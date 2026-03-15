const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const Particle = Java.type('org.bukkit.Particle');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const Color = Java.type('org.bukkit.Color');
const Bukkit = Java.type('org.bukkit.Bukkit');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');

const CFG = {
    damage: 4.0,
    baseCooldown: 100,
    minCooldown: 16,
    cdTargetReduction: 0.5,
    baseEnergyCost: 2,
    maxEnergyCost: 6,
    costTargetIncrease: 0.5,
    maxDistance: 10,
    particleInterval: 0.2,
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    queDePenalty: 0.01,
    levelMultiplier: { "黄":1.0, "玄":1.2, "地":1.5, "天":1.8 },
    meritRange: { min:1, max:10 },
    particleColor: { r:255,g:255,b:255 },
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
    const opt = new DustOptions(Color.fromRGB(CFG.particleColor.r,CFG.particleColor.g,CFG.particleColor.b),1.0);
    const dirX=dir.getX(), dirY=dir.getY(), dirZ=dir.getZ();
    const startX=startLoc.getX(), startY=startLoc.getY(), startZ=startLoc.getZ();
    for (let d=0; d<=CFG.maxDistance; d+=CFG.particleInterval)
        world.spawnParticle(Particle.DUST, startX+dirX*d, startY+dirY*d, startZ+dirZ*d, 1,0,0,0,0, opt);
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

    const levelBase = CFG.levelMultiplier[level]||1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    let meritMult;
    if (merit>=0) {
        const gain = (maxMulti-1) * (merit/(merit+CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(merit)/100)*CFG.queDePenalty);
    }
    const finalDamage = CFG.damage * meritMult;

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
        const change = Math.floor(Math.random()*(CFG.meritRange.max-CFG.meritRange.min+1))+CFG.meritRange.min;
        const newMerit = white ? merit - change : merit + change;
        const meritText = newMerit>=0 ? `§b功德值：§6${Math.round(newMerit)}` : `§c缺德值：§6${Math.round(Math.abs(newMerit))}`;
        const finalLore = updatedLore.map(l=> l && (l.includes("功德值")||l.includes("缺德值")) ? meritText : l);
        meta.setLore(finalLore);
        staff.setItemMeta(meta);
        player.sendMessage(white ? `§c[烧火棍] 击中${type}！-${change}功德` : `§a[烧火棍] 击中${type}！+${change}功德`);
        skillCache.put(uuid, { hitEntity:hit, damage:finalDamage, meritChange:white?-change:change, timestamp:now });
    }
}