const ChatColor = org.bukkit.ChatColor;
const MESSAGE = "大胆竟敢想作弊";

function onUse(event) {
    const player = event.getPlayer();
    player.sendMessage(ChatColor.translateAlternateColorCodes('&', MESSAGE));
}