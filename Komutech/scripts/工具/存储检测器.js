const HashMap = Java.type('java.util.HashMap');
const ChatColor = org.bukkit.ChatColor;

const WUDAO_STONE = "KOMUTECH_JZ_GJ_存储检测器";
const DIRECTIONS = [
    { name: "东", offsetX: 1, offsetZ: 0 },
    { name: "南", offsetX: 0, offsetZ: 1 },
    { name: "西", offsetX: -1, offsetZ: 0 },
    { name: "北", offsetX: 0, offsetZ: -1 }
];

var machineCache = new HashMap();
var facingCache = new HashMap();
var playerTimeCache = new HashMap();
var reportTimeCache = new HashMap();
var checkTimeCache = new HashMap();

function tick(info) {
    if (info.machine().getId() === WUDAO_STONE) {
        handleStone(info.block().getLocation());
    }
}

function handleStone(loc) {
    var now = new Date().getTime();
    if (now - checkTimeCache.getOrDefault(loc, 0) < 200) return;
    checkTimeCache.put(loc, now);
    
    var world = loc.getWorld();
    var player = getPlayerOnStone(loc, world, now);
    var machines = checkDirections(loc);
    
    machineCache.put(loc, machines);
    
    if (player) {
        handlePlayer(loc, player, machines, now);
    } else if (now - reportTimeCache.getOrDefault(loc, 0) >= 10000) {
        sendBriefReport(loc, world, machines);
        reportTimeCache.put(loc, now);
    }
}

function getPlayerOnStone(loc, world, now) {
    var center = loc.clone().add(0.5, 1, 0.5);
    
    for (var i = 0; i < world.getPlayers().size(); i++) {
        var player = world.getPlayers().get(i);
        var pLoc = player.getLocation();
        
        if (pLoc.getWorld().equals(world) &&
            Math.abs(pLoc.getX() - center.getX()) < 0.7 &&
            Math.abs(pLoc.getZ() - center.getZ()) < 0.7 &&
            Math.abs(pLoc.getY() - center.getY()) < 1.5) {
            
            var playerId = player.getUniqueId().toString();
            var onTime = playerTimeCache.getOrDefault(playerId, 0);
            playerTimeCache.put(playerId, now);
            
            if (now - onTime > 1000) return player;
        }
    }
    return null;
}

function checkDirections(loc) {
    var result = [];
    for (var i = 0; i < DIRECTIONS.length; i++) {
        var dir = DIRECTIONS[i];
        var targetLoc = loc.clone().add(dir.offsetX, 0, dir.offsetZ);
        var machine = StorageCacheUtils.getSfItem(targetLoc);
        
        result.push({
            direction: dir.name,
            index: i,
            machineId: machine ? machine.getId() : null,
            machineName: machine ? (machine.getItemName() || machine.getId()) : "无机器",
            location: targetLoc,
            storageInfo: machine ? checkStorage(targetLoc) : null
        });
    }
    return result;
}

function checkStorage(loc) {
    var menu = StorageCacheUtils.getMenu(loc);
    if (!menu) return null;
    
    var hasItems = false, itemCount = 0, itemTypes = 0, usedSlots = 0;
    var items = [];
    
    for (var slot = 0; slot < menu.getContents().length; slot++) {
        var item = menu.getItemInSlot(slot);
        if (item && !item.getType().equals(org.bukkit.Material.AIR)) {
            hasItems = true;
            itemCount += item.getAmount();
            itemTypes++;
            usedSlots++;
            
            var meta = item.getItemMeta();
            var name = meta && meta.hasDisplayName() ? 
                meta.getDisplayName() : 
                formatName(item.getType().name());
            
            items.push({
                name: name.length > 20 ? name.substring(0, 17) + "..." : name,
                amount: item.getAmount()
            });
        }
    }
    
    return {
        hasItems: hasItems,
        itemCount: itemCount,
        itemTypes: itemTypes,
        usedSlots: usedSlots,
        totalSlots: menu.getContents().length,
        items: items
    };
}

function handlePlayer(loc, player, machines, now) {
    var dirVector = player.getEyeLocation().getDirection();
    var dirIndex = getDirection(dirVector.getX(), dirVector.getZ());
    
    var playerId = player.getUniqueId().toString() + "_" + loc.toString();
    var lastDir = facingCache.getOrDefault(playerId, -1);
    var changed = (lastDir !== dirIndex);
    facingCache.put(playerId, dirIndex);
    
    if (changed || now - reportTimeCache.getOrDefault(loc, 0) >= 2000) {
        sendDetailedReport(player, machines[dirIndex], changed);
        reportTimeCache.put(loc, now);
    }
}

function getDirection(x, z) {
    return Math.abs(x) > Math.abs(z) ? (x > 0 ? 0 : 2) : (z > 0 ? 1 : 3);
}

