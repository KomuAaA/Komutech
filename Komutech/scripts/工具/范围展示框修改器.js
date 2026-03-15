var POSITION_KEYS = {FIRST: "§6§l位置一：", SECOND: "§6§l位置二："};
var MODES = {
    HIDE: {lore: "§6§l当前模式: §7隐形", name: "隐形", action: function(f) { f.setVisible(false); }},
    SHOW: {lore: "§6§l当前模式: §b显形", name: "显形", action: function(f) { f.setVisible(true); }},
    BREAK: {lore: "§6§l当前模式: §c拆除", name: "拆除", action: function(f) { f.remove(); }}
};
var COOLDOWN_TICKS = 10;
var BATCH_SIZE = 20;
var TARGET_ITEM_ID = "KOMUTECH_JZ_GJ_方位记录器";
var cooldowns = new java.util.HashMap();
var SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");
var Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
var Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
var Bukkit = Java.type('org.bukkit.Bukkit');
var scheduler = Bukkit.getScheduler();
var Runnable = Java.type('java.lang.Runnable');

function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) return true;
    var pm = Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}

function isStorageTool(item) {
    if (!item) return false;
    var sfItem = SlimefunItem.getByItem(item);
    return sfItem && sfItem.getId() === TARGET_ITEM_ID;
}

function findStorageTool(player) {
    var inv = player.getInventory();
    for (var i = 0; i < inv.getSize(); i++) {
        var item = inv.getItem(i);
        if (item && isStorageTool(item)) return item;
    }
    return null;
}

function getCurrentMode(lore) {
    if (!lore) return MODES.HIDE;
    for (var i = 0; i < lore.size(); i++) {
        var line = lore.get(i);
        if (!line) continue;
        if (line.indexOf("隐形") !== -1) return MODES.HIDE;
        if (line.indexOf("显形") !== -1) return MODES.SHOW;
        if (line.indexOf("拆除") !== -1) return MODES.BREAK;
    }
    return MODES.HIDE;
}

function switchMode(item, player) {
    var meta = item.getItemMeta();
    if (!meta) return;
    var lore = meta.hasLore() ? meta.getLore() : null;
    var modes = [MODES.HIDE, MODES.SHOW, MODES.BREAK];
    var currentIdx = modes.indexOf(getCurrentMode(lore));
    var newMode = modes[(currentIdx + 1) % modes.length];
    var newLore = new java.util.ArrayList();
    if (lore) {
        for (var i = 0; i < lore.size(); i++) {
            var line = lore.get(i);
            if (line && line.indexOf("当前模式") === -1) newLore.add(line);
        }
    }
    newLore.add(newMode.lore);
    meta.setLore(newLore);
    item.setItemMeta(meta);
    player.sendMessage("§a已切换至: " + newMode.name);
}

function parsePositionFromLore(lore, key) {
    if (!lore) return null;
    for (var i = 0; i < lore.size(); i++) {
        var line = lore.get(i);
        if (line && line.indexOf(key) === 0) {
            var match = line.substring(key.length).trim().match(/X:(-?\d+)\s+Y:(-?\d+)\s+Z:(-?\d+)/);
            if (match) return {x: parseInt(match[1]), y: parseInt(match[2]), z: parseInt(match[3])};
        }
    }
    return null;
}

function getItemFramesInRegion(world, minX, minY, minZ, maxX, maxY, maxZ) {
    var center = new org.bukkit.Location(world, (minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2);
    var half = 1 + Math.max(maxX-minX, maxY-minY, maxZ-minZ)/2;
    var frames = [];
    for (var ent of world.getNearbyEntities(center, half, half, half)) {
        if (ent instanceof org.bukkit.entity.ItemFrame || ent instanceof org.bukkit.entity.GlowItemFrame) {
            var loc = ent.getLocation();
            if (loc.getBlockX() >= minX && loc.getBlockX() <= maxX &&
                loc.getBlockY() >= minY && loc.getBlockY() <= maxY &&
                loc.getBlockZ() >= minZ && loc.getBlockZ() <= maxZ) {
                frames.push(ent);
            }
        }
    }
    return frames;
}

function checkCooldown(player) {
    var now = Bukkit.getServer().getCurrentTick();
    var uuid = player.getUniqueId().toString();
    if (cooldowns.containsKey(uuid) && now - cooldowns.get(uuid) < COOLDOWN_TICKS) return false;
    cooldowns.put(uuid, now);
    return true;
}

function onUse(event) {
    var player = event.getPlayer();
    var item = event.getItem();
    if (!player || !item || !checkCooldown(player)) return;
    if (player.isSneaking()) { switchMode(item, player); return; }
    var storageItem = findStorageTool(player);
    if (!storageItem) { player.sendMessage("§c背包中没有「方位记录器」"); return; }
    var meta = storageItem.getItemMeta();
    if (!meta || !meta.hasLore()) { player.sendMessage("§c记录器上没有坐标信息"); return; }
    var lore = meta.getLore();
    var pos1 = parsePositionFromLore(lore, POSITION_KEYS.FIRST);
    var pos2 = parsePositionFromLore(lore, POSITION_KEYS.SECOND);
    if (!pos1 || !pos2) { player.sendMessage("§c坐标信息不完整"); return; }
    var minX = Math.min(pos1.x, pos2.x), maxX = Math.max(pos1.x, pos2.x);
    var minY = Math.min(pos1.y, pos2.y), maxY = Math.max(pos1.y, pos2.y);
    var minZ = Math.min(pos1.z, pos2.z), maxZ = Math.max(pos1.z, pos2.z);
    var toolMeta = item.getItemMeta();
    var currentMode = getCurrentMode(toolMeta ? toolMeta.getLore() : null);
    var world = player.getWorld();
    var frames = getItemFramesInRegion(world, minX, minY, minZ, maxX, maxY, maxZ);
    if (frames.length === 0) { player.sendMessage("§e区域内无展示框"); return; }

    var plugin = Slimefun.instance();
    var index = 0;
    var processedCount = 0;
    var mode = currentMode;
    var playerId = player.getUniqueId();

    var MyRunnable = Java.extend(Runnable, {
        run: function() {
            var processed = 0;
            while (index < frames.length && processed < BATCH_SIZE) {
                var frame = frames[index];
                if (frame.isValid() && hasPermission(player, frame.getLocation())) {
                    mode.action(frame);
                    processedCount++;
                }
                index++;
                processed++;
            }
            if (index >= frames.length) {
                scheduler.cancelTask(taskId);
                if (player.isOnline()) {
                    player.sendMessage("§a操作完成，共处理 " + processedCount + " 个展示框");
                }
            }
        }
    });
    var task = scheduler.runTaskTimer(plugin, new MyRunnable(), 0, 1);
    var taskId = task.getTaskId();
    player.sendMessage("§a开始" + mode.name + "区域内展示框...");
}