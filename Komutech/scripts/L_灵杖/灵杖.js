const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const Particle = Java.type('org.bukkit.Particle');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const Color = Java.type('org.bukkit.Color');
const Bukkit = Java.type('org.bukkit.Bukkit');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');

const CFG = {
    baseDamage: 5.0,                    // 基础伤害
    baseCooldown: 100,                   // 基础冷却5秒（100刻）
    minCooldown: 16,                      // 最小冷却0.8秒（16刻）
    cdTargetReduction: 0.5,               // 目标功德时冷却缩减50%
    baseEnergyCost: 5,                    // 基础灵力消耗
    maxEnergyCost: 15,                     // 最大消耗（基础×3）
    costTargetIncrease: 0.5,               // 目标功德时消耗增加50%
    maxDistance: 15,                       // 射线最大距离
    particleInterval: 0.1,                  // 粒子间隔
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER", "IRON_GOLEM", "COW", "PIG", "SHEEP", "CHICKEN", "WOLF", "CAT"],
    meritEffects: { penalty: 0.01, range: [1,10] },
    levelMultiplier: { "黄":1.0, "玄":1.2, "地":1.5, "天":1.8 },
    baseMaxMultiplier: 521,                 // 黄级基础最大倍率
    targetMerit: 1314520,                   // 目标功德值
    targetMultiplier: 99                     // 目标功德对应的倍率
};

CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const cdMaxReduction = 1 - CFG.minCooldown/CFG.baseCooldown;
CFG.cdK = CFG.targetMerit * (cdMaxReduction/CFG.cdTargetReduction - 1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1;
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const cooldowns = new java.util.HashMap();
const skillCache = new java.util.HashMap();

function getItemInfo(item) {
    if (!item || item.getAmount()!==1) return null;
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const info = { level:"黄", energy:{cur:0,max:1000}, merit:0, meta, lore };
    lore.forEach((line,i)=>{
        if (!line) return;
        if (i===0) {
            if (line.includes("天")) info.level="天";
            else if (line.includes("地")) info.level="地";
            else if (line.includes("玄")) info.level="玄";
        }
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;
        if (line.includes("灵力剩余")) {
            info.energy.cur = parseInt(nums[0].replace('§6',''))||0;
            info.energy.max = parseInt(nums[1]?.replace('§6','')||1000);
        } else if (line.includes("德值")) {
            const num = parseInt(nums[0].replace('§6',''))||0;
            info.merit = line.includes("缺德值") ? -num : num;
        }
    });
    return info;
}

function updateLore(meta, lore, energy, merit) {
    const newLore = lore.map(line=>{
        if (!line) return line;
        if (line.includes("灵力剩余"))
            return `§b灵力剩余：§6${energy.cur} §7/ §6${energy.max}`;
        if (line.includes("功德值")||line.includes("缺德值"))
            return merit>=0 ? `§b功德值：§6${Math.round(merit)}` : `§c缺德值：§6${Math.round(Math.abs(merit))}`;
        return line;
    });
    meta.setLore(newLore);
    return newLore;
}

function cleanupPlayerCache(uuid) { return skillCache.remove(uuid)!==null; }

function createRayParticles(world, startLoc, dir) {
    const startColor = Color.fromRGB(0,255,255), endColor = Color.fromRGB(0,255,77);
    const dirX=dir.getX(), dirY=dir.getY(), dirZ=dir.getZ();
    const startX=startLoc.getX(), startY=startLoc.getY(), startZ=startLoc.getZ();
    for (let d=0; d<=CFG.maxDistance; d+=CFG.particleInterval) {
        const p = d/CFG.maxDistance;
        const r = Math.round(startColor.getRed()+(endColor.getRed()-startColor.getRed())*p);
        const g = Math.round(startColor.getGreen()+(endColor.getGreen()-startColor.getGreen())*p);
        const b = Math.round(startColor.getBlue()+(endColor.getBlue()-startColor.getBlue())*p);
        world.spawnParticle(Particle.DUST, startX+dirX*d, startY+dirY*d, startZ+dirZ*d,
            1,0,0,0,0, new DustOptions(Color.fromRGB(r,g,b),1.0));
    }
}

function rayTraceEntity(world, startLoc, dir, player) {
    const hit = world.rayTrace(startLoc, dir, CFG.maxDistance, FluidCollisionMode.NEVER, false, 0.1,
        e => e!==player && e instanceof LivingEntity && e.getType().name()!=="ARMOR_STAND");
    return hit ? hit.getHitEntity() : null;
}

function onUse(event) {
    const player = event.getPlayer();
    if (event.getHand()!==EquipmentSlot.HAND) return;
    const staff = player.getInventory().getItemInMainHand();
    if (!staff?.getItemMeta()) return;

    const uuid = player.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const lastUse = cooldowns.get(uuid)||0;
    const itemInfo = getItemInfo(staff);
    if (!itemInfo) return;
    let { level, energy, merit, meta, lore } = itemInfo;

    // 动态冷却
    let dynamicCooldown = CFG.baseCooldown;
    if (merit>0) {
        const reduction = cdMaxReduction * (merit/(merit+CFG.cdK));
        dynamicCooldown = Math.max(CFG.minCooldown, Math.round(CFG.baseCooldown*(1-reduction)));
    }
    if (now - lastUse < dynamicCooldown) {
        player.sendMessage(`§c✖ 技能冷却中！剩余 §6${((dynamicCooldown-(now-lastUse))*0.05).toFixed(1)} §c秒`);
        return;
    }

    // 动态灵力消耗
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

    // 伤害计算（方案D）
    const levelBase = CFG.levelMultiplier[level]||1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    let meritMult;
    if (merit>=0) {
        const gain = (maxMulti-1) * (merit/(merit+CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(merit)/100)*CFG.meritEffects.penalty);
    }
    const finalDamage = CFG.baseDamage * meritMult;

    energy.cur -= dynamicCost;
    const updatedLore = updateLore(meta, lore, energy, merit);
    staff.setItemMeta(meta);
    cooldowns.put(uuid, now);

    const world = player.getWorld();
    world.playSound(player.getLocation(), CFG.soundName, 1.0, 1.0);
    const eyeLoc = player.getEyeLocation();
    const dir = eyeLoc.getDirection();
    createRayParticles(world, eyeLoc.clone().add(dir), dir);
    const hit = rayTraceEntity(world, eyeLoc.clone().add(dir), dir, player);
    if (hit) {
        const type = hit.getType().name();
        const white = CFG.whiteList.includes(type);
        hit.damage(finalDamage, player);
        const change = Math.floor(Math.random()*(CFG.meritEffects.range[1]-CFG.meritEffects.range[0]+1))+CFG.meritEffects.range[0];
        const newMerit = white ? merit - change : merit + change;
        const meritText = newMerit>=0 ? `§b功德值：§6${Math.round(newMerit)}` : `§c缺德值：§6${Math.round(Math.abs(newMerit))}`;
        const finalLore = updatedLore.map(l=> l && (l.includes("功德值")||l.includes("缺德值")) ? meritText : l);
        meta.setLore(finalLore);
        staff.setItemMeta(meta);
        player.sendMessage(white ? `§c攻击§6${type}§c，扣除§6${change}§c点功德！` : `§a攻击§6${type}§a，获得§6${change}§a点功德！`);
        skillCache.put(uuid, { hitEntity:hit, damage:finalDamage, meritChange:white?-change:change, timestamp:now });
    }
}