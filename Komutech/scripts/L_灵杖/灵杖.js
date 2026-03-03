const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

// ========== Java类型导入 ==========
const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const Particle = Java.type('org.bukkit.Particle');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const Color = Java.type('org.bukkit.Color');
const Bukkit = Java.type('org.bukkit.Bukkit');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');

// ========== 核心配置 ==========
const CFG = {
    cooldown: 20,                          // 冷却时间（刻）
    baseDamage: 5.0,                        // 基础伤害
    energyCost: 5,                           // 灵力消耗
    maxDistance: 15,                         // 射线最大距离
    particleInterval: 0.1,                    // 粒子间隔（方块）
    soundName: "entity.evoker.cast_spell",    // 施法音效
    whiteList: ["VILLAGER", "IRON_GOLEM", "COW", "PIG", "SHEEP", "CHICKEN", "WOLF", "CAT"],
    meritEffects: {                            // 功德影响
        bonus: 0.01,
        penalty: 0.01,
        range: [1, 10]
    },
    levelMultiplier: { "黄": 1.0, "玄": 1.2, "地": 1.5, "天": 1.8 },

    // === 伤害倍率软上限 ===
    maxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520
};

// 自动计算曲线常数 K
CFG.meritCurveK = CFG.targetMerit * ((CFG.maxMultiplier - 1) / (CFG.targetMultiplier - 1) - 1);

// ========== 全局管理 ==========
const cooldowns = new java.util.HashMap();
const skillCache = new java.util.HashMap();

// ========== 核心函数 ==========
const getItemInfo = (item) => {
    if (!item || item.getAmount() !== 1) return null;
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const info = { level: "黄", energy: { cur: 0, max: 1000 }, merit: 0 };

    lore.forEach((line, i) => {
        if (!line) return;
        if (i === 0) {
            if (line.includes("天")) info.level = "天";
            else if (line.includes("地")) info.level = "地";
            else if (line.includes("玄")) info.level = "玄";
        }
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;

        if (line.includes("灵力剩余")) {
            info.energy.cur = parseInt(nums[0].replace('§6', '')) || 0;
            info.energy.max = parseInt(nums[1]?.replace('§6', '') || 1000);
        } else if (line.includes("德值")) {
            const num = parseInt(nums[0].replace('§6', '')) || 0;
            info.merit = line.includes("缺德值") ? -num : num;
        }
    });
    return { ...info, meta, lore };
};

const updateLore = (meta, lore, energy, merit) => {
    const newLore = lore.map(line => {
        if (!line) return line;
        if (line.includes("灵力剩余")) {
            return `§b灵力剩余：§6${energy.cur} §7/ §6${energy.max}`;
        }
        if (line.includes("功德值") || line.includes("缺德值")) {
            return merit >= 0 ?
                `§b功德值：§6${Math.round(merit)}` :
                `§c缺德值：§6${Math.round(Math.abs(merit))}`;
        }
        return line;
    });
    meta.setLore(newLore);
    return newLore;
};

const cleanupPlayerCache = (playerUuid) => {
    return skillCache.remove(playerUuid) !== null;
};

const createRayParticles = (world, startLoc, direction) => {
    const startColor = Color.fromRGB(0, 255, 255);
    const endColor = Color.fromRGB(0, 255, 77);
    const dirX = direction.getX(), dirY = direction.getY(), dirZ = direction.getZ();
    const startX = startLoc.getX(), startY = startLoc.getY(), startZ = startLoc.getZ();

    for (let d = 0; d <= CFG.maxDistance; d += CFG.particleInterval) {
        const progress = d / CFG.maxDistance;
        const r = Math.round(startColor.getRed() + (endColor.getRed() - startColor.getRed()) * progress);
        const g = Math.round(startColor.getGreen() + (endColor.getGreen() - startColor.getGreen()) * progress);
        const b = Math.round(startColor.getBlue() + (endColor.getBlue() - startColor.getBlue()) * progress);

        world.spawnParticle(Particle.DUST,
            startX + dirX * d,
            startY + dirY * d,
            startZ + dirZ * d,
            1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(r, g, b), 1.0));
    }
};

