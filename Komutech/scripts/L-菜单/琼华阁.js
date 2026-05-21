const KOMUTECH_QHG_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_QHG_Material = Java.type('org.bukkit.Material');
const KOMUTECH_QHG_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_QHG_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_QHG_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_QHG_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_QHG_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_QHG_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_QHG_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_QHG_Consumer = Java.type('java.util.function.Consumer');
const KOMUTECH_QHG_CATEGORIES = [
    { id: 'jichucailiao', name: '§6✦ 基础材料', lore: '§e基础材料', icon: 'EMERALD', slot: 10 },
    { id: 'lingzhizhongzi', name: '§2✦ 灵植种子', lore: '§e各类灵植种子', icon: 'WHEAT_SEEDS', slot: 11 },
    { id: 'leisi', name: '§8✦ 儡肆', lore: '§e傀儡交易', icon: 'SKULL_BANNER_PATTERN', slot: 12 }
];
const KOMUTECH_QHG_INFO_ITEM = { material: 'PAINTING', name: '§6§l琼华阁', lore: ['§f点击上方分类查看可兑换物品', '§f每个物品标有兑换所需灵石'] };
const KOMUTECH_QHG_MAIN_TITLE = '§6§l✨ 琼华阁 ✨';
const KOMUTECH_QHG_SUB_PRE = '§6§l✨ ';
const KOMUTECH_QHG_SUB_SUF = ' ✨';
const KOMUTECH_QHG_BORDER_SLOTS = [0,1,2,3,4,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];
const KOMUTECH_QHG_ITEMS = {
    jichucailiao: [
        { id: 'KOMUTECH_L_JCWP_琼华阁通行柬1', lines: ['§f---§a§l点击购买§f---', '§a•需：64 中品灵石 + 4 功德券'], price: [{ id: 'KOMUTECH_L_DJ_ZPLS', amount: 64 }, { id: 'KOMUTECH_L_DJ_功德券', amount: 4 }] },
        { id: 'KOMUTECH_L_JCWP_SC', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] },
        { id: 'KOMUTECH_L_JCWP_SYM', lines: ['§f---§a§l点击购买§f---', '§a•需：4 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 4 }] },
        { id: 'KOMUTECH_L_GJ_KCB', lines: ['§f---§a§l点击购买§f---', '§a•需：8 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 8 }] }
    ],
    lingzhizhongzi: [
        { id: 'KOMUTECH_L_LZZZ_TSSM', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] },
        { id: 'KOMUTECH_L_LZZZ_SSSM', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] },
        { id: 'KOMUTECH_L_LZZZ_YGZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] },
        { id: 'KOMUTECH_L_LZZZ_MHZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] },
        { id: 'KOMUTECH_L_LZZZ_MZZ', lines: ['§f---§a§l点击购买§f---', '§a•需：16 下品灵石'], price: [{ id: 'KOMUTECH_L_DJ_XPLS', amount: 16 }] }
    ],
    leisi: [
        { id: 'KOMUTECH_L_JCWP_儡肆通行柬', lines: ['§f---§a§l点击购买§f---', '§a•需：64 上品灵石 + 16 功德券'], price: [{ id: 'KOMUTECH_L_DJ_SPLS', amount: 64 }, { id: 'KOMUTECH_L_DJ_功德券', amount: 16 }] },
        { id: 'KOMUTECH_L_SW_KLN', lines: ['§f---§a§l点击购买§f---', '§a•需：64 上品灵石 + 4 昙息玉'], price: [{ id: 'KOMUTECH_L_DJ_SPLS', amount: 64 }, { id: 'KOMUTECH_L_KW_TXY', amount: 4 }] }
    ]
};
let KOMUTECH_QHG_PRICE_MAP = new java.util.HashMap();
for (let cat in KOMUTECH_QHG_ITEMS) {
    for (let item of KOMUTECH_QHG_ITEMS[cat]) {
        KOMUTECH_QHG_PRICE_MAP.put(item.id, item.price);
    }
}
let KOMUTECH_QHG_COOLDOWN = new java.util.HashMap();
const KOMUTECH_QHG_COOLDOWN_MS = 1000;
function KOMUTECH_QHG_isOnCooldown(player) {
    const last = KOMUTECH_QHG_COOLDOWN.get(player);
    if (!last) return false;
    const now = Date.now();
    if (now - last < KOMUTECH_QHG_COOLDOWN_MS) return true;
    KOMUTECH_QHG_COOLDOWN.remove(player);
    return false;
}
function KOMUTECH_QHG_setCooldown(player) { KOMUTECH_QHG_COOLDOWN.put(player, Date.now()); }
function KOMUTECH_QHG_item(mat, name, lore) {
    const it = new KOMUTECH_QHG_ItemStack(KOMUTECH_QHG_Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_QHG_borderItem() { return KOMUTECH_QHG_item('ORANGE_STAINED_GLASS_PANE', '§6✨'); }
function KOMUTECH_QHG_applyBorder(inv) { const b = KOMUTECH_QHG_borderItem(); KOMUTECH_QHG_BORDER_SLOTS.forEach(s => inv.setItem(s, b.clone())); }
function KOMUTECH_QHG_hasEnough(player, priceList, multiplier) {
    const inv = player.getInventory();
    for (let price of priceList) {
        let needed = price.amount * multiplier;
        let total = 0;
        for (let i = 0; i < inv.getSize(); i++) {
            const stack = inv.getItem(i);
            if (!stack || stack.getType() === KOMUTECH_QHG_Material.AIR) continue;
            const sf = KOMUTECH_QHG_SlimefunItem.getByItem(stack);
            if (!sf || sf.getId() !== price.id) continue;
            total += stack.getAmount();
            if (total >= needed) break;
        }
        if (total < needed) return false;
    }
    return true;
}
function KOMUTECH_QHG_removeItems(player, priceList, multiplier) {
    for (let price of priceList) {
        let need = price.amount * multiplier;
        let remain = need;
        const inv = player.getInventory();
        for (let i = 0; i < inv.getSize() && remain > 0; i++) {
            const stack = inv.getItem(i);
            if (!stack || stack.getType() === KOMUTECH_QHG_Material.AIR) continue;
            const sf = KOMUTECH_QHG_SlimefunItem.getByItem(stack);
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
function KOMUTECH_QHG_canAddItem(player, itemStack, amount) {
    const maxStack = itemStack.getMaxStackSize();
    let remaining = amount;
    const inv = player.getInventory();
    for (let i = 0; i < 36; i++) {
        const stack = inv.getItem(i);
        if (stack == null) {
            remaining -= maxStack;
            if (remaining <= 0) return true;
            continue;
        }
        if (stack.isSimilar(itemStack)) {
            const space = maxStack - stack.getAmount();
            if (space > 0) {
                remaining -= space;
                if (remaining <= 0) return true;
            }
        }
    }
    return false;
}
function KOMUTECH_QHG_giveItems(player, itemProto, amount) {
    const maxStack = itemProto.getMaxStackSize();
    let give = amount;
    while (give > 0) {
        const stackSize = Math.min(maxStack, give);
        const copy = itemProto.clone();
        copy.setAmount(stackSize);
        const left = player.getInventory().addItem(copy);
        if (!left.isEmpty()) {
            player.getWorld().dropItem(player.getLocation(), left.values().iterator().next());
        }
        give -= stackSize;
    }
}
function KOMUTECH_QHG_buildMain() {
    const inv = KOMUTECH_QHG_Bukkit.createInventory(null, 54, KOMUTECH_QHG_MAIN_TITLE);
    KOMUTECH_QHG_applyBorder(inv);
    KOMUTECH_QHG_CATEGORIES.forEach(c => inv.setItem(c.slot, KOMUTECH_QHG_item(c.icon, c.name, [c.lore, '', '§a点击查看'])));
    inv.setItem(4, KOMUTECH_QHG_item(KOMUTECH_QHG_INFO_ITEM.material, KOMUTECH_QHG_INFO_ITEM.name, KOMUTECH_QHG_INFO_ITEM.lore));
    inv.setItem(49, KOMUTECH_QHG_item('BARRIER', '§c关闭', '§7关闭菜单'));
    return inv;
}
function KOMUTECH_QHG_catMenu(cid) {
    const cat = KOMUTECH_QHG_CATEGORIES.find(c => c.id === cid);
    if (!cat) return null;
    const list = KOMUTECH_QHG_ITEMS[cid];
    if (!list || !list.length) return null;
    const inv = KOMUTECH_QHG_Bukkit.createInventory(null, 54, KOMUTECH_QHG_SUB_PRE + cat.name + KOMUTECH_QHG_SUB_SUF);
    KOMUTECH_QHG_applyBorder(inv);
    inv.setItem(4, KOMUTECH_QHG_item('PAPER', '§6' + cat.name + '说明', ['§7点击物品购买', '§e共' + list.length + '种']));
    let slot = 10;
    for (let i = 0; i < list.length; i++) {
        if (slot > 43) break;
        const e = list[i];
        const sf = KOMUTECH_QHG_SlimefunItem.getById(e.id);
        if (sf) {
            const it = sf.getItem().clone();
            const meta = it.getItemMeta();
            let lore = meta.getLore() || [];
            if (!Array.isArray(lore)) lore = [lore];
            for (let line of e.lines) lore.push(line);
            meta.setLore(lore);
            it.setItemMeta(meta);
            inv.setItem(slot, it);
        } else {
            inv.setItem(slot, KOMUTECH_QHG_item('BARRIER', '§c无效物品', ['§7ID: ' + e.id]));
        }
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
    }
    inv.setItem(49, KOMUTECH_QHG_item('ARROW', '§a返回', '§7返回主菜单'));
    return inv;
}
let KOMUTECH_QHG_openPlayers = new java.util.HashSet();
function KOMUTECH_QHG_registerListener() {
    if (KOMUTECH_QHG_plugin.komutech_gj_qhgui) {
        try {
            KOMUTECH_QHG_ClickEvent.getHandlerList().unregister(KOMUTECH_QHG_plugin.komutech_gj_qhgui);
            KOMUTECH_QHG_CloseEvent.getHandlerList().unregister(KOMUTECH_QHG_plugin.komutech_gj_qhgui);
        } catch(e) {
            if (e.message && e.message.includes("Context is already closed")) return;
            print("注销旧监听器错误: " + e);
        }
        KOMUTECH_QHG_plugin.komutech_gj_qhgui = null;
    }
    const L = Java.extend(KOMUTECH_QHG_Listener, {});
    const listener = new L();
    KOMUTECH_QHG_plugin.komutech_gj_qhgui = listener;
    KOMUTECH_QHG_Bukkit.getPluginManager().registerEvent(KOMUTECH_QHG_ClickEvent, listener, KOMUTECH_QHG_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!KOMUTECH_QHG_openPlayers.contains(p)) return;
            const title = e.getView().getTitle();
            if (title !== KOMUTECH_QHG_MAIN_TITLE && !title.startsWith(KOMUTECH_QHG_SUB_PRE)) return;
            e.setCancelled(true);
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === KOMUTECH_QHG_Material.AIR) return;
            if (title === KOMUTECH_QHG_MAIN_TITLE) {
                const cat = KOMUTECH_QHG_CATEGORIES.find(c => c.slot === slot && it.getItemMeta().getDisplayName() === c.name);
                if (cat) {
                    const sub = KOMUTECH_QHG_catMenu(cat.id);
                    if (sub) KOMUTECH_QHG_openMenu(p, sub);
                    return;
                }
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§c关闭') {
                    p.closeInventory();
                    return;
                }
            } else {
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§a返回') {
                    KOMUTECH_QHG_openMain(p);
                    return;
                }
                const sf = KOMUTECH_QHG_SlimefunItem.getByItem(it);
                if (!sf) return;
                const prices = KOMUTECH_QHG_PRICE_MAP.get(sf.getId());
                if (!prices || !prices.length) {
                    p.sendMessage('§c价格信息错误');
                    return;
                }
                if (KOMUTECH_QHG_isOnCooldown(p)) {
                    p.sendMessage('§c操作过快，请稍后再试');
                    return;
                }
                const isShift = e.isShiftClick();
                if (!isShift) {
                    if (!KOMUTECH_QHG_hasEnough(p, prices, 1)) { p.sendMessage('§c灵石不足，无法购买'); return; }
                    const itemProto = sf.getItem();
                    if (!KOMUTECH_QHG_canAddItem(p, itemProto, 1)) { p.sendMessage('§c背包已满，请清理空间'); return; }
                    KOMUTECH_QHG_removeItems(p, prices, 1);
                    KOMUTECH_QHG_giveItems(p, itemProto, 1);
                    p.sendMessage('§a购买成功！');
                    KOMUTECH_QHG_setCooldown(p);
                } else {
                    p.sendMessage('§a请在聊天栏输入购买数量（正整数）:');
                    getChatInput(p, new (Java.extend(KOMUTECH_QHG_Consumer, {
                        accept: function(input) {
                            if (!p.isOnline()) return;
                            const num = parseInt(input);
                            if (isNaN(num) || num < 1) {
                                p.sendMessage('§c请输入大于0的整数');
                                return;
                            }
                            if (KOMUTECH_QHG_isOnCooldown(p)) { p.sendMessage('§c操作过快，请稍后再试'); return; }
                            const itemProto = sf.getItem();
                            const maxStack = itemProto.getMaxStackSize();
                            if (!KOMUTECH_QHG_hasEnough(p, prices, num)) { p.sendMessage('§c灵石不足，无法购买'); return; }
                            if (!KOMUTECH_QHG_canAddItem(p, itemProto, num)) { p.sendMessage('§c背包空间不足，无法容纳该数量'); return; }
                            KOMUTECH_QHG_removeItems(p, prices, num);
                            KOMUTECH_QHG_giveItems(p, itemProto, num);
                            p.sendMessage('§a成功购买 ' + num + ' 个！');
                            KOMUTECH_QHG_setCooldown(p);
                        }
                    })));
                }
            }
        } catch (err) { print("琼华阁点击错误: " + err); }
    }, KOMUTECH_QHG_plugin);
    KOMUTECH_QHG_Bukkit.getPluginManager().registerEvent(KOMUTECH_QHG_CloseEvent, listener, KOMUTECH_QHG_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            KOMUTECH_QHG_openPlayers.remove(p);
            if (KOMUTECH_QHG_openPlayers.isEmpty()) {
                try {
                    KOMUTECH_QHG_ClickEvent.getHandlerList().unregister(listener);
                    KOMUTECH_QHG_CloseEvent.getHandlerList().unregister(listener);
                } catch(ex) {
                    if (ex.message && ex.message.includes("Context is already closed")) return;
                    print("注销监听器错误: " + ex);
                }
                KOMUTECH_QHG_plugin.komutech_gj_qhgui = null;
            }
        } catch (err) {}
    }, KOMUTECH_QHG_plugin);
}
function KOMUTECH_QHG_ensureListener() { if (!KOMUTECH_QHG_plugin.komutech_gj_qhgui) KOMUTECH_QHG_registerListener(); }
function KOMUTECH_QHG_openMenu(p, inv) { p.openInventory(inv); KOMUTECH_QHG_openPlayers.add(p); KOMUTECH_QHG_ensureListener(); }
function KOMUTECH_QHG_openMain(p) { KOMUTECH_QHG_openMenu(p, KOMUTECH_QHG_buildMain()); }
function KOMUTECH_QHG_onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { KOMUTECH_QHG_openMain(player); return true; } catch (err) { player.sendMessage('§c无法打开商店菜单'); return false; }
}
function KOMUTECH_QHG_onUse(e) { const p = e.getPlayer(); try { KOMUTECH_QHG_openMain(p); } catch (err) { p.sendMessage('§c无法打开商店菜单'); } return false; }
function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) { return KOMUTECH_QHG_onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode); }
function onUse(e) { KOMUTECH_QHG_onUse(e); }