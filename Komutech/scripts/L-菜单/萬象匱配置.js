const KOMUTECH_L_ZJ_WXGPZ_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_ZJ_WXGPZ_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_ZJ_WXGPZ_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_L_ZJ_WXGPZ_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_ZJ_WXGPZ_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_ZJ_WXGPZ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_ZJ_WXGPZ_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_L_ZJ_WXGPZ_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_ZJ_WXGPZ_Consumer = Java.type('java.util.function.Consumer');
const KOMUTECH_L_ZJ_WXGPZ_File = Java.type('java.io.File');
const KOMUTECH_L_ZJ_WXGPZ_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_ZJ_WXGPZ_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_ZJ_WXGPZ_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_ZJ_WXGPZ_DATA_DIR = new KOMUTECH_L_ZJ_WXGPZ_File("plugins/RykenSlimefunCustomizer/addon_configs/Komutech/WXG");
const KOMUTECH_L_ZJ_WXGPZ_PLAYER_TITLE = "§a§l我的存储";
const KOMUTECH_L_ZJ_WXGPZ_ADMIN_TITLE = "§c§l管理员模式";
const KOMUTECH_L_ZJ_WXGPZ_STORAGE_LIST_TITLE = "§e§l存储列表 - ";
const KOMUTECH_L_ZJ_WXGPZ_STORAGE_VIEW_TITLE = "§d§l存储内容 - ";
const KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT = 49;
const KOMUTECH_L_ZJ_WXGPZ_MODE_SLOT = 4;
const KOMUTECH_L_ZJ_WXGPZ_INFO_SLOT = 8;
const KOMUTECH_L_ZJ_WXGPZ_BORDER_SLOTS = [0,1,2,3,5,6,7,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];
const KOMUTECH_L_ZJ_WXGPZ_SORT_SLOT = 47;
const KOMUTECH_L_ZJ_WXGPZ_SEARCH_SLOT = 51;
const KOMUTECH_L_ZJ_WXGPZ_BACK_BUTTON_SLOT = 45;
const KOMUTECH_L_ZJ_WXGPZ_COLOR_REGEX = /§./g;
function KOMUTECH_L_ZJ_WXGPZ_initStorageFolder() { if (!KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.exists()) KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.mkdirs(); }
KOMUTECH_L_ZJ_WXGPZ_initStorageFolder();
function KOMUTECH_L_ZJ_WXGPZ_getAllPlayers() {
    if (!KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.exists()) return [];
    const files = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.listFiles();
    if (!files) return [];
    const players = new java.util.HashSet();
    for (let file of files) {
        if (file.isFile() && file.getName().endsWith(".json")) {
            const name = file.getName();
            const closeBracket = name.indexOf(']');
            if (closeBracket !== -1) {
                players.add(name.substring(1, closeBracket));
            }
        }
    }
    return Array.from(players);
}
function KOMUTECH_L_ZJ_WXGPZ_getPlayerStorages(playerName) {
    if (!KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.exists()) return [];
    const files = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.listFiles();
    if (!files) return [];
    const storages = [];
    const prefix = "[" + playerName + "]";
    for (let file of files) {
        const fileName = file.getName();
        if (file.isFile() && fileName.endsWith(".json") && fileName.startsWith(prefix)) {
            const storageName = fileName.substring(prefix.length, fileName.length - 5);
            storages.push({ name: storageName, file });
        }
    }
    return storages;
}
function KOMUTECH_L_ZJ_WXGPZ_deleteFile(file) { try { file.delete(); return true; } catch(e) { return false; } }
function KOMUTECH_L_ZJ_WXGPZ_renameFile(file, oldName, newName, player) {
    const newPath = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.getAbsolutePath() + KOMUTECH_L_ZJ_WXGPZ_File.separator + "[" + player + "]" + newName + ".json";
    const newFile = new KOMUTECH_L_ZJ_WXGPZ_File(newPath);
    if (newFile.exists()) return false;
    try { KOMUTECH_L_ZJ_WXGPZ_Files.move(file.toPath(), newFile.toPath()); return true; } catch(e) { return false; }
}
function KOMUTECH_L_ZJ_WXGPZ_createItem(mat, name, lore) {
    const it = new KOMUTECH_L_ZJ_WXGPZ_ItemStack(KOMUTECH_L_ZJ_WXGPZ_Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_L_ZJ_WXGPZ_applyBorder(inv) {
    const border = KOMUTECH_L_ZJ_WXGPZ_createItem("BLACK_STAINED_GLASS_PANE", " ", null);
    KOMUTECH_L_ZJ_WXGPZ_BORDER_SLOTS.forEach(s => inv.setItem(s, border.clone()));
}
function KOMUTECH_L_ZJ_WXGPZ_buildPlayerMenu(player) {
    const storages = KOMUTECH_L_ZJ_WXGPZ_getPlayerStorages(player.getName());
    const inv = KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().createInventory(null, 54, KOMUTECH_L_ZJ_WXGPZ_PLAYER_TITLE);
    KOMUTECH_L_ZJ_WXGPZ_applyBorder(inv);
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_MODE_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("COMPASS", "§a切换模式", ["§7点击切换到管理员模式"]));
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_INFO_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("PAPER", "§a你的存储", ["§7共 " + storages.length + " 个"]));
    let slot = 10;
    for (let i = 0; i < storages.length; i++) {
        const s = storages[i];
        inv.setItem(slot, KOMUTECH_L_ZJ_WXGPZ_createItem("PAPER", "§f存储名: §e" + s.name, null));
        inv.setItem(slot + 9, KOMUTECH_L_ZJ_WXGPZ_createItem("REDSTONE_BLOCK", "§c删除", ["§7删除存储 " + s.name]));
        inv.setItem(slot + 18, KOMUTECH_L_ZJ_WXGPZ_createItem("NAME_TAG", "§a重命名", ["§7重命名存储 " + s.name]));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
        if (slot > 43) break;
    }
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
    return { inv, storages };
}
function KOMUTECH_L_ZJ_WXGPZ_buildAdminList(page = 1) {
    const players = KOMUTECH_L_ZJ_WXGPZ_getAllPlayers();
    const total = Math.max(1, Math.ceil(players.length / 28));
    const start = (page - 1) * 28;
    const pagePlayers = players.slice(start, start + 28);
    const inv = KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().createInventory(null, 54, KOMUTECH_L_ZJ_WXGPZ_ADMIN_TITLE);
    KOMUTECH_L_ZJ_WXGPZ_applyBorder(inv);
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_MODE_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("COMPASS", "§a切换模式", ["§7点击切换到玩家模式"]));
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_INFO_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("PAPER", "§6管理员面板", ["§7总玩家数: " + players.length, "§7第 " + page + "/" + total + " 页"]));
    inv.setItem(53, KOMUTECH_L_ZJ_WXGPZ_createItem("TNT", "§c清空所有数据", ["§7删除全部存储文件", "§c§l不可逆！"]));
    const rows = [10, 19, 28, 37];
    let idx = 0;
    for (let r of rows) {
        for (let c = 0; c < 7; c++) {
            if (idx >= pagePlayers.length) break;
            inv.setItem(r + c, KOMUTECH_L_ZJ_WXGPZ_createItem("PLAYER_HEAD", "§e" + pagePlayers[idx], ["§7点击查看存储列表"]));
            idx++;
        }
        if (idx >= pagePlayers.length) break;
    }
    if (page > 1) inv.setItem(48, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a上一页", ["§7第 " + (page - 1) + " 页"]));
    if (page < total) inv.setItem(50, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a下一页", ["§7第 " + (page + 1) + " 页"]));
    inv.setItem(49, KOMUTECH_L_ZJ_WXGPZ_createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
    const slotMap = new java.util.HashMap();
    idx = 0;
    for (let r of rows) {
        for (let c = 0; c < 7; c++) {
            if (idx >= pagePlayers.length) break;
            slotMap.put(r + c, pagePlayers[idx]);
            idx++;
        }
        if (idx >= pagePlayers.length) break;
    }
    return { inv, page, total, slotMap };
}
function KOMUTECH_L_ZJ_WXGPZ_buildStorageList(playerName) {
    const storages = KOMUTECH_L_ZJ_WXGPZ_getPlayerStorages(playerName);
    const inv = KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().createInventory(null, 54, KOMUTECH_L_ZJ_WXGPZ_STORAGE_LIST_TITLE + playerName);
    KOMUTECH_L_ZJ_WXGPZ_applyBorder(inv);
    inv.setItem(4, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a返回", ["§7返回玩家列表"]));
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_INFO_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("PAPER", "§6玩家: " + playerName, ["§7共 " + storages.length + " 个存储"]));
    inv.setItem(53, KOMUTECH_L_ZJ_WXGPZ_createItem("TNT", "§c删除该玩家所有存储", ["§7删除玩家 " + playerName + " 的所有存储", "§c§l不可逆！"]));
    let slot = 10;
    for (let i = 0; i < storages.length; i++) {
        const s = storages[i];
        inv.setItem(slot, KOMUTECH_L_ZJ_WXGPZ_createItem("BOOK", "§f存储名: §e" + s.name, ["§7点击查看内容"]));
        inv.setItem(slot + 9, KOMUTECH_L_ZJ_WXGPZ_createItem("REDSTONE_BLOCK", "§c删除", ["§7删除此存储"]));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
        if (slot > 43) break;
    }
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
    return { inv, storages, playerName };
}
function KOMUTECH_L_ZJ_WXGPZ_serialize(item) {
    if (!item || item.getType() === KOMUTECH_L_ZJ_WXGPZ_Material.AIR) return null;
    let sf = KOMUTECH_L_ZJ_WXGPZ_SlimefunItem.getByItem(item);
    return JSON.stringify(sf ? { type:"slimefun", id:sf.getId() } : { type:"vanilla", material:item.getType().name() });
}
function KOMUTECH_L_ZJ_WXGPZ_deserialize(json) {
    if (!json) return null;
    try {
        let d = JSON.parse(json);
        if (d.type === "slimefun") {
            let sf = KOMUTECH_L_ZJ_WXGPZ_SlimefunItem.getById(d.id);
            return sf ? sf.getItem().clone() : null;
        }
        let mat = KOMUTECH_L_ZJ_WXGPZ_Material.getMaterial(d.material);
        return mat ? new KOMUTECH_L_ZJ_WXGPZ_ItemStack(mat,1) : null;
    } catch(e) { return null; }
}
function KOMUTECH_L_ZJ_WXGPZ_emptyPage() { return new Array(45).fill(null); }
function KOMUTECH_L_ZJ_WXGPZ_emptyData() { return { pages: { "1": KOMUTECH_L_ZJ_WXGPZ_emptyPage() }, meta: { page: "1", mode: "normal", kw: "" } }; }
function KOMUTECH_L_ZJ_WXGPZ_loadData(player, storage) {
    const path = KOMUTECH_L_ZJ_WXGPZ_Paths.get(KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.getAbsolutePath(), "[" + player + "]" + storage + ".json");
    try {
        if (!KOMUTECH_L_ZJ_WXGPZ_Files.exists(path)) return KOMUTECH_L_ZJ_WXGPZ_emptyData();
        let data = JSON.parse(KOMUTECH_L_ZJ_WXGPZ_Files.readString(path, KOMUTECH_L_ZJ_WXGPZ_StandardCharsets.UTF_8));
        if (!data.meta) data.meta = { page: "1", mode: "normal", kw: "" };
        return data;
    } catch(e) { print("配置加载数据错误: " + e); return KOMUTECH_L_ZJ_WXGPZ_emptyData(); }
}
function KOMUTECH_L_ZJ_WXGPZ_saveData(player, storage, data) {
    const path = KOMUTECH_L_ZJ_WXGPZ_Paths.get(KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.getAbsolutePath(), "[" + player + "]" + storage + ".json");
    try { KOMUTECH_L_ZJ_WXGPZ_initStorageFolder(); KOMUTECH_L_ZJ_WXGPZ_Files.writeString(path, JSON.stringify(data), KOMUTECH_L_ZJ_WXGPZ_StandardCharsets.UTF_8); } catch(e) { print("配置保存数据错误: " + e); }
}
function KOMUTECH_L_ZJ_WXGPZ_sortName(item) {
    if (!item) return "无效物品";
    let n = item.getItemMeta().getDisplayName();
    return (n || item.getType().name()).replace(KOMUTECH_L_ZJ_WXGPZ_COLOR_REGEX,'');
}
function KOMUTECH_L_ZJ_WXGPZ_sortAll(data) {
    let items = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let it = KOMUTECH_L_ZJ_WXGPZ_deserialize(ser);
        if (!it) continue;
        items.push({ ser, name: KOMUTECH_L_ZJ_WXGPZ_sortName(it) });
    }
    items.sort((a,b)=>new Intl.Collator('zh-CN').compare(a.name,b.name));
    let newPages = {}, idx=0;
    for (let i=0; i<items.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!newPages[page]) newPages[page] = KOMUTECH_L_ZJ_WXGPZ_emptyPage();
        newPages[page][idx%45] = items[i].ser;
        idx++;
    }
    data.pages = newPages;
    data.meta = { page: "1", mode: "normal", kw: "" };
    return data;
}
function KOMUTECH_L_ZJ_WXGPZ_searchText(item) {
    let t = [item.getType().name().toLowerCase()];
    let meta = item.getItemMeta();
    if (meta.hasDisplayName()) t.push(meta.getDisplayName().replace(KOMUTECH_L_ZJ_WXGPZ_COLOR_REGEX,'').toLowerCase());
    let sf = KOMUTECH_L_ZJ_WXGPZ_SlimefunItem.getByItem(item);
    if (sf) t.push(sf.getId().toLowerCase());
    return Array.from(new Set(t)).join(' ');
}
function KOMUTECH_L_ZJ_WXGPZ_searchInData(data, kw) {
    kw = kw.toLowerCase();
    let matched = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let it = KOMUTECH_L_ZJ_WXGPZ_deserialize(ser);
        if (!it) continue;
        if (KOMUTECH_L_ZJ_WXGPZ_searchText(it).includes(kw)) matched.push(ser);
    }
    let res = { pages: {}, meta: { page: "1", mode: "search", kw: kw } };
    let idx=0;
    for (let i=0; i<matched.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!res.pages[page]) res.pages[page] = KOMUTECH_L_ZJ_WXGPZ_emptyPage();
        res.pages[page][idx%45] = matched[i];
        idx++;
    }
    return res;
}
function KOMUTECH_L_ZJ_WXGPZ_findEmptySlot(data) {
    let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
    for (let p of pages) {
        let page = data.pages[p];
        for (let i=0; i<45; i++) if (!page[i]) return { page:p.toString(), slot:i };
    }
    let newPage = (pages.length+1).toString();
    data.pages[newPage] = KOMUTECH_L_ZJ_WXGPZ_emptyPage();
    return { page: newPage, slot:0 };
}
function KOMUTECH_L_ZJ_WXGPZ_existsInData(data, item) {
    let s = KOMUTECH_L_ZJ_WXGPZ_serialize(item);
    if (!s) return false;
    for (let p in data.pages) if (data.pages[p].includes(s)) return true;
    return false;
}
function KOMUTECH_L_ZJ_WXGPZ_storeInData(data, item) {
    if (KOMUTECH_L_ZJ_WXGPZ_existsInData(data, item)) return { success: false, reason: "物品已存在" };
    let empty = KOMUTECH_L_ZJ_WXGPZ_findEmptySlot(data);
    let ser = KOMUTECH_L_ZJ_WXGPZ_serialize(item);
    if (!ser) return { success: false, reason: "无法序列化" };
    data.pages[empty.page][empty.slot] = ser;
    return { success: true, page: empty.page };
}
function KOMUTECH_L_ZJ_WXGPZ_buildStorageView(player, storage, page = 1, mode = "normal", searchData = null, kw = "") {
    let data = KOMUTECH_L_ZJ_WXGPZ_loadData(player, storage);
    const finalPage = page !== undefined ? page : data.meta.page;
    const finalMode = mode !== undefined ? mode : data.meta.mode;
    const finalKw = kw !== undefined ? kw : data.meta.kw;
    const inv = KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().createInventory(null, 54, KOMUTECH_L_ZJ_WXGPZ_STORAGE_VIEW_TITLE + storage);
    const border = KOMUTECH_L_ZJ_WXGPZ_createItem("BLACK_STAINED_GLASS_PANE", "§8", null);
    for (let i = 45; i < 54; i++) inv.setItem(i, border.clone());
    let display = finalMode === "search" ? searchData : data;
    const pages = Object.keys(display.pages).map(Number).sort((a,b)=>a-b);
    const curPage = pages.includes(finalPage) ? finalPage : (pages[0] || 1);
    const curData = display.pages[curPage] || [];
    for (let i = 0; i < 45; i++) {
        const ser = curData[i];
        if (ser) {
            const it = KOMUTECH_L_ZJ_WXGPZ_deserialize(ser);
            if (it) inv.setItem(i, it);
        }
    }
    inv.setItem(48, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a上一页", ["§7上一页"]));
    inv.setItem(49, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a返回", ["§7返回存储列表"]));
    inv.setItem(50, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a下一页", ["§7下一页"]));
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_SORT_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("HOPPER", "§a按拼音整理", ["§7点击整理物品"]));
    inv.setItem(KOMUTECH_L_ZJ_WXGPZ_SEARCH_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("NAME_TAG", "§a搜索", ["§7点击输入关键词搜索"]));
    if (finalMode === "search") inv.setItem(KOMUTECH_L_ZJ_WXGPZ_BACK_BUTTON_SLOT, KOMUTECH_L_ZJ_WXGPZ_createItem("ARROW", "§a返回", ["§7返回正常浏览"]));
    return { inv, data, player, storage, curPage, mode: finalMode, searchData, kw: finalKw };
}
let KOMUTECH_L_ZJ_WXGPZ_openPlayers = new java.util.HashMap();
let KOMUTECH_L_ZJ_WXGPZ_registered = false;
let KOMUTECH_L_ZJ_WXGPZ_awaitingSearch = new java.util.HashSet();
let KOMUTECH_L_ZJ_WXGPZ_listener = null;
function KOMUTECH_L_ZJ_WXGPZ_ensureListener() {
    if (KOMUTECH_L_ZJ_WXGPZ_registered) return;
    if (KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd) {
        KOMUTECH_L_ZJ_WXGPZ_ClickEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd);
        KOMUTECH_L_ZJ_WXGPZ_CloseEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd);
        KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd = null;
    }
    const L = Java.extend(KOMUTECH_L_ZJ_WXGPZ_Listener, {});
    const listener = new L();
    KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd = listener;
    KOMUTECH_L_ZJ_WXGPZ_listener = listener;
    KOMUTECH_L_ZJ_WXGPZ_registered = true;
    KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_ZJ_WXGPZ_ClickEvent, listener, KOMUTECH_L_ZJ_WXGPZ_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!KOMUTECH_L_ZJ_WXGPZ_openPlayers.containsKey(p)) return;
            const title = e.getInventory().getTitle();
            if (!title.startsWith(KOMUTECH_L_ZJ_WXGPZ_PLAYER_TITLE) && !title.startsWith(KOMUTECH_L_ZJ_WXGPZ_ADMIN_TITLE) && !title.startsWith(KOMUTECH_L_ZJ_WXGPZ_STORAGE_LIST_TITLE) && !title.startsWith(KOMUTECH_L_ZJ_WXGPZ_STORAGE_VIEW_TITLE)) return;
            e.setCancelled(true);
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === KOMUTECH_L_ZJ_WXGPZ_Material.AIR) return;
            const state = KOMUTECH_L_ZJ_WXGPZ_openPlayers.get(p);
            if (title === KOMUTECH_L_ZJ_WXGPZ_PLAYER_TITLE) {
                if (slot === KOMUTECH_L_ZJ_WXGPZ_MODE_SLOT) { KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, 1); return; }
                if (slot === KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT) { p.closeInventory(); return; }
                const row = Math.floor(slot / 9);
                const col = slot % 9;
                if (row === 2 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const name = state.storages[idx].name;
                        p.sendMessage("§c确定要删除存储 §e" + name + "§c 吗？请输入 §6确认删除 §c以确认:");
                        getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp === "确认删除") {
                                    KOMUTECH_L_ZJ_WXGPZ_deleteFile(state.storages[idx].file);
                                    p.sendMessage("§a已删除存储 " + name);
                                    KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p);
                                } else p.sendMessage("§c删除已取消");
                            }
                        })));
                    }
                } else if (row === 3 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const old = state.storages[idx].name;
                        p.sendMessage("§a请输入新的存储名（当前: " + old + "），输入 cancel 取消:");
                        getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp.toLowerCase() === "cancel") { p.sendMessage("§c已取消重命名"); return; }
                                if (!inp || inp.trim() === "") { p.sendMessage("§c名称不能为空"); return; }
                                if (/[\\/:*?"<>|]/.test(inp)) { p.sendMessage("§c名称不能包含 \\ / : * ? \" < > | 等字符"); return; }
                                const newName = inp;
                                const player = p.getName();
                                const newPath = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.getAbsolutePath() + KOMUTECH_L_ZJ_WXGPZ_File.separator + "[" + player + "]" + newName + ".json";
                                if (new KOMUTECH_L_ZJ_WXGPZ_File(newPath).exists()) { p.sendMessage("§c已存在同名存储"); return; }
                                if (KOMUTECH_L_ZJ_WXGPZ_renameFile(state.storages[idx].file, old, newName, player)) {
                                    p.sendMessage("§a已重命名为 " + newName);
                                    KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p);
                                } else p.sendMessage("§c重命名失败");
                            }
                        })));
                    }
                }
                return;
            }
            if (title === KOMUTECH_L_ZJ_WXGPZ_ADMIN_TITLE) {
                if (!p.isOp() && p.getName() !== "Komu_A") {
                    p.sendMessage("§c你没有权限使用管理员模式");
                    KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p);
                    return;
                }
                if (slot === KOMUTECH_L_ZJ_WXGPZ_MODE_SLOT) { KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p); return; }
                if (slot === KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT) { p.closeInventory(); return; }
                if (slot === 53) {
                    const pass = getAddonConfig().getString("L_ZJ_WXG_MM", "0108");
                    p.sendMessage("§c确定要清空所有存储数据吗？此操作不可逆。请输入密码以确认:");
                    getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                        accept: function(inp) {
                            if (!p.isOnline()) return;
                            if (inp === pass) {
                                const files = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.listFiles();
                                if (files) for (let f of files) if (f.isFile() && f.getName().endsWith(".json")) f.delete();
                                p.sendMessage("§a已清空所有存储数据");
                                KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, 1);
                            } else p.sendMessage("§c密码错误，操作已取消");
                        }
                    })));
                    return;
                }
                if (slot === 48 && state.page > 1) { KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, state.page - 1); return; }
                if (slot === 50 && state.page < state.total) { KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, state.page + 1); return; }
                if (state.slotMap && state.slotMap.containsKey(slot)) {
                    KOMUTECH_L_ZJ_WXGPZ_openStorageList(p, state.slotMap.get(slot));
                    return;
                }
                return;
            }
            if (title.startsWith(KOMUTECH_L_ZJ_WXGPZ_STORAGE_LIST_TITLE)) {
                if (slot === 4) { KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, 1); return; }
                if (slot === KOMUTECH_L_ZJ_WXGPZ_BACK_SLOT) { p.closeInventory(); return; }
                if (slot === 53) {
                    p.sendMessage("§c确定要删除玩家 §e" + state.playerName + "§c 的所有存储吗？请输入 §6确认删除 §c以确认:");
                    getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                        accept: function(inp) {
                            if (!p.isOnline()) return;
                            if (inp === "确认删除") {
                                const storages = KOMUTECH_L_ZJ_WXGPZ_getPlayerStorages(state.playerName);
                                storages.forEach(s => s.file.delete());
                                p.sendMessage("§a已删除玩家 " + state.playerName + " 的所有存储");
                                KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, 1);
                            } else p.sendMessage("§c删除已取消");
                        }
                    })));
                    return;
                }
                const row = Math.floor(slot / 9);
                const col = slot % 9;
                if (row === 1 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        KOMUTECH_L_ZJ_WXGPZ_openStorageView(p, state.playerName, state.storages[idx].name);
                    }
                } else if (row === 2 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const name = state.storages[idx].name;
                        p.sendMessage("§c确定要删除存储 §e" + name + "§c 吗？请输入 §6确认删除 §c以确认:");
                        getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp === "确认删除") {
                                    KOMUTECH_L_ZJ_WXGPZ_deleteFile(state.storages[idx].file);
                                    p.sendMessage("§a已删除存储 " + name);
                                    KOMUTECH_L_ZJ_WXGPZ_openStorageList(p, state.playerName);
                                } else p.sendMessage("§c删除已取消");
                            }
                        })));
                    }
                }
                return;
            }
            if (title.startsWith(KOMUTECH_L_ZJ_WXGPZ_STORAGE_VIEW_TITLE)) {
                const top = e.getView().getTopInventory();
                const clicked = e.getClickedInventory();
                const path = KOMUTECH_L_ZJ_WXGPZ_DATA_DIR.getAbsolutePath() + KOMUTECH_L_ZJ_WXGPZ_File.separator + "[" + state.player + "]" + state.storage + ".json";
                const file = new KOMUTECH_L_ZJ_WXGPZ_File(path);
                if (slot === KOMUTECH_L_ZJ_WXGPZ_BACK_BUTTON_SLOT && state.mode === "search") {
                    let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                    data.meta = { page: "1", mode: "normal", kw: "" };
                    KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                    const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, 1, "normal", null, "");
                    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, mode: "normal", searchData: null, kw: "", currentPage: 1 });
                } else if (slot === 48 && state.currentPage > 1) {
                    let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                    data.meta.page = (state.currentPage - 1).toString();
                    KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                    const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, state.currentPage - 1, state.mode, state.searchData, state.kw);
                    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage - 1 });
                } else if (slot === 49) {
                    KOMUTECH_L_ZJ_WXGPZ_openStorageList(p, state.player);
                } else if (slot === 50) {
                    let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                    data.meta.page = (state.currentPage + 1).toString();
                    KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                    const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, state.currentPage + 1, state.mode, state.searchData, state.kw);
                    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage + 1 });
                } else if (slot === KOMUTECH_L_ZJ_WXGPZ_SORT_SLOT && state.mode === "normal") {
                    let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                    let nd = KOMUTECH_L_ZJ_WXGPZ_sortAll(data);
                    KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, nd);
                    const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, 1, "normal", null, "");
                    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: nd, currentPage: 1 });
                    p.sendMessage("§a整理完成！");
                } else if (slot === KOMUTECH_L_ZJ_WXGPZ_SEARCH_SLOT) {
                    if (KOMUTECH_L_ZJ_WXGPZ_awaitingSearch.contains(p)) return;
                    KOMUTECH_L_ZJ_WXGPZ_awaitingSearch.add(p);
                    p.sendMessage("§a请在聊天栏输入搜索关键词，输入 cancel 取消:");
                    getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXGPZ_Consumer, {
                        accept: function(inp) {
                            KOMUTECH_L_ZJ_WXGPZ_awaitingSearch.remove(p);
                            if (!p.isOnline()) return;
                            if (inp.toLowerCase() === "cancel") { p.sendMessage("§c已取消搜索"); return; }
                            if (!inp.trim()) { p.sendMessage("§c关键词不能为空"); return; }
                            let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                            const res = KOMUTECH_L_ZJ_WXGPZ_searchInData(data, inp);
                            if (!res.pages[1] || !res.pages[1][0]) { p.sendMessage("§c没有找到匹配的物品"); return; }
                            data.meta = { page: "1", mode: "search", kw: inp };
                            KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                            const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, 1, "search", res, inp);
                            KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, mode: "search", searchData: res, kw: inp, currentPage: 1 });
                            let cnt = Object.values(res.pages).flat().filter(v=>v).length;
                            p.sendMessage("§a找到 " + cnt + " 个物品");
                        }
                    })));
                } else if (slot >= 0 && slot < 45 && clicked === top) {
                    const item = e.getCurrentItem();
                    if (item && item.getType() !== KOMUTECH_L_ZJ_WXGPZ_Material.AIR) {
                        if (p.getInventory().firstEmpty() === -1) {
                            p.sendMessage("§c背包已满");
                        } else {
                            p.getInventory().addItem(item.clone());
                            let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                            const page = state.currentPage;
                            const idx = slot;
                            if (state.mode === "search") {
                                let ser = state.searchData.pages[page][idx];
                                if (ser) {
                                    for (let pp in data.pages) {
                                        let arr = data.pages[pp];
                                        let pos = arr.indexOf(ser);
                                        if (pos !== -1) { arr[pos] = null; break; }
                                    }
                                    state.searchData.pages[page][idx] = null;
                                }
                            } else {
                                if (data.pages[page] && data.pages[page][idx]) data.pages[page][idx] = null;
                            }
                            KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                            p.sendMessage("§a已取出物品");
                            let v = (state.mode === "search") ?
                                KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, state.currentPage, "search", state.searchData, state.kw) :
                                KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, state.currentPage, "normal", null, "");
                            KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage });
                        }
                    }
                } else if (slot >= 0 && slot < 45 && clicked !== top && state.mode === "normal") {
                    const hand = e.getCurrentItem();
                    if (hand && hand.getType() !== KOMUTECH_L_ZJ_WXGPZ_Material.AIR) {
                        let sf = KOMUTECH_L_ZJ_WXGPZ_SlimefunItem.getByItem(hand);
                        let id = sf ? sf.getId() : null;
                        if (id && ["KOMUTECH_L_ZJ_萬象匱", "KOMUTECH_L_ZJ_萬衍儀", "KOMUTECH_L_ZJ_無"].includes(id)) {
                            p.sendMessage("§c不能存入此物品");
                            return;
                        }
                        let data = KOMUTECH_L_ZJ_WXGPZ_loadData(state.player, state.storage);
                        let result = KOMUTECH_L_ZJ_WXGPZ_storeInData(data, hand);
                        if (!result.success) { p.sendMessage("§c存入失败: " + result.reason); return; }
                        KOMUTECH_L_ZJ_WXGPZ_saveData(state.player, state.storage, data);
                        if (hand.getAmount() > 1) hand.setAmount(hand.getAmount() - 1);
                        else e.getClickedInventory().setItem(e.getSlot(), null);
                        p.sendMessage("§a已存入物品");
                        const v = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(state.player, state.storage, parseInt(result.page), state.mode, state.searchData, state.kw);
                        KOMUTECH_L_ZJ_WXGPZ_openMenu(p, v.inv, { ...v, data: data, currentPage: parseInt(result.page) });
                    }
                }
                return;
            }
        } catch (err) { KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().getLogger().warning("[数据管理] 点击事件错误: " + err); }
    }, KOMUTECH_L_ZJ_WXGPZ_plugin);
    KOMUTECH_L_ZJ_WXGPZ_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_ZJ_WXGPZ_CloseEvent, listener, KOMUTECH_L_ZJ_WXGPZ_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            KOMUTECH_L_ZJ_WXGPZ_openPlayers.remove(p);
            KOMUTECH_L_ZJ_WXGPZ_awaitingSearch.remove(p);
            if (KOMUTECH_L_ZJ_WXGPZ_openPlayers.isEmpty()) {
                KOMUTECH_L_ZJ_WXGPZ_ClickEvent.getHandlerList().unregister(listener);
                KOMUTECH_L_ZJ_WXGPZ_CloseEvent.getHandlerList().unregister(listener);
                KOMUTECH_L_ZJ_WXGPZ_plugin.komutech_l_zj_wxgpzcd = null;
                KOMUTECH_L_ZJ_WXGPZ_registered = false;
                KOMUTECH_L_ZJ_WXGPZ_listener = null;
            }
        } catch (err) {}
    }, KOMUTECH_L_ZJ_WXGPZ_plugin);
}
function KOMUTECH_L_ZJ_WXGPZ_openMenu(p, inv, data = null) {
    p.openInventory(inv);
    KOMUTECH_L_ZJ_WXGPZ_openPlayers.put(p, data);
    KOMUTECH_L_ZJ_WXGPZ_ensureListener();
}
function KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p) {
    const { inv, storages } = KOMUTECH_L_ZJ_WXGPZ_buildPlayerMenu(p);
    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, inv, { storages });
}
function KOMUTECH_L_ZJ_WXGPZ_openAdminList(p, page) {
    if (!p.isOp() && p.getName() !== "Komu_A") {
        p.sendMessage("§c你没有权限使用管理员模式");
        KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(p);
        return;
    }
    const { inv, page: cur, total, slotMap } = KOMUTECH_L_ZJ_WXGPZ_buildAdminList(page);
    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, inv, { page: cur, total, slotMap });
}
function KOMUTECH_L_ZJ_WXGPZ_openStorageList(p, playerName) {
    const { inv, storages, playerName: name } = KOMUTECH_L_ZJ_WXGPZ_buildStorageList(playerName);
    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, inv, { storages, playerName: name });
}
function KOMUTECH_L_ZJ_WXGPZ_openStorageView(p, player, storage, page = 1) {
    const { inv, data, curPage, mode, searchData, kw } = KOMUTECH_L_ZJ_WXGPZ_buildStorageView(player, storage, page);
    KOMUTECH_L_ZJ_WXGPZ_openMenu(p, inv, { data, player, storage, currentPage: curPage, mode, searchData, kw });
}
function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { KOMUTECH_L_ZJ_WXGPZ_openPlayerMenu(player); return true; } catch (err) { player.sendMessage("§c无法打开数据管理菜单"); return false; }
}