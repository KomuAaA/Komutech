const KOMUTECH_L_PFYS_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_L_PFYS_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_PFYS_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_PFYS_InvClick = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_L_PFYS_InvClose = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_PFYS_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_PFYS_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_PFYS_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_PFYS_SlimefunGuide = Java.type('io.github.thebusybiscuit.slimefun4.core.guide.SlimefunGuide');
const KOMUTECH_L_PFYS_PlayerProfile = Java.type('io.github.thebusybiscuit.slimefun4.api.player.PlayerProfile');
const KOMUTECH_L_PFYS_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_L_PFYS_NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const KOMUTECH_L_PFYS_PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');
const KOMUTECH_L_PFYS_Consumer = Java.type('java.util.function.Consumer');
const KOMUTECH_L_PFYS_TITLE_MAIN = '§6口木科技便捷配方';
const KOMUTECH_L_PFYS_TITLE_SUB = '§6便捷配方 - ';
const KOMUTECH_L_PFYS_ITEMS_PER_PAGE = 28;
const KOMUTECH_L_PFYS_CATEGORIES = [
    { id: 'jcwp', name: '§a基础物品', icon: 'CRAFTING_TABLE', machines: ['KOMUTECH_L_JQ_下品一芥乾坤'], manual: [
        { id: 'KOMUTECH_L_LZZZ_YGZZ', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_YGZZ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_YGZZ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZZZ_TSSM', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_TSSM', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_TSSM', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZZZ_SSSM', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_SSSM', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_SSSM', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZZZ_MHZZ', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_MHZZ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_MHZZ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZZZ_MZZ', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_MZZ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZZZ_MZZ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_JCWP_TM', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_JCWP_TM', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_JCWP_TM', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZ_YG', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZ_YG', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZ_SM', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZ_SM', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZ_MH', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZ_MH', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_LZ_M', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_LZ_M', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_DJ_XPLJ', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_XPLJ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_XPLJ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_DJ_ZPLJ', machine: 'KOMUTECH_L_JQ_下品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_ZPLJ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_ZPLJ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_DJ_SPLJ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_SPLJ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' },
        { id: 'KOMUTECH_L_DJ_JPLJ', machine: 'KOMUTECH_L_JQ_中品一芥乾坤' },{ id: 'KOMUTECH_L_DJ_JPLJ', machine: 'KOMUTECH_L_JQ_上品一芥乾坤' }
    ]},
    { id: 'fz', name: '§b法则', icon: 'ENCHANTED_BOOK', machines: ['KOMUTECH_L_PF_法则合成演示'] },
    { id: 'lz', name: '§d灵杖', icon: 'BLAZE_ROD', machines: ['KOMUTECH_L_JQ_LNLQF'] },
    { id: 'jz', name: '§5卷轴', icon: 'BOOK', machines: ['KOMUTECH_L_JQ_JZZXT'] },
    { id: 'fl', name: '§e符箓', icon: 'PAPER', machines: ['KOMUTECH_L_JQ_FLHZT'] },
    { id: 'zj', name: '§5終極', icon: 'NETHER_STAR', machines: ['KOMUTECH_L_PF_终极合成演示'] }
];
const KOMUTECH_L_PFYS_BORDER_SLOTS = [0,1,2,3,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52];
const KOMUTECH_L_PFYS_OUT_SLOTS = [10,11,12,13,14,15,16,19,20,21,22,23,24,25,28,29,30,31,32,33,34,37,38,39,40,41,42,43];
function KOMUTECH_L_PFYS_strip(s) { return s.replace(/§[0-9a-fk-or]/gi, '').replace(/&[0-9a-fk-or]/gi, ''); }
function KOMUTECH_L_PFYS_extractChinese(s) { if (!s) return ''; const m = s.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g); return m ? m.join('') : ''; }
function KOMUTECH_L_PFYS_item(mat, name, lore) { const i = new KOMUTECH_L_PFYS_ItemStack(KOMUTECH_L_PFYS_Material.getMaterial(mat)); const m = i.getItemMeta(); m.setDisplayName(name); if (lore) m.setLore(Array.isArray(lore) ? lore : [lore]); i.setItemMeta(m); return i; }
function KOMUTECH_L_PFYS_border(inv) { const b = KOMUTECH_L_PFYS_item('PINK_STAINED_GLASS_PANE', '§d✨', []); KOMUTECH_L_PFYS_BORDER_SLOTS.forEach(s => inv.setItem(s, b.clone())); }
function KOMUTECH_L_PFYS_parseOutputs(mid) {
    const outs = new java.util.HashSet();
    try {
        const mach = KOMUTECH_L_PFYS_SlimefunItem.getById(mid);
        if (!mach) return [];
        if (typeof mach.getMachineRecipes === 'function') {
            const recipes = mach.getMachineRecipes();
            if (recipes && !recipes.isEmpty()) { const it = recipes.iterator(); while (it.hasNext()) { const out = it.next().getOutput(); if (out) for (let j = 0; j < out.length; j++) { const sf = KOMUTECH_L_PFYS_SlimefunItem.getByItem(out[j]); if (sf) outs.add(sf.getId()); } } }
        }
        if (outs.isEmpty() && typeof mach.getRecipes === 'function') {
            const recipes = mach.getRecipes();
            if (recipes && !recipes.isEmpty()) { for (let i = 0; i < recipes.size(); i++) { const out = recipes.get(i).getOutput(); if (out) { const sf = KOMUTECH_L_PFYS_SlimefunItem.getByItem(out); if (sf) outs.add(sf.getId()); } } }
        }
    } catch (e) {}
    const arr = []; const it = outs.iterator(); while (it.hasNext()) arr.push(it.next()); return arr;
}
const KOMUTECH_L_PFYS_cache = {};
KOMUTECH_L_PFYS_CATEGORIES.forEach(cat => {
    const entries = [];
    if (cat.machines) { cat.machines.forEach(mid => { const outIds = KOMUTECH_L_PFYS_parseOutputs(mid); outIds.forEach(o => entries.push({ out: o, machine: mid })); }); }
    if (cat.manual) { cat.manual.forEach(m => entries.push({ out: m.id, machine: m.machine })); }
    KOMUTECH_L_PFYS_cache[cat.id] = entries;
});
function KOMUTECH_L_PFYS_mainMenu() {
    const inv = KOMUTECH_L_PFYS_Bukkit.createInventory(null, 54, KOMUTECH_L_PFYS_TITLE_MAIN);
    KOMUTECH_L_PFYS_border(inv);
    inv.setItem(4, KOMUTECH_L_PFYS_item('PAINTING', '§6口木科技便捷配方', ['§7点击分类查看产物', '§7或使用右下角搜索']));
    KOMUTECH_L_PFYS_CATEGORIES.forEach((c, i) => inv.setItem(10 + i, KOMUTECH_L_PFYS_item(c.icon, c.name, ['§7点击查看产物'])));
    inv.setItem(53, KOMUTECH_L_PFYS_item('COMPASS', '§e🔍 搜索', ['§7点击后在聊天栏输入物品名']));
    inv.setItem(49, KOMUTECH_L_PFYS_item('BARRIER', '§c关闭', []));
    return inv;
}
function KOMUTECH_L_PFYS_catMenu(cid, page) {
    const cat = KOMUTECH_L_PFYS_CATEGORIES.find(c => c.id === cid);
    if (!cat) return null;
    const allEntries = KOMUTECH_L_PFYS_cache[cid];
    if (!allEntries || allEntries.length === 0) return null;
    const totalPages = Math.ceil(allEntries.length / KOMUTECH_L_PFYS_ITEMS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * KOMUTECH_L_PFYS_ITEMS_PER_PAGE;
    const pageEntries = allEntries.slice(start, start + KOMUTECH_L_PFYS_ITEMS_PER_PAGE);
    const inv = KOMUTECH_L_PFYS_Bukkit.createInventory(null, 54, KOMUTECH_L_PFYS_TITLE_SUB + cat.name);
    KOMUTECH_L_PFYS_border(inv);
    inv.setItem(4, KOMUTECH_L_PFYS_item('PAPER', '§6' + cat.name + ' - 产物列表', ['§7第 ' + page + '/' + totalPages + ' 页']));
    for (let i = 0; i < pageEntries.length; i++) {
        const e = pageEntries[i];
        const sf = KOMUTECH_L_PFYS_SlimefunItem.getById(e.out);
        if (!sf) continue;
        const original = sf.getItem();
        const display = original.clone();
        const meta = display.getItemMeta();
        const machName = (() => { const m = KOMUTECH_L_PFYS_SlimefunItem.getById(e.machine); return m ? (m.getItem().getItemMeta().getDisplayName() || e.machine) : e.machine; })();
        const extraLore = '§7产出机器：' + machName;
        let oldLore = meta.getLore() || [];
        if (!Array.isArray(oldLore)) oldLore = [oldLore];
        oldLore.push(extraLore);
        meta.setLore(oldLore);
        display.setItemMeta(meta);
        const dm = display.getItemMeta();
        dm.getPersistentDataContainer().set(new KOMUTECH_L_PFYS_NamespacedKey('komutech_l_bxpf', 'machine'), KOMUTECH_L_PFYS_PersistentDataType.STRING, e.machine);
        display.setItemMeta(dm);
        inv.setItem(KOMUTECH_L_PFYS_OUT_SLOTS[i], display);
    }
    if (page > 1) inv.setItem(48, KOMUTECH_L_PFYS_item('ARROW', '§a上一页', ['§7第 ' + (page - 1) + ' 页']));
    else inv.setItem(48, KOMUTECH_L_PFYS_item('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(49, KOMUTECH_L_PFYS_item('ARROW', '§a返回', ['§7返回主菜单']));
    if (page < totalPages) inv.setItem(50, KOMUTECH_L_PFYS_item('ARROW', '§a下一页', ['§7第 ' + (page + 1) + ' 页']));
    else inv.setItem(50, KOMUTECH_L_PFYS_item('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(53, KOMUTECH_L_PFYS_item('COMPASS', '§e🔍 搜索', ['§7点击后在聊天栏输入物品名']));
    return inv;
}
function KOMUTECH_L_PFYS_openGuide(p, mid) { const m = KOMUTECH_L_PFYS_SlimefunItem.getById(mid); if (!m) return; const prof = KOMUTECH_L_PFYS_PlayerProfile.find(p); if (!prof.isPresent()) return; KOMUTECH_L_PFYS_SlimefunGuide.displayItem(prof.get(), m, true); }
function KOMUTECH_L_PFYS_search(p) {
    p.sendMessage('§e请在聊天栏输入要搜索的物品名称（输入 cancel 取消）:');
    getChatInput(p, new (Java.extend(KOMUTECH_L_PFYS_Consumer, { accept: function(inp) {
        if (!inp || inp.toLowerCase() === 'cancel') { p.sendMessage('§c已取消搜索。'); return; }
        const kw = KOMUTECH_L_PFYS_extractChinese(inp);
        if (!kw) { p.sendMessage('§c请输入有效的中文关键词。'); return; }
        for (const cat of KOMUTECH_L_PFYS_CATEGORIES) {
            const entries = KOMUTECH_L_PFYS_cache[cat.id];
            if (!entries) continue;
            for (const e of entries) {
                const sf = KOMUTECH_L_PFYS_SlimefunItem.getById(e.out);
                if (!sf) continue;
                let rawName = e.out;
                try { const meta = sf.getItem().getItemMeta(); if (meta && meta.hasDisplayName()) rawName = meta.getDisplayName(); } catch (err) {}
                const chinese = KOMUTECH_L_PFYS_extractChinese(rawName);
                if (chinese.includes(kw) || e.out.toLowerCase().includes(kw.toLowerCase())) {
                    p.sendMessage('§a找到匹配项：' + rawName + '，位于分类：' + cat.name);
                    KOMUTECH_L_PFYS_openCategory(p, cat.id, 1);
                    return;
                }
            }
        }
        p.sendMessage('§c未找到包含 "' + kw + '" 的物品。');
    }})));
}
let KOMUTECH_L_PFYS_openPlayers = new java.util.HashMap();
let KOMUTECH_L_PFYS_registered = false;
let KOMUTECH_L_PFYS_listener = null;
function KOMUTECH_L_PFYS_register() {
    if (KOMUTECH_L_PFYS_registered) return;
    const L = Java.extend(KOMUTECH_L_PFYS_Listener, {});
    KOMUTECH_L_PFYS_listener = new L();
    KOMUTECH_L_PFYS_Bukkit.getPluginManager().registerEvent(KOMUTECH_L_PFYS_InvClick, KOMUTECH_L_PFYS_listener, KOMUTECH_L_PFYS_EventPriority.NORMAL, (l, e) => {
        const p = e.getWhoClicked();
        if (!KOMUTECH_L_PFYS_openPlayers.containsKey(p)) return;
        const t = e.getInventory().getTitle();
        if (t !== KOMUTECH_L_PFYS_TITLE_MAIN && !t.startsWith(KOMUTECH_L_PFYS_TITLE_SUB)) return;
        e.setCancelled(true);
        const slot = e.getSlot();
        const it = e.getCurrentItem();
        if (!it || it.getType() === KOMUTECH_L_PFYS_Material.AIR) return;
        if (t === KOMUTECH_L_PFYS_TITLE_MAIN) {
            if (slot === 53) { KOMUTECH_L_PFYS_search(p); return; }
            if (slot === 49) { p.closeInventory(); return; }
            const cat = KOMUTECH_L_PFYS_CATEGORIES.find((c, i) => slot === 10 + i && it.getItemMeta().getDisplayName() === c.name);
            if (cat) KOMUTECH_L_PFYS_openCategory(p, cat.id, 1);
        } else {
            const state = KOMUTECH_L_PFYS_openPlayers.get(p);
            if (slot === 53) { KOMUTECH_L_PFYS_search(p); return; }
            if (slot === 49) { KOMUTECH_L_PFYS_openMain(p); return; }
            if (slot === 48) { if (state && state.page > 1) KOMUTECH_L_PFYS_openCategory(p, state.catId, state.page - 1); return; }
            if (slot === 50) { const total = state ? Math.ceil(KOMUTECH_L_PFYS_cache[state.catId].length / KOMUTECH_L_PFYS_ITEMS_PER_PAGE) : 1; if (state && state.page < total) KOMUTECH_L_PFYS_openCategory(p, state.catId, state.page + 1); return; }
            const pdc = it.getItemMeta().getPersistentDataContainer();
            const mid = pdc.get(new KOMUTECH_L_PFYS_NamespacedKey('komutech_l_bxpf', 'machine'), KOMUTECH_L_PFYS_PersistentDataType.STRING);
            if (mid) KOMUTECH_L_PFYS_openGuide(p, mid);
        }
    }, KOMUTECH_L_PFYS_plugin);
    KOMUTECH_L_PFYS_Bukkit.getPluginManager().registerEvent(KOMUTECH_L_PFYS_InvClose, KOMUTECH_L_PFYS_listener, KOMUTECH_L_PFYS_EventPriority.NORMAL, (l, e) => {
        KOMUTECH_L_PFYS_openPlayers.remove(e.getPlayer());
        if (KOMUTECH_L_PFYS_openPlayers.isEmpty()) { try { KOMUTECH_L_PFYS_InvClick.getHandlerList().unregister(KOMUTECH_L_PFYS_listener); KOMUTECH_L_PFYS_InvClose.getHandlerList().unregister(KOMUTECH_L_PFYS_listener); } catch (ex) {} KOMUTECH_L_PFYS_registered = false; KOMUTECH_L_PFYS_listener = null; }
    }, KOMUTECH_L_PFYS_plugin);
    KOMUTECH_L_PFYS_registered = true;
}
function KOMUTECH_L_PFYS_open(p, inv, state) { p.openInventory(inv); KOMUTECH_L_PFYS_openPlayers.put(p, state); if (!KOMUTECH_L_PFYS_registered) KOMUTECH_L_PFYS_register(); }
function KOMUTECH_L_PFYS_openMain(p) { KOMUTECH_L_PFYS_open(p, KOMUTECH_L_PFYS_mainMenu(), { catId: null, page: 0 }); }
function KOMUTECH_L_PFYS_openCategory(p, cid, page) { const m = KOMUTECH_L_PFYS_catMenu(cid, page); if (m) KOMUTECH_L_PFYS_open(p, m, { catId: cid, page: page }); }
function onButtonGroupClick(player) { KOMUTECH_L_PFYS_openMain(player); return true; }
function onUse(e) { KOMUTECH_L_PFYS_openMain(e.getPlayer()); return false; }