const rayTraceEntity = (world, startLoc, direction, player) => {
    const hitEntity = world.rayTrace(
        startLoc,
        direction,
        CFG.maxDistance,
        FluidCollisionMode.NEVER,
        false,
        0.1,
        entity => entity !== player &&
                 entity instanceof LivingEntity &&
                 entity.getType().name() !== "ARMOR_STAND"
    );
    return hitEntity ? hitEntity.getHitEntity() : null;
};

// ========== 主事件 ==========
function onUse(event) {
    const player = event.getPlayer();
    if (event.getHand() !== EquipmentSlot.HAND) return;

    const staff = player.getInventory().getItemInMainHand();
    if (!staff?.getItemMeta()) return;

    const uuid = player.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const lastUse = cooldowns.get(uuid) || 0;

    if (now - lastUse < CFG.cooldown) {
        player.sendMessage(`§c✖ 技能冷却中！剩余 §6${((CFG.cooldown - (now - lastUse)) * 0.05).toFixed(1)} §c秒`);
        return;
    }

    const itemInfo = getItemInfo(staff);
    if (!itemInfo) return;

    const { level, energy, merit, meta, lore } = itemInfo;

    if (energy.cur < CFG.energyCost) {
        player.sendMessage(`§c⚠ 灵力不足！当前 §6${energy.cur}§7/§6${energy.max} §c，需 §6${CFG.energyCost} §c点方可催动`);
        return;
    }

    cleanupPlayerCache(uuid);

    // 伤害计算
    let meritMultiplier;
    if (merit >= 0) {
        const limitGain = CFG.maxMultiplier - 1;
        const cappedGain = limitGain * (merit / (merit + CFG.meritCurveK));
        meritMultiplier = 1 + cappedGain;
    } else {
        meritMultiplier = Math.max(0.1, 1 - (Math.abs(merit) / 100) * CFG.meritEffects.penalty);
    }
    const finalDamage = CFG.baseDamage * meritMultiplier * (CFG.levelMultiplier[level] || 1.0);

    // 扣除灵力
    energy.cur -= CFG.energyCost;
    const updatedLore = updateLore(meta, lore, energy, merit);
    staff.setItemMeta(meta);

    cooldowns.put(uuid, now);

    const world = player.getWorld();
    world.playSound(player.getLocation(), CFG.soundName, 1.0, 1.0);

    const eyeLoc = player.getEyeLocation();
    const dir = eyeLoc.getDirection();
    const startLoc = eyeLoc.clone().add(dir);

    createRayParticles(world, startLoc, dir);
    const hitEntity = rayTraceEntity(world, startLoc, dir, player);

    if (!hitEntity) return;

    const entityType = hitEntity.getType().name();
    const isWhiteList = CFG.whiteList.includes(entityType);
    hitEntity.damage(finalDamage, player);

    const change = Math.floor(Math.random() * (CFG.meritEffects.range[1] - CFG.meritEffects.range[0] + 1)) + CFG.meritEffects.range[0];
    const newMerit = isWhiteList ? merit - change : merit + change;

    const meritText = newMerit >= 0 ?
        `§b功德值：§6${Math.round(newMerit)}` :
        `§c缺德值：§6${Math.round(Math.abs(newMerit))}`;

    const finalLore = updatedLore.map(line =>
        line && (line.includes("功德值") || line.includes("缺德值")) ? meritText : line
    );

    meta.setLore(finalLore);
    staff.setItemMeta(meta);

    player.sendMessage(isWhiteList ?
        `§c攻击§6${entityType}§c，扣除§6${change}§c点功德！` :
        `§a攻击§6${entityType}§a，获得§6${change}§a点功德！`);

    skillCache.put(uuid, {
        hitEntity: hitEntity,
        damage: finalDamage,
        meritChange: isWhiteList ? -change : change,
        timestamp: now
    });
}