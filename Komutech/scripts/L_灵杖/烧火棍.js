// Java类型导入
const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const Particle = Java.type('org.bukkit.Particle');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const Color = Java.type('org.bukkit.Color');

// 配置
const CFG = {
    cooldown: 20,                          // 冷却时间（刻）
    damage: 4.0,                            // 基础伤害
    energyCost: 2,                           // 灵力消耗
    maxDistance: 10,                         // 射线最大距离
    particleInterval: 0.2,                    // 粒子密度
    soundName: "entity.evoker.cast_spell",    // 施法音效
    whiteList: ["VILLAGER", "IRON_GOLEM", "COW", "PIG", "SHEEP", "CHICKEN", "WOLF", "CAT"],
    meritBonus: 0.01,                         // 功德加成系数
    queDePenalty: 0.01,                       // 缺德惩罚系数
    levelMultiplier: {                        // 等级倍率
        "黄": 1.0,
        "玄": 1.2,
        "地": 1.5,
        "天": 1.8
    },
    meritRange: {                              // 每次命中功德变动范围
        min: 1,
        max: 10
    },
    particleColor: {                           // 粒子颜色
        r: 255,
        g: 255,
        b: 255
    },
    // === 伤害倍率软上限 ===
    maxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520
};

// 自动计算曲线常数 K
CFG.meritCurveK = CFG.targetMerit * ((CFG.maxMultiplier - 1) / (CFG.targetMultiplier - 1) - 1);

const cooldownMap = new java.util.HashMap();

// 工具函数
const getItemInfo = (item) => {
    if (!item || item.getAmount() !== 1) return null;
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const result = { level: "黄", energy: { cur: 0, max: 1000 }, merit: 0, meta, lore };

    lore.forEach((line, i) => {
        if (!line) return;
        if (i === 0) {
            if (line.includes("天")) result.level = "天";
            else if (line.includes("地")) result.level = "地";
            else if (line.includes("玄")) result.level = "玄";
        }
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;

        if (line.includes("灵力剩余")) {
            result.energy.cur = parseInt(nums[0].replace('§6', '')) || 0;
            result.energy.max = parseInt(nums[1]?.replace('§6', '') || 1000);
        } else if (line.includes("德值")) {
            const num = parseInt(nums[0].replace('§6', '')) || 0;
            result.merit = line.includes("缺德值") ? -num : num;
        }
    });
    return result;
};

// 主函数
function onUse(event) {
    const p = event.getPlayer();
    if (event.getHand() !== EquipmentSlot.HAND) return;

    const staff = p.getInventory().getItemInMainHand();
    if (!staff?.getItemMeta()) return;

    const uuid = p.getUniqueId().toString();
    const now = org.bukkit.Bukkit.getServer().getCurrentTick();
    const lastUse = cooldownMap.get(uuid) || 0;

    if (now - lastUse < CFG.cooldown) {
        p.sendMessage(`§c✖ 技能冷却中！剩余 §6${((CFG.cooldown - (now - lastUse)) * 0.05).toFixed(1)} §c秒`);
        return;
    }

    const itemInfo = getItemInfo(staff);
    if (!itemInfo) return;

    const { level, energy, merit, meta, lore } = itemInfo;

    if (energy.cur < CFG.energyCost) {
        p.sendMessage(`§c⚠ 灵力不足！当前 §6${energy.cur}§7/§6${energy.max} §c，需 §6${CFG.energyCost} §c点方可催动`);
        return;
    }

    // 伤害计算
    let meritMultiplier;
    if (merit >= 0) {
        const limitGain = CFG.maxMultiplier - 1;
        const cappedGain = limitGain * (merit / (merit + CFG.meritCurveK));
        meritMultiplier = 1 + cappedGain;
    } else {
        meritMultiplier = Math.max(0.1, 1 - (Math.abs(merit) / 100) * CFG.queDePenalty);
    }
    const finalDamage = CFG.damage * meritMultiplier * (CFG.levelMultiplier[level] || 1.0);

    // 扣除灵力
    const newEnergy = energy.cur - CFG.energyCost;
    const updatedLore = lore.map(line =>
        line?.includes("灵力剩余") ?
        `§b灵力剩余：§6${newEnergy} §7/ §6${energy.max}` : line
    );

    meta.setLore(updatedLore);
    staff.setItemMeta(meta);
    cooldownMap.put(uuid, now);

    const world = p.getWorld();
    const eyeLoc = p.getEyeLocation();
    const dir = eyeLoc.getDirection();
    const startLoc = eyeLoc.clone().add(dir);

    world.playSound(p.getLocation(), CFG.soundName, 1.0, 1.0);

    // 粒子效果
    const particleColor = Color.fromRGB(CFG.particleColor.r, CFG.particleColor.g, CFG.particleColor.b);
    const particleOptions = new DustOptions(particleColor, 1.0);
    const dirX = dir.getX(), dirY = dir.getY(), dirZ = dir.getZ();
    const startX = startLoc.getX(), startY = startLoc.getY(), startZ = startLoc.getZ();

    for (let d = 0; d <= CFG.maxDistance; d += CFG.particleInterval) {
        world.spawnParticle(Particle.DUST,
            startX + dirX * d,
            startY + dirY * d,
            startZ + dirZ * d,
            1, 0, 0, 0, 0, particleOptions);
    }

    const rayResult = world.rayTrace(startLoc, dir, CFG.maxDistance, FluidCollisionMode.NEVER, false, 0.5,
        e => e !== p && e instanceof org.bukkit.entity.LivingEntity && e.getType().name() !== "ARMOR_STAND");

    if (!rayResult?.getHitEntity()) return;

    const entity = rayResult.getHitEntity();
    const entityType = entity.getType().name();
    const isWhiteList = CFG.whiteList.includes(entityType);

    entity.damage(finalDamage, p);

    const change = Math.floor(Math.random() * (CFG.meritRange.max - CFG.meritRange.min + 1)) + CFG.meritRange.min;
    const newVal = isWhiteList ? merit - change : merit + change;
    const meritText = newVal >= 0 ? `§b功德值：§6${Math.round(newVal)}` : `§c缺德值：§6${Math.round(Math.abs(newVal))}`;

    const finalLore = updatedLore.map(line =>
        line && (line.includes("功德值") || line.includes("缺德值")) ? meritText : line
    );

    meta.setLore(finalLore);
    staff.setItemMeta(meta);

    p.sendMessage(isWhiteList ?
        `§c[烧火棍] 击中${entityType}！-${change}功德` :
        `§a[烧火棍] 击中${entityType}！+${change}功德`);
}