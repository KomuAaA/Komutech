const Bukkit = Java.type('org.bukkit.Bukkit');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const KOMUTECH_L_DJ_GDQ_DATA_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const KOMUTECH_L_DJ_GDQ_ITEM_ID = 'KOMUTECH_L_DJ_功德券';
const KOMUTECH_L_DJ_GDQ_PER_TICKET = 100;
function KOMUTECH_L_DJ_GDQ_sendMsg(player, msg) { player.spigot().sendMessage(ChatMessageType.ACTION_BAR, new TextComponent(msg)); }
function KOMUTECH_L_DJ_GDQ_loadData(name) { try { const path = Paths.get(KOMUTECH_L_DJ_GDQ_DATA_DIR, '[' + name + '].json'); return Files.exists(path) ? JSON.parse(Files.readString(path, StandardCharsets.UTF_8)) : null; } catch(e) { return null; } }
function KOMUTECH_L_DJ_GDQ_saveData(name, data) { try { const path = Paths.get(KOMUTECH_L_DJ_GDQ_DATA_DIR, '[' + name + '].json'); Files.writeString(path, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); return true; } catch(e) { return false; } }
function KOMUTECH_L_DJ_GDQ_getTicketSlot(player) {
    const main = player.getInventory().getItemInMainHand();
    const off = player.getInventory().getItemInOffHand();
    const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
    let isTicket = function(item) {
        if (!item || item.getType().isAir()) return false;
        const sf = SlimefunItem.getByItem(item);
        return sf && sf.getId() === KOMUTECH_L_DJ_GDQ_ITEM_ID;
    };
    if (isTicket(main)) return { slot: 'main', item: main, amount: main.getAmount() };
    if (isTicket(off)) return { slot: 'off', item: off, amount: off.getAmount() };
    return null;
}
function KOMUTECH_L_DJ_GDQ_consumeTicket(player, slot, consumeAll) {
    const inv = player.getInventory();
    let item = slot === 'main' ? inv.getItemInMainHand() : inv.getItemInOffHand();
    if (!item || item.getAmount() < 1) return 0;
    let consumed = consumeAll ? item.getAmount() : 1;
    if (item.getAmount() > consumed) {
        item.setAmount(item.getAmount() - consumed);
    } else {
        if (slot === 'main') inv.setItemInMainHand(null);
        else inv.setItemInOffHand(null);
    }
    player.updateInventory();
    return consumed;
}
function onUse(event) {
    const player = event.getPlayer();
    const ticket = KOMUTECH_L_DJ_GDQ_getTicketSlot(player);
    if (!ticket) { KOMUTECH_L_DJ_GDQ_sendMsg(player, "§c请手持功德券使用！"); return; }
    let data = KOMUTECH_L_DJ_GDQ_loadData(player.getName());
    if (!data) { KOMUTECH_L_DJ_GDQ_sendMsg(player, "§c无法读取玩家属性数据！"); return; }
    let current = data.功德 || 0;
    let consumeAll = player.isSneaking();
    let amount = consumeAll ? ticket.amount : 1;
    if (amount < 1) { KOMUTECH_L_DJ_GDQ_sendMsg(player, "§c没有足够的功德券！"); return; }
    let add = amount * KOMUTECH_L_DJ_GDQ_PER_TICKET;
    let newMerit = current + add;
    data.功德 = newMerit;
    if (!KOMUTECH_L_DJ_GDQ_saveData(player.getName(), data)) {
        KOMUTECH_L_DJ_GDQ_sendMsg(player, "§c保存数据失败！");
        return;
    }
    let consumed = KOMUTECH_L_DJ_GDQ_consumeTicket(player, ticket.slot, consumeAll);
    if (consumed !== amount) {
        KOMUTECH_L_DJ_GDQ_sendMsg(player, "§c消耗功德券数量异常！");
        return;
    }
    KOMUTECH_L_DJ_GDQ_sendMsg(player, `§a功德 +${add} §7(消耗${consumed}张) §7| §f当前 ${newMerit}`);
    player.getWorld().playSound(player.getLocation(), "block.note_block.bell", 1, 1);
}