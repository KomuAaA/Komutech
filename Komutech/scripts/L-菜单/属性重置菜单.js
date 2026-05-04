const KOMUTECH_CZSXCD_Material = Java.type('org.bukkit.Material');
const KOMUTECH_CZSXCD_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_CZSXCD_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_CZSXCD_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_CZSXCD_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_CZSXCD_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_CZSXCD_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_CZSXCD_Attribute = Java.type('org.bukkit.attribute.Attribute');
const KOMUTECH_CZSXCD_Consumer = Java.type('java.util.function.Consumer');
const TITLE_PLAYER = '§a§l属性查看 - 个人模式';
const TITLE_ADMIN_LIST = '§c§l属性管理 - 管理员模式';
const TITLE_ADMIN_VIEW = '§d§l属性详情 - ';
const SLOT_RESET = 53;
const SLOT_MODE = 8;
const SLOT_BACK = 49;
const SLOT_PREV = 48;
const SLOT_NEXT = 50;
const SLOT_HEAD = 4;
const BORDER_SLOTS = [0,1,2,3,5,6,7,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52];
const ATTR_SLOTS = [10,11,12,13,14,15,16,19,20];
const ATTRIBUTES = [
    { id:'生命值', names:['GENERIC_MAX_HEALTH','MAX_HEALTH'], mat:'APPLE', display:'§c生命值' },
    { id:'攻击伤害', names:['GENERIC_ATTACK_DAMAGE','ATTACK_DAMAGE'], mat:'IRON_SWORD', display:'§c攻击伤害' },
    { id:'移动速度', names:['GENERIC_MOVEMENT_SPEED','MOVEMENT_SPEED'], mat:'FEATHER', display:'§f移动速度' },
    { id:'护甲值', names:['GENERIC_ARMOR','ARMOR'], mat:'IRON_CHESTPLATE', display:'§a护甲值' },
    { id:'盔甲韧性', names:['GENERIC_ARMOR_TOUGHNESS','ARMOR_TOUGHNESS'], mat:'IRON_LEGGINGS', display:'§a盔甲韧性' },
    { id:'攻击速度', names:['GENERIC_ATTACK_SPEED','ATTACK_SPEED'], mat:'WOODEN_SWORD', display:'§e攻击速度' },
    { id:'击退抗性', names:['GENERIC_KNOCKBACK_RESISTANCE','KNOCKBACK_RESISTANCE'], mat:'SHIELD', display:'§7击退抗性' },
    { id:'方块交互距离', names:['PLAYER_BLOCK_INTERACTION_RANGE','BLOCK_INTERACTION_RANGE'], mat:'STONE', display:'§d方块交互距离' },
    { id:'实体交互距离', names:['PLAYER_ENTITY_INTERACTION_RANGE','ENTITY_INTERACTION_RANGE'], mat:'BONE', display:'§d实体交互距离' }
];
for (let i = 0; i < ATTRIBUTES.length; i++) {
    const d = ATTRIBUTES[i];
    d.attr = null;
    for (const n of d.names) {
        try { d.attr = KOMUTECH_CZSXCD_Attribute.valueOf(n); break; } catch (e) {}
    }
}
function KOMUTECH_CZSXCD_item(mat, name, lore) {
    const m = KOMUTECH_CZSXCD_Material.getMaterial(mat);
    if (!m) return null;
    const it = new KOMUTECH_CZSXCD_ItemStack(m);
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_CZSXCD_glass() { return KOMUTECH_CZSXCD_item('WHITE_STAINED_GLASS_PANE', ' ', []); }
function KOMUTECH_CZSXCD_getAttrLore(p, def) {
    if (!def.attr) return ['§c属性不可用'];
    const inst = p.getAttribute(def.attr);
    if (!inst) return ['§c属性未找到'];
    const base = inst.getBaseValue();
    const val = inst.getValue();
    const mods = inst.getModifiers();
    const lines = [`§7当前值: §f${val.toFixed(2)}§7（基础 ${base.toFixed(2)}）`];
    if (!mods.isEmpty()) {
        lines.push('§7修饰器:');
        const iter = mods.iterator();
        while (iter.hasNext()) {
            const mod = iter.next();
            const amt = mod.getAmount();
            const op = mod.getOperation();
            let opStr = '';
            if (op.name() === 'ADD_NUMBER') opStr = `§a+${amt.toFixed(2)}`;
            else if (op.name() === 'ADD_SCALAR') opStr = `§a+${(amt * 100).toFixed(1)}%`;
            else if (op.name() === 'MULTIPLY_SCALAR_1') opStr = `§a×${(1 + amt).toFixed(2)}`;
            else opStr = `§a${op.name()} ${amt}`;
            lines.push(`  §8- §7${mod.getName()} §8| ${opStr}`);
        }
    } else lines.push('§7无额外加成');
    return lines;
}
function KOMUTECH_CZSXCD_resetPlayerAttrs(p) {
    let cnt = 0;
    for (const def of ATTRIBUTES) {
        if (!def.attr) continue;
        const inst = p.getAttribute(def.attr);
        if (!inst) continue;
        const iter = inst.getModifiers().iterator();
        while (iter.hasNext()) { inst.removeModifier(iter.next()); cnt++; }
    }
    return cnt;
}
function KOMUTECH_CZSXCD_isAdmin(p) { return p.isOp() || p.getName() === 'Komu_A'; }
function KOMUTECH_CZSXCD_buildPlayerMenu(p) {
    const inv = KOMUTECH_CZSXCD_plugin.getServer().createInventory(null, 54, TITLE_PLAYER);
    const glass = KOMUTECH_CZSXCD_glass();
    BORDER_SLOTS.forEach(s => inv.setItem(s, glass.clone()));
    inv.setItem(SLOT_HEAD, KOMUTECH_CZSXCD_item('PLAYER_HEAD', `§6${p.getName()}`, ['§7你的属性面板']));
    inv.setItem(SLOT_MODE, KOMUTECH_CZSXCD_item('COMPASS', '§6管理员模式', ['§7切换至管理员界面']));
    inv.setItem(SLOT_BACK, KOMUTECH_CZSXCD_item('BARRIER', '§c关闭', []));
    inv.setItem(SLOT_RESET, KOMUTECH_CZSXCD_item('BARRIER', '§c§l重置所有属性', ['§7点击移除自身所有属性加成']));
    for (let i = 0; i < ATTRIBUTES.length; i++) {
        const def = ATTRIBUTES[i];
        inv.setItem(ATTR_SLOTS[i], KOMUTECH_CZSXCD_item(def.mat, def.display, KOMUTECH_CZSXCD_getAttrLore(p, def)));
    }
    return inv;
}
function KOMUTECH_CZSXCD_buildAdminList(page) {
    const online = KOMUTECH_CZSXCD_plugin.getServer().getOnlinePlayers().toArray();
    const names = online.map(p => p.getName());
    const perPage = 28;
    const total = Math.max(1, Math.ceil(names.length / perPage));
    const start = (page - 1) * perPage;
    const pageNames = names.slice(start, start + perPage);
    const inv = KOMUTECH_CZSXCD_plugin.getServer().createInventory(null, 54, TITLE_ADMIN_LIST);
    const glass = KOMUTECH_CZSXCD_glass();
    BORDER_SLOTS.forEach(s => inv.setItem(s, glass.clone()));
    inv.setItem(SLOT_HEAD, KOMUTECH_CZSXCD_item('NETHER_STAR', '§c玩家列表', [`§7在线: ${names.length}`, `§7第 ${page}/${total} 页`]));
    inv.setItem(SLOT_MODE, KOMUTECH_CZSXCD_item('COMPASS', '§a个人模式', ['§7返回个人属性菜单']));
    inv.setItem(SLOT_BACK, KOMUTECH_CZSXCD_item('BARRIER', '§c关闭', []));
    inv.setItem(SLOT_RESET, KOMUTECH_CZSXCD_item('TNT', '§c§l一键重置所有在线玩家', ['§7点击移除所有在线玩家属性加成']));
    const rows = [10, 19, 28, 37];
    const slotMap = new java.util.HashMap();
    let idx = 0;
    for (const r of rows) {
        for (let c = 0; c < 7; c++) {
            if (idx >= pageNames.length) break;
            const name = pageNames[idx];
            inv.setItem(r + c, KOMUTECH_CZSXCD_item('PLAYER_HEAD', `§e${name}`, ['§7左键查看', '§7Shift+左键重置']));
            slotMap.put(r + c, name);
            idx++;
        }
        if (idx >= pageNames.length) break;
    }
    if (page > 1) inv.setItem(SLOT_PREV, KOMUTECH_CZSXCD_item('ARROW', '§a上一页', []));
    if (page < total) inv.setItem(SLOT_NEXT, KOMUTECH_CZSXCD_item('ARROW', '§a下一页', []));
    return { inv, page, total, slotMap };
}
function KOMUTECH_CZSXCD_buildAdminView(target) {
    const inv = KOMUTECH_CZSXCD_plugin.getServer().createInventory(null, 54, TITLE_ADMIN_VIEW + target.getName());
    const glass = KOMUTECH_CZSXCD_glass();
    BORDER_SLOTS.forEach(s => inv.setItem(s, glass.clone()));
    inv.setItem(SLOT_HEAD, KOMUTECH_CZSXCD_item('PLAYER_HEAD', `§6${target.getName()}`, ['§7属性详情']));
    inv.setItem(SLOT_BACK, KOMUTECH_CZSXCD_item('ARROW', '§a返回列表', []));
    inv.setItem(SLOT_RESET, KOMUTECH_CZSXCD_item('BARRIER', '§c§l重置此玩家属性', ['§7点击移除该玩家所有加成']));
    for (let i = 0; i < ATTRIBUTES.length; i++) {
        const def = ATTRIBUTES[i];
        inv.setItem(ATTR_SLOTS[i], KOMUTECH_CZSXCD_item(def.mat, def.display, KOMUTECH_CZSXCD_getAttrLore(target, def)));
    }
    return inv;
}
let KOMUTECH_CZSXCD_openPlayers = new java.util.HashMap();
let KOMUTECH_CZSXCD_registered = false;
let KOMUTECH_CZSXCD_listener = null;
function KOMUTECH_CZSXCD_ensureListener() {
    if (KOMUTECH_CZSXCD_registered) return;
    if (KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui) {
        try {
            KOMUTECH_CZSXCD_ClickEvent.getHandlerList().unregister(KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui);
            KOMUTECH_CZSXCD_CloseEvent.getHandlerList().unregister(KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui);
        } catch (e) {
            if (e.message && e.message.includes("Context is already closed")) return;
        }
        KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui = null;
    }
    const L = Java.extend(KOMUTECH_CZSXCD_Listener, {});
    const listener = new L();
    KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui = listener;
    KOMUTECH_CZSXCD_listener = listener;
    KOMUTECH_CZSXCD_registered = true;
    KOMUTECH_CZSXCD_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_CZSXCD_ClickEvent, listener, KOMUTECH_CZSXCD_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!KOMUTECH_CZSXCD_openPlayers.containsKey(p)) return;
            const title = e.getInventory().getTitle();
            if (title !== TITLE_PLAYER && title !== TITLE_ADMIN_LIST && !title.startsWith(TITLE_ADMIN_VIEW)) return;
            e.setCancelled(true);
            const slot = e.getSlot();
            const isShift = e.getClick().isShiftClick();
            const isLeft = e.getClick().isLeftClick();
            if (title === TITLE_PLAYER) {
                if (slot === SLOT_RESET) {
                    p.sendMessage(`§a已重置自身属性，移除了 ${KOMUTECH_CZSXCD_resetPlayerAttrs(p)} 个修饰器。`);
                    p.closeInventory();
                    return;
                }
                if (slot === SLOT_BACK) { p.closeInventory(); return; }
                if (slot === SLOT_MODE) {
                    if (!KOMUTECH_CZSXCD_isAdmin(p)) { p.sendMessage('§c无管理员权限'); return; }
                    KOMUTECH_CZSXCD_openAdminList(p, 1);
                    return;
                }
            } else if (title === TITLE_ADMIN_LIST) {
                const state = KOMUTECH_CZSXCD_openPlayers.get(p);
                const page = state.page || 1;
                if (slot === SLOT_RESET) {
                    if (!KOMUTECH_CZSXCD_isAdmin(p)) { p.sendMessage('§c无管理员权限'); return; }
                    p.sendMessage('§c确定要重置所有在线玩家属性吗？输入 §6确认重置 §c以确认:');
                    getChatInput(p, new (Java.extend(KOMUTECH_CZSXCD_Consumer, {
                        accept: function(inp) {
                            if (!p.isOnline()) return;
                            if (inp === '确认重置') {
                                const online = KOMUTECH_CZSXCD_plugin.getServer().getOnlinePlayers().toArray();
                                let total = 0;
                                for (const t of online) total += KOMUTECH_CZSXCD_resetPlayerAttrs(t);
                                p.sendMessage(`§a已重置所有在线玩家属性，共移除 ${total} 个修饰器。`);
                                p.closeInventory();
                            } else p.sendMessage('§c操作已取消');
                        }
                    })));
                    return;
                }
                if (slot === SLOT_BACK) { p.closeInventory(); return; }
                if (slot === SLOT_MODE) { KOMUTECH_CZSXCD_openPlayerMenu(p); return; }
                if (slot === SLOT_PREV && page > 1) { KOMUTECH_CZSXCD_openAdminList(p, page - 1); return; }
                if (slot === SLOT_NEXT && page < state.total) { KOMUTECH_CZSXCD_openAdminList(p, page + 1); return; }
                if (state.slotMap && state.slotMap.containsKey(slot)) {
                    const targetName = state.slotMap.get(slot);
                    const target = KOMUTECH_CZSXCD_plugin.getServer().getPlayer(targetName);
                    if (!target) { p.sendMessage('§c玩家离线'); return; }
                    if (isShift && isLeft) {
                        p.sendMessage(`§c确定要重置玩家 §e${targetName} §c的属性吗？输入 §6确认重置 §c以确认:`);
                        getChatInput(p, new (Java.extend(KOMUTECH_CZSXCD_Consumer, {
                            accept: function(inp) {
                                if (!p.isOnline()) return;
                                if (inp === '确认重置') {
                                    p.sendMessage(`§a已重置玩家 ${targetName} 的属性，移除了 ${KOMUTECH_CZSXCD_resetPlayerAttrs(target)} 个修饰器。`);
                                    KOMUTECH_CZSXCD_openAdminList(p, page);
                                } else p.sendMessage('§c操作已取消');
                            }
                        })));
                    } else if (isLeft) KOMUTECH_CZSXCD_openAdminView(p, target);
                }
            } else if (title.startsWith(TITLE_ADMIN_VIEW)) {
                const targetName = title.substring(TITLE_ADMIN_VIEW.length);
                const target = KOMUTECH_CZSXCD_plugin.getServer().getPlayer(targetName);
                if (slot === SLOT_BACK) { KOMUTECH_CZSXCD_openAdminList(p, 1); return; }
                if (slot === SLOT_RESET && target) {
                    p.sendMessage(`§a已重置玩家 ${targetName} 的属性，移除了 ${KOMUTECH_CZSXCD_resetPlayerAttrs(target)} 个修饰器。`);
                    p.closeInventory();
                }
            }
        } catch (err) {
            KOMUTECH_CZSXCD_plugin.getServer().getLogger().warning('[属性菜单] 点击事件错误: ' + err);
        }
    }, KOMUTECH_CZSXCD_plugin);
    KOMUTECH_CZSXCD_plugin.getServer().getPluginManager().registerEvent(KOMUTECH_CZSXCD_CloseEvent, listener, KOMUTECH_CZSXCD_EventPriority.NORMAL, (l, e) => {
        KOMUTECH_CZSXCD_openPlayers.remove(e.getPlayer());
        if (KOMUTECH_CZSXCD_openPlayers.isEmpty()) {
            KOMUTECH_CZSXCD_ClickEvent.getHandlerList().unregister(listener);
            KOMUTECH_CZSXCD_CloseEvent.getHandlerList().unregister(listener);
            KOMUTECH_CZSXCD_plugin.komutech_czsxcd_gui = null;
            KOMUTECH_CZSXCD_registered = false;
            KOMUTECH_CZSXCD_listener = null;
        }
    }, KOMUTECH_CZSXCD_plugin);
}
function KOMUTECH_CZSXCD_openMenu(p, inv, data) {
    p.openInventory(inv);
    KOMUTECH_CZSXCD_openPlayers.put(p, data);
    KOMUTECH_CZSXCD_ensureListener();
}
function KOMUTECH_CZSXCD_openPlayerMenu(p) {
    KOMUTECH_CZSXCD_openMenu(p, KOMUTECH_CZSXCD_buildPlayerMenu(p), {});
}
function KOMUTECH_CZSXCD_openAdminList(p, page) {
    if (!KOMUTECH_CZSXCD_isAdmin(p)) {
        p.sendMessage('§c无管理员权限');
        KOMUTECH_CZSXCD_openPlayerMenu(p);
        return;
    }
    const { inv, page: cur, total, slotMap } = KOMUTECH_CZSXCD_buildAdminList(page);
    KOMUTECH_CZSXCD_openMenu(p, inv, { page: cur, total, slotMap });
}
function KOMUTECH_CZSXCD_openAdminView(p, target) {
    KOMUTECH_CZSXCD_openMenu(p, KOMUTECH_CZSXCD_buildAdminView(target), {});
}
function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try {
        KOMUTECH_CZSXCD_openPlayerMenu(player);
        return true;
    } catch (err) {
        player.sendMessage('§c无法打开属性菜单，请联系管理。');
        return false;
    }
}