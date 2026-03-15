const CATEGORIES = [
    { id: 'jichucailiao', name: '§6✦ 基础材料', lore: '§e基础材料', icon: 'EMERALD', slot: 10 },
    { id: 'lingzhizhongzi', name: '§2✦ 灵植种子', lore: '§e各类灵植种子', icon: 'WHEAT_SEEDS', slot: 11 },
    { id: 'leisi', name: '§8✦ 儡肆', lore: '§e傀儡交易', icon: 'SKULL_BANNER_PATTERN', slot: 12 }
];
const INFO_ITEM = { material: 'PAINTING', name: '§6§l琼华阁', lore: ['§f点击上方分类查看可兑换物品', '§f每个物品标有兑换所需灵石'] };
const MAIN_TITLE = '§6§l✨ 琼华阁 ✨';
const SUB_PRE = '§6§l✨ ';
const SUB_SUF = ' ✨';
const BORDER_SLOTS = [0,1,2,3,4,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];

const ITEMS = {
    jichucailiao: [
        { id: 'KOMUTECH_L_JCWP_SC', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] },
        { id: 'KOMUTECH_L_GJ_KCB', lines: ['§f---§a§l点击购买§f---', '§a•需：8 下品灵石', '§7-8×KOMUTECH_L_DJ_XPLS'] }
    ],
    lingzhizhongzi: [
        { id: 'KOMUTECH_L_LZZZ_TSSM', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] },
        { id: 'KOMUTECH_L_LZZZ_SSSM', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] },
        { id: 'KOMUTECH_L_LZZZ_YGZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] },
        { id: 'KOMUTECH_L_LZZZ_MHZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] },
        { id: 'KOMUTECH_L_LZZZ_MZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石', '§7-16×KOMUTECH_L_DJ_XPLS'] }
    ],
    leisi: [
        { id: 'KOMUTECH_L_JCWP_儡肆通行柬', lines: ['§f---§a§l点击购买§f---', '§a•需：64 上品灵石 + 16 功德券', '§7-64×KOMUTECH_L_DJ_SPLS', '§7-16×KOMUTECH_L_DJ_功德券'] },
        { id: 'KOMUTECH_L_SW_KLN', lines: ['§f---§a§l点击购买§f---', '§a•需：64 上品灵石 + 4 昙息玉', '§7-64×KOMUTECH_L_DJ_SPLS', '§7-4×KOMUTECH_L_KW_TXY'] },
        { id: 'KOMUTECH_L_SW_XGO', lines: ['§f---§a§l点击购买§f---', '§a•需：64 上品灵石 + 4 枢机玉', '§7-64×KOMUTECH_L_DJ_SPLS', '§7-4×KOMUTECH_L_KW_SJY'] }
    ]
};

const Bukkit = Java.type('org.bukkit.Bukkit');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Listener = Java.type('org.bukkit.event.Listener');

function item(mat, name, lore) {
    const it = new ItemStack(Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function borderItem() { return item('ORANGE_STAINED_GLASS_PANE', '§6✨'); }
function applyBorder(inv) { const b = borderItem(); BORDER_SLOTS.forEach(s => inv.setItem(s, b.clone())); }

function parsePrices(lore) {
    const prices = [];
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line.startsWith('§7-') && line.includes('×')) {
            const p = line.split('×');
            if (p.length === 2) {
                const amt = parseInt(p[0].substring(3));
                const id = p[1].trim();
                if (!isNaN(amt) && amt > 0 && id) prices.push({ id, amount: amt });
            }
        }
    }
    return prices;
}

function hasEnough(player, priceList) {
    const inventory = player.getInventory();
    for (let price of priceList) {
        let total = 0;
        for (let i = 0; i < inventory.getSize(); i++) {
            const stack = inventory.getItem(i);
            if (!stack || stack.getType() === Material.AIR) continue;
            const sf = SlimefunItem.getByItem(stack);
            if (!sf || sf.getId() !== price.id) continue;
            total += stack.getAmount();
        }
        if (total < price.amount) return false;
    }
    return true;
}

function removeItems(player, priceList) {
    for (let price of priceList) {
        let remain = price.amount;
        const inv = player.getInventory();
        for (let i = 0; i < inv.getSize() && remain > 0; i++) {
            const stack = inv.getItem(i);
            if (!stack || stack.getType() === Material.AIR) continue;
            const sf = SlimefunItem.getByItem(stack);
            if (!sf || sf.getId() !== price.id) continue;
            const amt = stack.getAmount();
            if (amt <= remain) {
                inv.setItem(i, null);
                remain -= amt;
            } else {
                stack.setAmount(amt - remain);
                remain = 0;
            }
        }
    }
}