function sendDetailedReport(player, info, isNewDir) {
    if (isNewDir) {
        player.sendMessage(ChatColor.GOLD + "=== 您正面向" + info.direction + "方 ===");
        player.playSound(player.getLocation(), "block.note_block.pling", 0.5, 1.2);
    }
    
    if (!info.machineId) {
        player.sendMessage(ChatColor.YELLOW + info.direction + "方: " + 
            ChatColor.RED + "没有检测到粘液机器");
        player.playSound(player.getLocation(), "block.note_block.bass", 0.3, 0.8);
        return;
    }
    
    var msg = ChatColor.YELLOW + info.direction + "方机器: " + 
        ChatColor.AQUA + ChatColor.stripColor(info.machineName) + "\n";
    
    if (info.storageInfo) {
        var s = info.storageInfo;
        if (s.hasItems) {
            var percent = s.totalSlots > 0 ? Math.round((s.usedSlots / s.totalSlots) * 100) : 0;
            msg += ChatColor.WHITE + "存储: " + ChatColor.GREEN + 
                s.usedSlots + "/" + s.totalSlots + "槽位 (" + percent + "%)\n";
            msg += ChatColor.WHITE + "物品: " + ChatColor.YELLOW + 
                s.itemCount + "个, " + s.itemTypes + "种\n";
            
            if (s.items.length > 0) {
                msg += ChatColor.WHITE + "主要物品:\n";
                for (var j = 0; j < Math.min(s.items.length, 5); j++) {
                    var item = s.items[j];
                    msg += ChatColor.GRAY + "  • " + ChatColor.WHITE + 
                        item.name + ChatColor.GRAY + " x" + item.amount + "\n";
                }
                if (s.items.length > 5) {
                    msg += ChatColor.GRAY + "  等" + (s.items.length - 5) + "种物品\n";
                }
            }
        } else {
            msg += ChatColor.GRAY + "存储: 空\n";
        }
    } else {
        msg += ChatColor.DARK_GRAY + "该机器没有存储空间\n";
    }
    
    player.sendMessage(msg);
    if (info.storageInfo && info.storageInfo.hasItems) {
        var percent = s.totalSlots > 0 ? Math.round((s.usedSlots / s.totalSlots) * 100) : 0;
        player.playSound(player.getLocation(), "block.note_block.chime", 0.3, 0.5 + (percent / 100) * 0.5);
    }
}

function sendBriefReport(loc, world, machines) {
    for (var i = 0; i < world.getPlayers().size(); i++) {
        var player = world.getPlayers().get(i);
        if (player.getLocation().distance(loc) <= 15) {
            var msg = ChatColor.GOLD + "=== 存储检测器 - 四向机器检测 ===\n";
            var anyFound = false;
            
            for (var j = 0; j < machines.length; j++) {
                var m = machines[j];
                msg += ChatColor.YELLOW + m.direction + ChatColor.WHITE + "方: ";
                
                if (m.machineId) {
                    anyFound = true;
                    msg += ChatColor.AQUA + ChatColor.stripColor(m.machineName) + " ";
                    
                    if (m.storageInfo) {
                        msg += m.storageInfo.hasItems ? 
                            ChatColor.GREEN + "[" + m.storageInfo.itemCount + "个物品]" :
                            ChatColor.GRAY + "[空]";
                    } else {
                        msg += ChatColor.DARK_GRAY + "[无存储]";
                    }
                } else {
                    msg += ChatColor.RED + "无机器";
                }
                if (j < machines.length - 1) msg += "\n";
            }
            
            msg += ChatColor.GRAY + "\n" + ChatColor.ITALIC + "站上机器并面向不同方向查看详细信息";
            player.sendMessage(msg);
            
            if (anyFound) {
                player.playSound(player.getLocation(), "block.note_block.hat", 0.3, 1.0);
            }
        }
    }
}

function formatName(materialName) {
    return materialName.toLowerCase().replace(/_/g, ' ')
        .replace(/\b\w/g, function(l) { return l.toUpperCase(); });
}

function onPlace(event) {
    var loc = event.getBlock().getLocation();
    clearCache(loc);
    
    var player = event.getPlayer();
    player.sendMessage(ChatColor.GREEN + "已放置存储检测器");
    player.sendMessage(ChatColor.YELLOW + "功能: 检测东南西北四个方向的粘液机器");
    player.sendMessage(ChatColor.GRAY + "站上机器并面向不同方向查看详细信息");
    
    handleStone(loc);
}

function onBreak(event, itemStack, drops) {
    clearCache(event.getBlock().getLocation());
    event.getPlayer().sendMessage(ChatColor.GOLD + "存储检测器已被拆除");
}

function clearCache(loc) {
    machineCache.remove(loc);
    reportTimeCache.remove(loc);
    checkTimeCache.remove(loc);
}