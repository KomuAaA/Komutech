// 魂缚符 - 绑定生物进行远程攻击的道具
const CFG = {
    BIND_COOLDOWN: 60,
    DAMAGE_COOLDOWN: 10,
    RAY_TRACE_RANGE: 50,
    ENERGY_COST: 5,
    PARTICLE_COUNT: 50
};

// === 类型导入和全局变量 ===
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const ArrayList = Java.type('java.util.ArrayList');

const cooldowns = { bind: new java.util.HashMap(), damage: new java.util.HashMap() };

// === 冷却检查函数 ===
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

// === 物品信息处理函数 ===
function getItemInfo(item) {
    if (!item || item.getType() === org.bukkit.Material.AIR) return null;
    
    const meta = item.getItemMeta();
    if (!meta) return null;
    
    const lore = meta.getLore() || new ArrayList();
    const info = { energy: 0, maxEnergy: 100, bindUuid: null, bindName: null, meta: meta };
    
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (!line) continue;
        
        if (line.includes("灵力剩余")) {
            const match = line.match(/§6(\d+)\s*§7\/\s*§6(\d+)/);
            if (match) {
                info.energy = parseInt(match[1]) || 0;
                info.maxEnergy = parseInt(match[2]) || 100;
            }
        } else if (line.includes("UUID:")) {
            const parts = line.split("UUID:");
            if (parts[1]) info.bindUuid = parts[1].replace(/§[0-9a-fA-F]/g, "").trim();
        } else if (line.includes("绑定: ")) {
            const nameStart = line.indexOf("绑定: ");
            if (nameStart !== -1) info.bindName = line.substring(nameStart + 4).replace(/§[0-9a-fA-F]/g, "").trim();
        }
    }
    return info;
}

function updateLore(item, energy, bindUuid, bindName) {
    const meta = item.getItemMeta();
    if (!meta) return false;
    
    const oldLore = meta.getLore() || new ArrayList();
    const newLore = new ArrayList();
    
    for (let i = 0; i < oldLore.size(); i++) {
        const line = oldLore.get(i);
        if (line && !line.includes("灵力剩余") && !line.includes("绑定: ") && !line.includes("UUID:")) {
            newLore.add(line);
        }
    }
    
    const info = getItemInfo(item);
    const maxEnergy = info ? info.maxEnergy : 100;
    
    newLore.add(`§b灵力剩余：§6${energy} §7/ §6${maxEnergy}`);
    
    if (bindName) {
        newLore.add(`§a绑定: §e${bindName}`);
        if (bindUuid) newLore.add(`§7§kUUID:${bindUuid}`);
    }
    
    meta.setLore(newLore);
    item.setItemMeta(meta);
    return true;
}

function consumeEnergy(player, cost) {
    const item = player.getInventory().getItemInMainHand();
    if (!item || item.getType() === org.bukkit.Material.AIR) return false;
    
    const info = getItemInfo(item);
    if (!info || info.energy < cost) {
        player.sendMessage(`§c灵力不足！需要 ${cost} 点灵力`);
        return false;
    }
    
    const newEnergy = info.energy - cost;
    updateLore(item, newEnergy, info.bindUuid, info.bindName);
    return true;
}

