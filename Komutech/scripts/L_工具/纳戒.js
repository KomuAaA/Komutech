const KOMUTECH_L_GJ_NJ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_L_GJ_NJ_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_GJ_NJ_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_GJ_NJ_EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const KOMUTECH_L_GJ_NJ_File = Java.type('java.io.File');
const KOMUTECH_L_GJ_NJ_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_GJ_NJ_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_GJ_NJ_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_GJ_NJ_InventoryCloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_GJ_NJ_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_GJ_NJ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_GJ_NJ_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_L_GJ_NJ_Base64 = Java.type('java.util.Base64');
const KOMUTECH_L_GJ_NJ_STORAGE_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/纳戒';
const KOMUTECH_L_GJ_NJ_BACKPACK_SIZE = 54;
const KOMUTECH_L_GJ_NJ_TITLE = '§b纳戒';
const KOMUTECH_L_GJ_NJ_COOLDOWN_MS = 1000;
let KOMUTECH_L_GJ_NJ_cooldowns = new java.util.HashMap();
let KOMUTECH_L_GJ_NJ_openPlayers = new java.util.HashSet();
let KOMUTECH_L_GJ_NJ_registered = false;
let KOMUTECH_L_GJ_NJ_listener = null;

function KOMUTECH_L_GJ_NJ_initDir() {
    let dir = new KOMUTECH_L_GJ_NJ_File(KOMUTECH_L_GJ_NJ_STORAGE_PATH);
    if (!dir.exists()) dir.mkdirs();
}
function KOMUTECH_L_GJ_NJ_getPlayerPath(player) {
    return KOMUTECH_L_GJ_NJ_STORAGE_PATH + '/[' + player.getName() + ']纳戒.json';
}
function KOMUTECH_L_GJ_NJ_serializeInventory(inv) {
    let items = [];
    for (let i = 0; i < inv.getSize(); i++) {
        let item = inv.getItem(i);
        if (!item || item.getType() === KOMUTECH_L_GJ_NJ_Material.AIR) {
            items.push(null);
        } else {
            items.push(KOMUTECH_L_GJ_NJ_Base64.getEncoder().encodeToString(item.serializeAsBytes()));
        }
    }
    return items;
}
function KOMUTECH_L_GJ_NJ_deserializeInventory(data) {
    let inv = KOMUTECH_L_GJ_NJ_Bukkit.createInventory(null, KOMUTECH_L_GJ_NJ_BACKPACK_SIZE, KOMUTECH_L_GJ_NJ_TITLE);
    if (!data) return inv;
    for (let i = 0; i < data.length; i++) {
        let b64 = data[i];
        if (!b64) continue;
        try {
            let bytes = KOMUTECH_L_GJ_NJ_Base64.getDecoder().decode(b64);
            inv.setItem(i, KOMUTECH_L_GJ_NJ_ItemStack.deserializeBytes(bytes));
        } catch (e) {}
    }
    return inv;
}
function KOMUTECH_L_GJ_NJ_loadBackpack(player) {
    let path = KOMUTECH_L_GJ_NJ_Paths.get(KOMUTECH_L_GJ_NJ_getPlayerPath(player));
    if (!KOMUTECH_L_GJ_NJ_Files.exists(path)) return null;
    try {
        let jsonStr = KOMUTECH_L_GJ_NJ_Files.readString(path, KOMUTECH_L_GJ_NJ_StandardCharsets.UTF_8);
        return JSON.parse(jsonStr);
    } catch (e) { return null; }
}
function KOMUTECH_L_GJ_NJ_saveBackpack(player, inv) {
    let data = KOMUTECH_L_GJ_NJ_serializeInventory(inv);
    let jsonStr = JSON.stringify(data);
    let path = KOMUTECH_L_GJ_NJ_Paths.get(KOMUTECH_L_GJ_NJ_getPlayerPath(player));
    try {
        KOMUTECH_L_GJ_NJ_initDir();
        KOMUTECH_L_GJ_NJ_Files.writeString(path, jsonStr, KOMUTECH_L_GJ_NJ_StandardCharsets.UTF_8);
    } catch (e) {}
}
function KOMUTECH_L_GJ_NJ_unregisterListener() {
    if (KOMUTECH_L_GJ_NJ_listener) {
        try { KOMUTECH_L_GJ_NJ_InventoryCloseEvent.getHandlerList().unregister(KOMUTECH_L_GJ_NJ_listener); } catch (ex) {
            if (ex.message && ex.message.includes("Context is already closed")) return;
        }
        KOMUTECH_L_GJ_NJ_listener = null;
    }
    KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui = null;
    KOMUTECH_L_GJ_NJ_registered = false;
}
function KOMUTECH_L_GJ_NJ_registerListener() {
    if (KOMUTECH_L_GJ_NJ_registered) return;
    if (KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui) {
        try { KOMUTECH_L_GJ_NJ_InventoryCloseEvent.getHandlerList().unregister(KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui); } catch (e) {
            if (e.message && e.message.includes("Context is already closed")) return;
        }
        KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui = null;
    }
    const L = Java.extend(KOMUTECH_L_GJ_NJ_Listener, {});
    const listener = new L();
    KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui = listener;
    KOMUTECH_L_GJ_NJ_listener = listener;
    KOMUTECH_L_GJ_NJ_registered = true;
    KOMUTECH_L_GJ_NJ_plugin.getServer().getPluginManager().registerEvent(
        KOMUTECH_L_GJ_NJ_InventoryCloseEvent, listener, KOMUTECH_L_GJ_NJ_EventPriority.NORMAL,
        (l, e) => {
            try {
                let p = e.getPlayer();
                if (!KOMUTECH_L_GJ_NJ_openPlayers.contains(p) || e.getView().getTitle() !== KOMUTECH_L_GJ_NJ_TITLE) return;
                KOMUTECH_L_GJ_NJ_openPlayers.remove(p);
                KOMUTECH_L_GJ_NJ_saveBackpack(p, e.getInventory());
                if (KOMUTECH_L_GJ_NJ_openPlayers.isEmpty()) KOMUTECH_L_GJ_NJ_unregisterListener();
            } catch (ex) {}
        }, KOMUTECH_L_GJ_NJ_plugin
    );
}
function KOMUTECH_L_GJ_NJ_onUse(e) {
    if (e.getHand() !== KOMUTECH_L_GJ_NJ_EquipmentSlot.HAND) return;
    let p = e.getPlayer();
    let uid = p.getUniqueId().toString();
    let now = Date.now();
    let last = KOMUTECH_L_GJ_NJ_cooldowns.get(uid) || 0;
    if (now - last < KOMUTECH_L_GJ_NJ_COOLDOWN_MS) {
        let remain = Math.ceil((KOMUTECH_L_GJ_NJ_COOLDOWN_MS - (now - last)) / 1000 * 10) / 10;
        p.sendActionBar("§c纳戒冷却中，请等待 §6" + remain + " §c秒");
        return;
    }
    KOMUTECH_L_GJ_NJ_cooldowns.put(uid, now);
    let openView = p.getOpenInventory();
    if (openView && openView.getTitle() === KOMUTECH_L_GJ_NJ_TITLE) {
        p.sendMessage("§c纳戒已打开，请先关闭当前界面再试！");
        return;
    }
    KOMUTECH_L_GJ_NJ_registerListener();
    let data = KOMUTECH_L_GJ_NJ_loadBackpack(p);
    let inv = KOMUTECH_L_GJ_NJ_deserializeInventory(data);
    p.openInventory(inv);
    KOMUTECH_L_GJ_NJ_openPlayers.add(p);
}
function onUse(e) { KOMUTECH_L_GJ_NJ_onUse(e); }
if (KOMUTECH_L_GJ_NJ_plugin.komutech_l_gj_njgui) {
    KOMUTECH_L_GJ_NJ_unregisterListener();
}