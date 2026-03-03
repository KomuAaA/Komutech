// Slimefun PDC检测器脚本 - 放置时发送下方方块PDC信息
let Material = Java.type('org.bukkit.Material');
let PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');

function getBlockBelow(detectorLoc) {
    const world = detectorLoc.getWorld();
    const x = detectorLoc.getBlockX();
    const y = detectorLoc.getBlockY() - 1;
    const z = detectorLoc.getBlockZ();
    if (y < world.getMinHeight()) return null;
    return world.getBlockAt(x, y, z);
}

function onPlace(event) {
    const player = event.getPlayer();
    const block = event.getBlockPlaced();
    const blockBelow = getBlockBelow(block.getLocation());
    
    if (!blockBelow || blockBelow.getType() === Material.AIR) {
        player.sendMessage("§c下方无方块或为空气");
        return;
    }
    
    try {
        const state = blockBelow.getState();
        if (state.getPersistentDataContainer) {
            const pdc = state.getPersistentDataContainer();
            const keys = pdc.getKeys();
            
            player.sendMessage("§6===== 方块PDC信息 =====");
            player.sendMessage("§7方块类型: §f" + blockBelow.getType().name());
            
            const keyIterator = keys.iterator();
            let hasPDC = false;
            
            while (keyIterator.hasNext()) {
                const key = keyIterator.next();
                const value = pdc.get(key, PersistentDataType.STRING);
                
                if (value) {
                    player.sendMessage("§e" + key.toString() + ": §f" + value);
                    hasPDC = true;
                }
            }
            
            if (!hasPDC) {
                player.sendMessage("§7该方块没有PDC数据");
            }
        } else {
            player.sendMessage("§7该方块不支持PDC");
        }
    } catch (error) {
        player.sendMessage("§c读取PDC时出错: " + error.message);
    }
}

function process(e) {}

function onInteract(event) {
    event.setCancelled(true);
}

function onBreak(event) {}

function onDisable() {}