// === 射线检测和粒子效果函数 ===
function rayTrace(player) {
    const world = player.getWorld();
    const startLoc = player.getEyeLocation();
    const direction = startLoc.getDirection();
    
    const hitResult = world.rayTrace(
        startLoc, 
        direction, 
        CFG.RAY_TRACE_RANGE,
        Java.type('org.bukkit.FluidCollisionMode').NEVER,
        true,
        1.0,
        e => e !== player && e instanceof LivingEntity
    );
    
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
        endLoc = startLoc.clone().add(
            direction.getX() * CFG.RAY_TRACE_RANGE,
            direction.getY() * CFG.RAY_TRACE_RANGE,
            direction.getZ() * CFG.RAY_TRACE_RANGE
        );
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

function spawnEntityParticles(entity, isSuccess) {
    if (!entity || !entity.isValid()) return;
    
    const world = entity.getWorld();
    const loc = entity.getLocation();
    const color = isSuccess === true ? Color.fromRGB(50, 205, 50) : 
                 isSuccess === false ? Color.fromRGB(220, 20, 60) : null;
    
    for (let i = 0; i < 30; i++) {
        const offsetX = (Math.random() - 0.5) * 2.5;
        const offsetY = Math.random() * entity.getHeight() * 1.2;
        const offsetZ = (Math.random() - 0.5) * 2.5;
        
        const particleLoc = loc.clone().add(offsetX, offsetY, offsetZ);
        
        if (color) {
            world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(),
                1, 0, 0, 0, 0, new DustOptions(color, 0.8));
        } else {
            const colors = [
                Color.fromRGB(0, 255, 255),
                Color.fromRGB(255, 105, 180),
                Color.fromRGB(138, 43, 226),
                Color.fromRGB(255, 215, 0)
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            world.spawnParticle(Particle.DUST, particleLoc.getX(), particleLoc.getY(), particleLoc.getZ(),
                1, 0, 0, 0, 0, new DustOptions(randomColor, 0.8));
        }
    }
}

// === 辅助函数 ===
function unbindAndConsume(player, item, energy) {
    updateLore(item, energy, null, null);
    
    if (item.getAmount() > 1) {
        item.setAmount(item.getAmount() - 1);
    } else {
        player.getInventory().setItemInMainHand(null);
    }
    player.updateInventory();
}

// 根据UUID查找实体
function findEntity(uuidStr) {
    if (!uuidStr) return null;
    
    try {
        const uuid = java.util.UUID.fromString(uuidStr);
        const worlds = Bukkit.getWorlds();
        
        for (let w of worlds) {
            for (let e of w.getEntities()) {
                if (e.getUniqueId().equals(uuid)) {
                    return e;
                }
            }
        }
    } catch(e) {
        // UUID格式错误
    }
    
    return null;
}

// === 主函数 ===
function onUse(e) {
    const p = e.getPlayer();
    const item = p.getInventory().getItemInMainHand();
    if (!item || item.getType() === org.bukkit.Material.AIR) return true;
    
    if (p.isSneaking()) {
        if (!checkCooldown(p, 'bind')) return true;
        
        const info = getItemInfo(item);
        if (info && info.bindUuid) {
            const entity = findEntity(info.bindUuid);
            if (entity) {
                p.sendMessage(`§c已绑定：${info.bindName || '未知生物'}！§e普通右键攻击`);
            } else {
                updateLore(item, info.energy, null, null);
                p.sendMessage("§c绑定的生物已不存在，记录已清除。");
            }
            return true;
        }
        
        if (!consumeEnergy(p, CFG.ENERGY_COST)) return true;
        
        const target = rayTrace(p);
        
        shootRayParticles(p, target);
        
        if (!target) {
            p.sendMessage("§c未找到生物");
            return true;
        }
        
        const healthRatio = (target.getHealth() / p.getHealth()) * 100;
        const chance = healthRatio <= 10 ? 1.0 : healthRatio <= 20 ? 0.9 : 
                       healthRatio <= 50 ? 0.6 : healthRatio <= 80 ? 0.3 : 0.1;
        const percent = Math.round(chance * 100);
        
        if (Math.random() <= chance) {
            const newInfo = getItemInfo(item);
            if (newInfo) {
                const finalEnergy = newInfo.energy - CFG.ENERGY_COST;
                updateLore(item, finalEnergy, target.getUniqueId().toString(), target.getName());
                p.sendMessage(`§a绑定成功！(${percent}%)`);
                spawnEntityParticles(target, true);
            }
        } else {
            p.sendMessage(`§c绑定失败！(${percent}%)`);
            spawnEntityParticles(target, false);
        }
        
    } else {
        if (!checkCooldown(p, 'damage')) return true;
        
        const info = getItemInfo(item);
        if (!info || !info.bindUuid) {
            p.sendMessage("§c未绑定！蹲下右键绑定生物");
            return true;
        }
        
        const entity = findEntity(info.bindUuid);
        if (!entity) {
            p.sendMessage("§c生物不存在，绑定解除！");
            unbindAndConsume(p, item, info.energy);
            return true;
        }
        
        // 消耗灵力
        if (!consumeEnergy(p, CFG.ENERGY_COST)) return true;
        
        entity.damage(1, p);
        
        const currentHealth = entity.getHealth();
        const newHealth = Math.max(0, currentHealth - 10);
        entity.setHealth(newHealth);
        
        p.sendMessage(`§c对${entity.getName()}造成10点真实伤害！`);
        spawnEntityParticles(entity, null);
        
        if (entity.getHealth() <= 0) {
            p.sendMessage("§c生物已死亡，绑定解除！");
            unbindAndConsume(p, item, getItemInfo(item).energy);
        }
    }
    
    return true;
}