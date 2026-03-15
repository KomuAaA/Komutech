const CATEGORIES = [
    { id: 'rumen', name: '§a✦ 入门篇', lore: '§e灵石获取与基础开采', icon: 'AMETHYST_CLUSTER', slot: 10 },
    { id: 'shenwu', name: '§b✦ 深悟篇', lore: '§e法则的获取与进阶', icon: 'ENDER_PEARL', slot: 11 },
    { id: 'dacheng', name: '§6✦ 大成篇', lore: '§e身外身的获取', icon: 'ENDER_EYE', slot: 12 },
    { id: 'lingzhi', name: '§2✦ 灵植篇', lore: '§e灵植种子种植方法', icon: 'BAMBOO', slot: 13 },
    { id: 'lingzhang', name: '§d✦ 灵杖篇', lore: '§e灵杖的使用方法', icon: 'BLAZE_ROD', slot: 14 },
    { id: 'juanzhou', name: '§5✦ 卷轴篇', lore: '§e卷轴的使用方法', icon: 'BOOK', slot: 15 }
];

const REWARD_CHANCE = {
    'KOMUTECH_L_LZ_YG': 30,
    'KOMUTECH_L_DJ_XPLS': 30,
    'KOMUTECH_L_GJ_印物笺': 1
};

const GENERATE_REWARD_CHANCE = 50;
const REWARD_SLOTS = [19,20,21,22,23,24,25,28,29,30,31,32,33,34,37,38,39,40,41,42,43];
const INFO_SLOT = 4;
const INFO_ITEM = {
    material: 'PAINTING', name: '§a§l口木科技教程说明',
    lore: ['§f点击上方分类查看教程', '§f点击下方随机奖励物品', '§f即可获得惊喜！']
};
const MAIN_TITLE = '§b§l✨ 口木科技教程 ✨';
const SUB_PRE = '§b§l✨ ';
const SUB_SUF = ' ✨';
const BORDER_SLOTS = [0,1,2,3,4,5,6,7,8,9,17,18,26,27,35,36,44,45,46,47,48,50,51,52,53];

const TIPS = {
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

const Bukkit = Java.type('org.bukkit.Bukkit');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const InventoryClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InventoryCloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Listener = Java.type('org.bukkit.event.Listener');

// 工具函数
function item(mat, name, lore) {
    const it = new ItemStack(Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function borderItem() { return item('PINK_STAINED_GLASS_PANE', '§d✨'); }
function applyBorder(inv) { const b = borderItem(); BORDER_SLOTS.forEach(s => inv.setItem(s, b.clone())); }

function giveRandomReward(p) {
    const rand = Math.random() * 100;
    let cum = 0;
    for (const [id, chance] of Object.entries(REWARD_CHANCE)) {
        cum += chance;
        if (rand < cum) {
            const sf = SlimefunItem.getById(id);
            if (sf) {
                const reward = sf.getItem().clone();
                p.getWorld().dropItemNaturally(p.getLocation(), reward);
                p.sendMessage('§a获得奖励: ' + (reward.getItemMeta().getDisplayName() || id));
            } else p.sendMessage('§c奖励无效');
            return;
        }
    }
    p.sendMessage('§f🎉倒霉🥚，你成功避开了奖励。');
}

function buildMainMenu() {
    const inv = Bukkit.createInventory(null, 54, MAIN_TITLE);
    applyBorder(inv);
    CATEGORIES.forEach(c => inv.setItem(c.slot, item(c.icon, c.name, [c.lore, '', '§a点击查看'])));
    inv.setItem(INFO_SLOT, item(INFO_ITEM.material, INFO_ITEM.name, INFO_ITEM.lore));
    if (Math.random() * 100 < GENERATE_REWARD_CHANCE) {
        const slot = REWARD_SLOTS[Math.floor(Math.random() * REWARD_SLOTS.length)];
        inv.setItem(slot, item('ENDER_CHEST', '§e✨ 神秘奖励 ✨', ['§7点击随机获得奖励']));
    }
    inv.setItem(49, item('BARRIER', '§c关闭', '§7关闭菜单'));
    return inv;
}

function catMenu(cid) {
    const cat = CATEGORIES.find(c => c.id === cid);
    if (!cat) return null;
    const tips = TIPS[cid];
    if (!tips || !tips.length) return null;
    const inv = Bukkit.createInventory(null, 54, SUB_PRE + cat.name + SUB_SUF);
    applyBorder(inv);
    inv.setItem(4, item('PAPER', '§6' + cat.name + '说明', ['§7点击条目查看详情', '§e共' + tips.length + '个知识点']));
    let slot = 10;
    tips.forEach(tip => {
        if (slot > 43) return;
        inv.setItem(slot, item(tip.icon || 'PAPER', tip.name, tip.lore));
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
    if (plugin.komutech_gj_znui) {
        InventoryClickEvent.getHandlerList().unregister(plugin.komutech_gj_znui);
        InventoryCloseEvent.getHandlerList().unregister(plugin.komutech_gj_znui);
        plugin.komutech_gj_znui = null;
    }
    const L = Java.extend(Listener, {});
    const listener = new L();

    Bukkit.getPluginManager().registerEvent(InventoryClickEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getWhoClicked();
            if (!openPlayers.contains(p)) return;
            const title = e.getInventory().getTitle();
            if (title !== MAIN_TITLE && !title.startsWith(SUB_PRE)) return;
            e.setCancelled(true);
            const inv = e.getInventory();
            const slot = e.getSlot();
            const it = e.getCurrentItem();
            if (!it || it.getType() === Material.AIR) return;

            if (title === MAIN_TITLE) {
                const cat = CATEGORIES.find(c => c.slot === slot && it.getItemMeta().getDisplayName() === c.name);
                if (cat) { openCat(p, cat.id); return; }
                const disp = it.getItemMeta().getDisplayName();
                if (disp === '§e✨ 神秘奖励 ✨') { giveRandomReward(p); inv.setItem(slot, null); return; }
                if (slot === 49 && disp === '§c关闭') { p.closeInventory(); return; }
            } else {
                if (slot === 49 && it.getItemMeta().getDisplayName() === '§a返回') openMain(p);
            }
        } catch (err) {}
    }, plugin);

    Bukkit.getPluginManager().registerEvent(InventoryCloseEvent, listener, EventPriority.NORMAL, (l, e) => {
        try {
            const p = e.getPlayer();
            openPlayers.remove(p);
            if (openPlayers.isEmpty()) {
                InventoryClickEvent.getHandlerList().unregister(listener);
                InventoryCloseEvent.getHandlerList().unregister(listener);
                plugin.komutech_gj_znui = null;
                registered = false;
            }
        } catch (err) {}
    }, plugin);

    plugin.komutech_gj_znui = listener;
    registered = true;
}

function openMenu(p, inv) {
    p.openInventory(inv);
    openPlayers.add(p);
    ensureListener();
}
function openMain(p) { openMenu(p, buildMainMenu()); }
function openCat(p, id) {
    const menu = catMenu(id);
    menu ? openMenu(p, menu) : p.sendMessage('§c该分类暂无内容。');
}

function onButtonGroupClick(player, slot, clickedItem, clickAction, guideMode) {
    try { openMain(player); return true; } catch (err) { player.sendMessage('§c无法打开教程菜单，请联系管理。'); return false; }
}

function onUse(e) {
    const p = e.getPlayer();
    try { openMain(p); } catch (err) { p.sendMessage('§c无法打开教程菜单，请联系管理。'); }
    return false;
}