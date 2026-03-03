const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

// ========== 核心配置 ==========
const CFG = {
    name: '蜉蝣梦',
    cooldown: 20,
    damage: 6.0,
    energyCost: 12,
    meritEffects: {
        bonus: 0.01,
        penalty: 0.01,
        range: [1, 12]
    },
    maxDistance: 24,
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER", "IRON_GOLEM", "COW", "PIG", "SHEEP", "CHICKEN", "WOLF", "CAT"],
    sphereRadius: 1.5,
    sphereParticleCount: 8,
    sphereMoveSteps: 12,
    sphereMoveInterval: 2,
    particleType: "BUBBLE_COLUMN_UP",
    areaDamageInterval: 2,
    levelMultiplier: { "黄": 1.0, "玄": 1.2, "地": 1.5, "天": 1.8 },

    // === 伤害倍率软上限 ===
    maxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520
};

CFG.meritCurveK = CFG.targetMerit * ((CFG.maxMultiplier - 1) / (CFG.targetMultiplier - 1) - 1);

// ========== Java类型导入 ==========
const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const Particle = Java.type('org.bukkit.Particle');
const Bukkit = Java.type('org.bukkit.Bukkit');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const JavaRunnable = Java.extend(Java.type('java.lang.Runnable'));

// ========== 全局管理 ==========
const cooldowns = new java.util.HashMap();
const activeTasks = new java.util.HashMap();
const skillCache = new java.util.HashMap();

// ========== 工具函数 ==========
const extractNumbers = (text) => {
    if (!text) return [];
    const matches = text.match(/§6(-?\d+)/g);
    return matches ? matches.map(m => parseInt(m.replace('§6', ''))) : [];
};

const calculateFinalDamage = (baseDamage, merit, levelMultiplier, meritEffects) => {
    let meritMultiplier;
    if (merit >= 0) {
        const limitGain = CFG.maxMultiplier - 1;
        const cappedGain = limitGain * (merit / (merit + CFG.meritCurveK));
        meritMultiplier = 1 + cappedGain;
    } else {
        meritMultiplier = Math.max(0.1, 1 - (Math.abs(merit) / 100) * meritEffects.penalty);
    }
    return baseDamage * meritMultiplier * (levelMultiplier || 1.0);
};

const getMeritMessage = (skillName, meritDelta) => {
    if (meritDelta === 0) return `§7✧ [${skillName}] 威能消散，未动分毫`;
    const absDelta = Math.abs(meritDelta);
    const direction = meritDelta > 0 ? '积得' : '损去';
    const color = meritDelta > 0 ? '§a' : '§c';
    return `§7✧ [${skillName}] 威能消散，${color}${direction}${absDelta} 功德值`;
};

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
        if (line.includes("灵力剩余")) {
            const nums = extractNumbers(line);
            if (nums.length > 0) {
                result.energy.cur = nums[0];
                result.energy.max = nums[1] || 1000;
            }
        } else if (line.includes("德值")) {
            const nums = extractNumbers(line);
            if (nums.length > 0) {
                result.merit = line.includes("缺德值") ? -nums[0] : nums[0];
            }
        }
    });
    return result;
};

const updateLore = (item, keyword, newText) => {
    const meta = item.getItemMeta();
    if (!meta) return false;
    const lore = meta.getLore() || [];
    const index = lore.findIndex(line => line && line.includes(keyword));
    if (index >= 0) {
        lore[index] = newText;
        meta.setLore(lore);
        item.setItemMeta(meta);
        return true;
    }
    return false;
};

const cleanupPlayerCache = (playerUuid) => {
    const taskId = activeTasks.remove(playerUuid);
    if (taskId) {
        try { Bukkit.getScheduler().cancelTask(taskId); } catch (e) {}
    }
    return skillCache.remove(playerUuid) !== null;
};

const createSphereParticles = (world, center) => {
    const particle = Particle[CFG.particleType] || Particle.WATER_BUBBLE;

    for (let i = 0; i < CFG.sphereParticleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.random() * Math.PI;
        const r = CFG.sphereRadius * (0.8 + Math.random() * 0.2);

        const offsetX = r * Math.sin(phi) * Math.cos(theta);
        const offsetY = r * Math.sin(phi) * Math.sin(theta);
        const offsetZ = r * Math.cos(phi);

        world.spawnParticle(
            particle,
            center.getX() + offsetX,
            center.getY() + offsetY,
            center.getZ() + offsetZ,
            1, 0, 0, 0, 0.05
        );
    }
};

