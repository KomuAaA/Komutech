let Material = Java.type('org.bukkit.Material');
let stored = new Map();
let Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
let Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');

function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) return true;
    let pm = Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}

function onUse(event) {
    let player = event.getPlayer();
    let target = player.getTargetBlock(null, 3);
    if (!target || target.getType() === Material.AIR) {
        player.sendMessage("§c❌ 未瞄准有效方块！");
        return;
    }
    let loc = target.getLocation();
    if (!hasPermission(player, loc)) {
        player.sendMessage("§c你没有权限在此区域操作方块！");
        player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        return;
    }
    if (player.isSneaking()) {
        stored.set(player.getName(), target.getType());
        player.sendMessage(`§a✅ 存储：§e${target.getType().name().replace(/_/g, " ")}`);
        updateTool(player);
        return;
    }
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

function updateTool(player) {
    let item = player.getInventory().getItemInMainHand();
    if (!item || item.getType() === Material.AIR) return;
    let mat = stored.get(player.getName());
    let lore = [
        "§7Shift+右键：存储材质",
        "§7右键：替换为存储材质",
        ""
    ];
    if (mat) lore.push(`§e存储：§6${mat.name().replace(/_/g, " ")}`);
    else lore.push("§c未存储材质");
    item.setLore(lore);
    player.getInventory().setItemInMainHand(item);
}

function onJoin(event) { updateTool(event.getPlayer()); }
function onDisable() { stored.clear(); }