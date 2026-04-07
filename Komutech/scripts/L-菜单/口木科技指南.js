const KOMUTECH_ZN_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_ZN_Material = Java.type('org.bukkit.Material');
const KOMUTECH_ZN_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_ZN_ClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_ZN_CloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_ZN_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_ZN_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_ZN_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_ZN_Listener = Java.type('org.bukkit.event.Listener');
const KOMUTECH_ZN_CATEGORIES = [
    { id: 'rumen', name: '§a✦ 入门篇', lore: '§e灵石获取与基础开采', icon: 'AMETHYST_CLUSTER', slot: 10 },
    { id: 'shenwu', name: '§b✦ 深悟篇', lore: '§e法则的获取与进阶', icon: 'ENDER_PEARL', slot: 11 },
    { id: 'dacheng', name: '§6✦ 大成篇', lore: '§e身外身的获取', icon: 'ENDER_EYE', slot: 12 },
    { id: 'lingzhi', name: '§2✦ 灵植篇', lore: '§e灵植种子种植方法', icon: 'BAMBOO', slot: 13 },
    { id: 'lingzhang', name: '§d✦ 灵杖篇', lore: '§e灵杖的使用方法', icon: 'BLAZE_ROD', slot: 14 },
    { id: 'juanzhou', name: '§5✦ 卷轴篇', lore: '§e卷轴的使用方法', icon: 'BOOK', slot: 15 }
];
const KOMUTECH_ZN_REWARDS = [
    { id: 'KOMUTECH_L_LZ_YG', chance: 30 },
    { id: 'KOMUTECH_L_DJ_XPLS', chance: 30 },
    { id: 'KOMUTECH_L_GJ_印物笺', chance: 1 }
];
const KOMUTECH_ZN_REWARD_SLOTS = [19,20,21,22,23,24,25,28,29,30,31,32,33,34,37,38,39,40,41,42,43];
const KOMUTECH_ZN_INFO_SLOT = 4;
const KOMUTECH_ZN_INFO_ITEM = {
    material: 'PAINTING', name: '§a§l口木科技教程说明',
    lore: ['§f点击上方分类查看教程', '§f点击下方随机奖励物品', '§f即可获得惊喜！']
};
const KOMUTECH_ZN_MAIN_TITLE = '§b§l✨ 口木科技教程 ✨';
const KOMUTECH_ZN_SUB_PRE = '§b§l✨ ';
const KOMUTECH_ZN_SUB_SUF = ' ✨';
const KOMUTECH_ZN_BORDER_SLOTS = [0,1,2,3,4,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];
const KOMUTECH_ZN_TIPS = {
    rumen: [
        { name: '§6灵石获取', icon: 'AMETHYST_SHARD', lore: ['§7• 灵脉宝窟/矿井开采灵石原矿获得下品灵石', '§7• 灵矿提取台处理原矿，灵能提炼器转换', '§7• 上品/极品需功德券辅助合成'] },
        { name: '§6矿物获取', icon: 'IRON_INGOT', lore: ['§7• 灵石原矿开采', '§7• 矿石原胚/杂矿概率获得', '§7• 玄铁、寒铁等由原胚在灵能提取器随机产出'] },
        { name: '§6灵脉宝窟', icon: 'FURNACE', lore: ['§7• 右键打开，点击石头开采', '§7• 下界合金镐可一键挖掘', '§7• 产出：灵石原矿、下品灵石、杂矿'] },
        { name: '§6灵脉晶辉宝窟', icon: 'DIAMOND', lore: ['§7• 同上，产出各类宝石璞胚'] }
    ],
    shenwu: [
        { name: '§6法则概述', icon: 'ENCHANTED_BOOK', lore: ['§7• 一丝、些许、完整三个品级', '§7• 涵盖金木水火土冰风雷机关炼金声音空间杀戮'] },
        { name: '§6一丝法则', icon: 'GOLD_NUGGET', lore: ['§7• 悟道石+材料+南方法则承载器', '§7• 悟道成功在承载器生成'] },
        { name: '§6些许法则', icon: 'GOLD_INGOT', lore: ['§7• 明悟石按顺序放入1-36个一丝法则'] },
        { name: '§6完整法则', icon: 'GOLD_BLOCK', lore: ['§7• 破妄石按顺序放入1-36个些许法则'] },
        { name: '§6高级法则', icon: 'NETHER_STAR', lore: ['§7• 五行灵曦：15个各完整五行法则合成', '§7• 五行祖炁：1-36个灵曦合成'] }
    ],
    dacheng: [
        { name: '§6身外身简介', icon: 'PLAYER_HEAD', lore: ['§7可绑定分身，自动化关键'] },
        { name: '§6无垢坯', icon: 'CLAY_BALL', lore: ['§7• 上品一芥乾坤合成清灵壤+元灵髓', '§7• 炼枢造生仪合成无垢坯'] },
        { name: '§6蕴灵身', icon: 'BLAZE_POWDER', lore: ['§7• 手持无垢坯右键使用', '§7• 消耗99%生命绑定自身'] },
        { name: '§6进阶', icon: 'BEACON', lore: ['§7• 蕴灵身可合成循工偶、百巧工等'] }
    ],
    lingzhi: [
        { name: '§6种子获取', icon: 'WHEAT_SEEDS', lore: ['§7• 桃、松、玉干、棉花、麻种子在下品一芥乾坤合成'] },
        { name: '§6种植环境', icon: 'GRASS_BLOCK', lore: ['§7• 普通作物需耕地', '§7• 树木需草方块，周围留空', '§7• 玉干草方块即可'] },
        { name: '§6生长收获', icon: 'BAMBOO', lore: ['§7• 成熟后破坏种子格自动掉落', '§7• 稀释灵液可增加玉干产量'] },
        { name: '§6产物用途', icon: 'OAK_LOG', lore: ['§7• 玉干→褚纸、玄铁工具', '§7• 桃/松木→木材', '§7• 棉花→一袋棉花→布', '§7• 麻→布'] }
    ],
    lingzhang: [
        { name: '§6灵杖简介', icon: 'BLAZE_ROD', lore: ['§7• 黄阶1、玄阶1.2、地阶1.5、天阶1.8倍率', '§7• 品阶越高基础伤害/灵力上限越高'] },
        { name: '§6灵力补充', icon: 'EMERALD', lore: ['§7• 手持灵石右键补充', '§7• Shift+右键自动补满'] },
        { name: '§6功德值', icon: 'EXPERIENCE_BOTTLE', lore: ['§7• 伤敌增功德，伤友增缺德', '§7• 每100功德提升1%伤害，上限1314倍', '§7• 5201314功德后收益降低'] },
        { name: '§6灵杖获取', icon: 'CRAFTING_TABLE', lore: ['§7• 烧火棍：工匠台', '§7• 黄阶/玄阶/地阶：灵能炼器坊'] }
    ],
    juanzhou: [
        { name: '§6卷轴简介', icon: 'BOOK', lore: ['§7• 分黄玄地天四阶'] },
        { name: '§6绑定方法', icon: 'ANVIL', lore: ['§7• 副手卷轴+主手灵杖右键'] },
        { name: '§6释放方法', icon: 'BLAZE_POWDER', lore: ['§7• 副手持卷轴 Shift+右键'] },
        { name: '§6熟练度', icon: 'EXPERIENCE_BOTTLE', lore: ['§7• 每100点降低3%冷却，上限90%'] },
        { name: '§6卷轴获取', icon: 'WRITABLE_BOOK', lore: ['§7• 黄阶：勾豆灰', '§7• 玄阶：九霄环佩鸣', '§7• 地阶：冰火两重天', '§7• 天阶：游龙惊鸿诀（均卷轴撰写台合成）'] }
    ]
};
function KOMUTECH_ZN_item(mat, name, lore) {
    const it = new KOMUTECH_ZN_ItemStack(KOMUTECH_ZN_Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_ZN_borderItem() { return KOMUTECH_ZN_item('PINK_STAINED_GLASS_PANE', '§d✨'); }
function KOMUTECH_ZN_applyBorder(inv) { const b = KOMUTECH_ZN_borderItem(); KOMUTECH_ZN_BORDER_SLOTS.forEach(s => inv.setItem(s, b.clone())); }
function KOMUTECH_ZN_giveRandomReward(p) {
    const rand = Math.random() * 100;
    let cum = 0;
    for (let r of KOMUTECH_ZN_REWARDS) {
        cum += r.chance;
        if (rand < cum) {
            const sf = KOMUTECH_ZN_SlimefunItem.getById(r.id);
            if (sf) {
                const reward = sf.getItem().clone();
                p.getWorld().dropItemNaturally(p.getLocation(), reward);
                p.sendMessage('§a获得奖励: ' + (reward.getItemMeta().getDisplayName() || r.id));
            } else p.sendMessage('§c奖励物品无效，请联系管理');
            return;
        }
    }
    p.sendMessage('§f🎉倒霉🥚，你成功避开了奖励。');
}
function KOMUTECH_ZN_buildMainMenu() {
    const inv = KOMUTECH_ZN_Bukkit.createInventory(null, 54, KOMUTECH_ZN_MAIN_TITLE);
    KOMUTECH_ZN_applyBorder(inv);
    KOMUTECH_ZN_CATEGORIES.forEach(c => inv.setItem(c.slot, KOMUTECH_ZN_item(c.icon, c.name, [c.lore, '', '§a点击查看'])));
    inv.setItem(KOMUTECH_ZN_INFO_SLOT, KOMUTECH_ZN_item(KOMUTECH_ZN_INFO_ITEM.material, KOMUTECH_ZN_INFO_ITEM.name, KOMUTECH_ZN_INFO_ITEM.lore));
    if (Math.random() * 100 < 50) {
        const slot = KOMUTECH_ZN_REWARD_SLOTS[Math.floor(Math.random() * KOMUTECH_ZN_REWARD_SLOTS.length)];
        inv.setItem(slot, KOMUTECH_ZN_item('ENDER_CHEST', '§e✨ 神秘奖励 ✨', ['§7点击随机获得奖励']));
    }
    inv.setItem(49, KOMUTECH_ZN_item('BARRIER', '§c关闭', '§7关闭菜单'));
    return inv;
}
function KOMUTECH_ZN_catMenu(cid) {
    const cat = KOMUTECH_ZN_CATEGORIES.find(c => c.id === cid);
    if (!cat) return null;
    const tips = KOMUTECH_ZN_TIPS[cid];
    if (!tips || !tips.length) return null;
    const inv = KOMUTECH_ZN_Bukkit.createInventory(null, 54, KOMUTECH_ZN_SUB_PRE + cat.name + KOMUTECH_ZN_SUB_SUF);
    KOMUTECH_ZN_applyBorder(inv);
    inv.setItem(4, KOMUTECH_ZN_item('PAPER', '§6' + cat.name + '说明', ['§7点击条目查看详情', '§e共' + tips.length + '个知识点']));
    let slot = 10;
    for (let tip of tips) {
        if (slot > 43) break;
        inv.setItem(slot, KOMUTECH_ZN_item(tip.icon || 'PAPER', tip.name, tip.lore));
        slot++;
        if ((slot - 9) % 9 === 0) slot += 2;
    }
    inv.setItem(49, KOMUTECH_ZN_item('ARROW', '§a返回', '§7返回主菜单'));
    return inv;
}
let KOMUTECH_ZN_openPlayers = new java.util.HashSet();
let KOMUTECH_ZN_registered = false;
let KOMUTECH_ZN_listener = null;
function KOMUTECH_ZN_registerListener() {
    if (KOMUTECH_ZN_registered && KOMUTECH_ZN_listener) return;
    if (KOMUTECH_ZN_plugin.komutech_gj_znui) {
        try {
            KOMUTECH_ZN_ClickEvent.getHandlerList().unregister(KOMUTECH_ZN_plugin.komutech_gj_znui);
            KOMUTECH_ZN_CloseEvent.getHandlerList().unregister(KOMUTECH_ZN_plugin.komutech_gj_znui);
        } catch(e) {
            if (e.message && e.message.includes("Context is already closed")) return;
            print("注销旧监听器错误: " + e);
        }
        KOMUTECH_ZN_plugin.komutech_gj_znui = null;
    }
    const L = Java.extend(KOMUTECH_ZN_Listener, {});
    const listener = new L();
    KOMUTECH_ZN_plugin.komutech_gj_znui = listener;
    KOMUTECH_ZN_listener = listener;
    KOMUTECH_ZN_Bukkit.getPluginManager().registerEvent(KOMUTECH_ZN_ClickEvent, listener, KOMUTECH_ZN_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!KOMUTECH_ZN_openPlayers.contains(p)) return;
            const title = e.getInventory().getTitle();
            if (title !== KOMUTECH_ZN_MAIN_TITLE && !title.startsWith(KOMUTECH_ZN_SUB_PRE)) return;
            e.setCancelled(true);
            const inv = e.getInventory();
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === KOMUTECH_ZN_Material.AIR) return;
            if (title === KOMUTECH_ZN_MAIN_TITLE) {
                const cat = KOMUTECH_ZN_CATEGORIES.find(c => c.slot === slot && it.getItemMeta().getDisplayName() === c.name);
                if (cat) { KOMUTECH_ZN_openCat(p, cat.id); return; }
                const disp = it.getItemMeta().getDisplayName();
                if (disp === '§e✨ 神秘奖励 ✨') { KOMUTECH_ZN_giveRandomReward(p); inv.setItem(slot, null); return; }
                if (slot === 49 && disp === '§c关闭') { p.closeInventory(); return; }
            } else {
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§a返回') KOMUTECH_ZN_openMain(p);
            }
        } catch (err) { print("教程菜单点击错误: " + err); }
    }, KOMUTECH_ZN_plugin);
    KOMUTECH_ZN_Bukkit.getPluginManager().registerEvent(KOMUTECH_ZN_CloseEvent, listener, KOMUTECH_ZN_EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            KOMUTECH_ZN_openPlayers.remove(p);
            if (KOMUTECH_ZN_openPlayers.isEmpty()) {
                try {
                    KOMUTECH_ZN_ClickEvent.getHandlerList().unregister(listener);
                    KOMUTECH_ZN_CloseEvent.getHandlerList().unregister(listener);
                } catch(ex) {
                    if (ex.message && ex.message.includes("Context is already closed")) return;
                    print("注销监听器错误: " + ex);
                }
                KOMUTECH_ZN_plugin.komutech_gj_znui = null;
                KOMUTECH_ZN_registered = false;
                KOMUTECH_ZN_listener = null;
            }
        } catch (err) {}
    }, KOMUTECH_ZN_plugin);
    KOMUTECH_ZN_registered = true;
}
function KOMUTECH_ZN_ensureListener() { if (!KOMUTECH_ZN_registered) KOMUTECH_ZN_registerListener(); }
function KOMUTECH_ZN_openMenu(p, inv) { p.openInventory(inv); KOMUTECH_ZN_openPlayers.add(p); KOMUTECH_ZN_ensureListener(); }
function KOMUTECH_ZN_openMain(p) { KOMUTECH_ZN_openMenu(p, KOMUTECH_ZN_buildMainMenu()); }
function KOMUTECH_ZN_openCat(p, id) {
    const menu = KOMUTECH_ZN_catMenu(id);
    menu ? KOMUTECH_ZN_openMenu(p, menu) : p.sendMessage('§c该分类暂无内容。');
}
function KOMUTECH_ZN_onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { KOMUTECH_ZN_openMain(player); return true; } catch (err) { player.sendMessage('§c无法打开教程菜单，请联系管理。'); return false; }
}
function KOMUTECH_ZN_onUse(e) {
    const p = e.getPlayer();
    try { KOMUTECH_ZN_openMain(p); } catch (err) { p.sendMessage('§c无法打开教程菜单，请联系管理。'); }
    return false;
}
function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) { return KOMUTECH_ZN_onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode); }
function onUse(e) { KOMUTECH_ZN_onUse(e); }