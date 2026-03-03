const ChatColor = org.bukkit.ChatColor;
const MESSAGE = "手中的道具非你能探索的哟~";

function onUse(event) {
    const player = event.getPlayer();
    player.sendMessage(ChatColor.translateAlternateColorCodes('&', MESSAGE));
}