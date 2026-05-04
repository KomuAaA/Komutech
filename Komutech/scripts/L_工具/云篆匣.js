(function() {
const Bukkit = Java.type('org.bukkit.Bukkit');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const InventoryClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InventoryDragEvent = Java.type('org.bukkit.event.inventory.InventoryDragEvent');
const InventoryCloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const STORAGE_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣';
const ATTR_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const TITLE = '§b云篆匣';
const SIZE = 9;
const SCROLL_PREFIX = 'KOMUTECH_L_JZ_';
const CONFIG_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/卷轴属性.json';
const COOLDOWN_MS = 1000;
let openPlayers = new java.util.HashMap();
let listener = null;
let scrollCfg = null;
let cooldowns = new java.util.HashMap();
try {
    const raw = Files.readString(Paths.get(CONFIG_PATH), StandardCharsets.UTF_8);
    scrollCfg = JSON.parse(raw);
} catch(e) { print("[云篆匣] 加载卷轴属性失败: " + e); }
function initDir() {
    const dir = new java.io.File(STORAGE_DIR);
    if (!dir.exists()) dir.mkdirs();
}
function getPath(name) { return Paths.get(STORAGE_DIR, '[' + name + ']云篆匣.json'); }
function loadData(name) {
    const p = getPath(name);
    if (!Files.exists(p)) return { 卷轴数据: new Array(SIZE).fill(null), 熟练度记录: {} };
    try { return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[云篆匣] 读取失败: " + e); return { 卷轴数据: new Array(SIZE).fill(null), 熟练度记录: {} }; }
}
function saveData(name, data) {
    try { initDir(); Files.writeString(getPath(name), JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[云篆匣] 保存失败: " + e); }
}
function getPlayerWuxing(playerName) {
    try {
        const p = Paths.get(ATTR_DIR, '[' + playerName + '].json');
        if (!Files.exists(p)) return 1;
        const attr = JSON.parse(Files.readString(p, StandardCharsets.UTF_8));
        const val = parseFloat(attr["悟性"]) || 1;
        return Math.min(9, Math.max(1, Math.floor(val)));
    } catch(e) { return 1; }
}
function getSkillName(fullId) { return fullId.startsWith(SCROLL_PREFIX) ? fullId.substring(SCROLL_PREFIX.length) : fullId; }
function getMaxProf(skillName) {
    if (!scrollCfg || !skillName) return 0;
    const s = scrollCfg[skillName];
    return (s && s["熟练度上限"]) ? s["熟练度上限"] : 0;
}
function makeDisplayItem(id, prof) {
    const sf = getSfItemById(id);
    if (!sf) return null;
    const item = sf.getItem().clone();
    const meta = item.getItemMeta();
    let lore = meta.getLore() || [];
    lore = lore.filter(line => !line.startsWith("§7熟练度："));
    const skillName = getSkillName(id);
    const max = getMaxProf(skillName);
    lore.push("§7熟练度：§f" + prof + " §7/ §f" + max);
    meta.setLore(lore);
    item.setItemMeta(meta);
    return item;
}
function makeBarrier() {
    const item = new ItemStack(Material.BARRIER);
    const meta = item.getItemMeta();
    meta.setDisplayName("§c未解锁");
    meta.setLore(["§7需要更高的悟性"]);
    item.setItemMeta(meta);
    return item;
}
function openInventory(p) {
    const name = p.getName();
    const wuxing = getPlayerWuxing(name);
    const data = loadData(name);
    openPlayers.put(p, { data: data, wuxing: wuxing });
    const inv = Bukkit.createInventory(null, SIZE, TITLE);
    const ids = data.卷轴数据;
    const proficiencies = data.熟练度记录 || {};
    for (let i = 0; i < SIZE; i++) {
        if (i < wuxing) {
            const id = ids[i];
            if (id) {
                const prof = proficiencies[getSkillName(id)] || 0;
                const display = makeDisplayItem(id, prof);
                if (display) inv.setItem(i, display);
            }
        } else {
            inv.setItem(i, makeBarrier());
        }
    }
    p.openInventory(inv);
}
function unregisterListener() {
    if (listener) {
        try { InventoryClickEvent.getHandlerList().unregister(listener); } catch(e) { if (e.message && e.message.includes("Context is already closed")) return; }
        try { InventoryDragEvent.getHandlerList().unregister(listener); } catch(e) {}
        try { InventoryCloseEvent.getHandlerList().unregister(listener); } catch(e) {}
        listener = null;
    }
    plugin.komutech_l_gj_yzx_listener = null;
}
function registerListener() {
    if (plugin.komutech_l_gj_yzx_listener) {
        try { InventoryClickEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) { if (e.message && e.message.includes("Context is already closed")) return; }
        try { InventoryDragEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) {}
        try { InventoryCloseEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) {}
        plugin.komutech_l_gj_yzx_listener = null;
    }
    unregisterListener();
    const L = Java.extend(Java.type('org.bukkit.event.Listener'), {});
    listener = new L();
    plugin.komutech_l_gj_yzx_listener = listener;
    plugin.getServer().getPluginManager().registerEvent(InventoryClickEvent, listener, EventPriority.NORMAL, (l, e) => {
        const p = e.getWhoClicked();
        const h = openPlayers.get(p);
        if (!h || !e.getView().getTitle().startsWith(TITLE)) return;
        e.setCancelled(true);
        const slot = e.getRawSlot();
        const clk = e.getClickedInventory();
        const top = e.getView().getTopInventory();
        const data = h.data;
        const wuxing = h.wuxing;
        const name = p.getName();
        if (clk === top && slot >= 0 && slot < wuxing) {
            const id = data.卷轴数据[slot];
            if (!id) return;
            const sf = getSfItemById(id);
            if (!sf) return;
            const clean = sf.getItem().clone();
            const leftover = p.getInventory().addItem(clean);
            if (!leftover.isEmpty()) { p.sendMessage("§c背包已满，无法取出"); return; }
            data.卷轴数据[slot] = null;
            saveData(name, data);
            top.setItem(slot, null);
            return;
        }
        if (clk === p.getInventory()) {
            const cur = e.getCurrentItem();
            if (!cur || cur.getType() === Material.AIR) return;
            const sf = getSfItemByItem(cur);
            if (!sf || !sf.getId().startsWith(SCROLL_PREFIX)) { p.sendMessage("§c只能存入卷轴物品"); return; }
            const id = sf.getId();
            for (let i = 0; i < wuxing; i++) { if (data.卷轴数据[i] === id) { p.sendMessage("§c此卷轴已经存入了"); return; } }
            let emptySlot = -1;
            for (let i = 0; i < wuxing; i++) { if (!data.卷轴数据[i]) { emptySlot = i; break; } }
            if (emptySlot === -1) { p.sendMessage("§c可用云篆匣已满（当前悟性：" + wuxing + "）"); return; }
            if (cur.getAmount() > 1) cur.setAmount(cur.getAmount() - 1);
            else p.getInventory().setItem(e.getSlot(), null);
            data.卷轴数据[emptySlot] = id;
            const skillName = getSkillName(id);
            if (!data.熟练度记录) data.熟练度记录 = {};
            if (!data.熟练度记录[skillName]) data.熟练度记录[skillName] = 0;
            const prof = data.熟练度记录[skillName];
            saveData(name, data);
            const display = makeDisplayItem(id, prof);
            if (display) top.setItem(emptySlot, display);
            return;
        }
    }, plugin);
    plugin.getServer().getPluginManager().registerEvent(InventoryDragEvent, listener, EventPriority.NORMAL, (l, e) => {
        const p = e.getWhoClicked();
        if (openPlayers.containsKey(p) && e.getView().getTitle().startsWith(TITLE)) e.setCancelled(true);
    }, plugin);
    plugin.getServer().getPluginManager().registerEvent(InventoryCloseEvent, listener, EventPriority.NORMAL, (l, e) => {
        const p = e.getPlayer();
        if (!e.getView().getTitle().startsWith(TITLE)) return;
        openPlayers.remove(p);
        if (openPlayers.isEmpty()) unregisterListener();
    }, plugin);
}
if (plugin.komutech_l_gj_yzx_listener) {
    try { InventoryClickEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) {}
    try { InventoryDragEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) {}
    try { InventoryCloseEvent.getHandlerList().unregister(plugin.komutech_l_gj_yzx_listener); } catch(e) {}
    plugin.komutech_l_gj_yzx_listener = null;
}
function onUse(e) {
    if (e.getHand() !== EquipmentSlot.HAND) return;
    const p = e.getPlayer();
    const uid = p.getUniqueId().toString();
    const now = Date.now();
    const last = cooldowns.get(uid) || 0;
    if (now - last < COOLDOWN_MS) {
        const remain = Math.ceil((COOLDOWN_MS - (now - last)) / 1000 * 10) / 10;
        p.sendActionBar("§c云篆匣冷却中，请等待 §6" + remain + " §c秒");
        return;
    }
    cooldowns.put(uid, now);
    const openView = p.getOpenInventory();
    if (openView && openView.getTitle().startsWith(TITLE)) {
        p.sendMessage("§c云篆匣已打开，请先关闭当前界面再试！");
        return;
    }
    registerListener();
    openInventory(p);
}
globalThis.onUse = onUse;
})();