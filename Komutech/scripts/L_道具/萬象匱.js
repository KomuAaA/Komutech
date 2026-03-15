const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const Material = Java.type('org.bukkit.Material');
const Bukkit = Java.type('org.bukkit.Bukkit');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const DragEvent = Java.type('org.bukkit.event.inventory.InventoryDragEvent');
const CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const Listener = Java.type('org.bukkit.event.Listener');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Consumer = Java.type('java.util.function.Consumer');
const PersistentDataAPI = Java.type('io.github.bakedlibs.dough.data.persistent.PersistentDataAPI');
const NS = "komutech";
const PAGES_INDEX_KEY = new NamespacedKey(NS, "pages_index");
const PAGE_KEY_PREFIX = "wxg_";
const STORAGE_ID = "KOMUTECH_L_ZJ_萬象匱";
const TITLE = "§f§l萬象匱";
const PAGE_SIZE = 54;
const SLOT = { PREV:48, NEXT:50, CLOSE:49, SORT:47, SEARCH:51, BACK:45 };
const BLACKLIST = [STORAGE_ID, "KOMUTECH_L_ZJ_萬衍儀", "KOMUTECH_L_ZJ_無"];

const ZH_SORTER = new Intl.Collator('zh-CN', { sensitivity: 'base' });

function serialize(item) {
    if (!item || item.getType() === Material.AIR) return null;
    let sf = SlimefunItem.getByItem(item);
    return JSON.stringify(sf ? { type:"slimefun", id:sf.getId() } : { type:"vanilla", material:item.getType().name() });
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
        return mat ? new ItemStack(mat,1) : null;
    } catch(e) { return null; }
}

function pageKey(p) { return new NamespacedKey(NS, PAGE_KEY_PREFIX + p); }
function readData(item) {
    let meta = item.getItemMeta();
    let arr = PersistentDataAPI.getIntArray(meta, PAGES_INDEX_KEY);
    if (!arr || arr.length === 0) return { pages:{ "1": new Array(PAGE_SIZE).fill(null) } };
    let pages = {};
    for (let i=0; i<arr.length; i++) {
        let p = arr[i].toString(), json = PersistentDataAPI.getString(meta, pageKey(p));
        pages[p] = json ? JSON.parse(json) : new Array(PAGE_SIZE).fill(null);
    }
    return { pages };
}
function writeData(item, data) {
    let meta = item.getItemMeta();
    let nums = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
    let intArr = Java.type('int[]'), arr = new intArr(nums.length);
    for (let i=0; i<nums.length; i++) arr[i] = nums[i];
    PersistentDataAPI.setIntArray(meta, PAGES_INDEX_KEY, arr);
    for (let p in data.pages) PersistentDataAPI.setString(meta, pageKey(p), JSON.stringify(data.pages[p]));
    item.setItemMeta(meta);
}

function getPage(data, p) { return data.pages[p] || null; }
function exists(data, item) {
    let s = serialize(item);
    if (!s) return false;
    for (let p in data.pages) if (data.pages[p].includes(s)) return true;
    return false;
}
function findEmpty(data) {
    let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
    for (let p of pages) {
        let page = data.pages[p];
        for (let i=0; i<45; i++) if (!page[i]) return { page:p.toString(), slot:i };
    }
    return null;
}
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
function buildGUI(item, page, mode="normal", searchData=null, kw="") {
    let data = mode==="search" ? searchData : readData(item);
    if (!data.pages) data = { pages:{ "1":new Array(PAGE_SIZE).fill(null) } };
    let title = TITLE + (mode==="search" ? ` §7- 搜索 "${kw}" 第 ${page} 页` : ` §7- 第 ${page} 页`);
    let inv = Bukkit.createInventory(null, PAGE_SIZE, title);
    let pg = getPage(data, page);
    if (pg) for (let i=0; i<45; i++) inv.setItem(i, pg[i] ? deserialize(pg[i]) : null);

    let prev = (parseInt(page)-1).toString();
    inv.setItem(SLOT.PREV, (parseInt(page)>1 && data.pages[prev]) ? createItem("ARROW","§a上一页","§7点击切换到第 "+prev+" 页") : createItem("GRAY_STAINED_GLASS_PANE","§8无上一页",null));
    let next = (parseInt(page)+1).toString();
    inv.setItem(SLOT.NEXT, data.pages[next] ? createItem("ARROW","§a下一页","§7点击切换到第 "+next+" 页") : createItem("GRAY_STAINED_GLASS_PANE","§8无下一页",null));
    inv.setItem(SLOT.CLOSE, createItem("BARRIER","§c关闭","§7关闭存储界面"));
    if (mode==="normal") {
        inv.setItem(SLOT.SORT, createItem("HOPPER","§a按拼音整理","§7点击将所有页物品按拼音排序"));
        inv.setItem(SLOT.SEARCH, createItem("NAME_TAG","§a搜索","§7点击输入关键词搜索物品"));
    } else inv.setItem(SLOT.BACK, createItem("ARROW","§a返回","§7返回正常浏览"));
    let border = createItem("BLACK_STAINED_GLASS_PANE","§8",null);
    for (let i=45; i<54; i++) if (inv.getItem(i)==null) inv.setItem(i, border.clone());
    return inv;
}

