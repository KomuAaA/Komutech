const ChatColor = org.bukkit.ChatColor;
const MESSAGE = "想用看说明";

function onOpen(event) {
    const player = event.getPlayer();
    player.sendMessage(ChatColor.translateAlternateColorCodes('&', MESSAGE));
}

function onClose(event) {
    // 菜单关闭时的处理（无需操作）
}

function onClick(event) {
    // 菜单点击时的处理（无需操作）
}