const KOMUTECH_L_ZJ_WYY_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_ZJ_WYY_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_ZJ_WYY_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_ZJ_WYY_FixedMetadataValue = Java.type('org.bukkit.metadata.FixedMetadataValue');
const KOMUTECH_L_ZJ_WYY_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_ZJ_WYY_File = Java.type('java.io.File');
const KOMUTECH_L_ZJ_WYY_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_ZJ_WYY_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_ZJ_WYY_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_ZJ_WYY_DATA_DIR = new KOMUTECH_L_ZJ_WYY_File("plugins/RykenSlimefunCustomizer/addon_configs/Komutech/WXG");
const KOMUTECH_L_ZJ_WYY_STORAGE_ID = "KOMUTECH_L_ZJ_萬象匱";
const KOMUTECH_L_ZJ_WYY_SEARCH_ITEM_ID = "MAGIC_EXPANSION_ITEM_NAME_TAG";
const KOMUTECH_L_ZJ_WYY_PAGE_SIZE = 54;
const KOMUTECH_L_ZJ_WYY_INPUT_SLOT = 49;
const KOMUTECH_L_ZJ_WYY_LOAD_BUTTON = 53;
const KOMUTECH_L_ZJ_WYY_PREV_SLOT = 48;
const KOMUTECH_L_ZJ_WYY_NEXT_SLOT = 50;
const KOMUTECH_L_ZJ_WYY_SORT_SLOT = 47;
const KOMUTECH_L_ZJ_WYY_SEARCH_SLOT = 51;
const KOMUTECH_L_ZJ_WYY_ZH_SORTER = new Intl.Collator('zh-CN', { sensitivity: 'base' });
function KOMUTECH_L_ZJ_WYY_initStorageFolder() { if (!KOMUTECH_L_ZJ_WYY_DATA_DIR.exists()) KOMUTECH_L_ZJ_WYY_DATA_DIR.mkdirs(); }
function KOMUTECH_L_ZJ_WYY_getStorageName(item) {
    if (!item || !item.hasItemMeta()) return null;
    const lore = item.getItemMeta().getLore();
    if (!lore) return null;
    for (let line of lore) if (line.startsWith("§7┃ 存储标识: §f")) return line.substring("§7┃ 存储标识: §f".length);
    return null;
}
function KOMUTECH_L_ZJ_WYY_getFileName(playerName, storageName) {
    if (!storageName) return null;
    const safe = storageName.replace(/[\\/:*?"<>|]/g, '_');
    return "[" + playerName + "]" + safe + ".json";
}
function KOMUTECH_L_ZJ_WYY_readData(item, playerName) {
    let name = KOMUTECH_L_ZJ_WYY_getStorageName(item);
    if (!name) return { pages:{ "1": new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null) }, unamed: true };
    const path = KOMUTECH_L_ZJ_WYY_Paths.get(KOMUTECH_L_ZJ_WYY_DATA_DIR.getAbsolutePath(), KOMUTECH_L_ZJ_WYY_getFileName(playerName, name));
    try {
        if (!KOMUTECH_L_ZJ_WYY_Files.exists(path)) return { pages:{ "1": new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null) } };
        return JSON.parse(KOMUTECH_L_ZJ_WYY_Files.readString(path, KOMUTECH_L_ZJ_WYY_StandardCharsets.UTF_8));
    } catch(e) { print("萬衍儀讀取錯誤: " + e); return { pages:{ "1": new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null) } }; }
}
function KOMUTECH_L_ZJ_WYY_writeData(item, data, playerName) {
    let name = KOMUTECH_L_ZJ_WYY_getStorageName(item);
    if (!name) return;
    const path = KOMUTECH_L_ZJ_WYY_Paths.get(KOMUTECH_L_ZJ_WYY_DATA_DIR.getAbsolutePath(), KOMUTECH_L_ZJ_WYY_getFileName(playerName, name));
    try { KOMUTECH_L_ZJ_WYY_initStorageFolder(); KOMUTECH_L_ZJ_WYY_Files.writeString(path, JSON.stringify(data), KOMUTECH_L_ZJ_WYY_StandardCharsets.UTF_8); } catch(e) { print("萬衍儀寫入錯誤: " + e); }
}
function KOMUTECH_L_ZJ_WYY_serialize(item) {
    if (!item || item.getType() === KOMUTECH_L_ZJ_WYY_Material.AIR) return null;
    let sf = KOMUTECH_L_ZJ_WYY_SlimefunItem.getByItem(item);
    return JSON.stringify(sf ? { type:"slimefun", id:sf.getId(), amount:item.getAmount() } : { type:"vanilla", material:item.getType().name(), amount:item.getAmount() });
}
function KOMUTECH_L_ZJ_WYY_deserialize(json) {
    if (!json) return null;
    try {
        let d = JSON.parse(json);
        if (d.type === "slimefun") {
            let sf = KOMUTECH_L_ZJ_WYY_SlimefunItem.getById(d.id);
            return sf ? sf.getItem().clone() : null;
        }
        let mat = KOMUTECH_L_ZJ_WYY_Material.getMaterial(d.material);
        return mat ? new KOMUTECH_L_ZJ_WYY_ItemStack(mat, d.amount || 1) : null;
    } catch(e) { return null; }
}
function KOMUTECH_L_ZJ_WYY_getPage(data, p) { return data?.pages?.[p] || null; }
function KOMUTECH_L_ZJ_WYY_searchText(item) {
    let t = [item.getType().name().toLowerCase()];
    let meta = item.getItemMeta();
    if (meta.hasDisplayName()) t.push(meta.getDisplayName().replace(/§./g,'').toLowerCase());
    let sf = KOMUTECH_L_ZJ_WYY_SlimefunItem.getByItem(item);
    if (sf) t.push(sf.getId().toLowerCase());
    return Array.from(new Set(t)).join(' ');
}
function KOMUTECH_L_ZJ_WYY_sortName(item) {
    if (!item) return "§c无效物品";
    let n = item.getItemMeta().getDisplayName();
    return (n || item.getType().name()).replace(/§./g,'');
}
function KOMUTECH_L_ZJ_WYY_sortAll(data) {
    let items = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let item = KOMUTECH_L_ZJ_WYY_deserialize(ser);
        if (!item) continue;
        items.push({ ser, name: KOMUTECH_L_ZJ_WYY_sortName(item) });
    }
    items.sort((a,b)=>KOMUTECH_L_ZJ_WYY_ZH_SORTER.compare(a.name,b.name));
    let newPages = {}, idx=0;
    for (let i=0; i<items.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!newPages[page]) newPages[page] = new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null);
        newPages[page][idx%45] = items[i].ser;
        idx++;
    }
    data.pages = newPages;
    return data;
}
function KOMUTECH_L_ZJ_WYY_search(data, kw) {
    kw = kw.toLowerCase();
    let matched = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let item = KOMUTECH_L_ZJ_WYY_deserialize(ser);
        if (!item) continue;
        if (KOMUTECH_L_ZJ_WYY_searchText(item).includes(kw)) matched.push({ ser, name: KOMUTECH_L_ZJ_WYY_sortName(item) });
    }
    matched.sort((a,b)=>KOMUTECH_L_ZJ_WYY_ZH_SORTER.compare(a.name,b.name));
    let res = { pages:{} }, idx=0;
    for (let i=0; i<matched.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!res.pages[page]) res.pages[page] = new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null);
        res.pages[page][idx%45] = matched[i].ser;
        idx++;
    }
    return res;
}
function KOMUTECH_L_ZJ_WYY_createItem(mat, name, lore) {
    let it = new KOMUTECH_L_ZJ_WYY_ItemStack(KOMUTECH_L_ZJ_WYY_Material[mat]);
    let meta = it.getItemMeta();
    if (name) meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_L_ZJ_WYY_fillGUI(inv, data, page, mode, sData, kw) {
    if (!data?.pages) data = { pages:{ "1": new Array(KOMUTECH_L_ZJ_WYY_PAGE_SIZE).fill(null) } };
    let display = mode === "search" ? sData : data;
    let pg = KOMUTECH_L_ZJ_WYY_getPage(display, page);
    for (let i=0; i<45; i++) {
        let ser = pg?.[i];
        let item = ser ? KOMUTECH_L_ZJ_WYY_deserialize(ser) : null;
        inv.setItem(i, item ? item : KOMUTECH_L_ZJ_WYY_createItem("BLACK_STAINED_GLASS_PANE", " ", null));
    }
    let prev = (parseInt(page)-1).toString();
    if (parseInt(page) > 1 && display.pages[prev]) inv.setItem(KOMUTECH_L_ZJ_WYY_PREV_SLOT, KOMUTECH_L_ZJ_WYY_createItem("ARROW", "§a上一页", "§7点击切换到第 " + prev + " 页"));
    else inv.setItem(KOMUTECH_L_ZJ_WYY_PREV_SLOT, KOMUTECH_L_ZJ_WYY_createItem("GRAY_STAINED_GLASS_PANE", "§8", null));
    let next = (parseInt(page)+1).toString();
    if (display.pages[next]) inv.setItem(KOMUTECH_L_ZJ_WYY_NEXT_SLOT, KOMUTECH_L_ZJ_WYY_createItem("ARROW", "§a下一页", "§7点击切换到第 " + next + " 页"));
    else inv.setItem(KOMUTECH_L_ZJ_WYY_NEXT_SLOT, KOMUTECH_L_ZJ_WYY_createItem("GRAY_STAINED_GLASS_PANE", "§8", null));
    if (mode === "normal") inv.setItem(KOMUTECH_L_ZJ_WYY_SEARCH_SLOT, KOMUTECH_L_ZJ_WYY_createItem("NAME_TAG", "§a搜索", "§7点击使用搜索道具"));
    else inv.setItem(KOMUTECH_L_ZJ_WYY_SEARCH_SLOT, KOMUTECH_L_ZJ_WYY_createItem("NAME_TAG", "§a搜索 (关键词: " + kw + ")", "§7点击使用搜索道具"));
}
function KOMUTECH_L_ZJ_WYY_isStorageItem(item) { return item?.getType() !== KOMUTECH_L_ZJ_WYY_Material.AIR && KOMUTECH_L_ZJ_WYY_SlimefunItem.getByItem(item)?.getId() === KOMUTECH_L_ZJ_WYY_STORAGE_ID; }
function KOMUTECH_L_ZJ_WYY_getStorageData(inv, player) { let it = inv.getItem(KOMUTECH_L_ZJ_WYY_INPUT_SLOT); return KOMUTECH_L_ZJ_WYY_isStorageItem(it) ? KOMUTECH_L_ZJ_WYY_readData(it, player) : null; }
function KOMUTECH_L_ZJ_WYY_findSearchItem(p) {
    for (let it of p.getInventory().getContents()) {
        if (!it || it.getType() === KOMUTECH_L_ZJ_WYY_Material.AIR) continue;
        if (KOMUTECH_L_ZJ_WYY_SlimefunItem.getByItem(it)?.getId() === KOMUTECH_L_ZJ_WYY_SEARCH_ITEM_ID) return it;
    }
    for (let it of p.getInventory().getContents()) {
        if (it?.getType() === KOMUTECH_L_ZJ_WYY_Material.NAME_TAG && it.getItemMeta()?.hasDisplayName()) return it;
    }
    return null;
}
let KOMUTECH_L_ZJ_WYY_openPlayers = new java.util.HashMap();
function KOMUTECH_L_ZJ_WYY_saveState(p, h) {
    p.setMetadata("komutech_wyy_mode", new KOMUTECH_L_ZJ_WYY_FixedMetadataValue(KOMUTECH_L_ZJ_WYY_plugin, h.mode));
    if (h.mode === "search") {
        p.setMetadata("komutech_wyy_keyword", new KOMUTECH_L_ZJ_WYY_FixedMetadataValue(KOMUTECH_L_ZJ_WYY_plugin, h.kw));
        if (p.hasMetadata("komutech_wyy_page")) p.removeMetadata("komutech_wyy_page", KOMUTECH_L_ZJ_WYY_plugin);
    } else {
        p.setMetadata("komutech_wyy_page", new KOMUTECH_L_ZJ_WYY_FixedMetadataValue(KOMUTECH_L_ZJ_WYY_plugin, h.page));
        if (p.hasMetadata("komutech_wyy_keyword")) p.removeMetadata("komutech_wyy_keyword", KOMUTECH_L_ZJ_WYY_plugin);
    }
}
function KOMUTECH_L_ZJ_WYY_loadState(p, loaded) {
    let mode = p.hasMetadata("komutech_wyy_mode") ? p.getMetadata("komutech_wyy_mode").get(0).asString() : "normal";
    let kw = p.hasMetadata("komutech_wyy_keyword") ? p.getMetadata("komutech_wyy_keyword").get(0).asString() : "";
    let page = "1";
    if (mode === "normal" && p.hasMetadata("komutech_wyy_page")) page = p.getMetadata("komutech_wyy_page").get(0).asString();
    ["komutech_wyy_page","komutech_wyy_mode","komutech_wyy_keyword"].forEach(k => p.removeMetadata(k, KOMUTECH_L_ZJ_WYY_plugin));
    let sData = null;
    if (mode === "search" && kw && loaded && !loaded.unamed) {
        sData = KOMUTECH_L_ZJ_WYY_search(loaded, kw);
        if (!sData.pages[1]?.[0]) { mode = "normal"; kw = ""; sData = null; }
        page = "1";
    } else if (mode === "search") { mode = "normal"; kw = ""; }
    return { page, mode, sData, kw };
}
function KOMUTECH_L_ZJ_WYY_onOpen(p) {
    let top = p.getOpenInventory().getTopInventory();
    let loaded = KOMUTECH_L_ZJ_WYY_getStorageData(top, p.getName());
    if (!loaded || loaded.unamed) {
        for (let i=0; i<45; i++) top.setItem(i, KOMUTECH_L_ZJ_WYY_createItem("BLACK_STAINED_GLASS_PANE", " ", null));
        top.setItem(KOMUTECH_L_ZJ_WYY_SEARCH_SLOT, KOMUTECH_L_ZJ_WYY_createItem("NAME_TAG", "§a搜索", "§7点击使用搜索道具"));
        KOMUTECH_L_ZJ_WYY_openPlayers.put(p, { page:"1", mode:"normal", sData:null, kw:"", loaded:null });
        if (loaded && loaded.unamed) p.sendMessage("§c萬象匱未命名，无法加载数据。");
        return;
    }
    let st = KOMUTECH_L_ZJ_WYY_loadState(p, loaded);
    KOMUTECH_L_ZJ_WYY_openPlayers.put(p, { page:st.page, mode:st.mode, sData:st.sData, kw:st.kw, loaded });
    KOMUTECH_L_ZJ_WYY_fillGUI(top, loaded, st.page, st.mode, st.sData, st.kw);
}
function KOMUTECH_L_ZJ_WYY_onClose(p) {
    let h = KOMUTECH_L_ZJ_WYY_openPlayers.get(p);
    if (h) { KOMUTECH_L_ZJ_WYY_saveState(p, h); KOMUTECH_L_ZJ_WYY_openPlayers.remove(p); }
}
function KOMUTECH_L_ZJ_WYY_onClick(p, slot, item, act) {
    let top = p.getOpenInventory().getTopInventory();
    let h = KOMUTECH_L_ZJ_WYY_openPlayers.get(p);
    if (!h) {
        let loaded = KOMUTECH_L_ZJ_WYY_getStorageData(top, p.getName());
        if (!loaded || loaded.unamed) { p.sendMessage("§c请先在49号槽放入已命名的萬象匱"); return; }
        let st = KOMUTECH_L_ZJ_WYY_loadState(p, loaded);
        h = { page:st.page, mode:st.mode, sData:st.sData, kw:st.kw, loaded };
        KOMUTECH_L_ZJ_WYY_openPlayers.put(p, h);
    }
    let mode = h.mode || "normal", kw = h.kw || "", cur = h.page;
    if (slot === KOMUTECH_L_ZJ_WYY_INPUT_SLOT) return;
    if (slot >= 45 && slot < 54) {
        if (slot === KOMUTECH_L_ZJ_WYY_LOAD_BUTTON) {
            let data = KOMUTECH_L_ZJ_WYY_getStorageData(top, p.getName());
            if (!data || data.unamed) { p.sendMessage("§c请在49号槽放入已命名的萬象匱"); return; }
            h.loaded = data; h.mode = "normal"; h.sData = null; h.kw = ""; h.page = "1";
            KOMUTECH_L_ZJ_WYY_fillGUI(top, data, "1", "normal", null, "");
            p.sendMessage("§a已加载萬象匱内容");
            return;
        }
        if (!h.loaded) { p.sendMessage("§c请先点击加载按钮"); return; }
        let data = mode === "search" ? h.sData : h.loaded;
        if (slot === KOMUTECH_L_ZJ_WYY_PREV_SLOT && data?.pages[(parseInt(cur)-1).toString()]) {
            h.page = (parseInt(cur)-1).toString();
            KOMUTECH_L_ZJ_WYY_fillGUI(top, h.loaded, h.page, mode, h.sData, kw);
        } else if (slot === KOMUTECH_L_ZJ_WYY_NEXT_SLOT && data?.pages[(parseInt(cur)+1).toString()]) {
            h.page = (parseInt(cur)+1).toString();
            KOMUTECH_L_ZJ_WYY_fillGUI(top, h.loaded, h.page, mode, h.sData, kw);
        } else if (slot === KOMUTECH_L_ZJ_WYY_SORT_SLOT && mode === "normal") {
            let nd = KOMUTECH_L_ZJ_WYY_sortAll(h.loaded);
            h.loaded = nd;
            KOMUTECH_L_ZJ_WYY_writeData(top.getItem(KOMUTECH_L_ZJ_WYY_INPUT_SLOT), nd, p.getName());
            h.page = nd.pages[cur]?.slice(0,45).some(v=>v) ? cur : "1";
            KOMUTECH_L_ZJ_WYY_fillGUI(top, nd, h.page, "normal", null, "");
            p.sendMessage("§a整理完成！");
        } else if (slot === KOMUTECH_L_ZJ_WYY_SEARCH_SLOT) {
            let si = KOMUTECH_L_ZJ_WYY_findSearchItem(p);
            if (!si) { p.sendMessage("§c你没有搜索道具，请手持§a魔法2的便携式命名牌 §c或已§a命名的命名牌后点击搜索"); return; }
            let dn = si.getItemMeta().getDisplayName();
            if (!dn) { p.sendMessage("§c搜索道具没有名称"); return; }
            let kwd = dn.replace(/§./g, '').trim();
            if (!kwd) { p.sendMessage("§c搜索道具名称为空"); return; }
            let res = KOMUTECH_L_ZJ_WYY_search(h.loaded, kwd);
            if (!res.pages[1]?.[0]) { p.sendMessage("§c没有找到匹配的物品"); return; }
            h.mode = "search"; h.sData = res; h.kw = kwd; h.page = "1";
            KOMUTECH_L_ZJ_WYY_fillGUI(top, h.loaded, "1", "search", res, kwd);
            let cnt = Object.values(res.pages).flat().filter(v=>v).length;
            p.sendMessage("§a找到 " + cnt + " 个物品");
        }
        return;
    }
    if (slot >= 0 && slot < 45) {
        if (!h.loaded) { p.sendMessage("§c请先点击加载按钮"); return; }
        let pg = KOMUTECH_L_ZJ_WYY_getPage(mode === "search" ? h.sData : h.loaded, cur);
        if (!pg?.[slot]) return;
        let proto = KOMUTECH_L_ZJ_WYY_deserialize(pg[slot]);
        if (!proto) return;
        let max = proto.getMaxStackSize();
        let give = 0;
        if (act.isShiftClicked() && act.isRightClicked()) {
            let inv = p.getInventory();
            let totalSpace = 0;
            for (let i = 0; i < 36; i++) {
                let stack = inv.getItem(i);
                if (stack == null) totalSpace += max;
                else if (stack.isSimilar(proto)) totalSpace += max - stack.getAmount();
                if (totalSpace >= 64 * 36) break;
            }
            let maxGive = totalSpace;
            let given = 0;
            if (maxGive > 0) {
                let amt = Math.min(maxGive, 64 * 36);
                let it = proto.clone(); it.setAmount(amt);
                let left = inv.addItem(it);
                if (left.isEmpty()) given = amt;
                else given = amt - left.values().iterator().next().getAmount();
            }
            give = given;
        } else if (act.isShiftClicked()) give = Math.min(64, max);
        else if (act.isRightClicked()) give = Math.min(16, max);
        else give = 1;
        if (!(act.isShiftClicked() && act.isRightClicked())) {
            let amt = Math.min(give, max);
            let it = proto.clone(); it.setAmount(amt);
            p.getInventory().addItem(it);
        }
        if (give > 0) p.sendMessage("§a取出了 " + give + " 个物品");
    }
}
function onOpen(p) { try { KOMUTECH_L_ZJ_WYY_onOpen(p); } catch(e) { print("萬衍儀onOpen錯誤: " + e); } }
function onClose(p) { try { KOMUTECH_L_ZJ_WYY_onClose(p); } catch(e) { print("萬衍儀onClose錯誤: " + e); } }
function onClick(p, s, i, a) { try { KOMUTECH_L_ZJ_WYY_onClick(p, s, i, a); } catch(e) { print("萬衍儀onClick錯誤: " + e); } }