function findStorage(player) {
    let hand = player.getInventory().getItemInMainHand();
    if (hand.getType()!==Material.AIR) {
        let sf = SlimefunItem.getByItem(hand);
        if (sf && sf.getId()===STORAGE_ID) return hand;
    }
    for (let i=0; i<player.getInventory().getSize(); i++) {
        let it = player.getInventory().getItem(i);
        if (!it || it.getType()===Material.AIR) continue;
        let sf = SlimefunItem.getByItem(it);
        if (sf && sf.getId()===STORAGE_ID) return it;
    }
    return null;
}

let openPlayers = new java.util.HashMap();
let turning = new java.util.HashSet();
let awaiting = new java.util.HashSet();

function registerListener() {
    if (plugin.komutech_l_zj_wxggui) {
        ClickEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
        DragEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
        CloseEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
    }
    const L = Java.extend(Listener, {});
    let lis = new L();

    Bukkit.getPluginManager().registerEvent(ClickEvent, lis, EventPriority.NORMAL, (l,e)=>{
        let p = e.getWhoClicked();
        if (!openPlayers.containsKey(p) || !e.getView().getTitle().startsWith(TITLE)) return;
        e.setCancelled(true);

        let h = openPlayers.get(p);
        let storage = h.item;
        if (!storage || storage.getType()===Material.AIR) {
            let hand = p.getInventory().getItemInMainHand();
            let sf = SlimefunItem.getByItem(hand);
            if (hand.getType()!==Material.AIR && sf && sf.getId()===STORAGE_ID) {
                storage = hand; h.item = hand;
            } else {
                p.sendMessage("§c存储道具已丢失，界面关闭。"); p.closeInventory(); return;
            }
        }

        let mode = h.mode || "normal", sData = h.searchData || null, kw = h.keyword || "", cur = h.page;
        let data = mode==="search" ? sData : readData(storage);
        if (!data || !data.pages) { p.closeInventory(); return; }

        let slot = e.getSlot(), clk = e.getClickedInventory(), top = e.getView().getTopInventory();

        if (clk===top && slot>=45 && slot<54) {
            if (slot===SLOT.PREV && data.pages[(parseInt(cur)-1).toString()]) {
                turning.add(p); h.page = (parseInt(cur)-1).toString();
                p.openInventory(buildGUI(storage, h.page, mode, sData, kw));
            } else if (slot===SLOT.NEXT && data.pages[(parseInt(cur)+1).toString()]) {
                turning.add(p); h.page = (parseInt(cur)+1).toString();
                p.openInventory(buildGUI(storage, h.page, mode, sData, kw));
            } else if (slot===SLOT.CLOSE) p.closeInventory();
            else if (mode==="normal" && slot===SLOT.SORT) {
                turning.add(p);
                let nd = sortAll(readData(storage));
                writeData(storage, nd);
                h.page = nd.pages[cur] && nd.pages[cur].slice(0,45).some(v=>v) ? cur : "1";
                p.openInventory(buildGUI(storage, h.page, "normal"));
                turning.remove(p); p.sendMessage("§a整理完成！");
            } else if (mode==="normal" && slot===SLOT.SEARCH) {
                p.sendMessage("§a请先手动关闭当前界面，然后在聊天栏输入关键词（输入 cancel 取消）:");
                awaiting.add(p);
            } else if (mode==="search" && slot===SLOT.BACK) {
                turning.add(p); h.mode="normal"; h.searchData=null; h.keyword=""; h.page="1";
                p.openInventory(buildGUI(storage, "1", "normal")); turning.remove(p);
            }
            return;
        }

        if (clk===top && slot>=0 && slot<45) {
            let pg = getPage(data, cur);
            if (!pg || !pg[slot]) return;
            if (p.getInventory().firstEmpty()===-1) { p.sendMessage("§c背包已满"); return; }
            let stored = deserialize(pg[slot]);
            if (!stored) {
                pg[slot]=null; if (mode==="normal") writeData(storage, data);
                top.setItem(slot,null); return;
            }
            if (mode==="search") {
                let orig = readData(storage);
                for (let pp in orig.pages) for (let i=0; i<orig.pages[pp].length; i++)
                    if (orig.pages[pp][i]===pg[slot]) { orig.pages[pp][i]=null; break; }
                writeData(storage, orig);
                pg[slot]=null; top.setItem(slot,null); p.getInventory().addItem(stored);
            } else {
                pg[slot]=null; data.pages[cur]=pg; writeData(storage, data);
                p.getInventory().addItem(stored); top.setItem(slot,null);
            }
            return;
        }

        if (clk===p.getInventory() && mode==="normal") {
            let it = e.getCurrentItem();
            if (!it || it.getType()===Material.AIR) return;
            let sf = SlimefunItem.getByItem(it), id = sf ? sf.getId() : null;
            if (id && BLACKLIST.includes(id)) { p.sendMessage("§c不能存入此物品"); return; }
            if (exists(data, it)) { p.sendMessage("§c该物品已存在"); return; }
            let empty = findEmpty(data);
            if (!empty) {
                let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
                let np = (pages.length+1).toString();
                data.pages[np] = new Array(PAGE_SIZE).fill(null);
                empty = { page: np, slot:0 };
            }
            let ser = serialize(it);
            if (!ser) { p.sendMessage("§c无法存储"); return; }
            let pg = getPage(data, empty.page) || new Array(PAGE_SIZE).fill(null);
            pg[empty.slot] = ser; data.pages[empty.page] = pg; writeData(storage, data);
            if (it.getAmount()>1) it.setAmount(it.getAmount()-1); else it.setAmount(0);
            if (empty.page !== cur) {
                turning.add(p); h.page = empty.page;
                p.openInventory(buildGUI(storage, empty.page, "normal")); turning.remove(p);
            } else top.setItem(empty.slot, deserialize(ser));
        }
    }, plugin);

    Bukkit.getPluginManager().registerEvent(DragEvent, lis, EventPriority.NORMAL, (l,e)=>{
        let p = e.getWhoClicked();
        if (!openPlayers.containsKey(p) || !e.getView().getTitle().startsWith(TITLE)) return;
        for (let slot of e.getNewItems().keySet()) if (slot<54) { e.setCancelled(true); return; }
    }, plugin);

    Bukkit.getPluginManager().registerEvent(CloseEvent, lis, EventPriority.NORMAL, (l,e)=>{
        let p = e.getPlayer();
        if (!e.getView().getTitle().startsWith(TITLE)) return;
        if (turning.contains(p)) turning.remove(p);
        else if (awaiting.contains(p)) {
            awaiting.remove(p);
            let storage = findStorage(p);
            if (!storage) { openPlayers.remove(p); return; }
            getChatInput(p, new (Java.extend(Consumer, {
                accept: function(input) {
                    if (input.toLowerCase()==="cancel") { openPlayers.remove(p); return; }
                    let cur = findStorage(p);
                    if (!cur) { p.sendMessage("§c存储道具已丢失"); openPlayers.remove(p); return; }
                    let orig = readData(cur);
                    if (!orig) { openPlayers.remove(p); return; }
                    let res = search(orig, input);
                    let h = openPlayers.get(p) || { item:cur, page:"1", mode:"normal", searchData:null, keyword:"" };
                    h.item = cur;
                    if (!res.pages[1] || !res.pages[1][0]) {
                        p.sendMessage("§c没有找到匹配的物品。");
                        h.mode="normal"; h.searchData=null; h.keyword=""; h.page="1";
                        turning.add(p); p.openInventory(buildGUI(cur, "1", "normal")); turning.remove(p);
                    } else {
                        h.mode="search"; h.searchData=res; h.keyword=input; h.page="1";
                        turning.add(p); p.openInventory(buildGUI(cur, "1", "search", res, input)); turning.remove(p);
                        let cnt = Object.values(res.pages).flat().filter(v=>v).length;
                        p.sendMessage("§a找到 " + cnt + " 个物品。");
                    }
                    openPlayers.put(p, h);
                }
            })));
        } else openPlayers.remove(p);
        if (openPlayers.isEmpty()) {
            ClickEvent.getHandlerList().unregister(lis);
            DragEvent.getHandlerList().unregister(lis);
            CloseEvent.getHandlerList().unregister(lis);
            plugin.komutech_l_zj_wxggui = null;
        }
    }, plugin);
    plugin.komutech_l_zj_wxggui = lis;
}

function ensure() { if (!plugin.komutech_l_zj_wxggui) registerListener(); }

function onUse(e) {
    let p = e.getPlayer(), it = e.getItem();
    let data = readData(it);
    if (!data.pages || Object.keys(data.pages).length===0) {
        data = { pages:{ "1": new Array(PAGE_SIZE).fill(null) } };
        writeData(it, data);
    }
    p.openInventory(buildGUI(it, "1", "normal"));
    openPlayers.put(p, { item:it, page:"1", mode:"normal", searchData:null, keyword:"" });
    ensure();
}

if (plugin.komutech_l_zj_wxggui) {
    ClickEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
    DragEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
    CloseEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxggui);
    plugin.komutech_l_zj_wxggui = null;
}