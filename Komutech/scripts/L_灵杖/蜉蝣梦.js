const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const Particle = Java.type('org.bukkit.Particle');
const Bukkit = Java.type('org.bukkit.Bukkit');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const JavaRunnable = Java.extend(Java.type('java.lang.Runnable'));

const CFG = {
    name: '蜉蝣梦',
    damage: 6.0,
    baseCooldown: 100,
    minCooldown: 16,
    cdTargetReduction: 0.5,
    baseEnergyCost: 12,
    maxEnergyCost: 36,
    costTargetIncrease: 0.5,
    meritEffects: { penalty:0.01, range:[1,12] },
    maxDistance: 24,
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    sphereRadius: 1.5,
    sphereParticleCount: 8,
    sphereMoveSteps: 12,
    sphereMoveInterval: 2,
    particleType: "BUBBLE_COLUMN_UP",
    areaDamageInterval: 2,
    levelMultiplier: { "黄":1.0, "玄":1.2, "地":1.5, "天":1.8 },
    baseMaxMultiplier: 521,
    targetMerit: 1314520,
    targetMultiplier: 99
};

CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const cdMaxReduction = 1 - CFG.minCooldown/CFG.baseCooldown;
CFG.cdK = CFG.targetMerit * (cdMaxReduction/CFG.cdTargetReduction - 1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1;
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const cooldowns = new java.util.HashMap();
const activeTasks = new java.util.HashMap();
const skillCache = new java.util.HashMap();

function extractNumbers(text) {
    if (!text) return [];
    const m = text.match(/§6(-?\d+)/g);
    return m ? m.map(s=>parseInt(s.replace('§6',''))) : [];
}

function calculateFinalDamage(base, merit, level) {
    const levelBase = CFG.levelMultiplier[level]||1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    if (merit>=0) {
        const gain = (maxMulti-1) * (merit/(merit+CFG.meritCurveK));
        return base * (1+gain);
    } else {
        return base * Math.max(0.1, 1 - (Math.abs(merit)/100)*CFG.meritEffects.penalty);
    }
}

function getMeritMessage(delta) {
    if (delta===0) return `§7✧ [${CFG.name}] 威能消散，未动分毫`;
    const abs = Math.abs(delta);
    return delta>0 ? `§7✧ [${CFG.name}] 威能消散，§a积得${abs} 功德值` : `§7✧ [${CFG.name}] 威能消散，§c损去${abs} 功德值`;
}

function getItemInfo(item) {
    if (!item || item.getAmount()!==1) return null;
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const res = { level:"黄", energy:{cur:0,max:1000}, merit:0, meta, lore };
    lore.forEach((line,i)=>{
        if (!line) return;
        if (i===0) {
            if (line.includes("天")) res.level="天";
            else if (line.includes("地")) res.level="地";
            else if (line.includes("玄")) res.level="玄";
        }
        const nums = extractNumbers(line);
        if (!nums.length) return;
        if (line.includes("灵力剩余")) {
            res.energy.cur = nums[0];
            res.energy.max = nums[1]||1000;
        } else if (line.includes("德值")) {
            res.merit = line.includes("缺德值") ? -nums[0] : nums[0];
        }
    });
    return res;
}

function updateLore(item, keyword, newText) {
    const meta = item.getItemMeta();
    if (!meta) return false;
    const lore = meta.getLore()||[];
    const idx = lore.findIndex(l=>l&&l.includes(keyword));
    if (idx>=0) {
        lore[idx]=newText;
        meta.setLore(lore);
        item.setItemMeta(meta);
        return true;
    }
    return false;
}

function cleanupPlayerCache(uuid) {
    const tid = activeTasks.remove(uuid);
    if (tid) try { Bukkit.getScheduler().cancelTask(tid); } catch(e){}
    return skillCache.remove(uuid)!==null;
}

function createSphereParticles(world, center) {
    const p = Particle[CFG.particleType]||Particle.WATER_BUBBLE;
    for (let i=0; i<CFG.sphereParticleCount; i++) {
        const theta = Math.random()*2*Math.PI, phi = Math.random()*Math.PI;
        const r = CFG.sphereRadius * (0.8+Math.random()*0.2);
        const offX = r*Math.sin(phi)*Math.cos(theta);
        const offY = r*Math.sin(phi)*Math.sin(theta);
        const offZ = r*Math.cos(phi);
        world.spawnParticle(p, center.getX()+offX, center.getY()+offY, center.getZ()+offZ, 1,0,0,0,0.05);
    }
}

function applySphereDamage(world, center, player, damage) {
    const entities = world.getNearbyLivingEntities(center, CFG.sphereRadius, CFG.sphereRadius, CFG.sphereRadius);
    let total = 0;
    for (let i=0; i<entities.size(); i++) {
        const e = entities.get(i);
        if (e===player || e.getType().name()==="ARMOR_STAND" || e.isDead()) continue;
        e.damage(damage, player);
        const change = Math.floor(Math.random()*(CFG.meritEffects.range[1]-CFG.meritEffects.range[0]+1))+CFG.meritEffects.range[0];
        total += CFG.whiteList.includes(e.getType().name()) ? -change : change;
    }
    return total;
}

function settleSkill(player) {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.get(uuid);
    if (!cache) return;
    const { staff, totalMeritDelta, staffInfo } = cache;
    if (totalMeritDelta!==0) {
        const newMerit = staffInfo.merit + totalMeritDelta;
        updateLore(staff, "德值", newMerit>=0 ? `§b功德值：§6${Math.round(newMerit)}` : `§c缺德值：§6${Math.round(Math.abs(newMerit))}`);
        player.sendMessage(getMeritMessage(totalMeritDelta));
    }
    skillCache.remove(uuid);
}

function onUse(event) {
    const player = event.getPlayer();
    if (event.getHand()!==EquipmentSlot.HAND) return;
    const staff = player.getInventory().getItemInMainHand();
    if (!staff?.getItemMeta()) return;

    const uuid = player.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const lastUse = cooldowns.get(uuid)||0;
    const info = getItemInfo(staff);
    if (!info) return;
    let { level, energy, merit } = info;

    let dynamicCooldown = CFG.baseCooldown;
    if (merit>0) {
        const reduction = cdMaxReduction * (merit/(merit+CFG.cdK));
        dynamicCooldown = Math.max(CFG.minCooldown, Math.round(CFG.baseCooldown*(1-reduction)));
    }
    if (now - lastUse < dynamicCooldown) {
        player.sendMessage(`§c✖ 技能冷却中！剩余 §6${((dynamicCooldown-(now-lastUse))*0.05).toFixed(1)} §c秒`);
        return;
    }

    let dynamicCost = CFG.baseEnergyCost;
    if (merit>0) {
        const increase = costMaxIncrease * (merit/(merit+CFG.costK));
        dynamicCost = Math.min(CFG.maxEnergyCost, Math.round(CFG.baseEnergyCost*(1+increase)));
    }
    if (energy.cur < dynamicCost) {
        player.sendMessage(`§c⚠ 灵力不足！当前 §6${energy.cur}§7/§6${energy.max} §c，需 §6${dynamicCost} §c点方可催动`);
        return;
    }

    cleanupPlayerCache(uuid);

    const finalDamage = calculateFinalDamage(CFG.damage, merit, level);
    const newEnergy = Math.max(0, energy.cur - dynamicCost);
    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${newEnergy} §7/ §6${energy.max}`);
    info.energy.cur = newEnergy;
    cooldowns.put(uuid, now);
    player.getWorld().playSound(player.getLocation(), CFG.soundName, 1.0, 1.0);

    if (!player.isOnline()) return;

    skillCache.put(uuid, { totalMeritDelta:0, staff:staff, staffInfo:info });

    const stepDist = CFG.maxDistance / CFG.sphereMoveSteps;
    let step = 0;
    const eyeLoc = player.getEyeLocation();
    const dir = eyeLoc.getDirection();
    const startLoc = eyeLoc.clone().add(dir);
    const initWorld = player.getWorld();

    const runnable = new JavaRunnable({
        run: function() {
            const cache = skillCache.get(uuid);
            if (!player.isOnline() || player.getWorld()!==initWorld || step>=CFG.sphereMoveSteps || !cache) {
                if (cache) settleSkill(player);
                cleanupPlayerCache(uuid);
                return;
            }
            const center = startLoc.clone().add(dir.clone().multiply(stepDist*step));
            createSphereParticles(initWorld, center);
            if (step % CFG.areaDamageInterval === 0) {
                cache.totalMeritDelta += applySphereDamage(initWorld, center, player, finalDamage);
            }
            step++;
        }
    });

    const task = Bukkit.getScheduler().runTaskTimer(plugin, runnable, 0, CFG.sphereMoveInterval);
    activeTasks.put(uuid, task.getTaskId());
}