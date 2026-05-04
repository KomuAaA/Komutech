const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');

const DATA_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const SPIRIT_COST = 5;
const CONFIG = { COOLDOWN: 5000, RANGE: 8, DETECTION_RADIUS: 1.0, ANIMATION_DURATION: 60, SPIRAL_COUNT: 3, PARTICLES_PER_SPIRAL: 8, SPIRAL_RADIUS: 1.2, SPIRAL_SPEED: 0.2 };
const SPECIAL_ITEM_ID = "KOMUTECH_L_F_灵墟缚灵符";

let cooldownPlayers = {};
let captureAnimations = {};
let animationTasks = {};

function loadData(name) {
    let p = Paths.get(DATA_DIR, '[' + name + '].json');
    if (!Files.exists(p)) return null;
    try { return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch (e) { return null; }
}
function saveData(name, d) {
    let p = Paths.get(DATA_DIR, '[' + name + '].json');
    try { Files.writeString(p, JSON.stringify(d, null, 2), StandardCharsets.UTF_8); return true; } catch (e) { return false; }
}
function parseLingli(raw) {
    if (typeof raw !== 'string') raw = '100/100+0';
    let m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)\+(-?\d+)$/);
    if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: parseInt(m[3]) };
    m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/);
    if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: 0 };
    return { cur: 100, max: 100, bonus: 0 };
}
function formatLingli(cur, max, bonus) { return cur.toFixed(2) + '/' + max + (bonus !== 0 ? '+' + bonus : ''); }

function getPlayerHealthActual(player) {
    let data = loadData(player.getName());
    if (data && data['血量_实际'] !== undefined) return parseFloat(data['血量_实际']);
    return 0;
}

function consumeSpirit(player, cost) {
    let data = loadData(player.getName());
    if (!data) return false;
    if (!data.灵力) data.灵力 = '100/100+0';
    let ling = parseLingli(data.灵力);
    if (ling.cur < cost) return false;
    ling.cur -= cost;
    data.灵力 = formatLingli(ling.cur, ling.max, ling.bonus);
    return saveData(player.getName(), data);
}