function buildMain() {
    const inv = Bukkit.createInventory(null, 54, MAIN_TITLE);
    applyBorder(inv);
    CATEGORIES.forEach(c => inv.setItem(c.slot, item(c.icon, c.name, [c.lore, '', '§a点击查看'])));
    inv.setItem(4, item(INFO_ITEM.material, INFO_ITEM.name, INFO_ITEM.lore));
    inv.setItem(49, item('BARRIER', '§c关闭', '§7关闭菜单'));
    return inv;
}

function catMenu(cid) {
    const cat = CATEGORIES.find(c => c.id === cid);
    if (!cat) return null;
    const list = ITEMS[cid];
    if (!list || !list.length) return null;
    const inv = Bukkit.createInventory(null, 54, SUB_PRE + cat.name + SUB_SUF);
    applyBorder(inv);
    inv.setItem(4, item('PAPER', '§6' + cat.name + '说明', ['§7点击物品购买', '§e共' + list.length + '种']));
    let slot = 10;
    list.forEach(e => {
        if (slot > 43) return;
        const sf = SlimefunItem.getById(e.id);
        if (sf) {
            const it = sf.getItem().clone();
            const meta = it.getItemMeta();
            let lore = meta.getLore() || [];
            if (!Array.isArray(lore)) lore = [lore];
            e.lines.forEach(l => lore.push(l));
            meta.setLore(lore);
            it.setItemMeta(meta);
            inv.setItem(slot, it);
        } else inv.setItem(slot, item('BARRIER', '§c无效物品', ['§7ID: ' + e.id]));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
    });
    inv.setItem(49, item('ARROW', '§a返回', '§7返回主菜单'));
    return inv;
}

const openPlayers = new java.util.HashSet();
let registered = false;

function ensureListener() {
    if (registered) return;
    // 如果已有旧监听器，先取消
    if (plugin.komutech_gj_qhgui) {
        ClickEvent.getHandlerList().unregister(plugin.komutech_gj_qhgui);
        CloseEvent.getHandlerList().unregister(plugin.komutech_gj_qhgui);
        plugin.komutech_gj_qhgui = null;
    }
    const L = Java.extend(Listener, {});
    const listener = new L();
    Bukkit.getPluginManager().registerEvent(ClickEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!openPlayers.contains(p)) return;
            const t = e.getInventory().getTitle();
            if (t !== MAIN_TITLE && !t.startsWith(SUB_PRE)) return;
            e.setCancelled(true);
            const inv = e.getInventory();
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === Material.AIR) return;

            if (t === MAIN_TITLE) {
                const cat = CATEGORIES.find(c => c.slot === slot && it.getItemMeta().getDisplayName() === c.name);
                if (cat) { const sub = catMenu(cat.id); if (sub) openMenu(p, sub); return; }
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§c关闭') { p.closeInventory(); return; }
            } else {
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§a返回') { openMain(p); return; }
                const sf = SlimefunItem.getByItem(it);
                if (!sf) return;
                const prices = parsePrices(it.getItemMeta().getLore());
                if (!prices.length) { p.sendMessage('§c价格信息错误'); return; }
                if (!hasEnough(p, prices)) { p.sendMessage('§c灵石不足，无法购买'); return; }
                removeItems(p, prices);
                const target = SlimefunItem.getById(sf.getId());
                if (target) p.getInventory().addItem(target.getItem().clone());
                else p.sendMessage('§c物品获取失败');
                p.sendMessage('§a购买成功！');
            }
        } catch (err) {}
    }, plugin);
    Bukkit.getPluginManager().registerEvent(CloseEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            openPlayers.remove(p);
            if (openPlayers.isEmpty()) {
                ClickEvent.getHandlerList().unregister(listener);
                CloseEvent.getHandlerList().unregister(listener);
                plugin.komutech_gj_qhgui = null;
                registered = false;
            }
        } catch (err) {}
    }, plugin);
    plugin.komutech_gj_qhgui = listener;
    registered = true;
}

function openMenu(p, inv) { p.openInventory(inv); openPlayers.add(p); ensureListener(); }
function openMain(p) { openMenu(p, buildMain()); }

function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { openMain(player); return true; } catch (err) { player.sendMessage('§c无法打开商店菜单'); return false; }
}
function onUse(e) { const p = e.getPlayer(); try { openMain(p); } catch (err) { p.sendMessage('§c无法打开商店菜单'); } return false; }