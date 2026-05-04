const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const ArrayList = Java.type('java.util.ArrayList');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');

const DATA_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const SPIRIT_COST = 5;
const CFG = { BIND_COOLDOWN: 60, DAMAGE_COOLDOWN: 10, RAY_TRACE_RANGE: 50, ENERGY_COST: SPIRIT_COST, PARTICLE_COUNT: 50 };

const cooldowns = { bind: new java.util.HashMap(), damage: new java.util.HashMap() };

function loadData(name) { let p = Paths.get(DATA_DIR, '[' + name + '].json'); if (!Files.exists(p)) return null; try { return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch (e) { return null; } }
function saveData(name, d) { let p = Paths.get(DATA_DIR, '[' + name + '].json'); try { Files.writeString(p, JSON.stringify(d, null, 2), StandardCharsets.UTF_8); return true; } catch (e) { return false; } }
function parseLingli(raw) { if (typeof raw !== 'string') raw = '100/100+0'; let m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)\+(-?\d+)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: parseInt(m[3]) }; m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: 0 }; return { cur: 100, max: 100, bonus: 0 }; }
function formatLingli(cur, max, bonus) { return cur.toFixed(2) + '/' + max + (bonus !== 0 ? '+' + bonus : ''); }
function getPlayerHealthActual(player) { let data = loadData(player.getName()); if (data && data['血量_实际'] !== undefined) return parseFloat(data['血量_实际']); return 0; }
function consumeSpirit(player, cost) { let data = loadData(player.getName()); if (!data) return false; if (!data.灵力) data.灵力 = '100/100+0'; let ling = parseLingli(data.灵力); if (ling.cur < cost) return false; ling.cur -= cost; data.灵力 = formatLingli(ling.cur, ling.max, ling.bonus); return saveData(player.getName(), data); }

function checkCooldown(player, type) {
    const now = Bukkit.getServer().getCurrentTick();
    const uuid = player.getUniqueId().toString();
    const map = cooldowns[type];
    const cooldown = type === 'bind' ? CFG.BIND_COOLDOWN : CFG.DAMAGE_COOLDOWN;
    if (map.containsKey(uuid) && now - map.get(uuid) < cooldown) {
        const remaining = ((cooldown - (now - map.get(uuid))) * 0.05).toFixed(1);
        player.sendMessage(`§c${type === 'bind' ? '绑定' : '伤害'}冷却中，请等待 ${remaining} 秒！`);
        return false;
    }
    map.put(uuid, now);
    return true;
}
function getItemInfo(item) {
    if (!item || item.getType() === org.bukkit.Material.AIR) return null;
    const meta = item.getItemMeta();
    if (!meta) return null;
    const lore = meta.getLore() || new ArrayList();
    const info = { bindUuid: null, bindName: null, meta: meta };
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (!line) continue;
        if (line.includes("UUID:")) { const parts = line.split("UUID:"); if (parts[1]) info.bindUuid = parts[1].replace(/§[0-9a-fA-F]/g, "").trim(); }
        else if (line.includes("绑定: ")) { const nameStart = line.indexOf("绑定: "); if (nameStart !== -1) info.bindName = line.substring(nameStart + 4).replace(/§[0-9a-fA-F]/g, "").trim(); }
    }
    return info;
}
function updateLore(item, bindUuid, bindName) {
    const meta = item.getItemMeta();
    if (!meta) return false;
    const oldLore = meta.getLore() || new ArrayList();
    const newLore = new ArrayList();
    for (let i = 0; i < oldLore.size(); i++) {
        const line = oldLore.get(i);
        if (line && !line.includes("绑定: ") && !line.includes("UUID:")) newLore.add(line);
    }
    if (bindName) { newLore.add(`§a绑定: §e${bindName}`); if (bindUuid) newLore.add(`§7§kUUID:${bindUuid}`); }
    meta.setLore(newLore);
    item.setItemMeta(meta);
    return true;
}
function rayTrace(player) {
    const world = player.getWorld();
    const startLoc = player.getEyeLocation();
    const direction = startLoc.getDirection();
    const hitResult = world.rayTrace(startLoc, direction, CFG.RAY_TRACE_RANGE, Java.type('org.bukkit.FluidCollisionMode').NEVER, true, 1.0, e => e !== player && e instanceof LivingEntity);
    return hitResult ? hitResult.getHitEntity() : null;
}
function shootRayParticles(player, targetEntity) {
    const startLoc = player.getEyeLocation();
    const world = player.getWorld();
    let endLoc;
    if (targetEntity && targetEntity.isValid() && targetEntity instanceof LivingEntity) {
        endLoc = targetEntity.getLocation().add(0, targetEntity.getHeight() / 2, 0);
    } else {
        const direction = startLoc.getDirection().normalize();
        endLoc = startLoc.clone().add(direction.getX() * CFG.RAY_TRACE_RANGE, direction.getY() * CFG.RAY_TRACE_RANGE, direction.getZ() * CFG.RAY_TRACE_RANGE);
    }
    const direction = endLoc.clone().subtract(startLoc).toVector();
    const distance = direction.length();
    const maxDistance = Math.min(distance, CFG.RAY_TRACE_RANGE);
    if (maxDistance < 0.5) return;
    direction.normalize();
    const startColor = Color.fromRGB(0, 255, 255);
    const endColor = Color.fromRGB(255, 105, 180);
    for (let d = 0; d <= maxDistance; d += maxDistance / CFG.PARTICLE_COUNT) {
        const progress = d / maxDistance;
        const r = Math.round(startColor.getRed() + (endColor.getRed() - startColor.getRed()) * progress);
        const g = Math.round(startColor.getGreen() + (endColor.getGreen() - startColor.getGreen()) * progress);
        const b = Math.round(startColor.getBlue() + (endColor.getBlue() - startColor.getBlue()) * progress);
        world.spawnParticle(Particle.DUST, startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getX(), startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getY(), startLoc.clone().add(direction.getX() * d, direction.getY() * d, direction.getZ() * d).getZ(), 1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(r, g, b), 0.6));
    }
}
function spawnEntityParticles(entity, isSuccess) {
    if (!entity || !entity.isValid()) return;
    const world = entity.getWorld();
    const loc = entity.getLocation();
    const color = isSuccess === true ? Color.fromRGB(50, 205, 50) : isSuccess === false ? Color.fromRGB(220, 20, 60) : null;
    for (let i = 0; i < 30; i++) {
        const offsetX = (Math.random() - 0.5) * 2.5;
        const offsetY = Math.random() * entity.getHeight() * 1.2;
        const offsetZ = (Math.random() - 0.5) * 2.5;
        const particleLoc = loc.clone().add(offsetX, offsetY, offsetZ);
        if (color) world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(), 1, 0, 0, 0, 0, new DustOptions(color, 0.8));
        else {
            const colors = [Color.fromRGB(0, 255, 255), Color.fromRGB(255, 105, 180), Color.fromRGB(138, 43, 226), Color.fromRGB(255, 215, 0)];
            world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(), 1, 0, 0, 0, 0, new DustOptions(colors[Math.floor(Math.random() * colors.length)], 0.8));
        }
    }
}
function findEntity(uuidStr) {
    if (!uuidStr) return null;
    try {
        const uuid = java.util.UUID.fromString(uuidStr);
        const worlds = Bukkit.getWorlds();
        for (let w of worlds) { for (let e of w.getEntities()) { if (e.getUniqueId().equals(uuid)) return e; } }
    } catch (e) {}
    return null;
}