// 粒子效果（保持不变）
function shootRayParticles(player, targetEntity) {
    const startLoc = player.getEyeLocation();
    const world = player.getWorld();
    let endLoc;
    if (targetEntity && targetEntity.isValid() && targetEntity instanceof Java.type('org.bukkit.entity.LivingEntity')) {
        endLoc = targetEntity.getLocation().add(0, targetEntity.getHeight() / 2, 0);
    } else {
        const direction = startLoc.getDirection().normalize();
        endLoc = startLoc.clone().add(direction.getX() * CONFIG.RANGE, direction.getY() * CONFIG.RANGE, direction.getZ() * CONFIG.RANGE);
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
        world.spawnParticle(Particle.DUST, startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getX(), startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getY(), startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getZ(), 1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(r, g, b), 0.6));
    }
}
function getTargetEntity(player, range, radius) {
    const eyeLoc = player.getEyeLocation();
    const direction = eyeLoc.getDirection();
    const world = player.getWorld();
    const result = world.rayTraceEntities(eyeLoc, direction, range, radius, entity => entity !== player && entity instanceof Java.type('org.bukkit.entity.LivingEntity') && !(entity instanceof Java.type('org.bukkit.entity.Player')));
    return result ? result.getHitEntity() : null;
}
function generateSpiralParticles(entity, tick) {
    if (!entity || !entity.isValid() || entity.isDead()) return;
    const world = entity.getWorld();
    const location = entity.getLocation();
    const height = entity.getHeight();
    for (let spiral = 0; spiral < CONFIG.SPIRAL_COUNT; spiral++) {
        const spiralOffset = spiral * (Math.PI * 2 / CONFIG.SPIRAL_COUNT);
        const spiralHeight = height * (spiral / CONFIG.SPIRAL_COUNT);
        for (let i = 0; i < CONFIG.PARTICLES_PER_SPIRAL; i++) {
            const angle = (i * (Math.PI * 2 / CONFIG.PARTICLES_PER_SPIRAL) + tick * CONFIG.SPIRAL_SPEED + spiralOffset) % (Math.PI * 2);
            const x = Math.cos(angle) * CONFIG.SPIRAL_RADIUS;
            const z = Math.sin(angle) * CONFIG.SPIRAL_RADIUS;
            const y = spiralHeight + 0.1;
            const particleLoc = location.clone().add(x, y, z);
            world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(), 1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(255, 105, 180), 0.5));
            if (i % 2 === 0) world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(), 1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(0, 255, 255), 0.4));
        }
    }
}
function startCaptureAnimation(player, entity, catchPercent, isSpecialItem) {
    const uuid = player.getUniqueId().toString();
    if (animationTasks[uuid]) { Bukkit.getScheduler().cancelTask(animationTasks[uuid]); delete animationTasks[uuid]; }
    delete captureAnimations[uuid];
    try {
        const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        let slowEffectType = PotionEffectType.SLOW || PotionEffectType.getByName("SLOWNESS");
        if (slowEffectType) entity.addPotionEffect(new PotionEffect(slowEffectType, 60, 255, true, false));
    } catch (e) {}
    captureAnimations[uuid] = { player, entity, catchPercent, startTime: Date.now(), tick: 0, isSpecialItem };
    const taskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer"), () => updateCaptureAnimation(uuid), 0, 1);
    animationTasks[uuid] = taskId;
}
function updateCaptureAnimation(uuid) {
    const anim = captureAnimations[uuid];
    if (!anim) { if (animationTasks[uuid]) { Bukkit.getScheduler().cancelTask(animationTasks[uuid]); delete animationTasks[uuid]; } return; }
    if (anim.tick >= CONFIG.ANIMATION_DURATION) { finishCaptureAnimation(uuid, true); return; }
    if (anim.entity.isDead() || !anim.entity.isValid() || !anim.player.isOnline()) { finishCaptureAnimation(uuid, false); return; }
    generateSpiralParticles(anim.entity, anim.tick);
    anim.tick++;
}
function finishCaptureAnimation(uuid, success) {
    const anim = captureAnimations[uuid];
    if (!anim) { if (animationTasks[uuid]) { Bukkit.getScheduler().cancelTask(animationTasks[uuid]); delete animationTasks[uuid]; } return; }
    if (animationTasks[uuid]) { Bukkit.getScheduler().cancelTask(animationTasks[uuid]); delete animationTasks[uuid]; }
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
function consumeItem(player) {
    const item = player.getInventory().getItemInMainHand();
    if (item && item.getAmount() > 0) {
        if (item.getAmount() > 1) item.setAmount(item.getAmount() - 1);
        else player.getInventory().setItemInMainHand(null);
        player.updateInventory();
        return true;
    }
    return false;
}
function giveSpawnEggToPlayer(player, entity, catchPercent, isSpecialItem) {
    try {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        const slowEffectType = PotionEffectType.SLOW || PotionEffectType.getByName("SLOWNESS");
        if (slowEffectType) entity.removePotionEffect(slowEffectType);
    } catch (e) {}
    let eggMaterial;
    try { eggMaterial = Java.type('org.bukkit.Material').valueOf(entity.getType().toString() + "_SPAWN_EGG"); } catch (e) { eggMaterial = Java.type('org.bukkit.Material').EGG; }
    const location = entity.getLocation();
    entity.remove();
    const itemStack = new Java.type('org.bukkit.inventory.ItemStack')(eggMaterial, 1);
    const added = player.getInventory().addItem(itemStack);
    if (!added.isEmpty()) { player.getWorld().dropItem(location, itemStack); player.sendMessage("§e背包已满，刷怪蛋已掉落！"); }
    player.updateInventory();
    player.sendMessage((isSpecialItem ? "§6灵墟§a" : "§a") + "捕捉成功！ (" + catchPercent + "%)");
}

function onUse(event) {
    const player = event.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();
    const expiredTime = now - CONFIG.COOLDOWN;
    for (const uid in cooldownPlayers) { if (cooldownPlayers[uid] < expiredTime) delete cooldownPlayers[uid]; }
    if (cooldownPlayers[uuid] && now - cooldownPlayers[uuid] < CONFIG.COOLDOWN) {
        const remaining = Math.ceil((CONFIG.COOLDOWN - (now - cooldownPlayers[uuid])) / 1000);
        player.sendMessage("§c冷却中，请等待 " + remaining + " 秒！");
        return;
    }
    if (captureAnimations[uuid]) { player.sendMessage("§c你正在进行捕捉！"); return; }
    const item = player.getInventory().getItemInMainHand();
    let isSpecialItem = false;
    if (item && !item.getType().equals(Java.type('org.bukkit.Material').AIR)) {
        const sfItem = SlimefunItem.getByItem(item);
        if (sfItem && sfItem.getId() === SPECIAL_ITEM_ID) isSpecialItem = true;
    }
    cooldownPlayers[uuid] = now;
    const entity = getTargetEntity(player, CONFIG.RANGE, CONFIG.DETECTION_RADIUS);
    shootRayParticles(player, entity);
    if (entity == null || entity instanceof Java.type('org.bukkit.entity.Player') || !(entity instanceof Java.type('org.bukkit.entity.LivingEntity'))) {
        player.sendMessage("§c未命中生物！ (0%)");
        return;
    }
    // 检查灵力
    if (!consumeSpirit(player, SPIRIT_COST)) {
        player.sendMessage("§c灵力不足！需要 " + SPIRIT_COST + " 点灵力");
        return;
    }
    if (!consumeItem(player)) return;
    const baseHealth = getPlayerHealthActual(player) + 20;
    if (entity.getHealth() >= baseHealth) { player.sendMessage("§c捕捉失败！ (0%)"); return; }
    const healthRatio = (entity.getHealth() / baseHealth) * 100;
    let catchChance;
    if (isSpecialItem) {
        catchChance = healthRatio <= 30 ? 1.0 : healthRatio <= 50 ? 0.90 : healthRatio <= 80 ? 0.80 : healthRatio <= 100 ? 0.50 : 0.10;
    } else {
        catchChance = healthRatio <= 10 ? 1.0 : healthRatio <= 20 ? 0.90 : healthRatio <= 50 ? 0.60 : healthRatio <= 80 ? 0.30 : 0.10;
    }
    const catchPercent = Math.round(catchChance * 100);
    if (catchChance < 1.0 && Math.random() > catchChance) { player.sendMessage("§c捕捉失败！ (" + catchPercent + "%)"); return; }
    player.sendMessage("§a捕捉成功！正在束缚... (" + catchPercent + "%)");
    startCaptureAnimation(player, entity, catchPercent, isSpecialItem);
}