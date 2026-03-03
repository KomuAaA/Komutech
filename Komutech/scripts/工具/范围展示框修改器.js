var POSITION_KEYS = {
    FIRST: "§6§l位置一：",
    SECOND: "§6§l位置二："
};

var MODES = {
    HIDE: { lore: "§6§l当前模式: §7隐形", action: false, name: "隐形" },
    SHOW: { lore: "§6§l当前模式: §b显形", action: true, name: "显形" }
};

var COOLDOWN_TICKS = 10;
var TARGET_ITEM_ID = "KOMUTECH_JZ_GJ_方位记录器";

var cooldowns = new java.util.HashMap();

var ITEM_FRAME_ITEM = new org.bukkit.inventory.ItemStack(org.bukkit.Material.ITEM_FRAME);
var GLOW_ITEM_FRAME_ITEM = new org.bukkit.inventory.ItemStack(org.bukkit.Material.GLOW_ITEM_FRAME);

var SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");

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
    }
    return MODES.HIDE;
}

function switchMode(item, player) {
    var meta = item.getItemMeta();
    if (!meta) return;
    
    var lore = meta.hasLore() ? meta.getLore() : null;
    var currentMode = getCurrentMode(lore);
    
    // 仅循环两种模式：HIDE -> SHOW -> HIDE
    var newMode = (currentMode === MODES.HIDE) ? MODES.SHOW : MODES.HIDE;
    
    var newLore = new java.util.ArrayList();
    if (lore) {
        for (var i = 0; i < lore.size(); i++) {
            var line = lore.get(i);
            if (line && line.indexOf("当前模式") === -1) {
                newLore.add(line);
            }
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
            if (match) return { x: parseInt(match[1]), y: parseInt(match[2]), z: parseInt(match[3]) };
        }
    }
    return null;
}

function getItemFramesInRegion(world, minX, minY, minZ, maxX, maxY, maxZ) {
    var centerX = (minX + maxX) / 2;
    var centerY = (minY + maxY) / 2;
    var centerZ = (minZ + maxZ) / 2;
    var halfX = (maxX - minX) / 2 + 1.0;
    var halfY = (maxY - minY) / 2 + 1.0;
    var halfZ = (maxZ - minZ) / 2 + 1.0;
    
    var centerLoc = new org.bukkit.Location(world, centerX, centerY, centerZ);
    var nearby = world.getNearbyEntities(centerLoc, halfX, halfY, halfZ);
    var frames = [];
    
    var iter = nearby.iterator();
    while (iter.hasNext()) {
        var entity = iter.next();
        if (entity instanceof org.bukkit.entity.ItemFrame || entity instanceof org.bukkit.entity.GlowItemFrame) {
            var loc = entity.getLocation();
            var bx = loc.getBlockX(), by = loc.getBlockY(), bz = loc.getBlockZ();
            if (bx >= minX && bx <= maxX && by >= minY && by <= maxY && bz >= minZ && bz <= maxZ) {
                frames.push(entity);
            }
        }
    }
    return frames;
}

function checkCooldown(player) {
    var now = org.bukkit.Bukkit.getServer().getCurrentTick();
    var uuid = player.getUniqueId().toString();
    if (cooldowns.containsKey(uuid) && now - cooldowns.get(uuid) < COOLDOWN_TICKS) {
        return false;
    }
    cooldowns.put(uuid, now);
    return true;
}

function onUse(event) {
    var player = event.getPlayer();
    var item = event.getItem();
    if (!player || !item) return;
    
    if (!checkCooldown(player)) {
        player.sendMessage("§c操作过于频繁，请稍后再试");
        return;
    }
    
    if (player.isSneaking()) {
        switchMode(item, player);
        return;
    }
    
    var storageItem = findStorageTool(player);
    if (!storageItem) {
        player.sendMessage("§c背包中没有「方位记录器」");
        return;
    }
    
    var meta = storageItem.getItemMeta();
    if (!meta || !meta.hasLore()) {
        player.sendMessage("§c记录器上没有坐标信息");
        return;
    }
    
    var lore = meta.getLore();
    var pos1 = parsePositionFromLore(lore, POSITION_KEYS.FIRST);
    var pos2 = parsePositionFromLore(lore, POSITION_KEYS.SECOND);
    
    if (!pos1 || !pos2) {
        player.sendMessage("§c坐标信息不完整");
        return;
    }
    
    var minX = Math.min(pos1.x, pos2.x), maxX = Math.max(pos1.x, pos2.x);
    var minY = Math.min(pos1.y, pos2.y), maxY = Math.max(pos1.y, pos2.y);
    var minZ = Math.min(pos1.z, pos2.z), maxZ = Math.max(pos1.z, pos2.z);
    
    var toolMeta = item.getItemMeta();
    var currentMode = getCurrentMode(toolMeta ? toolMeta.getLore() : null);
    
    try {
        var frames = getItemFramesInRegion(player.getWorld(), minX, minY, minZ, maxX, maxY, maxZ);
        
        if (frames.length === 0) {
            player.sendMessage("§e指定区域内没有找到展示框");
            return;
        }
        
        // 移除拆除模式，直接执行可见/不可见操作
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].isValid()) {
                frames[i].setVisible(currentMode.action);
            }
        }
        player.sendMessage("§a已将坐标区域内的展示框设为: §f" + currentMode.name);
        player.sendMessage("§7受影响展示框数量: §f" + frames.length);
    } catch (e) {
        player.sendMessage("§c处理展示框时出现错误，请重试");
    }
}