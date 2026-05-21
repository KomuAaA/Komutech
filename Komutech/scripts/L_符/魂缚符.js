(function() {
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const Player = Java.type('org.bukkit.entity.Player');
const ArrayList = Java.type('java.util.ArrayList');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const Consumer = Java.type('java.util.function.Consumer');
const Runnable = Java.type('java.lang.Runnable');
globalThis.KOMUTECH = globalThis.KOMUTECH || {};
globalThis.KOMUTECH.HFF = globalThis.KOMUTECH.HFF || {};
const KOMUTECH_L_F_HFF_DATA_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const KOMUTECH_L_F_HFF_CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵杖属性.json";
const KOMUTECH_L_F_HFF_BASE_SPIRIT_COST = 50;
const KOMUTECH_L_F_HFF_DEFAULT_DAMAGE = 10;
const KOMUTECH_L_F_HFF_CFG = { BIND_COOLDOWN: 60, DAMAGE_COOLDOWN: 10, RAY_TRACE_RANGE: 50, PARTICLE_COUNT: 50 };
globalThis.KOMUTECH.HFF.cooldowns = globalThis.KOMUTECH.HFF.cooldowns || { bind: new java.util.HashMap(), damage: new java.util.HashMap() };
globalThis.KOMUTECH.HFF.waitingInput = globalThis.KOMUTECH.HFF.waitingInput || new java.util.HashMap();
let KOMUTECH_L_F_HFF_REALM_TABLE = null;
let KOMUTECH_L_F_HFF_ATTR_MAP = null;
let KOMUTECH_L_F_HFF_GENGU_FACTOR = 1.0;
let KOMUTECH_L_F_HFF_REALM_NAMES = ["引气入体","练气","筑基","金丹","元婴","化神","大成","渡劫","飞升","神人"];
try {
    const pth = Paths.get(KOMUTECH_L_F_HFF_CONFIG_PATH);
    if (Files.exists(pth)) {
        const cfg = JSON.parse(Files.readString(pth, StandardCharsets.UTF_8));
        KOMUTECH_L_F_HFF_REALM_TABLE = cfg["修为倍率"];
        KOMUTECH_L_F_HFF_ATTR_MAP = cfg["灵根属性倍率"];
        const formula = cfg["公式参数"];
        if (formula && formula["根骨消耗因子"] !== undefined) {
            KOMUTECH_L_F_HFF_GENGU_FACTOR = parseFloat(formula["根骨消耗因子"]);
        }
    }
} catch(e) { print("[魂缚符] 加载配置失败: " + e); }
function KOMUTECH_L_F_HFF_sendMsg(player, msg) { player.spigot().sendMessage(ChatMessageType.ACTION_BAR, new TextComponent(msg)); }
function KOMUTECH_L_F_HFF_loadData(name) { try { const path = Paths.get(KOMUTECH_L_F_HFF_DATA_DIR, "[" + name + "].json"); return Files.exists(path) ? JSON.parse(Files.readString(path, StandardCharsets.UTF_8)) : null; } catch(e) { return null; } }
function KOMUTECH_L_F_HFF_saveData(name, data) { try { const path = Paths.get(KOMUTECH_L_F_HFF_DATA_DIR, "[" + name + "].json"); Files.writeString(path, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); return true; } catch(e) { return false; } }
function KOMUTECH_L_F_HFF_parseLingli(raw) { if (typeof raw !== 'string') raw = '100/100+0'; let m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)\+(-?\d+)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: parseInt(m[3]) }; m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: 0 }; return { cur: 100, max: 100, bonus: 0 }; }
function KOMUTECH_L_F_HFF_formatLingli(cur, max, bonus) { return cur.toFixed(2) + '/' + max + (bonus !== 0 ? '+' + bonus : ''); }
function KOMUTECH_L_F_HFF_getPlayerHealthActual(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); return data && data['血量_实际'] !== undefined ? parseFloat(data['血量_实际']) : 0; }
function KOMUTECH_L_F_HFF_getPlayerAttackActual(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); return data && data['攻击力_实际'] !== undefined ? parseFloat(data['攻击力_实际']) : 0; }
function KOMUTECH_L_F_HFF_getPlayerGengu(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); return data && data['根骨'] !== undefined ? parseFloat(data['根骨']) : 1; }
function KOMUTECH_L_F_HFF_getTotalQuality(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); return data && data['总品质'] !== undefined ? parseFloat(data['总品质']) : 1.0; }
function KOMUTECH_L_F_HFF_getPlayerRealmAndRank(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); if (!data || !data['修为']) return { realm: "引气入体", rank: 1 }; let text = data['修为']; let m = text.match(/『([^·]+)·(\d+)阶』/); if (m) return { realm: m[1], rank: parseInt(m[2]) }; m = text.match(/『(.+)阶』/); if (m) return { realm: m[1], rank: 1 }; return { realm: "引气入体", rank: 1 }; }
function KOMUTECH_L_F_HFF_getRealmCoef(realm, rank) { if (!KOMUTECH_L_F_HFF_REALM_TABLE) return 1.0; let arr = KOMUTECH_L_F_HFF_REALM_TABLE[realm]; if (!arr) return 1.0; let idx = Math.min(rank - 1, arr.length - 1); return parseFloat(arr[idx]); }
function KOMUTECH_L_F_HFF_getLingxiCoef(player) { let data = KOMUTECH_L_F_HFF_loadData(player.getName()); if (!data || !data['灵根属性']) return 1.0; let attr = data['灵根属性']; return KOMUTECH_L_F_HFF_ATTR_MAP && KOMUTECH_L_F_HFF_ATTR_MAP[attr] ? parseFloat(KOMUTECH_L_F_HFF_ATTR_MAP[attr]) : 1.0; }
function KOMUTECH_L_F_HFF_compareRealm(player, targetPlayer) { let p1 = KOMUTECH_L_F_HFF_getPlayerRealmAndRank(player); let p2 = KOMUTECH_L_F_HFF_getPlayerRealmAndRank(targetPlayer); let idx1 = KOMUTECH_L_F_HFF_REALM_NAMES.indexOf(p1.realm); let idx2 = KOMUTECH_L_F_HFF_REALM_NAMES.indexOf(p2.realm); if (idx1 === -1) idx1 = 0; if (idx2 === -1) idx2 = 0; if (idx1 > idx2) return 1; if (idx1 < idx2) return -1; if (p1.rank > p2.rank) return 1; if (p1.rank < p2.rank) return -1; return 0; }
function KOMUTECH_L_F_HFF_calcSpiritCost(player, baseCost) {
    const realmInfo = KOMUTECH_L_F_HFF_getPlayerRealmAndRank(player);
    const realmCoef = KOMUTECH_L_F_HFF_getRealmCoef(realmInfo.realm, realmInfo.rank);
    const lingxiCoef = KOMUTECH_L_F_HFF_getLingxiCoef(player);
    const gengu = KOMUTECH_L_F_HFF_getPlayerGengu(player);
    let cost = baseCost * realmCoef * lingxiCoef * gengu * KOMUTECH_L_F_HFF_GENGU_FACTOR;
    cost = Math.round(cost);
    if (cost < 1) cost = 1;
    return cost;
}
function KOMUTECH_L_F_HFF_consumeSpirit(player, baseCost) {
    const cost = KOMUTECH_L_F_HFF_calcSpiritCost(player, baseCost);
    let data = KOMUTECH_L_F_HFF_loadData(player.getName());
    if (!data) return { success: false, cost: cost, remaining: 0 };
    if (!data.灵力) data.灵力 = '100/100+0';
    let ling = KOMUTECH_L_F_HFF_parseLingli(data.灵力);
    if (ling.cur < cost) return { success: false, cost: cost, remaining: ling.cur };
    ling.cur -= cost;
    data.灵力 = KOMUTECH_L_F_HFF_formatLingli(ling.cur, ling.max, ling.bonus);
    if (KOMUTECH_L_F_HFF_saveData(player.getName(), data)) {
        return { success: true, cost: cost, remaining: ling.cur };
    }
    return { success: false, cost: cost, remaining: ling.cur };
}
function KOMUTECH_L_F_HFF_checkCooldown(player, type) { const now = Bukkit.getServer().getCurrentTick(); const uuid = player.getUniqueId().toString(); const map = globalThis.KOMUTECH.HFF.cooldowns[type]; const cooldown = type === 'bind' ? KOMUTECH_L_F_HFF_CFG.BIND_COOLDOWN : KOMUTECH_L_F_HFF_CFG.DAMAGE_COOLDOWN; if (map.containsKey(uuid) && now - map.get(uuid) < cooldown) { const remaining = ((cooldown - (now - map.get(uuid))) * 0.05).toFixed(1); KOMUTECH_L_F_HFF_sendMsg(player, `§c${type === 'bind' ? '绑定' : '伤害'}冷却中，请等待 ${remaining} 秒！`); return false; } map.put(uuid, now); return true; }
function KOMUTECH_L_F_HFF_getItemInfo(item) { if (!item || item.getType() === org.bukkit.Material.AIR) return null; const meta = item.getItemMeta(); if (!meta) return null; const lore = meta.getLore() || new ArrayList(); const info = { bindUuid: null, bindName: null, damage: KOMUTECH_L_F_HFF_DEFAULT_DAMAGE }; for (let i = 0; i < lore.size(); i++) { const line = lore.get(i); if (!line) continue; if (line.includes("UUID:")) { const parts = line.split("UUID:"); if (parts[1]) info.bindUuid = parts[1].replace(/§[0-9a-fA-F]/g, "").trim(); } else if (line.includes("绑定: ")) { const nameStart = line.indexOf("绑定: "); if (nameStart !== -1) info.bindName = line.substring(nameStart + 4).replace(/§[0-9a-fA-F]/g, "").trim(); } else if (line.includes("伤害设定: ")) { const dmgPart = line.split("伤害设定: ")[1]; if (dmgPart) info.damage = parseInt(dmgPart.replace(/§[0-9a-fA-F]/g, "").trim()); } } return info; }
function KOMUTECH_L_F_HFF_updateLore(item, bindUuid, bindName, damage) { const meta = item.getItemMeta(); if (!meta) return false; const oldLore = meta.getLore() || new ArrayList(); const newLore = new ArrayList(); for (let i = 0; i < oldLore.size(); i++) { const line = oldLore.get(i); if (line && !line.includes("绑定: ") && !line.includes("UUID:") && !line.includes("伤害设定: ")) newLore.add(line); } if (bindName) { newLore.add(`§a绑定: §e${bindName}`); if (bindUuid) newLore.add(`§7§kUUID:${bindUuid}`); } if (damage !== undefined) newLore.add(`§7伤害设定: §e${damage}`); meta.setLore(newLore); item.setItemMeta(meta); return true; }
function KOMUTECH_L_F_HFF_rayTrace(player) { const world = player.getWorld(); const startLoc = player.getEyeLocation(); const direction = startLoc.getDirection(); const hitResult = world.rayTrace(startLoc, direction, KOMUTECH_L_F_HFF_CFG.RAY_TRACE_RANGE, Java.type('org.bukkit.FluidCollisionMode').NEVER, true, 1.0, e => e !== player && e instanceof LivingEntity); return hitResult ? hitResult.getHitEntity() : null; }
function KOMUTECH_L_F_HFF_shootRayParticles(player, targetEntity) { const startLoc = player.getEyeLocation(); const world = player.getWorld(); let endLoc; if (targetEntity && targetEntity.isValid() && targetEntity instanceof LivingEntity) { endLoc = targetEntity.getLocation().add(0, targetEntity.getHeight() / 2, 0); } else { const direction = startLoc.getDirection().normalize(); endLoc = startLoc.clone().add(direction.getX() * KOMUTECH_L_F_HFF_CFG.RAY_TRACE_RANGE, direction.getY() * KOMUTECH_L_F_HFF_CFG.RAY_TRACE_RANGE, direction.getZ() * KOMUTECH_L_F_HFF_CFG.RAY_TRACE_RANGE); } const direction = endLoc.clone().subtract(startLoc).toVector(); const distance = direction.length(); const maxDistance = Math.min(distance, KOMUTECH_L_F_HFF_CFG.RAY_TRACE_RANGE); if (maxDistance < 0.5) return; direction.normalize(); const startColor = Color.fromRGB(0, 255, 255); const endColor = Color.fromRGB(255, 105, 180); for (let d = 0; d <= maxDistance; d += maxDistance / KOMUTECH_L_F_HFF_CFG.PARTICLE_COUNT) { const progress = d / maxDistance; const r = Math.round(startColor.getRed() + (endColor.getRed() - startColor.getRed()) * progress); const g = Math.round(startColor.getGreen() + (endColor.getGreen() - startColor.getGreen()) * progress); const b = Math.round(startColor.getBlue() + (endColor.getBlue() - startColor.getBlue()) * progress); world.spawnParticle(Particle.DUST, startLoc.getX() + direction.getX() * d, startLoc.getY() + direction.getY() * d, startLoc.getZ() + direction.getZ() * d, 1, 0, 0, 0, 0, new DustOptions(Color.fromRGB(r, g, b), 0.6)); } }
function KOMUTECH_L_F_HFF_spawnEntityParticles(entity, isSuccess) { if (!entity || !entity.isValid()) return; const world = entity.getWorld(); const loc = entity.getLocation(); let color; if (isSuccess === true) color = Color.fromRGB(50, 205, 50); else if (isSuccess === false) color = Color.fromRGB(220, 20, 60); for (let i = 0; i < 30; i++) { const ox = (Math.random() - 0.5) * 2.5; const oy = Math.random() * entity.getHeight() * 1.2; const oz = (Math.random() - 0.5) * 2.5; const pl = loc.clone().add(ox, oy, oz); if (color) world.spawnParticle(Particle.DUST, pl.getX(), pl.getY(), pl.getZ(), 1, 0, 0, 0, 0, new DustOptions(color, 0.8)); else { const colors = [Color.fromRGB(0,255,255), Color.fromRGB(255,105,180), Color.fromRGB(138,43,226), Color.fromRGB(255,215,0)]; world.spawnParticle(Particle.DUST, pl.getX(), pl.getY(), pl.getZ(), 1, 0, 0, 0, 0, new DustOptions(colors[Math.floor(Math.random() * colors.length)], 0.8)); } } }
function KOMUTECH_L_F_HFF_findEntity(uuidStr) { if (!uuidStr) return null; try { const uuid = java.util.UUID.fromString(uuidStr); for (let w of Bukkit.getWorlds()) { for (let e of w.getEntities()) { if (e.getUniqueId().equals(uuid)) return e; } } } catch(e) {} return null; }
function KOMUTECH_L_F_HFF_unbind(player, item) { if (item.getAmount() > 1) item.setAmount(item.getAmount() - 1); else player.getInventory().setItemInMainHand(null); player.updateInventory(); }
function KOMUTECH_L_F_HFF_calcBindChance(player, target) {
    const playerHealthBase = KOMUTECH_L_F_HFF_getPlayerHealthActual(player) + 20;
    const targetHealth = target.getHealth();
    const realmInfo = KOMUTECH_L_F_HFF_getPlayerRealmAndRank(player);
    const realmCoef = KOMUTECH_L_F_HFF_getRealmCoef(realmInfo.realm, realmInfo.rank);
    const lingxiCoef = KOMUTECH_L_F_HFF_getLingxiCoef(player);
    const totalQuality = KOMUTECH_L_F_HFF_getTotalQuality(player);
    let base = realmCoef * lingxiCoef * totalQuality;
    if (base > 1.0) base = 1.0;
    if (target instanceof Player) {
        const compare = KOMUTECH_L_F_HFF_compareRealm(player, target);
        if (compare < 0) return 0;
    }
    let final = base;
    if (targetHealth > playerHealthBase) {
        final = base * (playerHealthBase / targetHealth);
    }
    if (final > 1.0) final = 1.0;
    if (final < 0) final = 0;
    return final;
}
function KOMUTECH_L_F_HFF_startSettingDamage(player, item, info) {
    const uuid = player.getUniqueId().toString();
    const maxDamage = KOMUTECH_L_F_HFF_getPlayerAttackActual(player);
    if (globalThis.KOMUTECH.HFF.waitingInput.containsKey(uuid)) {
        KOMUTECH_L_F_HFF_sendMsg(player, "§c你已经在设置中，请先完成上一次操作");
        return;
    }
    KOMUTECH_L_F_HFF_sendMsg(player, `§a请输入新的伤害值 (1-${Math.floor(maxDamage)}，当前${info.damage})，输入0取消：`);
    const plugin = Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
    const consumer = new (Java.extend(Consumer))({
        accept: function(input) {
            globalThis.KOMUTECH.HFF.waitingInput.remove(uuid);
            const msg = input.trim();
            if (msg === "0") {
                KOMUTECH_L_F_HFF_sendMsg(player, "§c取消设置");
                return;
            }
            const newDamage = parseInt(msg);
            if (isNaN(newDamage) || newDamage < 1 || newDamage > maxDamage) {
                KOMUTECH_L_F_HFF_sendMsg(player, "§c无效数字或超出上限！");
                return;
            }
            Bukkit.getScheduler().runTask(plugin, new (Java.extend(Runnable))({
                run: function() {
                    KOMUTECH_L_F_HFF_updateLore(item, info.bindUuid, info.bindName, newDamage);
                    KOMUTECH_L_F_HFF_sendMsg(player, `§a伤害已设为 ${newDamage}`);
                }
            }));
        }
    });
    const timeoutTask = Bukkit.getScheduler().runTaskLater(plugin, new (Java.extend(Runnable))({
        run: function() {
            if (globalThis.KOMUTECH.HFF.waitingInput.containsKey(uuid)) {
                globalThis.KOMUTECH.HFF.waitingInput.remove(uuid);
                if (player.isOnline()) KOMUTECH_L_F_HFF_sendMsg(player, "§c设置超时已取消");
            }
        }
    }), 20 * 15);
    globalThis.KOMUTECH.HFF.waitingInput.put(uuid, timeoutTask);
    getChatInput(player, consumer);
}
function KOMUTECH_L_F_HFF_onUse(event) { const player = event.getPlayer(); const item = player.getInventory().getItemInMainHand(); if (!item || item.getType() === org.bukkit.Material.AIR) return; if (player.isSneaking()) { if (!KOMUTECH_L_F_HFF_checkCooldown(player, 'bind')) return; const info = KOMUTECH_L_F_HFF_getItemInfo(item); if (info && info.bindUuid) { const entity = KOMUTECH_L_F_HFF_findEntity(info.bindUuid); if (entity) { const waiting = globalThis.KOMUTECH.HFF.waitingInput.get(player.getUniqueId().toString()); if (waiting) { waiting.cancel(); globalThis.KOMUTECH.HFF.waitingInput.remove(player.getUniqueId().toString()); KOMUTECH_L_F_HFF_sendMsg(player, "§c已取消之前的设置"); } KOMUTECH_L_F_HFF_startSettingDamage(player, item, info); } else { KOMUTECH_L_F_HFF_updateLore(item, null, null, null); KOMUTECH_L_F_HFF_sendMsg(player, "§c绑定的生物已不存在，记录已清除。"); } return; } const target = KOMUTECH_L_F_HFF_rayTrace(player); KOMUTECH_L_F_HFF_shootRayParticles(player, target); if (!target) { KOMUTECH_L_F_HFF_sendMsg(player, "§c未找到生物"); return; } const chance = KOMUTECH_L_F_HFF_calcBindChance(player, target); const percent = Math.floor(chance * 100); if (Math.random() <= chance) { const result = KOMUTECH_L_F_HFF_consumeSpirit(player, KOMUTECH_L_F_HFF_BASE_SPIRIT_COST); if (!result.success) { KOMUTECH_L_F_HFF_sendMsg(player, `§c灵力不足！需要 ${result.cost} 点灵力，当前 ${Math.floor(result.remaining)}`); return; } KOMUTECH_L_F_HFF_sendMsg(player, `§a消耗 ${result.cost} 灵力 §7| §f剩余 ${Math.floor(result.remaining)} §7| §a绑定成功！(${percent}%)`); KOMUTECH_L_F_HFF_updateLore(item, target.getUniqueId().toString(), target.getName(), KOMUTECH_L_F_HFF_DEFAULT_DAMAGE); KOMUTECH_L_F_HFF_spawnEntityParticles(target, true); } else { KOMUTECH_L_F_HFF_sendMsg(player, `§c绑定失败！(${percent}%)`); KOMUTECH_L_F_HFF_spawnEntityParticles(target, false); } } else { if (!KOMUTECH_L_F_HFF_checkCooldown(player, 'damage')) return; const info = KOMUTECH_L_F_HFF_getItemInfo(item); if (!info || !info.bindUuid) { KOMUTECH_L_F_HFF_sendMsg(player, "§c未绑定！蹲下右键绑定生物"); return; } const entity = KOMUTECH_L_F_HFF_findEntity(info.bindUuid); if (!entity) { KOMUTECH_L_F_HFF_sendMsg(player, "§c生物不存在，绑定解除！"); KOMUTECH_L_F_HFF_unbind(player, item); return; } const result = KOMUTECH_L_F_HFF_consumeSpirit(player, KOMUTECH_L_F_HFF_BASE_SPIRIT_COST); if (!result.success) { KOMUTECH_L_F_HFF_sendMsg(player, `§c灵力不足！需要 ${result.cost} 点灵力，当前 ${Math.floor(result.remaining)}`); return; } entity.damage(info.damage, player); KOMUTECH_L_F_HFF_sendMsg(player, `§a消耗 ${result.cost} 灵力 §7| §f剩余 ${Math.floor(result.remaining)} §7| §c对 ${entity.getName()} 造成 ${info.damage} 伤害`); KOMUTECH_L_F_HFF_spawnEntityParticles(entity, null); if (entity.getHealth() <= 0) { KOMUTECH_L_F_HFF_sendMsg(player, "§c生物已死亡，绑定解除！"); KOMUTECH_L_F_HFF_unbind(player, item); } } }
globalThis.onUse = KOMUTECH_L_F_HFF_onUse;
})();