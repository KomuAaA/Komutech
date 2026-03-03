// 全局数据存储
let cooldownPlayers = {};
let captureAnimations = {};
let animationTasks = {};

// Bukkit API
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');

// 配置参数
const CONFIG = {
    COOLDOWN: 5000,
    RANGE: 8,                    // 检测距离（长度）
    DETECTION_RADIUS: 1.0,       // 检测半径/宽度（越大越容易命中）
    ANIMATION_DURATION: 60,
    SPIRAL_COUNT: 3,
    PARTICLES_PER_SPIRAL: 8,
    SPIRAL_RADIUS: 1.2,
    SPIRAL_SPEED: 0.2
};

// 物品ID
const SPECIAL_ITEM_ID = "KOMUTECH_L_F_灵墟缚灵符";

// 粒子效果：发射光线
function shootRayParticles(player, targetEntity) {
    const startLoc = player.getEyeLocation();
    const world = player.getWorld();
    
    let endLoc;
    if (targetEntity && targetEntity.isValid() && targetEntity instanceof org.bukkit.entity.LivingEntity) {
        endLoc = targetEntity.getLocation().add(0, targetEntity.getHeight() / 2, 0);
    } else {
        const direction = startLoc.getDirection().normalize();
        endLoc = startLoc.clone().add(
            direction.getX() * CONFIG.RANGE,
            direction.getY() * CONFIG.RANGE,
            direction.getZ() * CONFIG.RANGE
        );
    }
    
    const direction = endLoc.clone().subtract(startLoc).toVector();
    const distance = direction.length();
    const maxDistance = Math.min(distance, CONFIG.RANGE);
    if (maxDistance < 0.5) return;
    
    direction.normalize();
    
    const startColor = Color.fromRGB(0, 255, 255);
    const endColor = Color.fromRGB(255, 105, 180);
    
    for (let d = 0; d <= maxDistance; d += 0.25) {
        const progress = d / maxDistance;
        const r = Math.round(startColor.getRed() + (endColor.getRed() - startColor.getRed()) * progress);
        const g = Math.round(startColor.getGreen() + (endColor.getGreen() - startColor.getGreen()) * progress);
        const b = Math.round(startColor.getBlue() + (endColor.getBlue() - startColor.getBlue()) * progress);
        
        const particleLoc = startLoc.clone().add(
            direction.getX() * d,
            direction.getY() * d,
            direction.getZ() * d
        );
        
        world.spawnParticle(
            Particle.DUST,
            particleLoc.getX(),
            particleLoc.getY(),
            particleLoc.getZ(),
            1, 0, 0, 0, 0,
            new DustOptions(Color.fromRGB(r, g, b), 0.6)
        );
    }
}

// 射线检测
function getTargetEntity(player, range, radius) {
    const eyeLoc = player.getEyeLocation();
    const direction = eyeLoc.getDirection();
    const world = player.getWorld();
    
    const result = world.rayTraceEntities(
        eyeLoc,
        direction,
        range,
        radius,
        entity => entity !== player && 
                 entity instanceof org.bukkit.entity.LivingEntity && 
                 !(entity instanceof org.bukkit.entity.Player)
    );
    
    return result ? result.getHitEntity() : null;
}

// 粒子效果：螺旋粒子
function generateSpiralParticles(entity, tick) {
    if (!entity || !entity.isValid() || entity.isDead()) return;
    
    const world = entity.getWorld();
    const location = entity.getLocation();
    const height = entity.getHeight();
    
    for (let spiral = 0; spiral < CONFIG.SPIRAL_COUNT; spiral++) {
        const spiralOffset = spiral * (Math.PI * 2 / CONFIG.SPIRAL_COUNT);
        const spiralHeight = height * (spiral / CONFIG.SPIRAL_COUNT);
        
        for (let i = 0; i < CONFIG.PARTICLES_PER_SPIRAL; i++) {
            const angle = (i * (Math.PI * 2 / CONFIG.PARTICLES_PER_SPIRAL) + 
                          tick * CONFIG.SPIRAL_SPEED + spiralOffset) % (Math.PI * 2);
            
            const x = Math.cos(angle) * CONFIG.SPIRAL_RADIUS;
            const z = Math.sin(angle) * CONFIG.SPIRAL_RADIUS;
            const y = spiralHeight + 0.1;
            
            const particleLoc = location.clone().add(x, y, z);
            
            world.spawnParticle(
                Particle.DUST,
                particleLoc.getX(),
                particleLoc.getY(),
                particleLoc.getZ(),
                1, 0, 0, 0, 0,
                new DustOptions(Color.fromRGB(255, 105, 180), 0.5)
            );
            
            if (i % 2 === 0) {
                world.spawnParticle(
                    Particle.DUST,
                    particleLoc.getX(),
                    particleLoc.getY(),
                    particleLoc.getZ(),
                    1, 0, 0, 0, 0,
                    new DustOptions(Color.fromRGB(0, 255, 255), 0.4)
                );
            }
        }
    }
}

