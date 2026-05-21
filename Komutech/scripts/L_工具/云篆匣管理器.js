const KOMUTECH_L_GL_YLXGLQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_L_GL_YLXGLQ_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_GL_YLXGLQ_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_GL_YLXGLQ_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_L_GL_YLXGLQ_DragEvent = Java.type('org.bukkit.event.inventory.InventoryDragEvent');
const KOMUTECH_L_GL_YLXGLQ_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_GL_YLXGLQ_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_GL_YLXGLQ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_GL_YLXGLQ_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_GL_YLXGLQ_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_GL_YLXGLQ_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_GL_YLXGLQ_Consumer = Java.type('java.util.function.Consumer');
const KOMUTECH_L_GL_YLXGLQ_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_L_GL_YLXGLQ_SCROLL_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣';
const KOMUTECH_L_GL_YLXGLQ_CONFIG_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/卷轴属性.json';
const KOMUTECH_L_GL_YLXGLQ_TITLE_LIST = '§c§l云篆匣管理';
const KOMUTECH_L_GL_YLXGLQ_TITLE_DETAIL = '§d§l玩家卷轴详情 - ';
const KOMUTECH_L_GL_YLXGLQ_SCROLL_PREFIX = 'KOMUTECH_L_JZ_';
const KOMUTECH_L_GL_YLXGLQ_SIZE = 54;
const KOMUTECH_L_GL_YLXGLQ_BORDER_SLOTS = [0,1,2,3,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,51,52,53];
const KOMUTECH_L_GL_YLXGLQ_AVAILABLE_SLOTS = [10,11,12,13,14,15,16,19,20,21,22,23,24,25,28,29,30,31,32,33,34,37,38,39,40,41,42,43];
const KOMUTECH_L_GL_YLXGLQ_SLOTS_PER_PAGE = KOMUTECH_L_GL_YLXGLQ_AVAILABLE_SLOTS.length;
let KOMUTECH_L_GL_YLXGLQ_cfg = null;
try {
    if (KOMUTECH_L_GL_YLXGLQ_Files.exists(KOMUTECH_L_GL_YLXGLQ_Paths.get(KOMUTECH_L_GL_YLXGLQ_CONFIG_PATH))) {
        KOMUTECH_L_GL_YLXGLQ_cfg = JSON.parse(KOMUTECH_L_GL_YLXGLQ_Files.readString(KOMUTECH_L_GL_YLXGLQ_Paths.get(KOMUTECH_L_GL_YLXGLQ_CONFIG_PATH), KOMUTECH_L_GL_YLXGLQ_StandardCharsets.UTF_8));
    }
} catch(e) { print('[KOMUTECH_L_GL_YLXGLQ] 配置加载失败: ' + e); }
function KOMUTECH_L_GL_YLXGLQ_getSkillName(fullId) {
    return fullId && fullId.startsWith(KOMUTECH_L_GL_YLXGLQ_SCROLL_PREFIX) ? fullId.substring(KOMUTECH_L_GL_YLXGLQ_SCROLL_PREFIX.length) : fullId;
}
function KOMUTECH_L_GL_YLXGLQ_getMaxProf(skillName) {
    if (!KOMUTECH_L_GL_YLXGLQ_cfg || !skillName) return 0;
    const s = KOMUTECH_L_GL_YLXGLQ_cfg[skillName];
    return (s && s['熟练度上限']) ? s['熟练度上限'] : 0;
}
function KOMUTECH_L_GL_YLXGLQ_loadPlayerData(playerName) {
    const path = KOMUTECH_L_GL_YLXGLQ_Paths.get(KOMUTECH_L_GL_YLXGLQ_SCROLL_DIR, '[' + playerName + ']云篆匣.json');
    if (!KOMUTECH_L_GL_YLXGLQ_Files.exists(path)) return null;
    try {
        return JSON.parse(KOMUTECH_L_GL_YLXGLQ_Files.readString(path, KOMUTECH_L_GL_YLXGLQ_StandardCharsets.UTF_8));
    } catch(e) {
        return null;
    }
}
function KOMUTECH_L_GL_YLXGLQ_savePlayerData(playerName, data) {
    try {
        const dir = new java.io.File(KOMUTECH_L_GL_YLXGLQ_SCROLL_DIR);
        if (!dir.exists()) dir.mkdirs();
        KOMUTECH_L_GL_YLXGLQ_Files.writeString(KOMUTECH_L_GL_YLXGLQ_Paths.get(KOMUTECH_L_GL_YLXGLQ_SCROLL_DIR, '[' + playerName + ']云篆匣.json'), JSON.stringify(data, null, 2), KOMUTECH_L_GL_YLXGLQ_StandardCharsets.UTF_8);
        return true;
    } catch(e) {
        print('[KOMUTECH_L_GL_YLXGLQ] 保存失败: ' + e);
        return false;
    }
}
function KOMUTECH_L_GL_YLXGLQ_getScrollList(playerName) {
    const data = KOMUTECH_L_GL_YLXGLQ_loadPlayerData(playerName);
    if (!data || !data.卷轴数据) return [];
    return data.卷轴数据.filter(id => id != null);
}
function KOMUTECH_L_GL_YLXGLQ_getScrollProf(playerName, skillName) {
    const data = KOMUTECH_L_GL_YLXGLQ_loadPlayerData(playerName);
    if (!data || !data.熟练度记录) return 0;
    return data.熟练度记录[skillName] || 0;
}
function KOMUTECH_L_GL_YLXGLQ_setScrollProf(playerName, skillName, value) {
    const data = KOMUTECH_L_GL_YLXGLQ_loadPlayerData(playerName);
    if (!data) return false;
    if (!data.熟练度记录) data.熟练度记录 = {};
    data.熟练度记录[skillName] = value;
    return KOMUTECH_L_GL_YLXGLQ_savePlayerData(playerName, data);
}
function KOMUTECH_L_GL_YLXGLQ_makeDisplayItem(fullId, prof) {
    const sf = getSfItemById(fullId);
    if (!sf) return new KOMUTECH_L_GL_YLXGLQ_ItemStack(KOMUTECH_L_GL_YLXGLQ_Material.BARRIER);
    const item = sf.getItem().clone();
    const meta = item.getItemMeta();
    let lore = meta.getLore() || [];
    lore = lore.filter(line => !line.startsWith('§7熟练度：'));
    const skillName = KOMUTECH_L_GL_YLXGLQ_getSkillName(fullId);
    const max = KOMUTECH_L_GL_YLXGLQ_getMaxProf(skillName);
    lore.push('§7熟练度：§f' + prof + ' §7/ §f' + max);
    meta.setLore(lore);
    item.setItemMeta(meta);
    return item;
}
function KOMUTECH_L_GL_YLXGLQ_createItem(mat, name, lore) {
    const item = new KOMUTECH_L_GL_YLXGLQ_ItemStack(KOMUTECH_L_GL_YLXGLQ_Material.getMaterial(mat));
    const meta = item.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    item.setItemMeta(meta);
    return item;
}
function KOMUTECH_L_GL_YLXGLQ_applyBorder(inv) {
    const border = KOMUTECH_L_GL_YLXGLQ_createItem('WHITE_STAINED_GLASS_PANE', ' ', null);
    KOMUTECH_L_GL_YLXGLQ_BORDER_SLOTS.forEach(s => inv.setItem(s, border.clone()));
}
let KOMUTECH_L_GL_YLXGLQ_openPlayers = new java.util.HashMap();
let KOMUTECH_L_GL_YLXGLQ_clickListener = null;
let KOMUTECH_L_GL_YLXGLQ_dragListener = null;
let KOMUTECH_L_GL_YLXGLQ_closeListener = null;
let KOMUTECH_L_GL_YLXGLQ_awaiting = new java.util.HashMap();
function KOMUTECH_L_GL_YLXGLQ_unregisterListeners() {
    try { if (KOMUTECH_L_GL_YLXGLQ_clickListener) KOMUTECH_L_GL_YLXGLQ_ClickEvent.getHandlerList().unregister(KOMUTECH_L_GL_YLXGLQ_clickListener); } catch(e) {}
    try { if (KOMUTECH_L_GL_YLXGLQ_dragListener) KOMUTECH_L_GL_YLXGLQ_DragEvent.getHandlerList().unregister(KOMUTECH_L_GL_YLXGLQ_dragListener); } catch(e) {}
    try { if (KOMUTECH_L_GL_YLXGLQ_closeListener) KOMUTECH_L_GL_YLXGLQ_CloseEvent.getHandlerList().unregister(KOMUTECH_L_GL_YLXGLQ_closeListener); } catch(e) {}
    KOMUTECH_L_GL_YLXGLQ_clickListener = null;
    KOMUTECH_L_GL_YLXGLQ_dragListener = null;
    KOMUTECH_L_GL_YLXGLQ_closeListener = null;
}
function KOMUTECH_L_GL_YLXGLQ_registerListeners() {
    KOMUTECH_L_GL_YLXGLQ_unregisterListeners();
    const L = Java.extend(KOMUTECH_L_GL_YLXGLQ_Listener, {});
    KOMUTECH_L_GL_YLXGLQ_clickListener = new L();
    KOMUTECH_L_GL_YLXGLQ_dragListener = new L();
    KOMUTECH_L_GL_YLXGLQ_closeListener = new L();
    KOMUTECH_L_GL_YLXGLQ_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_GL_YLXGLQ_ClickEvent, KOMUTECH_L_GL_YLXGLQ_clickListener, KOMUTECH_L_GL_YLXGLQ_EventPriority.NORMAL, function(l, e) {
        const p = e.getWhoClicked();
        const state = KOMUTECH_L_GL_YLXGLQ_openPlayers.get(p);
        if (!state) return;
        const title = e.getView().getTitle();
        if (title !== KOMUTECH_L_GL_YLXGLQ_TITLE_LIST && !title.startsWith(KOMUTECH_L_GL_YLXGLQ_TITLE_DETAIL)) return;
        e.setCancelled(true);
        const slot = e.getSlot();
        const item = e.getCurrentItem();
        if (!item || item.getType() === KOMUTECH_L_GL_YLXGLQ_Material.AIR) return;
        if (title === KOMUTECH_L_GL_YLXGLQ_TITLE_LIST) {
            KOMUTECH_L_GL_YLXGLQ_handleListClick(p, slot, state);
        } else if (title.startsWith(KOMUTECH_L_GL_YLXGLQ_TITLE_DETAIL)) {
            const playerName = title.substring(KOMUTECH_L_GL_YLXGLQ_TITLE_DETAIL.length);
            KOMUTECH_L_GL_YLXGLQ_handleDetailClick(p, slot, playerName, state, e);
        }
    }, KOMUTECH_L_GL_YLXGLQ_plugin);
    KOMUTECH_L_GL_YLXGLQ_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_GL_YLXGLQ_DragEvent, KOMUTECH_L_GL_YLXGLQ_dragListener, KOMUTECH_L_GL_YLXGLQ_EventPriority.NORMAL, function(l, e) {
        if (KOMUTECH_L_GL_YLXGLQ_openPlayers.containsKey(e.getWhoClicked())) {
            e.setCancelled(true);
        }
    }, KOMUTECH_L_GL_YLXGLQ_plugin);
    KOMUTECH_L_GL_YLXGLQ_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_L_GL_YLXGLQ_CloseEvent, KOMUTECH_L_GL_YLXGLQ_closeListener, KOMUTECH_L_GL_YLXGLQ_EventPriority.NORMAL, function(l, e) {
        const p = e.getPlayer();
        if (KOMUTECH_L_GL_YLXGLQ_openPlayers.containsKey(p)) {
            KOMUTECH_L_GL_YLXGLQ_openPlayers.remove(p);
            if (KOMUTECH_L_GL_YLXGLQ_openPlayers.isEmpty()) {
                KOMUTECH_L_GL_YLXGLQ_unregisterListeners();
            }
        }
    }, KOMUTECH_L_GL_YLXGLQ_plugin);
}
function KOMUTECH_L_GL_YLXGLQ_getPlayerFiles() {
    const dir = new java.io.File(KOMUTECH_L_GL_YLXGLQ_SCROLL_DIR);
    if (!dir.exists() || !dir.isDirectory()) return [];
    const files = dir.listFiles();
    if (!files) return [];
    const names = [];
    for (let f of files) {
        const fname = f.getName();
        if (fname.startsWith('[') && fname.endsWith(']云篆匣.json')) {
            names.push(fname.substring(1, fname.length - ']云篆匣.json'.length));
        }
    }
    return names.sort();
}
function KOMUTECH_L_GL_YLXGLQ_buildListMenu(page) {
    const players = KOMUTECH_L_GL_YLXGLQ_getPlayerFiles();
    const totalPages = Math.max(1, Math.ceil(players.length / KOMUTECH_L_GL_YLXGLQ_SLOTS_PER_PAGE));
    const paged = players.slice((page - 1) * KOMUTECH_L_GL_YLXGLQ_SLOTS_PER_PAGE, page * KOMUTECH_L_GL_YLXGLQ_SLOTS_PER_PAGE);
    const inv = KOMUTECH_L_GL_YLXGLQ_Bukkit.createInventory(null, KOMUTECH_L_GL_YLXGLQ_SIZE, KOMUTECH_L_GL_YLXGLQ_TITLE_LIST);
    KOMUTECH_L_GL_YLXGLQ_applyBorder(inv);
    inv.setItem(4, KOMUTECH_L_GL_YLXGLQ_createItem('PAINTING', '§e云篆匣管理', ['§7总玩家数: ' + players.length]));
    inv.setItem(49, KOMUTECH_L_GL_YLXGLQ_createItem('BARRIER', '§c关闭', []));
    inv.setItem(48, page > 1 ? KOMUTECH_L_GL_YLXGLQ_createItem('ARROW', '§a上一页', []) : KOMUTECH_L_GL_YLXGLQ_createItem('WHITE_STAINED_GLASS_PANE', ' ', []));
    inv.setItem(50, page < totalPages ? KOMUTECH_L_GL_YLXGLQ_createItem('ARROW', '§a下一页', []) : KOMUTECH_L_GL_YLXGLQ_createItem('WHITE_STAINED_GLASS_PANE', ' ', []));
    const slotMap = new java.util.HashMap();
    for (let i = 0; i < paged.length; i++) {
        const pn = paged[i];
        const slot = KOMUTECH_L_GL_YLXGLQ_AVAILABLE_SLOTS[i];
        inv.setItem(slot, KOMUTECH_L_GL_YLXGLQ_createItem('PLAYER_HEAD', '§e' + pn, ['§7左键查看卷轴']));
        slotMap.put(slot, pn);
    }
    return { inv, page, totalPages, slotMap };
}
function KOMUTECH_L_GL_YLXGLQ_buildDetailMenu(playerName) {
    const data = KOMUTECH_L_GL_YLXGLQ_loadPlayerData(playerName);
    const scrolls = KOMUTECH_L_GL_YLXGLQ_getScrollList(playerName);
    const inv = KOMUTECH_L_GL_YLXGLQ_Bukkit.createInventory(null, KOMUTECH_L_GL_YLXGLQ_SIZE, KOMUTECH_L_GL_YLXGLQ_TITLE_DETAIL + playerName);
    KOMUTECH_L_GL_YLXGLQ_applyBorder(inv);
    inv.setItem(4, KOMUTECH_L_GL_YLXGLQ_createItem('PLAYER_HEAD', '§6' + playerName, []));
    inv.setItem(0, KOMUTECH_L_GL_YLXGLQ_createItem('ARROW', '§a返回', ['§7返回玩家列表']));
    inv.setItem(49, KOMUTECH_L_GL_YLXGLQ_createItem('BARRIER', '§c关闭', []));
    inv.setItem(48, KOMUTECH_L_GL_YLXGLQ_createItem('WHITE_STAINED_GLASS_PANE', ' ', []));
    inv.setItem(50, KOMUTECH_L_GL_YLXGLQ_createItem('WHITE_STAINED_GLASS_PANE', ' ', []));
    if (scrolls.length === 0) {
        inv.setItem(22, KOMUTECH_L_GL_YLXGLQ_createItem('PAPER', '§c该玩家暂未存入卷轴', []));
        return { inv, playerName, scrollMap: null };
    }
    const scrollMap = new java.util.HashMap();
    for (let i = 0; i < Math.min(scrolls.length, KOMUTECH_L_GL_YLXGLQ_AVAILABLE_SLOTS.length); i++) {
        const fullId = scrolls[i];
        const skillName = KOMUTECH_L_GL_YLXGLQ_getSkillName(fullId);
        const prof = KOMUTECH_L_GL_YLXGLQ_getScrollProf(playerName, skillName);
        const display = KOMUTECH_L_GL_YLXGLQ_makeDisplayItem(fullId, prof);
        const slot = KOMUTECH_L_GL_YLXGLQ_AVAILABLE_SLOTS[i];
        inv.setItem(slot, display);
        scrollMap.put(slot, fullId);
    }
    return { inv, playerName, scrollMap };
}
function KOMUTECH_L_GL_YLXGLQ_handleListClick(p, slot, state) {
    if (slot === 49) {
        p.closeInventory();
    } else if (slot === 48 && state.page > 1) {
        KOMUTECH_L_GL_YLXGLQ_openList(p, state.page - 1);
    } else if (slot === 50 && state.page < state.totalPages) {
        KOMUTECH_L_GL_YLXGLQ_openList(p, state.page + 1);
    } else if (state.slotMap && state.slotMap.containsKey(slot)) {
        const pn = state.slotMap.get(slot);
        KOMUTECH_L_GL_YLXGLQ_openDetail(p, pn);
    }
}
function KOMUTECH_L_GL_YLXGLQ_handleDetailClick(p, slot, playerName, state, event) {
    if (slot === 0) {
        KOMUTECH_L_GL_YLXGLQ_openList(p, 1);
    } else if (slot === 49) {
        p.closeInventory();
    } else if (state.scrollMap && state.scrollMap.containsKey(slot)) {
        const fullId = state.scrollMap.get(slot);
        const skillName = KOMUTECH_L_GL_YLXGLQ_getSkillName(fullId);
        if (event.isRightClick()) {
            if (KOMUTECH_L_GL_YLXGLQ_awaiting.containsKey(p)) return;
            KOMUTECH_L_GL_YLXGLQ_awaiting.put(p, true);
            p.sendMessage('§a请输入 §e' + skillName + ' §a的新熟练度值（数字）:');
            getChatInput(p, new (Java.extend(KOMUTECH_L_GL_YLXGLQ_Consumer, {
                accept: function(input) {
                    KOMUTECH_L_GL_YLXGLQ_awaiting.remove(p);
                    if (input.toLowerCase() === 'cancel') {
                        p.sendMessage('§c已取消');
                        return;
                    }
                    const val = parseInt(input);
                    if (isNaN(val) || val < 0) {
                        p.sendMessage('§c请输入非负整数');
                        return;
                    }
                    const max = KOMUTECH_L_GL_YLXGLQ_getMaxProf(skillName);
                    const finalVal = Math.min(val, max);
                    if (KOMUTECH_L_GL_YLXGLQ_setScrollProf(playerName, skillName, finalVal)) {
                        p.sendMessage('§a熟练度已更新为 ' + finalVal);
                        KOMUTECH_L_GL_YLXGLQ_openDetail(p, playerName);
                    } else {
                        p.sendMessage('§c保存失败');
                    }
                }
            })));
        }
    }
}
function KOMUTECH_L_GL_YLXGLQ_openList(p, page) {
    const menu = KOMUTECH_L_GL_YLXGLQ_buildListMenu(page);
    p.openInventory(menu.inv);
    KOMUTECH_L_GL_YLXGLQ_openPlayers.put(p, { page: menu.page, totalPages: menu.totalPages, slotMap: menu.slotMap });
    KOMUTECH_L_GL_YLXGLQ_registerListeners();
}
function KOMUTECH_L_GL_YLXGLQ_openDetail(p, playerName) {
    const menu = KOMUTECH_L_GL_YLXGLQ_buildDetailMenu(playerName);
    p.openInventory(menu.inv);
    KOMUTECH_L_GL_YLXGLQ_openPlayers.put(p, { playerName: playerName, scrollMap: menu.scrollMap });
    KOMUTECH_L_GL_YLXGLQ_registerListeners();
}
function KOMUTECH_L_GL_YLXGLQ_onUse(e) {
    if (e.getHand() !== Java.type('org.bukkit.inventory.EquipmentSlot').HAND) return;
    const p = e.getPlayer();
    if (!p.isOp() && p.getName() !== 'Komu_A') {
        p.sendMessage('§c你没有权限使用此道具');
        return;
    }
    KOMUTECH_L_GL_YLXGLQ_openList(p, 1);
}
globalThis.onUse = KOMUTECH_L_GL_YLXGLQ_onUse;