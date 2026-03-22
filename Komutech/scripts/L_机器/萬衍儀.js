const Material = Java.type('org.bukkit.Material');
const Bukkit = Java.type('org.bukkit.Bukkit');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const FixedMetadataValue = Java.type('org.bukkit.metadata.FixedMetadataValue');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const File = Java.type('java.io.File');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const DATA_DIR = new File("plugins/RykenSlimefunCustomizer/addon_configs/Komutech/WXG");
const STORAGE_ID = "KOMUTECH_L_ZJ_萬象匱";
const SEARCH_ITEM_ID = "MAGIC_EXPANSION_ITEM_NAME_TAG";
const PAGE_SIZE = 54;
const INPUT_SLOT = 49;
const LOAD_BUTTON = 53;
const PREV_SLOT = 48;
const NEXT_SLOT = 50;
const SORT_SLOT = 47;
const SEARCH_SLOT = 51;
const ZH_SORTER = new Intl.Collator('zh-CN', { sensitivity: 'base' });
const FILLER_TEMPLATE = createItem("BLACK_STAINED_GLASS_PANE", " ", null);
const DISABLED_TEMPLATE = createItem("GRAY_STAINED_GLASS_PANE", "§8", null);
function initStorageFolder() { if (!DATA_DIR.exists()) DATA_DIR.mkdirs(); }
function getStorageName(item) {
    if (!item || !item.hasItemMeta()) return null;
    const lore = item.getItemMeta().getLore();
    if (!lore) return null;
    for (let line of lore) if (line.startsWith("§7┃ 存储标识: §f")) return line.substring("§7┃ 存储标识: §f".length);
    return null;
}
function getFileName(playerName, storageName) {
    if (!storageName) return null;
    const safe = storageName.replace(/[\\/:*?"<>|]/g, '_');
    return playerName + "_" + safe + ".json";
}
function readData(item, playerName) {
    let name = getStorageName(item);
    if (!name) return { pages:{ "1": new Array(PAGE_SIZE).fill(null) }, unamed: true };
    const path = Paths.get(DATA_DIR.getAbsolutePath(), getFileName(playerName, name));
    try {
        if (!Files.exists(path)) return { pages:{ "1": new Array(PAGE_SIZE).fill(null) } };
        return JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
    } catch(e) { return { pages:{ "1": new Array(PAGE_SIZE).fill(null) } }; }
}
function writeData(item, data, playerName) {
    let name = getStorageName(item);
    if (!name) return;
    const path = Paths.get(DATA_DIR.getAbsolutePath(), getFileName(playerName, name));
    try { initStorageFolder(); Files.writeString(path, JSON.stringify(data), StandardCharsets.UTF_8); } catch(e) {}
}
function serialize(item) {
    if (!item || item.getType() === Material.AIR) return null;
    let sf = SlimefunItem.getByItem(item);
    return JSON.stringify(sf ? { type:"slimefun", id:sf.getId(), amount:item.getAmount() } : { type:"vanilla", material:item.getType().name(), amount:item.getAmount() });
}
function deserialize(json) {
    if (!json) return null;
    try {
        let d = JSON.parse(json);
        if (d.type === "slimefun") {
            let sf = SlimefunItem.getById(d.id);
            return sf ? sf.getItem().clone() : null;
        }
        let mat = Material.getMaterial(d.material);
        return mat ? new ItemStack(mat, d.amount || 1) : null;
    } catch(e) { return null; }
}
function getPage(data, p) { return data?.pages?.[p] || null; }
function searchText(item) {
    let t = [item.getType().name().toLowerCase()];
    let meta = item.getItemMeta();
    if (meta.hasDisplayName()) t.push(meta.getDisplayName().replace(/§./g,'').toLowerCase());
    let sf = SlimefunItem.getByItem(item);
    if (sf) t.push(sf.getId().toLowerCase());
    return Array.from(new Set(t)).join(' ');
}
function sortName(item) {
    let n = item.getItemMeta().getDisplayName();
    return (n || item.getType().name()).replace(/§./g,'');
}
function sortAll(data) {
    let items = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (ser) items.push({ ser, name:sortName(deserialize(ser)) });
    }
    items.sort((a,b)=>ZH_SORTER.compare(a.name,b.name));
    let newPages = {}, idx=0;
    for (let i=0; i<items.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!newPages[page]) newPages[page] = new Array(PAGE_SIZE).fill(null);
        newPages[page][idx%45] = items[i].ser;
        idx++;
    }
    data.pages = newPages;
    return data;
}
function search(data, kw) {
    kw = kw.toLowerCase();
    let matched = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let item = deserialize(ser);
        if (item && searchText(item).includes(kw)) matched.push({ ser, name:sortName(item) });
    }
    matched.sort((a,b)=>ZH_SORTER.compare(a.name,b.name));
    let res = { pages:{} }, idx=0;
    for (let i=0; i<matched.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!res.pages[page]) res.pages[page] = new Array(PAGE_SIZE).fill(null);
        res.pages[page][idx%45] = matched[i].ser;
        idx++;
    }
    return res;
}
function createItem(mat, name, lore) {
    let it = new ItemStack(Material[mat]);
    let meta = it.getItemMeta();
    if (name) meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function fillGUI(inv, data, page, mode, sData, kw) {
    if (!data?.pages) data = { pages:{ "1": new Array(PAGE_SIZE).fill(null) } };
    let display = mode === "search" ? sData : data;
    let pg = getPage(display, page);
    for (let i=0; i<45; i++) inv.setItem(i, pg?.[i] ? deserialize(pg[i]) : FILLER_TEMPLATE.clone());
    let prev = (parseInt(page)-1).toString();
    if (parseInt(page) > 1 && display.pages[prev]) inv.setItem(PREV_SLOT, createItem("ARROW", "§a上一页", "§7点击切换到第 " + prev + " 页"));
    else inv.setItem(PREV_SLOT, DISABLED_TEMPLATE.clone());
    let next = (parseInt(page)+1).toString();
    if (display.pages[next]) inv.setItem(NEXT_SLOT, createItem("ARROW", "§a下一页", "§7点击切换到第 " + next + " 页"));
    else inv.setItem(NEXT_SLOT, DISABLED_TEMPLATE.clone());
    if (mode === "normal") inv.setItem(SEARCH_SLOT, createItem("NAME_TAG", "§a搜索", "§7点击使用搜索道具"));
    else inv.setItem(SEARCH_SLOT, createItem("NAME_TAG", "§a搜索 (关键词: " + kw + ")", "§7点击使用搜索道具"));
}
function isStorageItem(item) { return item?.getType() !== Material.AIR && SlimefunItem.getByItem(item)?.getId() === STORAGE_ID; }
function getStorageData(inv, player) { let it = inv.getItem(INPUT_SLOT); return isStorageItem(it) ? readData(it, player) : null; }
function findSearchItem(p) {
    for (let it of p.getInventory().getContents()) {
        if (!it || it.getType() === Material.AIR) continue;
        if (SlimefunItem.getByItem(it)?.getId() === SEARCH_ITEM_ID) return it;
    }
    for (let it of p.getInventory().getContents()) {
        if (it?.getType() === Material.NAME_TAG && it.getItemMeta()?.hasDisplayName()) return it;
    }
    return null;
}
let openPlayers = new java.util.HashMap();
function saveState(p, h) {
    p.setMetadata("wx_mode", new FixedMetadataValue(plugin, h.mode));
    if (h.mode === "search") {
        p.setMetadata("wx_keyword", new FixedMetadataValue(plugin, h.kw));
        if (p.hasMetadata("wx_page")) p.removeMetadata("wx_page", plugin);
    } else {
        p.setMetadata("wx_page", new FixedMetadataValue(plugin, h.page));
        if (p.hasMetadata("wx_keyword")) p.removeMetadata("wx_keyword", plugin);
    }
}
function loadState(p, loaded) {
    let mode = p.hasMetadata("wx_mode") ? p.getMetadata("wx_mode").get(0).asString() : "normal";
    let kw = p.hasMetadata("wx_keyword") ? p.getMetadata("wx_keyword").get(0).asString() : "";
    let page = "1";
    if (mode === "normal" && p.hasMetadata("wx_page")) page = p.getMetadata("wx_page").get(0).asString();
    ["wx_page","wx_mode","wx_keyword"].forEach(k => p.removeMetadata(k, plugin));
    let sData = null;
    if (mode === "search" && kw && loaded && !loaded.unamed) {
        sData = search(loaded, kw);
        if (!sData.pages[1]?.[0]) { mode = "normal"; kw = ""; sData = null; }
        page = "1";
    } else if (mode === "search") { mode = "normal"; kw = ""; }
    return { page, mode, sData, kw };
}
function onOpen(p) {
    let top = p.getOpenInventory().getTopInventory();
    let loaded = getStorageData(top, p.getName());
    if (!loaded || loaded.unamed) {
        for (let i=0; i<45; i++) top.setItem(i, FILLER_TEMPLATE.clone());
        top.setItem(SEARCH_SLOT, createItem("NAME_TAG", "§a搜索", "§7点击使用搜索道具"));
        openPlayers.put(p, { page:"1", mode:"normal", sData:null, kw:"", loaded:null });
        if (loaded && loaded.unamed) p.sendMessage("§c萬象匱未命名，无法加载数据。");
        return;
    }
    let st = loadState(p, loaded);
    openPlayers.put(p, { page:st.page, mode:st.mode, sData:st.sData, kw:st.kw, loaded });
    fillGUI(top, loaded, st.page, st.mode, st.sData, st.kw);
}
function onClose(p) {
    let h = openPlayers.get(p);
    if (h) { saveState(p, h); openPlayers.remove(p); }
}
function onClick(p, slot, item, act) {
    let top = p.getOpenInventory().getTopInventory();
    let h = openPlayers.get(p);
    if (!h) {
        let loaded = getStorageData(top, p.getName());
        if (!loaded || loaded.unamed) { p.sendMessage("§c请先在49号槽放入已命名的萬象匱"); return; }
        let st = loadState(p, loaded);
        h = { page:st.page, mode:st.mode, sData:st.sData, kw:st.kw, loaded };
        openPlayers.put(p, h);
    }
    let mode = h.mode || "normal", kw = h.kw || "", cur = h.page;
    if (slot === INPUT_SLOT) return;
    if (slot >= 45 && slot < 54) {
        if (slot === LOAD_BUTTON) {
            let data = getStorageData(top, p.getName());
            if (!data || data.unamed) { p.sendMessage("§c请在49号槽放入已命名的萬象匱"); return; }
            h.loaded = data; h.mode = "normal"; h.sData = null; h.kw = ""; h.page = "1";
            fillGUI(top, data, "1", "normal", null, "");
            p.sendMessage("§a已加载萬象匱内容");
            return;
        }
        if (!h.loaded) { p.sendMessage("§c请先点击加载按钮"); return; }
        let data = mode === "search" ? h.sData : h.loaded;
        if (slot === PREV_SLOT && data?.pages[(parseInt(cur)-1).toString()]) {
            h.page = (parseInt(cur)-1).toString();
            fillGUI(top, h.loaded, h.page, mode, h.sData, kw);
        } else if (slot === NEXT_SLOT && data?.pages[(parseInt(cur)+1).toString()]) {
            h.page = (parseInt(cur)+1).toString();
            fillGUI(top, h.loaded, h.page, mode, h.sData, kw);
        } else if (slot === SORT_SLOT && mode === "normal") {
            let nd = sortAll(h.loaded);
            h.loaded = nd;
            writeData(top.getItem(INPUT_SLOT), nd, p.getName());
            h.page = nd.pages[cur]?.slice(0,45).some(v=>v) ? cur : "1";
            fillGUI(top, nd, h.page, "normal", null, "");
            p.sendMessage("§a整理完成！");
        } else if (slot === SEARCH_SLOT) {
            let si = findSearchItem(p);
            if (!si) { p.sendMessage("§c你没有搜索道具，请手持§a魔法2的便携式命名牌 §c或已§a命名的命名牌后点击搜索"); return; }
            let dn = si.getItemMeta().getDisplayName();
            if (!dn) { p.sendMessage("§c搜索道具没有名称"); return; }
            let kwd = dn.replace(/§./g, '').trim();
            if (!kwd) { p.sendMessage("§c搜索道具名称为空"); return; }
            let res = search(h.loaded, kwd);
            if (!res.pages[1]?.[0]) { p.sendMessage("§c没有找到匹配的物品"); return; }
            h.mode = "search"; h.sData = res; h.kw = kwd; h.page = "1";
            fillGUI(top, h.loaded, "1", "search", res, kwd);
            let cnt = Object.values(res.pages).flat().filter(v=>v).length;
            p.sendMessage("§a找到 " + cnt + " 个物品");
        }
        return;
    }
    if (slot >= 0 && slot < 45) {
        if (!h.loaded) { p.sendMessage("§c请先点击加载按钮"); return; }
        let pg = getPage(mode === "search" ? h.sData : h.loaded, cur);
        if (!pg?.[slot]) return;
        let proto = deserialize(pg[slot]);
        if (!proto) return;
        let max = proto.getMaxStackSize();
        let give = 0;
        if (act.isShiftClicked() && act.isRightClicked()) {
            let inv = p.getInventory(), given = 0;
            for (let i=0; i<100; i++) {
                let it = proto.clone(); it.setAmount(max);
                let left = inv.addItem(it);
                if (left.isEmpty()) given += max;
                else { given += max - left.values().iterator().next().getAmount(); break; }
            }
            give = given;
        } else if (act.isShiftClicked()) give = 64;
        else if (act.isRightClicked()) give = 16;
        else give = 1;
        if (!(act.isShiftClicked() && act.isRightClicked())) {
            let amt = Math.min(give, max);
            let it = proto.clone(); it.setAmount(amt);
            p.getInventory().addItem(it);
        }
        if (give > 0) p.sendMessage("§a取出了 " + give + " 个物品");
    }
}