// 开始捕捉动画
function startCaptureAnimation(player, entity, catchPercent, isSpecialItem) {
    const uuid = player.getUniqueId().toString();
    
    // 清理旧的动画数据
    if (animationTasks[uuid]) {
        Bukkit.getScheduler().cancelTask(animationTasks[uuid]);
        delete animationTasks[uuid];
    }
    delete captureAnimations[uuid];
    
    try {
        const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        let slowEffectType = PotionEffectType.SLOW || PotionEffectType.getByName("SLOWNESS");
        
        if (slowEffectType) {
            const slowEffect = new PotionEffect(slowEffectType, 60, 255, true, false);
            entity.addPotionEffect(slowEffect);
        }
    } catch (e) {}
    
    captureAnimations[uuid] = {
        player: player,
        entity: entity,
        catchPercent: catchPercent,
        startTime: Date.now(),
        tick: 0,
        isSpecialItem: isSpecialItem
    };
    
    const taskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(
        Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer"),
        () => updateCaptureAnimation(uuid),
        0, 1
    );
    
    animationTasks[uuid] = taskId;
}

// 更新捕捉动画
function updateCaptureAnimation(uuid) {
    const anim = captureAnimations[uuid];
    if (!anim) {
        if (animationTasks[uuid]) {
            Bukkit.getScheduler().cancelTask(animationTasks[uuid]);
            delete animationTasks[uuid];
        }
        return;
    }
    
    if (anim.tick >= CONFIG.ANIMATION_DURATION) {
        finishCaptureAnimation(uuid, true);
        return;
    }
    
    if (anim.entity.isDead() || !anim.entity.isValid() || !anim.player.isOnline()) {
        finishCaptureAnimation(uuid, false);
        return;
    }
    
    generateSpiralParticles(anim.entity, anim.tick);
    anim.tick++;
}

// 完成捕捉动画
function finishCaptureAnimation(uuid, success) {
    const anim = captureAnimations[uuid];
    if (!anim) {
        if (animationTasks[uuid]) {
            Bukkit.getScheduler().cancelTask(animationTasks[uuid]);
        }
        delete animationTasks[uuid];
        return;
    }
    
    if (animationTasks[uuid]) {
        Bukkit.getScheduler().cancelTask(animationTasks[uuid]);
        delete animationTasks[uuid];
    }
    
    if (success && anim.entity.isValid() && !anim.entity.isDead()) {
        giveSpawnEggToPlayer(anim.player, anim.entity, anim.catchPercent, anim.isSpecialItem);
    } else {
        if (anim.player.isOnline()) anim.player.sendMessage("§c捕捉失败！");
        
        try {
            if (anim.entity && anim.entity.isValid()) {
                const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
                const slowEffectType = PotionEffectType.SLOW || PotionEffectType.getByName("SLOWNESS");
                if (slowEffectType) anim.entity.removePotionEffect(slowEffectType);
            }
        } catch (e) {}
    }
    
    delete captureAnimations[uuid];
}

// 消耗物品
function consumeItem(player) {
    const item = player.getInventory().getItemInMainHand();
    if (item && item.getAmount() > 0) {
        if (item.getAmount() > 1) {
            item.setAmount(item.getAmount() - 1);
            player.getInventory().setItemInMainHand(item);
        } else {
            player.getInventory().setItemInMainHand(new org.bukkit.inventory.ItemStack(org.bukkit.Material.AIR));
        }
        player.updateInventory();
        return true;
    }
    return false;
}

