const ChatColor = org.bukkit.ChatColor;
const MESSAGE = "想用看说明";

function onPlace(event) {
    const player = event.getPlayer();
    player.sendMessage(ChatColor.translateAlternateColorCodes('&', MESSAGE));
}

function onBreak(event) {
    // 机器被破坏时的处理（无需操作）
}

function tick(info) {
    // 机器的周期性处理（无需操作）
}