const applySphereDamage = (world, center, player, damage, range) => {
    const entities = world.getNearbyLivingEntities(center, range, range, range);
    let totalMeritChange = 0;

    for (let i = 0; i < entities.size(); i++) {
        const entity = entities.get(i);
        if (entity === player ||
            entity.getType().name() === "ARMOR_STAND" ||
            entity.isDead()) continue;

        entity.damage(damage, player);

        const meritChange = Math.floor(Math.random() * (CFG.meritEffects.range[1] - CFG.meritEffects.range[0] + 1)) + CFG.meritEffects.range[0];
        totalMeritChange += CFG.whiteList.includes(entity.getType().name()) ? -meritChange : meritChange;
    }
    return totalMeritChange;
};

const settleSkill = (player) => {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.get(uuid);
    if (!cache) return;

    const { staff, totalMeritDelta, staffInfo } = cache;

    if (totalMeritDelta !== 0) {
        const newMerit = staffInfo.merit + totalMeritDelta;
        updateLore(staff, "德值", newMerit >= 0 ?
            `§b功德值：§6${Math.round(newMerit)}` :
            `§c缺德值：§6${Math.round(Math.abs(newMerit))}`);

        player.sendMessage(getMeritMessage(CFG.name, totalMeritDelta));
    }
    skillCache.remove(uuid);
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

    const staffInfo = getItemInfo(staff);
    if (!staffInfo) return;

    const { level, energy, merit } = staffInfo;

    if (energy.cur < CFG.energyCost) {
        player.sendMessage(`§c⚠ 灵力不足！当前 §6${energy.cur}§7/§6${energy.max} §c，需 §6${CFG.energyCost} §c点方可催动`);
        return;
    }

    cleanupPlayerCache(uuid);

    const finalDamage = calculateFinalDamage(CFG.damage, merit, CFG.levelMultiplier[level], CFG.meritEffects);

    const newEnergy = Math.max(0, energy.cur - CFG.energyCost);
    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${newEnergy} §7/ §6${energy.max}`);
    staffInfo.energy.cur = newEnergy;

    cooldowns.put(uuid, now);

    const world = player.getWorld();
    world.playSound(player.getLocation(), CFG.soundName, 1.0, 1.0);

    if (!player.isOnline()) return;

    skillCache.put(uuid, {
        totalMeritDelta: 0,
        staff: staff,
        staffInfo: staffInfo
    });

    const stepDistance = CFG.maxDistance / CFG.sphereMoveSteps;
    let currentStep = 0;
    const eyeLoc = player.getEyeLocation();
    const dir = eyeLoc.getDirection();
    const startLoc = eyeLoc.clone().add(dir);
    const initialWorld = player.getWorld(); // 记录初始世界

    const sphereRunnable = new JavaRunnable({
        run: function() {
            const uuid = player.getUniqueId().toString();
            const cache = skillCache.get(uuid);

            // 检测玩家是否在线、世界是否改变、是否已完成
            const shouldEnd = !player.isOnline() || player.getWorld() !== initialWorld || currentStep >= CFG.sphereMoveSteps || !cache;

            if (shouldEnd) {
                if (cache) settleSkill(player);
                cleanupPlayerCache(uuid);
                return;
            }

            const currentDistance = stepDistance * currentStep;
            const sphereCenter = startLoc.clone().add(dir.clone().multiply(currentDistance));

            // 使用初始世界生成粒子
            createSphereParticles(initialWorld, sphereCenter);

            if (currentStep % CFG.areaDamageInterval === 0) {
                const meritDelta = applySphereDamage(initialWorld, sphereCenter, player, finalDamage, CFG.sphereRadius);
                cache.totalMeritDelta += meritDelta;
            }

            currentStep++;
        }
    });

    const task = Bukkit.getScheduler().runTaskTimer(plugin, sphereRunnable, 0, CFG.sphereMoveInterval);
    activeTasks.put(uuid, task.getTaskId());
}