// 给予刷怪蛋
function giveSpawnEggToPlayer(player, entity, catchPercent, isSpecialItem) {
    try {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        const slowEffectType = PotionEffectType.SLOW || PotionEffectType.getByName("SLOWNESS");
        if (slowEffectType) entity.removePotionEffect(slowEffectType);
    } catch (e) {}
    
    let eggMaterial;
    try {
        eggMaterial = org.bukkit.Material.valueOf(entity.getType().toString() + "_SPAWN_EGG");
    } catch (e) {
        eggMaterial = org.bukkit.Material.EGG;
    }
    
    const location = entity.getLocation();
    entity.remove();
    
    const itemStack = new org.bukkit.inventory.ItemStack(eggMaterial, 1);
    const inventory = player.getInventory();
    const added = inventory.addItem(itemStack);
    
    if (!added.isEmpty()) {
        player.getWorld().dropItem(location, itemStack);
        player.sendMessage("§e背包已满，刷怪蛋已掉落在地面！");
    }
    
    player.updateInventory();
    
    if (isSpecialItem) {
        player.sendMessage("§6灵墟§a捕捉成功！ (" + catchPercent + "%)");
    } else {
        player.sendMessage("§a捕捉成功！ (" + catchPercent + "%)");
    }
}

// 主函数：使用物品时触发
function onUse(event) {
    const player = event.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();
    
    // 清理过期的冷却数据
    const expiredTime = now - CONFIG.COOLDOWN;
    for (const uid in cooldownPlayers) {
        if (cooldownPlayers[uid] < expiredTime) {
            delete cooldownPlayers[uid];
        }
    }
    
    // 冷却检查
    if (cooldownPlayers[uuid] && now - cooldownPlayers[uuid] < CONFIG.COOLDOWN) {
        const remaining = Math.ceil((CONFIG.COOLDOWN - (now - cooldownPlayers[uuid])) / 1000);
        player.sendMessage("§c道具冷却中，请等待 " + remaining + " 秒后再使用！");
        return;
    }
    
    // 检查是否正在捕捉
    if (captureAnimations[uuid]) {
        player.sendMessage("§c你正在进行捕捉，请等待完成！");
        return;
    }
    
    // 获取物品并检测是否为特殊物品
    const item = player.getInventory().getItemInMainHand();
    let isSpecialItem = false;
    
    if (item && !item.getType().equals(org.bukkit.Material.AIR)) {
        const sfItem = SlimefunItem.getByItem(item);
        if (sfItem !== null) {
            const itemId = sfItem.getId();
            if (itemId === SPECIAL_ITEM_ID) {
                isSpecialItem = true;
            }
        }
    }
    
    // 设置冷却
    cooldownPlayers[uuid] = now;
    
    // 使用射线检测
    const entity = getTargetEntity(player, CONFIG.RANGE, CONFIG.DETECTION_RADIUS);
    shootRayParticles(player, entity);
    
    // 未命中检查
    if (entity == null || entity instanceof org.bukkit.entity.Player || !(entity instanceof org.bukkit.entity.LivingEntity)) {
        player.sendMessage("§c未命中生物！ (0%)");
        return;
    }
    
    // 消耗道具
    if (!consumeItem(player)) {
        return;
    }
    
    // 捕捉判定
    if (entity.getHealth() >= player.getHealth()) {
        player.sendMessage("§c捕捉失败！ (0%)");
        return;
    }
    
    const healthRatio = (entity.getHealth() / player.getHealth()) * 100;
    let catchChance;
    
    // 根据物品类型选择概率
    if (isSpecialItem) {
        // 灵墟物品概率
        catchChance = healthRatio <= 30 ? 1.0 : 
                     healthRatio <= 50 ? 0.90 : 
                     healthRatio <= 80 ? 0.80 : 
                     healthRatio <= 100 ? 0.50 : 0.10;
    } else {
        // 普通物品概率
        catchChance = healthRatio <= 10 ? 1.0 : 
                     healthRatio <= 20 ? 0.90 : 
                     healthRatio <= 50 ? 0.60 : 
                     healthRatio <= 80 ? 0.30 : 0.10;
    }
    
    const catchPercent = Math.round(catchChance * 100);
    
    if (catchChance < 1.0 && Math.random() > catchChance) {
        player.sendMessage("§c捕捉失败！ (" + catchPercent + "%)");
        return;
    }
    
    // 开始捕捉动画
    player.sendMessage("§a捕捉成功！正在束缚生物... (" + catchPercent + "%)");
    startCaptureAnimation(player, entity, catchPercent, isSpecialItem);
}