// 材质替换工具 - 简化版
let Material = Java.type('org.bukkit.Material');
let stored = new Map(); // 玩家 → 存储材质

// 工具使用事件
function onUse(event) {
    let player = event.getPlayer();
    let target = player.getTargetBlock(null, 3);
    
    if (!target || target.getType() === Material.AIR) {
        player.sendMessage("§c❌ 未瞄准有效方块！");
        return;
    }

    // Shift+右键：存储材质
    if (player.isSneaking()) {
        stored.set(player.getName(), target.getType());
        player.sendMessage(`§a✅ 存储：§e${target.getType().name().replace(/_/g, " ")}`);
        updateTool(player);
        return;
    }

    // 普通右键：替换方块
    let mat = stored.get(player.getName());
    if (!mat) {
        player.sendMessage("§c❌ 请先用Shift+右键存储材质！");
        updateTool(player);
        return;
    }

    target.setType(mat);
    player.sendMessage(`§a✅ 替换为：§e${mat.name().replace(/_/g, " ")}`);
    updateTool(player);
}

// 更新工具说明
function updateTool(player) {
    let item = player.getInventory().getItemInMainHand();
    if (!item || item.getType() === Material.AIR) return;
    
    let mat = stored.get(player.getName());
    let lore = [
        "§7Shift+右键：存储材质",
        "§7右键：替换为存储材质",
        ""
    ];
    
    if (mat) {
        lore.push(`§e存储：§6${mat.name().replace(/_/g, " ")}`);
    } else {
        lore.push("§c未存储材质");
    }
    
    item.setLore(lore);
    player.getInventory().setItemInMainHand(item);
}

// 玩家加入时初始化
function onJoin(event) {
    updateTool(event.getPlayer());
}

// 插件卸载清理
function onDisable() {
    stored.clear();
}