function onUse(e) {
    const p = e.getPlayer();
    const item = p.getInventory().getItemInMainHand();
    if (!item || item.getType() === org.bukkit.Material.AIR) return true;
    if (p.isSneaking()) {
        if (!checkCooldown(p, 'bind')) return true;
        const info = getItemInfo(item);
        if (info && info.bindUuid) {
            const entity = findEntity(info.bindUuid);
            if (entity) { p.sendMessage(`§c已绑定：${info.bindName || '未知生物'}！§e普通右键攻击`); }
            else { updateLore(item, null, null); p.sendMessage("§c绑定的生物已不存在，记录已清除。"); }
            return true;
        }
        const target = rayTrace(p);
        shootRayParticles(p, target);
        if (!target) { p.sendMessage("§c未找到生物"); return true; }
        const baseHealth = getPlayerHealthActual(p) + 20;
        const healthRatio = (target.getHealth() / baseHealth) * 100;
        const chance = healthRatio <= 10 ? 1.0 : healthRatio <= 20 ? 0.9 : healthRatio <= 50 ? 0.6 : healthRatio <= 80 ? 0.3 : 0.1;
        const percent = Math.round(chance * 100);
        if (Math.random() <= chance) {
            // 消耗灵力
            if (!consumeSpirit(p, SPIRIT_COST)) { p.sendMessage("§c灵力不足！需要 " + SPIRIT_COST + " 点灵力"); return true; }
            updateLore(item, target.getUniqueId().toString(), target.getName());
            p.sendMessage(`§a绑定成功！(${percent}%)`);
            spawnEntityParticles(target, true);
        } else {
            p.sendMessage(`§c绑定失败！(${percent}%)`);
            spawnEntityParticles(target, false);
        }
    } else {
        if (!checkCooldown(p, 'damage')) return true;
        const info = getItemInfo(item);
        if (!info || !info.bindUuid) { p.sendMessage("§c未绑定！蹲下右键绑定生物"); return true; }
        const entity = findEntity(info.bindUuid);
        if (!entity) { p.sendMessage("§c生物不存在，绑定解除！"); unbind(p, item); return true; }
        if (!consumeSpirit(p, SPIRIT_COST)) { p.sendMessage("§c灵力不足！需要 " + SPIRIT_COST + " 点灵力"); return true; }
        entity.damage(1, p);
        const newHealth = Math.max(0, entity.getHealth() - 10);
        entity.setHealth(newHealth);
        p.sendMessage(`§c对${entity.getName()}造成10点真实伤害！`);
        spawnEntityParticles(entity, null);
        if (entity.getHealth() <= 0) { p.sendMessage("§c生物已死亡，绑定解除！"); unbind(p, item); }
    }
    return true;
}
function unbind(player, item) {
    if (item.getAmount() > 1) item.setAmount(item.getAmount() - 1);
    else player.getInventory().setItemInMainHand(null);
    player.updateInventory();
}