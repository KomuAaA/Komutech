const KOMUTECH_JZ_GJ_FWZSKXGQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_JZ_GJ_FWZSKXGQ_Location = Java.type('org.bukkit.Location');
const KOMUTECH_JZ_GJ_FWZSKXGQ_ItemFrame = Java.type('org.bukkit.entity.ItemFrame');
const KOMUTECH_JZ_GJ_FWZSKXGQ_GlowItemFrame = Java.type('org.bukkit.entity.GlowItemFrame');
const KOMUTECH_JZ_GJ_FWZSKXGQ_Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
const KOMUTECH_JZ_GJ_FWZSKXGQ_Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
const KOMUTECH_JZ_GJ_FWZSKXGQ_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_JZ_GJ_FWZSKXGQ_NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const KOMUTECH_JZ_GJ_FWZSKXGQ_PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');
const KOMUTECH_JZ_GJ_FWZSKXGQ_POSITION_KEYS = { FIRST: "§6§l位置一：", SECOND: "§6§l位置二：" };
const KOMUTECH_JZ_GJ_FWZSKXGQ_MODES = [
    { id: 0, name: "隐形", action: function(f) { f.setVisible(false); }, lore: "§6§l当前模式: §7隐形" },
    { id: 1, name: "显形", action: function(f) { f.setVisible(true); }, lore: "§6§l当前模式: §b显形" },
    { id: 2, name: "拆除", action: function(f) { f.remove(); }, lore: "§6§l当前模式: §c拆除" }
];
const KOMUTECH_JZ_GJ_FWZSKXGQ_TARGET_ITEM_ID = "KOMUTECH_JZ_GJ_方位记录器";
const KOMUTECH_JZ_GJ_FWZSKXGQ_BATCH_SIZE = 20;
const KOMUTECH_JZ_GJ_FWZSKXGQ_MODE_KEY = new KOMUTECH_JZ_GJ_FWZSKXGQ_NamespacedKey("komutech", "fwzskxgq_mode");
let KOMUTECH_JZ_GJ_FWZSKXGQ_cooldowns = new java.util.HashMap();
const KOMUTECH_JZ_GJ_FWZSKXGQ_COOLDOWN_MS = 1000;
function KOMUTECH_JZ_GJ_FWZSKXGQ_hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") || player.hasPermission("komutech.hologram.bypass") || player.isOp()) return true;
    const pm = KOMUTECH_JZ_GJ_FWZSKXGQ_Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, KOMUTECH_JZ_GJ_FWZSKXGQ_Interaction.BREAK_BLOCK) && pm.hasPermission(player, location, KOMUTECH_JZ_GJ_FWZSKXGQ_Interaction.INTERACT_BLOCK);
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_isStorageTool(item) {
    if (!item) return false;
    const sf = KOMUTECH_JZ_GJ_FWZSKXGQ_SlimefunItem.getByItem(item);
    return sf && sf.getId() === KOMUTECH_JZ_GJ_FWZSKXGQ_TARGET_ITEM_ID;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_findStorageTool(player) {
    const inv = player.getInventory();
    for (let i = 0; i < inv.getSize(); i++) {
        const item = inv.getItem(i);
        if (item && KOMUTECH_JZ_GJ_FWZSKXGQ_isStorageTool(item)) return item;
    }
    return null;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_getModeFromPDC(item) {
    const meta = item.getItemMeta();
    if (!meta) return 0;
    const pdc = meta.getPersistentDataContainer();
    if (pdc.has(KOMUTECH_JZ_GJ_FWZSKXGQ_MODE_KEY, KOMUTECH_JZ_GJ_FWZSKXGQ_PersistentDataType.INTEGER)) {
        return pdc.get(KOMUTECH_JZ_GJ_FWZSKXGQ_MODE_KEY, KOMUTECH_JZ_GJ_FWZSKXGQ_PersistentDataType.INTEGER);
    }
    return 0;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_setModeToPDC(item, modeId) {
    const meta = item.getItemMeta();
    if (!meta) return;
    const pdc = meta.getPersistentDataContainer();
    pdc.set(KOMUTECH_JZ_GJ_FWZSKXGQ_MODE_KEY, KOMUTECH_JZ_GJ_FWZSKXGQ_PersistentDataType.INTEGER, modeId);
    let lore = meta.getLore() || [];
    const newLore = [];
    for (let line of lore) {
        if (!line.startsWith("§6§l当前模式:")) newLore.push(line);
    }
    newLore.push(KOMUTECH_JZ_GJ_FWZSKXGQ_MODES[modeId].lore);
    meta.setLore(newLore);
    item.setItemMeta(meta);
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_switchMode(item, player) {
    const current = KOMUTECH_JZ_GJ_FWZSKXGQ_getModeFromPDC(item);
    const next = (current + 1) % KOMUTECH_JZ_GJ_FWZSKXGQ_MODES.length;
    KOMUTECH_JZ_GJ_FWZSKXGQ_setModeToPDC(item, next);
    player.sendActionBar("§a已切换至: " + KOMUTECH_JZ_GJ_FWZSKXGQ_MODES[next].name);
    player.playSound(player.getLocation(), "entity.experience_orb.pickup", 1.0, 1.0);
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_parsePositionFromLore(lore, key) {
    if (!lore) return null;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line && line.indexOf(key) === 0) {
            const match = line.substring(key.length).trim().match(/X:(-?\d+)\s+Y:(-?\d+)\s+Z:(-?\d+)/);
            if (match) return { x: parseInt(match[1]), y: parseInt(match[2]), z: parseInt(match[3]) };
        }
    }
    return null;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_getItemFramesInRegion(world, minX, minY, minZ, maxX, maxY, maxZ) {
    const center = new KOMUTECH_JZ_GJ_FWZSKXGQ_Location(world, (minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2);
    const half = Math.max(maxX-minX, maxY-minY, maxZ-minZ)/2 + 1;
    const frames = [];
    for (let ent of world.getNearbyEntities(center, half, half, half)) {
        if (ent instanceof KOMUTECH_JZ_GJ_FWZSKXGQ_ItemFrame || ent instanceof KOMUTECH_JZ_GJ_FWZSKXGQ_GlowItemFrame) {
            const loc = ent.getLocation();
            if (loc.getBlockX() >= minX && loc.getBlockX() <= maxX &&
                loc.getBlockY() >= minY && loc.getBlockY() <= maxY &&
                loc.getBlockZ() >= minZ && loc.getBlockZ() <= maxZ) {
                frames.push(ent);
            }
        }
    }
    return frames;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_checkCooldown(player) {
    const now = Date.now();
    const uuid = player.getUniqueId().toString();
    const last = KOMUTECH_JZ_GJ_FWZSKXGQ_cooldowns.get(uuid);
    if (last && now - last < KOMUTECH_JZ_GJ_FWZSKXGQ_COOLDOWN_MS) return false;
    KOMUTECH_JZ_GJ_FWZSKXGQ_cooldowns.put(uuid, now);
    return true;
}
function KOMUTECH_JZ_GJ_FWZSKXGQ_onUse(event) {
    try {
        const player = event.getPlayer();
        const item = event.getItem();
        if (!player || !item || !KOMUTECH_JZ_GJ_FWZSKXGQ_checkCooldown(player)) return;
        if (player.isSneaking()) {
            KOMUTECH_JZ_GJ_FWZSKXGQ_switchMode(item, player);
            return;
        }
        const storageItem = KOMUTECH_JZ_GJ_FWZSKXGQ_findStorageTool(player);
        if (!storageItem) { player.sendMessage("§c背包中没有「方位记录器」"); return; }
        const meta = storageItem.getItemMeta();
        if (!meta || !meta.hasLore()) { player.sendMessage("§c记录器上没有坐标信息"); return; }
        const lore = meta.getLore();
        const pos1 = KOMUTECH_JZ_GJ_FWZSKXGQ_parsePositionFromLore(lore, KOMUTECH_JZ_GJ_FWZSKXGQ_POSITION_KEYS.FIRST);
        const pos2 = KOMUTECH_JZ_GJ_FWZSKXGQ_parsePositionFromLore(lore, KOMUTECH_JZ_GJ_FWZSKXGQ_POSITION_KEYS.SECOND);
        if (!pos1 || !pos2) { player.sendMessage("§c坐标信息不完整"); return; }
        const minX = Math.min(pos1.x, pos2.x), maxX = Math.max(pos1.x, pos2.x);
        const minY = Math.min(pos1.y, pos2.y), maxY = Math.max(pos1.y, pos2.y);
        const minZ = Math.min(pos1.z, pos2.z), maxZ = Math.max(pos1.z, pos2.z);
        const modeId = KOMUTECH_JZ_GJ_FWZSKXGQ_getModeFromPDC(item);
        const mode = KOMUTECH_JZ_GJ_FWZSKXGQ_MODES[modeId];
        const world = player.getWorld();
        const frames = KOMUTECH_JZ_GJ_FWZSKXGQ_getItemFramesInRegion(world, minX, minY, minZ, maxX, maxY, maxZ);
        if (frames.length === 0) { player.sendMessage("§e区域内无展示框"); return; }
        const plugin = KOMUTECH_JZ_GJ_FWZSKXGQ_Slimefun.instance();
        let index = 0;
        let processedCount = 0;
        const playerName = player.getName();
        let task = null;
        const runnable = new (Java.extend(Java.type('java.lang.Runnable'), {
            run: function() {
                const p = KOMUTECH_JZ_GJ_FWZSKXGQ_Bukkit.getPlayer(playerName);
                if (p === null || !p.isOnline()) {
                    if (task) task.cancel();
                    return;
                }
                let processed = 0;
                while (index < frames.length && processed < KOMUTECH_JZ_GJ_FWZSKXGQ_BATCH_SIZE) {
                    const frame = frames[index];
                    if (frame.isValid() && KOMUTECH_JZ_GJ_FWZSKXGQ_hasPermission(p, frame.getLocation())) {
                        mode.action(frame);
                        processedCount++;
                    }
                    index++;
                    processed++;
                }
                if (index >= frames.length) {
                    if (task) task.cancel();
                    if (p.isOnline()) {
                        p.sendActionBar("§a操作完成，共处理 " + processedCount + " 个展示框");
                        p.playSound(p.getLocation(), "entity.experience_orb.pickup", 1.0, 1.0);
                    }
                }
            }
        }))();
        task = KOMUTECH_JZ_GJ_FWZSKXGQ_Bukkit.getScheduler().runTaskTimer(plugin, runnable, 0, 1);
        player.sendActionBar("§a开始" + mode.name + "区域内展示框...");
        player.playSound(player.getLocation(), "entity.experience_orb.pickup", 1.0, 1.0);
    } catch (err) { print("范围展示框修改器错误: " + err); }
}
function onUse(e) { KOMUTECH_JZ_GJ_FWZSKXGQ_onUse(e); }