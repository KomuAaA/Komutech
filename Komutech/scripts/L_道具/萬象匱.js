const KOMUTECH_L_ZJ_WXG_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_ZJ_WXG_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_ZJ_WXG_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_L_ZJ_WXG_DragEvent = Java.type('org.bukkit.event.inventory.InventoryDragEvent');
const KOMUTECH_L_ZJ_WXG_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_ZJ_WXG_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_ZJ_WXG_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_ZJ_WXG_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_L_ZJ_WXG_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_ZJ_WXG_Consumer = Java.type('java.util.function.Consumer');
const KOMUTECH_L_ZJ_WXG_File = Java.type('java.io.File');
const KOMUTECH_L_ZJ_WXG_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_ZJ_WXG_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_ZJ_WXG_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_ZJ_WXG_DATA_DIR = new KOMUTECH_L_ZJ_WXG_File("plugins/RykenSlimefunCustomizer/addon_configs/Komutech/WXG");
const KOMUTECH_L_ZJ_WXG_STORAGE_ID = "KOMUTECH_L_ZJ_萬象匱";
const KOMUTECH_L_ZJ_WXG_TITLE = "§f§l萬象匱";
const KOMUTECH_L_ZJ_WXG_PAGE_SIZE = 54;
const KOMUTECH_L_ZJ_WXG_SLOT = { PREV:48, NEXT:50, CLOSE:49, SORT:47, SEARCH:51, BACK:45 };
const KOMUTECH_L_ZJ_WXG_ZH_SORTER = new Intl.Collator('zh-CN', { sensitivity: 'base' });
const KOMUTECH_L_ZJ_WXG_COLOR_REGEX = /§./g;
const KOMUTECH_L_ZJ_WXG_DEFAULT_BLACKLIST = [KOMUTECH_L_ZJ_WXG_STORAGE_ID, "KOMUTECH_L_ZJ_萬衍儀", "KOMUTECH_L_ZJ_無"];
let KOMUTECH_L_ZJ_WXG_blacklistCache = null;
function KOMUTECH_L_ZJ_WXG_updateBlacklist() {
    try {
        let list = getAddonConfig().getStringList("L_ZJ_WXG_BAN");
        if (list && list.size() > 0) {
            let arr = []; for (let i=0; i<list.size(); i++) arr.push(list.get(i));
            KOMUTECH_L_ZJ_WXG_blacklistCache = arr;
            return;
        }
    } catch(e) { print("读取黑名单配置错误: " + e); }
    KOMUTECH_L_ZJ_WXG_blacklistCache = KOMUTECH_L_ZJ_WXG_DEFAULT_BLACKLIST;
}
KOMUTECH_L_ZJ_WXG_updateBlacklist();
function KOMUTECH_L_ZJ_WXG_initStorageFolder() { if (!KOMUTECH_L_ZJ_WXG_DATA_DIR.exists()) KOMUTECH_L_ZJ_WXG_DATA_DIR.mkdirs(); }
function KOMUTECH_L_ZJ_WXG_getStorageName(item) {
    if (!item || !item.hasItemMeta()) return null;
    const lore = item.getItemMeta().getLore();
    if (!lore) return null;
    for (let line of lore) if (line.startsWith("§7┃ 存储标识: §f")) return line.substring("§7┃ 存储标识: §f".length);
    return null;
}
function KOMUTECH_L_ZJ_WXG_setStorageName(item, name) {
    const meta = item.getItemMeta();
    let lore = meta.getLore() || [];
    lore = lore.filter(l => !l.startsWith("§7┃ 存储标识: §f"));
    lore.push("§7┃ 存储标识: §f" + name);
    meta.setLore(lore);
    item.setItemMeta(meta);
}
function KOMUTECH_L_ZJ_WXG_getFileName(playerName, storageName) {
    if (!storageName) return null;
    const safe = storageName.replace(/[\\/:*?"<>|]/g, '_');
    return "[" + playerName + "]" + safe + ".json";
}
function KOMUTECH_L_ZJ_WXG_countPlayerStorages(playerName) {
    if (!KOMUTECH_L_ZJ_WXG_DATA_DIR.exists()) return 0;
    const files = KOMUTECH_L_ZJ_WXG_DATA_DIR.listFiles();
    if (!files) return 0;
    let count = 0;
    const prefix = "[" + playerName + "]";
    for (let file of files) if (file.isFile() && file.getName().endsWith(".json") && file.getName().startsWith(prefix)) count++;
    return count;
}
function KOMUTECH_L_ZJ_WXG_readData(playerName, storageName) {
    const path = KOMUTECH_L_ZJ_WXG_Paths.get(KOMUTECH_L_ZJ_WXG_DATA_DIR.getAbsolutePath(), KOMUTECH_L_ZJ_WXG_getFileName(playerName, storageName));
    try {
        if (!KOMUTECH_L_ZJ_WXG_Files.exists(path)) return KOMUTECH_L_ZJ_WXG_createEmptyData();
        let data = JSON.parse(KOMUTECH_L_ZJ_WXG_Files.readString(path, KOMUTECH_L_ZJ_WXG_StandardCharsets.UTF_8));
        if (!data.meta) data.meta = { page: "1", mode: "normal", kw: "" };
        return data;
    } catch(e) { print("萬象匱讀取錯誤: " + e); return KOMUTECH_L_ZJ_WXG_createEmptyData(); }
}
function KOMUTECH_L_ZJ_WXG_writeData(playerName, storageName, data) {
    const path = KOMUTECH_L_ZJ_WXG_Paths.get(KOMUTECH_L_ZJ_WXG_DATA_DIR.getAbsolutePath(), KOMUTECH_L_ZJ_WXG_getFileName(playerName, storageName));
    try { KOMUTECH_L_ZJ_WXG_initStorageFolder(); KOMUTECH_L_ZJ_WXG_Files.writeString(path, JSON.stringify(data), KOMUTECH_L_ZJ_WXG_StandardCharsets.UTF_8); } catch(e) { print("萬象匱寫入錯誤: " + e); }
}
function KOMUTECH_L_ZJ_WXG_createEmptyPage() { return new Array(KOMUTECH_L_ZJ_WXG_PAGE_SIZE).fill(null); }
function KOMUTECH_L_ZJ_WXG_createEmptyData() { return { pages: { "1": KOMUTECH_L_ZJ_WXG_createEmptyPage() }, meta: { page: "1", mode: "normal", kw: "" } }; }
function KOMUTECH_L_ZJ_WXG_serialize(item) {
    if (!item || item.getType() === KOMUTECH_L_ZJ_WXG_Material.AIR) return null;
    let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(item);
    return JSON.stringify(sf ? { type:"slimefun", id:sf.getId() } : { type:"vanilla", material:item.getType().name() });
}
function KOMUTECH_L_ZJ_WXG_deserialize(json) {
    if (!json) return null;
    try {
        let d = JSON.parse(json);
        if (d.type === "slimefun") {
            let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getById(d.id);
            return sf ? sf.getItem().clone() : null;
        }
        let mat = KOMUTECH_L_ZJ_WXG_Material.getMaterial(d.material);
        return mat ? new KOMUTECH_L_ZJ_WXG_ItemStack(mat,1) : null;
    } catch(e) { return null; }
}
function KOMUTECH_L_ZJ_WXG_exists(data, item) {
    let s = KOMUTECH_L_ZJ_WXG_serialize(item);
    if (!s) return false;
    for (let p in data.pages) if (data.pages[p].includes(s)) return true;
    return false;
}
function KOMUTECH_L_ZJ_WXG_findEmpty(data) {
    let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
    for (let p of pages) {
        let page = data.pages[p];
        for (let i=0; i<45; i++) if (!page[i]) return { page:p.toString(), slot:i };
    }
    return null;
}
function KOMUTECH_L_ZJ_WXG_searchText(item) {
    let t = [item.getType().name().toLowerCase()];
    let meta = item.getItemMeta();
    if (meta.hasDisplayName()) t.push(meta.getDisplayName().replace(KOMUTECH_L_ZJ_WXG_COLOR_REGEX,'').toLowerCase());
    let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(item);
    if (sf) t.push(sf.getId().toLowerCase());
    return Array.from(new Set(t)).join(' ');
}
function KOMUTECH_L_ZJ_WXG_sortName(item) {
    if (!item) return "§c无效物品";
    let n = item.getItemMeta().getDisplayName();
    return (n || item.getType().name()).replace(KOMUTECH_L_ZJ_WXG_COLOR_REGEX,'');
}
function KOMUTECH_L_ZJ_WXG_sortAll(data) {
    let items = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let item = KOMUTECH_L_ZJ_WXG_deserialize(ser);
        if (!item) continue;
        items.push({ ser, name: KOMUTECH_L_ZJ_WXG_sortName(item) });
    }
    items.sort((a,b)=>KOMUTECH_L_ZJ_WXG_ZH_SORTER.compare(a.name,b.name));
    let newPages = {}, idx=0;
    for (let i=0; i<items.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!newPages[page]) newPages[page] = KOMUTECH_L_ZJ_WXG_createEmptyPage();
        newPages[page][idx%45] = items[i].ser;
        idx++;
    }
    data.pages = newPages;
    data.meta = { page: "1", mode: "normal", kw: "" };
    return data;
}
function KOMUTECH_L_ZJ_WXG_search(data, kw) {
    kw = kw.toLowerCase();
    let matched = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let item = KOMUTECH_L_ZJ_WXG_deserialize(ser);
        if (!item) continue;
        if (KOMUTECH_L_ZJ_WXG_searchText(item).includes(kw)) matched.push({ ser, name: KOMUTECH_L_ZJ_WXG_sortName(item) });
    }
    matched.sort((a,b)=>KOMUTECH_L_ZJ_WXG_ZH_SORTER.compare(a.name,b.name));
    let res = { pages: {}, meta: { page: "1", mode: "search", kw: kw } };
    let idx=0;
    for (let i=0; i<matched.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!res.pages[page]) res.pages[page] = KOMUTECH_L_ZJ_WXG_createEmptyPage();
        res.pages[page][idx%45] = matched[i].ser;
        idx++;
    }
    return res;
}
function KOMUTECH_L_ZJ_WXG_createItem(mat, name, lore) {
    let it = new KOMUTECH_L_ZJ_WXG_ItemStack(KOMUTECH_L_ZJ_WXG_Material[mat]);
    let meta = it.getItemMeta();
    if (name) meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_L_ZJ_WXG_buildGUI(playerName, storageName, data, page, mode, searchData, kw) {
    let displayData = mode === "search" ? searchData : data;
    if (!displayData || !displayData.pages) displayData = KOMUTECH_L_ZJ_WXG_createEmptyData();
    let title = KOMUTECH_L_ZJ_WXG_TITLE + (mode==="search" ? ` §7- 搜索 "${kw}" 第 ${page} 页` : ` §7- 第 ${page} 页`);
    let inv = KOMUTECH_L_ZJ_WXG_plugin.getServer().createInventory(null, KOMUTECH_L_ZJ_WXG_PAGE_SIZE, title);
    let pg = displayData.pages[page];
    if (pg) for (let i=0; i<45; i++) {
        let ser = pg[i];
        let itm = ser ? KOMUTECH_L_ZJ_WXG_deserialize(ser) : null;
        inv.setItem(i, itm ? itm : null);
    }
    let prev = (parseInt(page)-1).toString();
    inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.PREV, (parseInt(page)>1 && displayData.pages[prev]) ? KOMUTECH_L_ZJ_WXG_createItem("ARROW","§a上一页","§7点击切换到第 "+prev+" 页") : KOMUTECH_L_ZJ_WXG_createItem("GRAY_STAINED_GLASS_PANE","§8无上一页",null));
    let next = (parseInt(page)+1).toString();
    inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.NEXT, displayData.pages[next] ? KOMUTECH_L_ZJ_WXG_createItem("ARROW","§a下一页","§7点击切换到第 "+next+" 页") : KOMUTECH_L_ZJ_WXG_createItem("GRAY_STAINED_GLASS_PANE","§8无下一页",null));
    inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.CLOSE, KOMUTECH_L_ZJ_WXG_createItem("BARRIER","§c关闭","§7关闭存储界面"));
    if (mode==="normal") {
        inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.SORT, KOMUTECH_L_ZJ_WXG_createItem("HOPPER","§a按拼音整理","§7点击将所有页物品按拼音排序"));
        inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.SEARCH, KOMUTECH_L_ZJ_WXG_createItem("NAME_TAG","§a搜索","§7点击输入关键词搜索物品"));
    } else inv.setItem(KOMUTECH_L_ZJ_WXG_SLOT.BACK, KOMUTECH_L_ZJ_WXG_createItem("ARROW","§a返回","§7返回正常浏览"));
    let border = KOMUTECH_L_ZJ_WXG_createItem("BLACK_STAINED_GLASS_PANE","§8",null);
    for (let i=45; i<54; i++) if (inv.getItem(i)==null) inv.setItem(i, border.clone());
    return inv;
}
function KOMUTECH_L_ZJ_WXG_findStorage(player) {
    let hand = player.getInventory().getItemInMainHand();
    if (hand.getType()!==KOMUTECH_L_ZJ_WXG_Material.AIR) {
        let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(hand);
        if (sf && sf.getId()===KOMUTECH_L_ZJ_WXG_STORAGE_ID) return hand;
    }
    for (let i=0; i<player.getInventory().getSize(); i++) {
        let it = player.getInventory().getItem(i);
        if (!it || it.getType()===KOMUTECH_L_ZJ_WXG_Material.AIR) continue;
        let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(it);
        if (sf && sf.getId()===KOMUTECH_L_ZJ_WXG_STORAGE_ID) return it;
    }
    return null;
}
let KOMUTECH_L_ZJ_WXG_openPlayers = new java.util.HashMap();
let KOMUTECH_L_ZJ_WXG_turning = new java.util.HashSet();
let KOMUTECH_L_ZJ_WXG_awaiting = new java.util.HashSet();
let KOMUTECH_L_ZJ_WXG_namingPlayers = new java.util.HashSet();
let KOMUTECH_L_ZJ_WXG_registered = false;
let KOMUTECH_L_ZJ_WXG_listener = null;
function KOMUTECH_L_ZJ_WXG_registerListener() {
    if (KOMUTECH_L_ZJ_WXG_registered && KOMUTECH_L_ZJ_WXG_listener) return;
    if (KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui) {
        KOMUTECH_L_ZJ_WXG_ClickEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
        KOMUTECH_L_ZJ_WXG_DragEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
        KOMUTECH_L_ZJ_WXG_CloseEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
        KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui = null;
    }
    const L = Java.extend(KOMUTECH_L_ZJ_WXG_Listener, {});
    let lis = new L();
    KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui = lis;
    KOMUTECH_L_ZJ_WXG_listener = lis;
    KOMUTECH_L_ZJ_WXG_registered = true;
    KOMUTECH_L_ZJ_WXG_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_ZJ_WXG_ClickEvent, lis, KOMUTECH_L_ZJ_WXG_EventPriority.HIGHEST, (l,e)=>{
        let p = e.getWhoClicked();
        if (!KOMUTECH_L_ZJ_WXG_openPlayers.containsKey(p) || !e.getView().getTitle().startsWith(KOMUTECH_L_ZJ_WXG_TITLE)) return;
        e.setCancelled(true);
        let h = KOMUTECH_L_ZJ_WXG_openPlayers.get(p);
        let storageItem = h.item;
        if (!storageItem || storageItem.getType()===KOMUTECH_L_ZJ_WXG_Material.AIR) {
            let hand = p.getInventory().getItemInMainHand();
            let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(hand);
            if (hand.getType()!==KOMUTECH_L_ZJ_WXG_Material.AIR && sf && sf.getId()===KOMUTECH_L_ZJ_WXG_STORAGE_ID) {
                storageItem = hand; h.item = hand;
            } else {
                p.sendMessage("§c存储道具已丢失，界面关闭。"); p.closeInventory(); return;
            }
        }
        let mode = h.mode || "normal", sData = h.searchData || null, kw = h.keyword || "", cur = h.page;
        let storageName = KOMUTECH_L_ZJ_WXG_getStorageName(storageItem);
        if (!storageName) { p.closeInventory(); p.sendMessage("§c物品未命名，请先蹲下右键命名。"); return; }
        let data = mode==="search" ? sData : KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName);
        if (!data || (!data.pages && !data.unamed)) { p.closeInventory(); return; }
        if (data.unamed) { p.closeInventory(); p.sendMessage("§c存储数据损坏，请重新命名。"); return; }
        let slot = e.getSlot(), clk = e.getClickedInventory(), top = e.getView().getTopInventory();
        if (clk===top && slot>=45 && slot<54) {
            if (slot===KOMUTECH_L_ZJ_WXG_SLOT.PREV && data.pages[(parseInt(cur)-1).toString()]) {
                KOMUTECH_L_ZJ_WXG_turning.add(p); h.page = (parseInt(cur)-1).toString();
                data.meta.page = h.page;
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, data, h.page, mode, sData, kw));
            } else if (slot===KOMUTECH_L_ZJ_WXG_SLOT.NEXT && data.pages[(parseInt(cur)+1).toString()]) {
                KOMUTECH_L_ZJ_WXG_turning.add(p); h.page = (parseInt(cur)+1).toString();
                data.meta.page = h.page;
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, data, h.page, mode, sData, kw));
            } else if (slot===KOMUTECH_L_ZJ_WXG_SLOT.CLOSE) p.closeInventory();
            else if (mode==="normal" && slot===KOMUTECH_L_ZJ_WXG_SLOT.SORT) {
                KOMUTECH_L_ZJ_WXG_turning.add(p);
                let nd = KOMUTECH_L_ZJ_WXG_sortAll(KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName));
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, nd);
                h.page = nd.meta.page;
                h.mode = nd.meta.mode;
                h.searchData = null; h.keyword = "";
                p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, nd, nd.meta.page, "normal", null, ""));
                KOMUTECH_L_ZJ_WXG_turning.remove(p); p.sendMessage("§a整理完成！");
            } else if (mode==="normal" && slot===KOMUTECH_L_ZJ_WXG_SLOT.SEARCH) {
                p.sendMessage("§a请先手动关闭当前界面，然后在聊天栏输入关键词（输入 cancel 取消）:");
                KOMUTECH_L_ZJ_WXG_awaiting.add(p);
            } else if (mode==="search" && slot===KOMUTECH_L_ZJ_WXG_SLOT.BACK) {
                KOMUTECH_L_ZJ_WXG_turning.add(p);
                let orig = KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName);
                orig.meta = { page: "1", mode: "normal", kw: "" };
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, orig);
                h.mode = "normal"; h.searchData = null; h.keyword = ""; h.page = "1";
                p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, orig, "1", "normal", null, ""));
                KOMUTECH_L_ZJ_WXG_turning.remove(p);
            }
            return;
        }
        if (clk===top && slot>=0 && slot<45) {
            let pg = data.pages[cur];
            if (!pg || !pg[slot]) return;
            if (p.getInventory().firstEmpty()===-1) { p.sendMessage("§c背包已满"); return; }
            let stored = KOMUTECH_L_ZJ_WXG_deserialize(pg[slot]);
            if (!stored) {
                pg[slot]=null; if (mode==="normal") KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                top.setItem(slot,null); return;
            }
            if (mode==="search") {
                let orig = KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName);
                for (let pp in orig.pages) for (let i=0; i<orig.pages[pp].length; i++)
                    if (orig.pages[pp][i]===pg[slot]) { orig.pages[pp][i]=null; break; }
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, orig);
                pg[slot]=null; top.setItem(slot,null); p.getInventory().addItem(stored);
            } else {
                pg[slot]=null; KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                p.getInventory().addItem(stored); top.setItem(slot,null);
            }
            return;
        }
        if (clk===p.getInventory() && mode==="normal") {
            let it = e.getCurrentItem();
            if (!it || it.getType()===KOMUTECH_L_ZJ_WXG_Material.AIR) return;
            let sf = KOMUTECH_L_ZJ_WXG_SlimefunItem.getByItem(it), id = sf ? sf.getId() : null;
            if (id && KOMUTECH_L_ZJ_WXG_blacklistCache.includes(id)) { p.sendMessage("§c不能存入此物品"); return; }
            if (KOMUTECH_L_ZJ_WXG_exists(data, it)) { p.sendMessage("§c该物品已存在"); return; }
            let empty = KOMUTECH_L_ZJ_WXG_findEmpty(data);
            let fileExists = KOMUTECH_L_ZJ_WXG_Files.exists(KOMUTECH_L_ZJ_WXG_Paths.get(KOMUTECH_L_ZJ_WXG_DATA_DIR.getAbsolutePath(), KOMUTECH_L_ZJ_WXG_getFileName(p.getName(), storageName)));
            if (!fileExists) {
                let maxLimit = getAddonConfig().getInt("L_ZJ_WXG_CCmax", 5);
                let currentCount = KOMUTECH_L_ZJ_WXG_countPlayerStorages(p.getName());
                if (currentCount >= maxLimit) {
                    p.sendMessage("§c你已达到最大存储数量（" + maxLimit + "个），无法创建新的存储。");
                    return;
                }
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
            }
            if (!empty) {
                let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
                let np = (pages.length+1).toString();
                data.pages[np] = KOMUTECH_L_ZJ_WXG_createEmptyPage();
                empty = { page: np, slot:0 };
            }
            let ser = KOMUTECH_L_ZJ_WXG_serialize(it);
            if (!ser) { p.sendMessage("§c无法存储"); return; }
            let pg = data.pages[empty.page] || KOMUTECH_L_ZJ_WXG_createEmptyPage();
            pg[empty.slot] = ser; data.pages[empty.page] = pg; KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
            if (it.getAmount()>1) it.setAmount(it.getAmount()-1); else it.setAmount(0);
            if (empty.page !== cur) {
                KOMUTECH_L_ZJ_WXG_turning.add(p); h.page = empty.page;
                data.meta.page = h.page;
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, data, h.page, mode, sData, kw));
                KOMUTECH_L_ZJ_WXG_turning.remove(p);
            } else top.setItem(empty.slot, KOMUTECH_L_ZJ_WXG_deserialize(ser));
        }
    }, KOMUTECH_L_ZJ_WXG_plugin);
    KOMUTECH_L_ZJ_WXG_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_ZJ_WXG_DragEvent, lis, KOMUTECH_L_ZJ_WXG_EventPriority.HIGHEST, (l,e)=>{
        let p = e.getWhoClicked();
        if (!KOMUTECH_L_ZJ_WXG_openPlayers.containsKey(p) || !e.getView().getTitle().startsWith(KOMUTECH_L_ZJ_WXG_TITLE)) return;
        for (let slot of e.getNewItems().keySet()) if (slot<54) { e.setCancelled(true); return; }
    }, KOMUTECH_L_ZJ_WXG_plugin);
    KOMUTECH_L_ZJ_WXG_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_ZJ_WXG_CloseEvent, lis, KOMUTECH_L_ZJ_WXG_EventPriority.HIGHEST, (l,e)=>{
        let p = e.getPlayer();
        if (!e.getView().getTitle().startsWith(KOMUTECH_L_ZJ_WXG_TITLE)) return;
        if (KOMUTECH_L_ZJ_WXG_turning.contains(p)) KOMUTECH_L_ZJ_WXG_turning.remove(p);
        else if (KOMUTECH_L_ZJ_WXG_awaiting.contains(p)) {
            KOMUTECH_L_ZJ_WXG_awaiting.remove(p);
            let storage = KOMUTECH_L_ZJ_WXG_findStorage(p);
            if (!storage) { KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
            let storageName = KOMUTECH_L_ZJ_WXG_getStorageName(storage);
            if (!storageName) { KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
            getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXG_Consumer, {
                accept: function(input) {
                    if (input.toLowerCase()==="cancel") { KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
                    let cur = KOMUTECH_L_ZJ_WXG_findStorage(p);
                    if (!cur) { p.sendMessage("§c存储道具已丢失"); KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
                    let curName = KOMUTECH_L_ZJ_WXG_getStorageName(cur);
                    if (!curName) { KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
                    let orig = KOMUTECH_L_ZJ_WXG_readData(p.getName(), curName);
                    if (!orig || orig.unamed) { KOMUTECH_L_ZJ_WXG_openPlayers.remove(p); return; }
                    let res = KOMUTECH_L_ZJ_WXG_search(orig, input);
                    let h = KOMUTECH_L_ZJ_WXG_openPlayers.get(p) || { item:cur, page:"1", mode:"normal", searchData:null, keyword:"" };
                    h.item = cur;
                    if (!res.pages[1] || !res.pages[1][0]) {
                        p.sendMessage("§c没有找到匹配的物品。");
                        h.mode="normal"; h.searchData=null; h.keyword=""; h.page="1";
                        orig.meta = { page: "1", mode: "normal", kw: "" };
                        KOMUTECH_L_ZJ_WXG_writeData(p.getName(), curName, orig);
                        KOMUTECH_L_ZJ_WXG_turning.add(p); p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), curName, orig, "1", "normal", null, ""));
                        KOMUTECH_L_ZJ_WXG_turning.remove(p);
                    } else {
                        h.mode="search"; h.searchData=res; h.keyword=input; h.page="1";
                        orig.meta = { page: "1", mode: "search", kw: input };
                        KOMUTECH_L_ZJ_WXG_writeData(p.getName(), curName, orig);
                        KOMUTECH_L_ZJ_WXG_turning.add(p); p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), curName, orig, "1", "search", res, input));
                        KOMUTECH_L_ZJ_WXG_turning.remove(p);
                        let cnt = Object.values(res.pages).flat().filter(v=>v).length;
                        p.sendMessage("§a找到 " + cnt + " 个物品。");
                    }
                    KOMUTECH_L_ZJ_WXG_openPlayers.put(p, h);
                }
            })));
        } else {
            let h = KOMUTECH_L_ZJ_WXG_openPlayers.get(p);
            if (h && h.item) {
                let storageName = KOMUTECH_L_ZJ_WXG_getStorageName(h.item);
                if (storageName) {
                    let data = KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName);
                    if (data && !data.unamed) {
                        data.meta = { page: h.page, mode: h.mode, kw: h.keyword || "" };
                        KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                    }
                }
            }
            KOMUTECH_L_ZJ_WXG_openPlayers.remove(p);
        }
        if (KOMUTECH_L_ZJ_WXG_openPlayers.isEmpty()) {
            KOMUTECH_L_ZJ_WXG_ClickEvent.getHandlerList().unregister(lis);
            KOMUTECH_L_ZJ_WXG_DragEvent.getHandlerList().unregister(lis);
            KOMUTECH_L_ZJ_WXG_CloseEvent.getHandlerList().unregister(lis);
            KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui = null;
            KOMUTECH_L_ZJ_WXG_registered = false;
            KOMUTECH_L_ZJ_WXG_listener = null;
        }
    }, KOMUTECH_L_ZJ_WXG_plugin);
}
function KOMUTECH_L_ZJ_WXG_ensureListener() { if (!KOMUTECH_L_ZJ_WXG_registered) KOMUTECH_L_ZJ_WXG_registerListener(); }
function KOMUTECH_L_ZJ_WXG_onUse(e) {
    try {
        let p = e.getPlayer();
        let it = e.getItem();
        if (p.isSneaking()) {
            if (KOMUTECH_L_ZJ_WXG_namingPlayers.contains(p)) {
                KOMUTECH_L_ZJ_WXG_namingPlayers.remove(p);
                p.sendMessage("§c已取消命名输入，可重新开始命名。");
                return;
            }
            KOMUTECH_L_ZJ_WXG_namingPlayers.add(p);
            p.sendMessage("§a请在聊天栏输入此物品的存储名称（支持中文、字母、数字），输入 cancel 取消:");
            getChatInput(p, new (Java.extend(KOMUTECH_L_ZJ_WXG_Consumer, {
                accept: function(input) {
                    KOMUTECH_L_ZJ_WXG_namingPlayers.remove(p);
                    if (!p.isOnline()) return;
                    if (input.toLowerCase() === "cancel") { p.sendMessage("§c已取消命名。"); return; }
                    if (!input || input.trim() === "") { p.sendMessage("§c名称不能为空"); return; }
                    if (/[\\/:*?"<>|]/.test(input)) { p.sendMessage("§c名称不能包含 \\ / : * ? \" < > | 等字符"); return; }
                    KOMUTECH_L_ZJ_WXG_setStorageName(it, input);
                    p.sendMessage("§a已设置存储名称: §f" + input);
                    let storageName = KOMUTECH_L_ZJ_WXG_getStorageName(it);
                    let data = KOMUTECH_L_ZJ_WXG_readData(p.getName(), storageName);
                    if (!data.pages || Object.keys(data.pages).length===0) data = KOMUTECH_L_ZJ_WXG_createEmptyData();
                    KOMUTECH_L_ZJ_WXG_writeData(p.getName(), storageName, data);
                    p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), storageName, data, "1", "normal", null, ""));
                    KOMUTECH_L_ZJ_WXG_openPlayers.put(p, { item:it, page:"1", mode:"normal", searchData:null, keyword:"" });
                    KOMUTECH_L_ZJ_WXG_ensureListener();
                }
            })));
            return;
        }
        let name = KOMUTECH_L_ZJ_WXG_getStorageName(it);
        if (!name) { p.sendMessage("§c此物品尚未命名，请蹲下右键为它命名。"); return; }
        let data = KOMUTECH_L_ZJ_WXG_readData(p.getName(), name);
        if (data.unamed) { p.sendMessage("§c存储数据损坏，请重新蹲下右键命名。"); return; }
        if (!data.pages || Object.keys(data.pages).length===0) {
            data = KOMUTECH_L_ZJ_WXG_createEmptyData();
            KOMUTECH_L_ZJ_WXG_writeData(p.getName(), name, data);
        }
        let page = data.meta.page || "1";
        let mode = data.meta.mode || "normal";
        let kw = data.meta.kw || "";
        let searchData = null;
        if (mode === "search" && kw) {
            searchData = KOMUTECH_L_ZJ_WXG_search(data, kw);
            if (!searchData.pages[1] || !searchData.pages[1][0]) {
                mode = "normal"; kw = ""; searchData = null; page = "1";
                data.meta = { page: "1", mode: "normal", kw: "" };
                KOMUTECH_L_ZJ_WXG_writeData(p.getName(), name, data);
            }
        }
        p.openInventory(KOMUTECH_L_ZJ_WXG_buildGUI(p.getName(), name, data, page, mode, searchData, kw));
        KOMUTECH_L_ZJ_WXG_openPlayers.put(p, { item:it, page:page, mode:mode, searchData:searchData, keyword:kw });
        KOMUTECH_L_ZJ_WXG_ensureListener();
    } catch(ex) { print("萬象匱onUse錯誤: " + ex); }
}
if (KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui) {
    KOMUTECH_L_ZJ_WXG_ClickEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
    KOMUTECH_L_ZJ_WXG_DragEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
    KOMUTECH_L_ZJ_WXG_CloseEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui);
    KOMUTECH_L_ZJ_WXG_plugin.komutech_l_zj_wxggui = null;
    KOMUTECH_L_ZJ_WXG_registered = false;
}
function onUse(e) { KOMUTECH_L_ZJ_WXG_onUse(e); }