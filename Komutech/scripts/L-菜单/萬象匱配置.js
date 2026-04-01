const Bukkit = Java.type('org.bukkit.Bukkit');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const Listener = Java.type('org.bukkit.event.Listener');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Consumer = Java.type('java.util.function.Consumer');
const File = Java.type('java.io.File');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const DATA_DIR = new File("plugins/RykenSlimefunCustomizer/addon_configs/Komutech/WXG");
const PLAYER_TITLE = "§a§l我的存储";
const ADMIN_TITLE = "§c§l管理员模式";
const STORAGE_LIST_TITLE = "§e§l存储列表 - ";
const STORAGE_VIEW_TITLE = "§d§l存储内容 - ";
const BACK_SLOT = 49;
const MODE_SLOT = 4;
const INFO_SLOT = 8;
const BORDER_SLOTS = [0,1,2,3,5,6,7,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];
const SORT_SLOT = 47;
const SEARCH_SLOT = 51;
const BACK_BUTTON_SLOT = 45;
const COLOR_REGEX = /§./g;
function initStorageFolder() { if (!DATA_DIR.exists()) DATA_DIR.mkdirs(); }
initStorageFolder();
function getAllPlayers() {
    if (!DATA_DIR.exists()) return [];
    const files = DATA_DIR.listFiles();
    if (!files) return [];
    const players = new java.util.HashSet();
    for (let file of files) {
        if (file.isFile() && file.getName().endsWith(".json")) {
            const name = file.getName();
            const lastUnderscore = name.lastIndexOf('_');
            if (lastUnderscore !== -1) {
                players.add(name.substring(0, lastUnderscore));
            }
        }
    }
    return Array.from(players);
}
function getPlayerStorages(playerName) {
    if (!DATA_DIR.exists()) return [];
    const files = DATA_DIR.listFiles();
    if (!files) return [];
    const storages = [];
    const prefix = playerName + "_";
    for (let file of files) {
        const fileName = file.getName();
        if (file.isFile() && fileName.endsWith(".json") && fileName.startsWith(prefix)) {
            const storageName = fileName.substring(prefix.length, fileName.length - 5);
            storages.push({ name: storageName, file });
        }
    }
    return storages;
}
function deleteFile(file) { try { file.delete(); return true; } catch(e) { return false; } }
function renameFile(file, oldName, newName, player) {
    const newPath = DATA_DIR.getAbsolutePath() + File.separator + player + "_" + newName + ".json";
    const newFile = new File(newPath);
    if (newFile.exists()) return false;
    try { Files.move(file.toPath(), newFile.toPath()); return true; } catch(e) { return false; }
}
function createItem(mat, name, lore) {
    const it = new ItemStack(Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function applyBorder(inv) {
    const border = createItem("BLACK_STAINED_GLASS_PANE", " ", null);
    BORDER_SLOTS.forEach(s => inv.setItem(s, border.clone()));
}
function buildPlayerMenu(player) {
    const storages = getPlayerStorages(player.getName());
    const inv = Bukkit.createInventory(null, 54, PLAYER_TITLE);
    applyBorder(inv);
    inv.setItem(MODE_SLOT, createItem("COMPASS", "§a切换模式", ["§7点击切换到管理员模式"]));
    inv.setItem(INFO_SLOT, createItem("PAPER", "§a你的存储", ["§7共 " + storages.length + " 个"]));
    let slot = 10;
    for (let i = 0; i < storages.length; i++) {
        const s = storages[i];
        inv.setItem(slot, createItem("PAPER", "§f存储名: §e" + s.name, null));
        inv.setItem(slot + 9, createItem("REDSTONE_BLOCK", "§c删除", ["§7删除存储 " + s.name]));
        inv.setItem(slot + 18, createItem("NAME_TAG", "§a重命名", ["§7重命名存储 " + s.name]));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
        if (slot > 43) break;
    }
    inv.setItem(BACK_SLOT, createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
    return { inv, storages };
}
function buildAdminList(page = 1) {
    const players = getAllPlayers();
    const total = Math.max(1, Math.ceil(players.length / 28));
    const start = (page - 1) * 28;
    const pagePlayers = players.slice(start, start + 28);
    const inv = Bukkit.createInventory(null, 54, ADMIN_TITLE);
    applyBorder(inv);
    inv.setItem(MODE_SLOT, createItem("COMPASS", "§a切换模式", ["§7点击切换到玩家模式"]));
    inv.setItem(INFO_SLOT, createItem("PAPER", "§6管理员面板", ["§7总玩家数: " + players.length, "§7第 " + page + "/" + total + " 页"]));
    inv.setItem(53, createItem("TNT", "§c清空所有数据", ["§7删除全部存储文件", "§c§l不可逆！"]));
    const rows = [10, 19, 28, 37];
    let idx = 0;
    for (let r of rows) {
        for (let c = 0; c < 7; c++) {
            if (idx >= pagePlayers.length) break;
            inv.setItem(r + c, createItem("PLAYER_HEAD", "§e" + pagePlayers[idx], ["§7点击查看存储列表"]));
            idx++;
        }
        if (idx >= pagePlayers.length) break;
    }
    if (page > 1) inv.setItem(48, createItem("ARROW", "§a上一页", ["§7第 " + (page - 1) + " 页"]));
    if (page < total) inv.setItem(50, createItem("ARROW", "§a下一页", ["§7第 " + (page + 1) + " 页"]));
    inv.setItem(49, createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
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
function buildStorageList(playerName) {
    const storages = getPlayerStorages(playerName);
    const inv = Bukkit.createInventory(null, 54, STORAGE_LIST_TITLE + playerName);
    applyBorder(inv);
    inv.setItem(4, createItem("ARROW", "§a返回", ["§7返回玩家列表"]));
    inv.setItem(INFO_SLOT, createItem("PAPER", "§6玩家: " + playerName, ["§7共 " + storages.length + " 个存储"]));
    inv.setItem(53, createItem("TNT", "§c删除该玩家所有存储", ["§7删除玩家 " + playerName + " 的所有存储", "§c§l不可逆！"]));
    let slot = 10;
    for (let i = 0; i < storages.length; i++) {
        const s = storages[i];
        inv.setItem(slot, createItem("BOOK", "§f存储名: §e" + s.name, ["§7点击查看内容"]));
        inv.setItem(slot + 9, createItem("REDSTONE_BLOCK", "§c删除", ["§7删除此存储"]));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
        if (slot > 43) break;
    }
    inv.setItem(BACK_SLOT, createItem("BARRIER", "§c关闭", ["§7关闭菜单"]));
    return { inv, storages, playerName };
}
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
function emptyPage() { return new Array(45).fill(null); }
function emptyData() { return { pages: { "1": emptyPage() }, meta: { page: "1", mode: "normal", kw: "" } }; }
function loadData(player, storage) {
    const path = Paths.get(DATA_DIR.getAbsolutePath(), player + "_" + storage + ".json");
    try {
        if (!Files.exists(path)) return emptyData();
        let data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        if (!data.meta) data.meta = { page: "1", mode: "normal", kw: "" };
        return data;
    } catch(e) { return emptyData(); }
}
function saveData(player, storage, data) {
    const path = Paths.get(DATA_DIR.getAbsolutePath(), player + "_" + storage + ".json");
    try { initStorageFolder(); Files.writeString(path, JSON.stringify(data), StandardCharsets.UTF_8); } catch(e) {}
}
function sortName(item) {
    if (!item) return "无效物品";
    let n = item.getItemMeta().getDisplayName();
    return (n || item.getType().name()).replace(COLOR_REGEX,'');
}
function sortAll(data) {
    let items = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let it = deserialize(ser);
        if (!it) continue;
        items.push({ ser, name:sortName(it) });
    }
    items.sort((a,b)=>new Intl.Collator('zh-CN').compare(a.name,b.name));
    let newPages = {}, idx=0;
    for (let i=0; i<items.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!newPages[page]) newPages[page] = emptyPage();
        newPages[page][idx%45] = items[i].ser;
        idx++;
    }
    data.pages = newPages;
    data.meta = { page: "1", mode: "normal", kw: "" };
    return data;
}
function searchText(item) {
    let t = [item.getType().name().toLowerCase()];
    let meta = item.getItemMeta();
    if (meta.hasDisplayName()) t.push(meta.getDisplayName().replace(COLOR_REGEX,'').toLowerCase());
    let sf = SlimefunItem.getByItem(item);
    if (sf) t.push(sf.getId().toLowerCase());
    return Array.from(new Set(t)).join(' ');
}
function searchInData(data, kw) {
    kw = kw.toLowerCase();
    let matched = [];
    for (let p in data.pages) for (let i=0; i<data.pages[p].length; i++) {
        let ser = data.pages[p][i];
        if (!ser) continue;
        let it = deserialize(ser);
        if (!it) continue;
        if (searchText(it).includes(kw)) matched.push(ser);
    }
    let res = { pages: {}, meta: { page: "1", mode: "search", kw: kw } };
    let idx=0;
    for (let i=0; i<matched.length; i++) {
        let page = Math.floor(idx/45)+1;
        if (!res.pages[page]) res.pages[page] = emptyPage();
        res.pages[page][idx%45] = matched[i];
        idx++;
    }
    return res;
}
function findEmptySlot(data) {
    let pages = Object.keys(data.pages).map(Number).sort((a,b)=>a-b);
    for (let p of pages) {
        let page = data.pages[p];
        for (let i=0; i<45; i++) if (!page[i]) return { page:p.toString(), slot:i };
    }
    let newPage = (pages.length+1).toString();
    data.pages[newPage] = emptyPage();
    return { page: newPage, slot:0 };
}
function existsInData(data, item) {
    let s = serialize(item);
    if (!s) return false;
    for (let p in data.pages) if (data.pages[p].includes(s)) return true;
    return false;
}
function storeInData(data, item) {
    if (existsInData(data, item)) return { success: false, reason: "物品已存在" };
    let empty = findEmptySlot(data);
    let ser = serialize(item);
    if (!ser) return { success: false, reason: "无法序列化" };
    data.pages[empty.page][empty.slot] = ser;
    return { success: true, page: empty.page };
}
function buildStorageView(player, storage, page = 1, mode = "normal", searchData = null, kw = "") {
    let data = loadData(player, storage);
    const finalPage = page !== undefined ? page : data.meta.page;
    const finalMode = mode !== undefined ? mode : data.meta.mode;
    const finalKw = kw !== undefined ? kw : data.meta.kw;
    const inv = Bukkit.createInventory(null, 54, STORAGE_VIEW_TITLE + storage);
    const border = createItem("BLACK_STAINED_GLASS_PANE", "§8", null);
    for (let i = 45; i < 54; i++) inv.setItem(i, border.clone());
    let display = finalMode === "search" ? searchData : data;
    const pages = Object.keys(display.pages).map(Number).sort((a,b)=>a-b);
    const curPage = pages.includes(finalPage) ? finalPage : (pages[0] || 1);
    const curData = display.pages[curPage] || [];
    for (let i = 0; i < 45; i++) {
        const ser = curData[i];
        if (ser) {
            const it = deserialize(ser);
            if (it) inv.setItem(i, it);
        }
    }
    inv.setItem(48, createItem("ARROW", "§a上一页", ["§7上一页"]));
    inv.setItem(49, createItem("ARROW", "§a返回", ["§7返回存储列表"]));
    inv.setItem(50, createItem("ARROW", "§a下一页", ["§7下一页"]));
    inv.setItem(SORT_SLOT, createItem("HOPPER", "§a按拼音整理", ["§7点击整理物品"]));
    inv.setItem(SEARCH_SLOT, createItem("NAME_TAG", "§a搜索", ["§7点击输入关键词搜索"]));
    if (finalMode === "search") inv.setItem(BACK_BUTTON_SLOT, createItem("ARROW", "§a返回", ["§7返回正常浏览"]));
    return { inv, data, player, storage, curPage, mode: finalMode, searchData, kw: finalKw };
}
let openPlayers = new java.util.HashMap();
let registered = false;
let awaitingSearch = new java.util.HashSet();
function ensureListener() {
    if (registered) return;
    if (plugin.komutech_l_zj_wxgpzcd) {
        ClickEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxgpzcd);
        CloseEvent.getHandlerList().unregister(plugin.komutech_l_zj_wxgpzcd);
        plugin.komutech_l_zj_wxgpzcd = null;
    }
    const L = Java.extend(Listener, {});
    const listener = new L();
    Bukkit.getPluginManager().registerEvent(ClickEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!openPlayers.containsKey(p)) return;
            const title = e.getInventory().getTitle();
            if (!title.startsWith(PLAYER_TITLE) && !title.startsWith(ADMIN_TITLE) && !title.startsWith(STORAGE_LIST_TITLE) && !title.startsWith(STORAGE_VIEW_TITLE)) return;
            e.setCancelled(true);
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === Material.AIR) return;
            const state = openPlayers.get(p);
            if (title === PLAYER_TITLE) {
                if (slot === MODE_SLOT) { openAdminList(p, 1); return; }
                if (slot === BACK_SLOT) { p.closeInventory(); return; }
                const row = Math.floor(slot / 9);
                const col = slot % 9;
                if (row === 2 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const name = state.storages[idx].name;
                        p.sendMessage("§c确定要删除存储 §e" + name + "§c 吗？请输入 §6确认删除 §c以确认:");
                        getChatInput(p, new (Java.extend(Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp === "确认删除") {
                                    deleteFile(state.storages[idx].file);
                                    p.sendMessage("§a已删除存储 " + name);
                                    openPlayerMenu(p);
                                } else p.sendMessage("§c删除已取消");
                            }
                        })));
                    }
                } else if (row === 3 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const old = state.storages[idx].name;
                        p.sendMessage("§a请输入新的存储名（当前: " + old + "），输入 cancel 取消:");
                        getChatInput(p, new (Java.extend(Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp.toLowerCase() === "cancel") { p.sendMessage("§c已取消重命名"); return; }
                                if (!inp || inp.trim() === "") { p.sendMessage("§c名称不能为空"); return; }
                                if (/[\\/:*?"<>|]/.test(inp)) { p.sendMessage("§c名称不能包含 \\ / : * ? \" < > | 等字符"); return; }
                                const newName = inp;
                                const player = p.getName();
                                const newPath = DATA_DIR.getAbsolutePath() + File.separator + player + "_" + newName + ".json";
                                if (new File(newPath).exists()) { p.sendMessage("§c已存在同名存储"); return; }
                                if (renameFile(state.storages[idx].file, old, newName, player)) {
                                    p.sendMessage("§a已重命名为 " + newName);
                                    openPlayerMenu(p);
                                } else p.sendMessage("§c重命名失败");
                            }
                        })));
                    }
                }
                return;
            }
            if (title === ADMIN_TITLE) {
                if (slot === MODE_SLOT) { openPlayerMenu(p); return; }
                if (slot === BACK_SLOT) { p.closeInventory(); return; }
                if (slot === 53) {
                    const pass = getAddonConfig().getString("L_ZJ_WXG_MM", "0108");
                    p.sendMessage("§c确定要清空所有存储数据吗？此操作不可逆。请输入密码以确认:");
                    getChatInput(p, new (Java.extend(Consumer, {
                        accept: function(inp) {
                            if (!p.isOnline()) return;
                            if (inp === pass) {
                                const files = DATA_DIR.listFiles();
                                if (files) for (let f of files) if (f.isFile() && f.getName().endsWith(".json")) f.delete();
                                p.sendMessage("§a已清空所有存储数据");
                                openAdminList(p, 1);
                            } else p.sendMessage("§c密码错误，操作已取消");
                        }
                    })));
                    return;
                }
                if (slot === 48 && state.page > 1) { openAdminList(p, state.page - 1); return; }
                if (slot === 50 && state.page < state.total) { openAdminList(p, state.page + 1); return; }
                if (state.slotMap && state.slotMap.containsKey(slot)) {
                    openStorageList(p, state.slotMap.get(slot));
                    return;
                }
                return;
            }
            if (title.startsWith(STORAGE_LIST_TITLE)) {
                if (slot === 4) { openAdminList(p, 1); return; }
                if (slot === BACK_SLOT) { p.closeInventory(); return; }
                if (slot === 53) {
                    p.sendMessage("§c确定要删除玩家 §e" + state.playerName + "§c 的所有存储吗？请输入 §6确认删除 §c以确认:");
                    getChatInput(p, new (Java.extend(Consumer, {
                        accept: function(inp) {
                            if (!p.isOnline()) return;
                            if (inp === "确认删除") {
                                const storages = getPlayerStorages(state.playerName);
                                storages.forEach(s => s.file.delete());
                                p.sendMessage("§a已删除玩家 " + state.playerName + " 的所有存储");
                                openAdminList(p, 1);
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
                        openStorageView(p, state.playerName, state.storages[idx].name);
                    }
                } else if (row === 2 && col >= 1 && col <= 7) {
                    const idx = col - 1;
                    if (state.storages && idx < state.storages.length) {
                        const name = state.storages[idx].name;
                        p.sendMessage("§c确定要删除存储 §e" + name + "§c 吗？请输入 §6确认删除 §c以确认:");
                        getChatInput(p, new (Java.extend(Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp === "确认删除") {
                                    deleteFile(state.storages[idx].file);
                                    p.sendMessage("§a已删除存储 " + name);
                                    openStorageList(p, state.playerName);
                                } else p.sendMessage("§c删除已取消");
                            }
                        })));
                    }
                }
                return;
            }
            if (title.startsWith(STORAGE_VIEW_TITLE)) {
                const top = e.getView().getTopInventory();
                const clicked = e.getClickedInventory();
                const path = DATA_DIR.getAbsolutePath() + File.separator + state.player + "_" + state.storage + ".json";
                const file = new File(path);
                if (slot === BACK_BUTTON_SLOT && state.mode === "search") {
                    let data = loadData(state.player, state.storage);
                    data.meta = { page: "1", mode: "normal", kw: "" };
                    saveData(state.player, state.storage, data);
                    const v = buildStorageView(state.player, state.storage, 1, "normal", null, "");
                    openMenu(p, v.inv, { ...v, data: data, mode: "normal", searchData: null, kw: "", currentPage: 1 });
                } else if (slot === 48 && state.currentPage > 1) {
                    let data = loadData(state.player, state.storage);
                    data.meta.page = (state.currentPage - 1).toString();
                    saveData(state.player, state.storage, data);
                    const v = buildStorageView(state.player, state.storage, state.currentPage - 1, state.mode, state.searchData, state.kw);
                    openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage - 1 });
                } else if (slot === 49) {
                    openStorageList(p, state.player);
                } else if (slot === 50) {
                    let data = loadData(state.player, state.storage);
                    data.meta.page = (state.currentPage + 1).toString();
                    saveData(state.player, state.storage, data);
                    const v = buildStorageView(state.player, state.storage, state.currentPage + 1, state.mode, state.searchData, state.kw);
                    openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage + 1 });
                } else if (slot === SORT_SLOT && state.mode === "normal") {
                    let data = loadData(state.player, state.storage);
                    let nd = sortAll(data);
                    saveData(state.player, state.storage, nd);
                    const v = buildStorageView(state.player, state.storage, 1, "normal", null, "");
                    openMenu(p, v.inv, { ...v, data: nd, currentPage: 1 });
                    p.sendMessage("§a整理完成！");
                } else if (slot === SEARCH_SLOT) {
                    if (awaitingSearch.contains(p)) return;
                    awaitingSearch.add(p);
                    p.sendMessage("§a请在聊天栏输入搜索关键词，输入 cancel 取消:");
                    getChatInput(p, new (Java.extend(Consumer, {
                        accept: function(inp) {
                            awaitingSearch.remove(p);
                            if (!p.isOnline()) return;
                            if (inp.toLowerCase() === "cancel") { p.sendMessage("§c已取消搜索"); return; }
                            if (!inp.trim()) { p.sendMessage("§c关键词不能为空"); return; }
                            let data = loadData(state.player, state.storage);
                            const res = searchInData(data, inp);
                            if (!res.pages[1] || !res.pages[1][0]) { p.sendMessage("§c没有找到匹配的物品"); return; }
                            data.meta = { page: "1", mode: "search", kw: inp };
                            saveData(state.player, state.storage, data);
                            const v = buildStorageView(state.player, state.storage, 1, "search", res, inp);
                            openMenu(p, v.inv, { ...v, data: data, mode: "search", searchData: res, kw: inp, currentPage: 1 });
                            let cnt = Object.values(res.pages).flat().filter(v=>v).length;
                            p.sendMessage("§a找到 " + cnt + " 个物品");
                        }
                    })));
                } else if (slot >= 0 && slot < 45 && clicked === top) {
                    const item = e.getCurrentItem();
                    if (item && item.getType() !== Material.AIR) {
                        if (p.getInventory().firstEmpty() === -1) {
                            p.sendMessage("§c背包已满");
                        } else {
                            p.getInventory().addItem(item.clone());
                            let data = loadData(state.player, state.storage);
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
                            saveData(state.player, state.storage, data);
                            p.sendMessage("§a已取出物品");
                            let v = (state.mode === "search") ?
                                buildStorageView(state.player, state.storage, state.currentPage, "search", state.searchData, state.kw) :
                                buildStorageView(state.player, state.storage, state.currentPage, "normal", null, "");
                            openMenu(p, v.inv, { ...v, data: data, currentPage: state.currentPage });
                        }
                    }
                } else if (slot >= 0 && slot < 45 && clicked !== top && state.mode === "normal") {
                    const hand = e.getCurrentItem();
                    if (hand && hand.getType() !== Material.AIR) {
                        let sf = SlimefunItem.getByItem(hand);
                        let id = sf ? sf.getId() : null;
                        if (id && ["KOMUTECH_L_ZJ_萬象匱", "KOMUTECH_L_ZJ_萬衍儀", "KOMUTECH_L_ZJ_無"].includes(id)) {
                            p.sendMessage("§c不能存入此物品");
                            return;
                        }
                        let data = loadData(state.player, state.storage);
                        let result = storeInData(data, hand);
                        if (!result.success) { p.sendMessage("§c存入失败: " + result.reason); return; }
                        saveData(state.player, state.storage, data);
                        if (hand.getAmount() > 1) hand.setAmount(hand.getAmount() - 1);
                        else e.getClickedInventory().setItem(e.getSlot(), null);
                        p.sendMessage("§a已存入物品");
                        const v = buildStorageView(state.player, state.storage, parseInt(result.page), state.mode, state.searchData, state.kw);
                        openMenu(p, v.inv, { ...v, data: data, currentPage: parseInt(result.page) });
                    }
                }
                return;
            }
        } catch (err) { Bukkit.getLogger().warning("[数据管理] 点击事件错误: " + err); }
    }, plugin);
    Bukkit.getPluginManager().registerEvent(CloseEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            openPlayers.remove(p);
            awaitingSearch.remove(p);
            if (openPlayers.isEmpty()) {
                ClickEvent.getHandlerList().unregister(listener);
                CloseEvent.getHandlerList().unregister(listener);
                plugin.komutech_l_zj_wxgpzcd = null;
                registered = false;
            }
        } catch (err) {}
    }, plugin);
    plugin.komutech_l_zj_wxgpzcd = listener;
    registered = true;
}
function openMenu(p, inv, data = null) {
    p.openInventory(inv);
    openPlayers.put(p, data);
    ensureListener();
}
function openPlayerMenu(p) {
    const { inv, storages } = buildPlayerMenu(p);
    openMenu(p, inv, { storages });
}

function openAdminList(p, page) {
    if (!p.isOp() && p.getName() !== "Komu_A") {
        p.sendMessage("§c你没有权限使用管理员模式");
        openPlayerMenu(p);
        return;
    }
    const { inv, page: cur, total, slotMap } = buildAdminList(page);
    openMenu(p, inv, { page: cur, total, slotMap });
}
function openStorageList(p, playerName) {
    const { inv, storages, playerName: name } = buildStorageList(playerName);
    openMenu(p, inv, { storages, playerName: name });
}
function openStorageView(p, player, storage, page = 1) {
    const { inv, data, curPage, mode, searchData, kw } = buildStorageView(player, storage, page);
    openMenu(p, inv, { data, player, storage, currentPage: curPage, mode, searchData, kw });
}
function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { openPlayerMenu(player); return true; } catch (err) { player.sendMessage("§c无法打开数据管理菜单"); return false; }
}