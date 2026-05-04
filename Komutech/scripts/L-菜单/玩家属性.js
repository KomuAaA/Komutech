const Bukkit = Java.type('org.bukkit.Bukkit');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const InventoryClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InventoryCloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const Listener = Java.type('org.bukkit.event.Listener');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const Consumer = Java.type('java.util.function.Consumer');
const Attribute = Java.type('org.bukkit.attribute.Attribute');
const AttributeModifier = Java.type('org.bukkit.attribute.AttributeModifier');
const Operation = Java.type('org.bukkit.attribute.AttributeModifier.Operation');
const UUID = Java.type('java.util.UUID');
const DATA_DIR_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const PVP_LIST_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json';
const TITLE_PLAYER = '§a§l玩家属性 - 个人模式';
const TITLE_ADMIN_LIST = '§c§l玩家属性 - 管理员模式';
const TITLE_ADMIN_VIEW = '§d§l玩家属性详情 - ';
const SLOT = {
    MODE: 8, HEAD: 4, CLOSE: 49, BACK: 48, PREV: 48, NEXT: 50, CONFIRM: 53, LINGGEN_ATTR: 40, SHAQI: 12,
    GLOBAL_TOGGLE: 51, ATTR_POINTS: 6, WUXING: 15, GENGU: 16, SPEED: 32, SPIRIT_SENSE: 33, LINGLI: 31,
    HP: 23, ATTACK: 24, DEFENSE: 25, SPIRIT: 22, CULTIVATION: 13, PLAYER_COUNT: 6, NO_DATA: 22,
    FOUNDATION: 14, PVP: 0
};
const BORDER_SLOTS = [0,1,2,3,5,7,9,17,18,26,27,35,36,44,45,46,47,52];
const QUALITY_SLOTS = {20:'金',28:'木',30:'水',37:'火',39:'土',29:'雷',19:'风',21:'冰',11:'光',38:'暗'};
const VALID_LINGGEN = Object.values(QUALITY_SLOTS);
const KOMUTECH_WJSX_ATTR_SLOTS = {
    10:'功德',[SLOT.SHAQI]:'煞气',[SLOT.FOUNDATION]:'根基',[SLOT.WUXING]:'悟性',[SLOT.GENGU]:'根骨',[SLOT.LINGLI]:'灵力',
    [SLOT.HP]:'血量',[SLOT.ATTACK]:'攻击力',[SLOT.DEFENSE]:'防御力',[SLOT.SPEED]:'速度',[SLOT.SPIRIT_SENSE]:'灵识',
    [SLOT.ATTR_POINTS]:'属性点',[SLOT.SPIRIT]:'灵气',[SLOT.CULTIVATION]:'修为',[SLOT.LINGGEN_ATTR]:'灵根属性'
};
const KOMUTECH_WJSX_UPGRADE_ATTRS = {[SLOT.HP]:'血量',[SLOT.ATTACK]:'攻击力',[SLOT.DEFENSE]:'防御力',[SLOT.SPEED]:'速度'};
const KOMUTECH_WJSX_SWITCHABLE_ATTRS = ['血量','攻击力','防御力','速度','灵识'];
const KOMUTECH_WJSX_LINGGEN_BONUS = {
    '金':{'血量':0.8,'攻击力':1.2,'防御力':1.0,'速度':0.5,'灵识':0.8,'灵力':1.0},
    '木':{'血量':1.2,'攻击力':0.8,'防御力':1.0,'速度':0.8,'灵识':1.2,'灵力':1.2},
    '水':{'血量':1.0,'攻击力':0.9,'防御力':0.8,'速度':0.8,'灵识':1.0,'灵力':1.5},
    '火':{'血量':1.0,'攻击力':1.0,'防御力':0.8,'速度':0.8,'灵识':0.8,'灵力':0.8},
    '土':{'血量':1.0,'攻击力':0.8,'防御力':1.2,'速度':0.5,'灵识':0.9,'灵力':0.9},
    '雷':{'血量':1.2,'攻击力':1.8,'防御力':1.0,'速度':1.5,'灵识':1.5,'灵力':1.5},
    '风':{'血量':1.0,'攻击力':1.2,'防御力':0.8,'速度':1.8,'灵识':1.0,'灵力':1.3},
    '冰':{'血量':1.2,'攻击力':1.5,'防御力':1.0,'速度':1.2,'灵识':1.2,'灵力':1.4},
    '光':{'血量':1.3,'攻击力':1.5,'防御力':1.1,'速度':1.5,'灵识':1.5,'灵力':1.5},
    '暗':{'血量':1.1,'攻击力':1.3,'防御力':1.4,'速度':1.2,'灵识':1.5,'灵力':1.3}
};
const KOMUTECH_WJSX_DECAY_FACTOR = {1:1.0,2:0.8,3:0.5,4:0.3,5:0.1};
const KOMUTECH_WJSX_REALM_BONUS = [
    [0.10,0.13,0.16,0.19,0.22,0.25,0.28,0.31,0.34],[0.50,0.55,0.60,0.65,0.70,0.75,0.80,0.85,0.90],
    [1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00],[2.50,2.70,2.90,3.10,3.30,3.50,3.70,3.90,4.10],
    [4.50,4.80,5.10,5.40,5.70,6.00,6.30,6.60,6.90],[7.50,8.00,8.50,9.00,9.50,10.00,10.50,11.00,11.50],
    [12.50,13.50,14.50,15.50,16.50,17.50,18.50,19.50,20.50],[22.00,23.50,25.00,26.50,28.00,29.50,31.00,32.50,34.00],
    [36.00,38.00,40.00,42.00,44.00,46.00,48.00,50.00,52.00]
];
const KOMUTECH_WJSX_ATTR_META = {
    '血量':{uuid:'10110305-1003-1204-0823-141408280000',names:['GENERIC_MAX_HEALTH','MAX_HEALTH'],mat:'APPLE',name:'§c血量'},
    '攻击力':{uuid:'10110305-1003-1204-0823-092412040000',names:['GENERIC_ATTACK_DAMAGE','ATTACK_DAMAGE'],mat:'IRON_SWORD',name:'§c攻击力'},
    '防御力':{uuid:'10110305-1003-1204-0823-042100060000',names:['GENERIC_ARMOR','ARMOR'],mat:'IRON_CHESTPLATE',name:'§c防御力'},
    '速度':{uuid:'10110305-1003-1204-0823-210505050000',names:['GENERIC_MOVEMENT_SPEED','MOVEMENT_SPEED'],mat:'FEATHER',name:'§f速度'},
    '灵识':{uuid:['10110305-1003-1204-0823-082317040001','10110305-1003-1204-0823-082317040002'],names:['BLOCK_INTERACTION_RANGE','ENTITY_INTERACTION_RANGE'],mat:'ENDER_EYE',name:'§d灵识'},
    '功德':{mat:'GOLD_NUGGET',name:'§6功德'},'煞气':{mat:'GHAST_TEAR',name:'§6煞气'},'根基':{mat:'BEDROCK',name:'§6根基'},
    '悟性':{mat:'ENCHANTED_BOOK',name:'§6悟性'},'根骨':{mat:'BONE',name:'§6根骨'},'灵力':{mat:'GHAST_TEAR',name:'§6灵力'},
    '属性点':{mat:'NETHER_STAR',name:'§e属性点'},'灵根':{mat:'NETHER_STAR',name:'§6灵根'},'灵气':{mat:'EXPERIENCE_BOTTLE',name:'§6灵气'},
    '修为':{mat:'PAINTING',name:'§6修为'},'灵根属性':{mat:'NETHER_STAR',name:'§6灵根属性'}
};
const KOMUTECH_WJSX_MUTATED_COLORS = {'雷':true,'风':true,'冰':true,'光':true,'暗':true};
const KOMUTECH_WJSX_MAX_REACH_BONUS = 5.0;
let KOMUTECH_WJSX_ADMIN_PASSWORD = '0108';
let KOMUTECH_WJSX_BASE_GROWTH = {'血量':3,'攻击力':1,'防御力':1,'速度':0.1,'灵识':0.01,'灵力':0.1};
(function loadConfig() {
    try {
        const config = getAddonConfig();
        if (config) {
            KOMUTECH_WJSX_ADMIN_PASSWORD = config.getString('KOMUTECH_WJSX_MM', '0108');
            const growthSec = config.getConfigurationSection('KOMUTECH_WJSX_SXCZZ');
            if (growthSec) {
                KOMUTECH_WJSX_BASE_GROWTH = {
                    '血量': growthSec.getDouble('血量', 3), '攻击力': growthSec.getDouble('攻击力', 1),
                    '防御力': growthSec.getDouble('防御力', 1), '速度': growthSec.getDouble('速度', 0.1),
                    '灵识': growthSec.getDouble('灵识', 0.01), '灵力': growthSec.getDouble('灵力', 0.1)
                };
            }
        }
    } catch (e) { print('[玩家属性] 读取配置失败，使用默认值: ' + e); }
})();
function savePlayerData(playerName, data) {
    let path = Paths.get(DATA_DIR_PATH, '[' + playerName + '].json');
    try {
        let parent = path.getParent();
        if (!Files.exists(parent)) Files.createDirectories(parent);
        Files.writeString(path, JSON.stringify(data, null, 2), StandardCharsets.UTF_8);
        return true;
    } catch (e) { return false; }
}
function loadPlayerData(playerName) {
    let path = Paths.get(DATA_DIR_PATH, '[' + playerName + '].json');
    if (!Files.exists(path)) return null;
    try { return JSON.parse(Files.readString(path, StandardCharsets.UTF_8)); } catch (e) { return null; }
}
function loadPvpList() {
    try {
        const path = Paths.get(PVP_LIST_PATH);
        if (!Files.exists(path)) return [];
        const data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        return Array.isArray(data) ? data : Object.keys(data);
    } catch (e) { return []; }
}
function savePvpList(list) {
    try {
        const path = Paths.get(PVP_LIST_PATH);
        if (!Files.exists(path.getParent())) Files.createDirectories(path.getParent());
        Files.writeString(path, JSON.stringify(list, null, 2), StandardCharsets.UTF_8);
        return true;
    } catch (e) { return false; }
}
function getPvpStatus(playerName) {
    const list = loadPvpList();
    return !list.includes(playerName);
}
function setPvpStatus(playerName, enabled) {
    let list = loadPvpList();
    if (enabled) {
        list = list.filter(n => n !== playerName);
    } else {
        if (!list.includes(playerName)) list.push(playerName);
    }
    savePvpList(list);
}
function KOMUTECH_WJSX_log(msg) { print('[玩家属性] ' + msg); }
function KOMUTECH_WJSX_isAdmin(p) { return p.isOp() || p.getName() === 'Komu_A'; }
function KOMUTECH_WJSX_createItem(mat, name, lore) {
    const it = new ItemStack(Material.getMaterial(mat));
    const meta = it.getItemMeta();
    meta.setDisplayName(name);
    if (lore) meta.setLore(Array.isArray(lore) ? lore : [lore]);
    it.setItemMeta(meta);
    return it;
}
function KOMUTECH_WJSX_createInventory(title) {
    const inv = plugin.getServer().createInventory(null, 54, title);
    KOMUTECH_WJSX_applyBorder(inv);
    return inv;
}
function KOMUTECH_WJSX_applyBorder(inv) {
    const border = KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null);
    BORDER_SLOTS.forEach(s => inv.setItem(s, border.clone()));
}
function KOMUTECH_WJSX_parseLingli(data) {
    let raw = data.灵力;
    if (typeof raw !== 'string') raw = '100/100+0';
    const match = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(?:\+\s*(-?\d+(?:\.\d+)?))?$/);
    if (!match) {
        const oldMatch = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
        if (oldMatch) return {current: parseInt(oldMatch[1]), baseMax: parseInt(oldMatch[2]), bonus: 0, totalMax: parseInt(oldMatch[2])};
        return {current: 100, baseMax: 100, bonus: 0, totalMax: 100};
    }
    const cur = parseInt(match[1]), base = parseInt(match[2]), bonus = match[3] ? parseInt(match[3]) : 0;
    return {current: cur, baseMax: base, bonus: bonus, totalMax: base + bonus};
}
function KOMUTECH_WJSX_computeBaseMaxLingli(data) {
    const els = (data.灵根 || '').split('、').filter(e => e);
    const q = parseFloat(data.总品质) || 0.01;
    const lc = KOMUTECH_WJSX_getLinggenFinalCoefficient(els, q, '灵力');
    const info = KOMUTECH_WJSX_getCultivationInfo(data.灵气 || '0');
    const decay = KOMUTECH_WJSX_DECAY_FACTOR[els.length] || 0.1;
    const gengu = data.根骨 || 1;
    return Math.floor(info.spiritCap * lc * decay * q * (KOMUTECH_WJSX_BASE_GROWTH['灵力'] || 0.1) * (gengu / 10)) + 100;
}
function KOMUTECH_WJSX_ensureLingliFormat(data) {
    if ((data.灵力 || '').includes('+')) return;
    const match = (data.灵力 || '').match(/^(\d+)\/(\d+)$/);
    if (match) data.灵力 = match[1] + '/' + match[2] + '+0';
    else { const base = KOMUTECH_WJSX_computeBaseMaxLingli(data); data.灵力 = base + '/' + base + '+0'; }
}
function KOMUTECH_WJSX_ensureDataFileComplete(playerName, data) {
    let modified = false;
    KOMUTECH_WJSX_SWITCHABLE_ATTRS.forEach(attr => {
        if (data[attr + '_启用'] === undefined) { data[attr + '_启用'] = true; modified = true; }
        if (data[attr + '_实际'] === undefined) { data[attr + '_实际'] = 0.0; modified = true; }
    });
    if (data.属性点 === undefined) { data.属性点 = 5; modified = true; }
    if (data.攻击力 === undefined) { data.攻击力 = 0; modified = true; }
    if (!data.灵力 || !data.灵力.includes('+')) { KOMUTECH_WJSX_ensureLingliFormat(data); modified = true; }
    if (modified) savePlayerData(playerName, data);
}
function KOMUTECH_WJSX_getRealmCoefficient(data) {
    const s = data.灵气; if (!s) return 0;
    const m = s.match(/^(\d+)\//); if (!m) return 0;
    const v = parseInt(m[1]); if (v < 100) return 0;
    if (v >= 100000000000) return 18 + Math.floor((v - 100000000000) / 100000000000) * 2;
    const rb = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
    let idx = 0; for (let i = 0; i < rb.length; i++) if (v < rb[i]) { idx = i - 1; break; }
    if (idx === -1) idx = 0; if (v >= 1000000000) idx = 7;
    const base = rb[idx], range = idx === 7 ? 90000000000 : rb[idx + 1] - base;
    const step = Math.floor(range / 9), rank = Math.floor((v - base) / step);
    return KOMUTECH_WJSX_REALM_BONUS[idx][rank];
}
function KOMUTECH_WJSX_computeLinggenAttr(els, q) {
    const c = els.length;
    const mutatedCount = els.filter(e => KOMUTECH_WJSX_MUTATED_COLORS[e]).length;
    if (c === 1) {
        const e = els[0];
        if (KOMUTECH_WJSX_MUTATED_COLORS[e]) return '变异灵根';
        if (q > 0.9) return '天灵根';
        return '单灵根';
    }
    if (c >= 5) return '杂灵根';
    if (c > 1 && mutatedCount > 0) return '变异多灵根';
    if (c === 4) return '四灵根';
    if (c === 3) return '三灵根';
    if (c === 2) return '双灵根';
    return '未知';
}
function KOMUTECH_WJSX_calculateCoefficients(els, q) {
    const coeffs = {'血量':0,'攻击力':0,'防御力':0,'速度':0,'灵识':0,'灵力':0};
    if (!els.length) return coeffs;
    const c = els.length, decay = KOMUTECH_WJSX_DECAY_FACTOR[c] || 0.1, sum = {'血量':0,'攻击力':0,'防御力':0,'速度':0,'灵识':0,'灵力':0};
    for (let e of els) { const b = KOMUTECH_WJSX_LINGGEN_BONUS[e] || {}; for (let a in sum) sum[a] += b[a] || 0; }
    for (let a in coeffs) coeffs[a] = (sum[a] / c) * q * decay;
    return coeffs;
}
function KOMUTECH_WJSX_getLinggenFinalCoefficient(els, q, attr) {
    const baseCoeff = KOMUTECH_WJSX_calculateCoefficients(els, q)[attr] || 0;
    const attrType = KOMUTECH_WJSX_computeLinggenAttr(els, q);
    let extraMultiplier = 1.0;
    switch (attrType) {
        case '杂灵根': extraMultiplier = 0.1; break; case '四灵根': extraMultiplier = 0.3; break; case '三灵根': extraMultiplier = 0.5; break;
        case '双灵根': extraMultiplier = 0.8; break; case '单灵根': extraMultiplier = 1.0; break; case '天灵根': extraMultiplier = 1.2; break;
        case '变异灵根': extraMultiplier = 1.3; break; case '变异多灵根': extraMultiplier = 1.0; break; case '混沌灵根': extraMultiplier = 1.0; break;
        default: extraMultiplier = 1.0;
    }
    return (1.0 + baseCoeff) * extraMultiplier;
}
function KOMUTECH_WJSX_computeActualValue(pts, base, lc, rc, q, gengu) {
    const raw = pts * base * (lc + rc) * q * (gengu / 10);
    return Math.max(0.0, Math.round(raw * 100) / 100);
}
function KOMUTECH_WJSX_isGoldenCoreRealm(data) { const s = data.灵气; if (!s) return false; const m = s.match(/^(\d+)\//); return m ? parseInt(m[1]) >= 10000 : false; }
function KOMUTECH_WJSX_areAllEnabled(data) { return KOMUTECH_WJSX_SWITCHABLE_ATTRS.every(a => data[a + '_启用'] !== false); }
function KOMUTECH_WJSX_toggleAllAttributes(p, data) { const ns = !KOMUTECH_WJSX_areAllEnabled(data); KOMUTECH_WJSX_SWITCHABLE_ATTRS.forEach(a => data[a + '_启用'] = ns); p.sendMessage('§a所有战斗属性已' + (ns ? '启用' : '禁用')); }
function KOMUTECH_WJSX_getAttributeInstance(attr) { for (let n of KOMUTECH_WJSX_ATTR_META[attr]?.names || []) { try { return Attribute.valueOf(n); } catch (e) {} } return null; }
function KOMUTECH_WJSX_removeAttributeModifier(p, attr) {
    const m = KOMUTECH_WJSX_ATTR_META[attr]; if (!m) return;
    if (attr === '灵识') {
        m.names.forEach((n, i) => { try {
            const inst = p.getAttribute(Attribute.valueOf(n)); if (!inst) return;
            const old = inst.getModifier(UUID.fromString(m.uuid[i])); if (old) inst.removeModifier(old);
        } catch (e) {} });
        return;
    }
    const inst = p.getAttribute(KOMUTECH_WJSX_getAttributeInstance(attr)); if (!inst) return;
    const old = inst.getModifier(UUID.fromString(m.uuid)); if (old) inst.removeModifier(old);
}
function KOMUTECH_WJSX_applyAttribute(p, attr, val, en) {
    if (!en) { KOMUTECH_WJSX_removeAttributeModifier(p, attr); return; }
    const m = KOMUTECH_WJSX_ATTR_META[attr]; if (!m) return;
    if (attr === '灵识') {
        const c = Math.min(val, KOMUTECH_WJSX_MAX_REACH_BONUS);
        m.names.forEach((n, i) => { try {
            const inst = p.getAttribute(Attribute.valueOf(n)); if (!inst) return;
            const u = UUID.fromString(m.uuid[i]); const old = inst.getModifier(u); if (old) inst.removeModifier(old);
            if (c > 0) inst.addModifier(new AttributeModifier(u, m.uuid[i], c, Operation.ADD_NUMBER));
        } catch (e) {} });
        return;
    }
    const inst = p.getAttribute(KOMUTECH_WJSX_getAttributeInstance(attr)); if (!inst) return;
    let fv = val, op = Operation.ADD_NUMBER;
    if (attr === '速度') { if (fv > 200.0) fv = 200.0; op = Operation.MULTIPLY_SCALAR_1; fv /= 100.0; }
    const u = UUID.fromString(m.uuid), old = inst.getModifier(u); if (old) inst.removeModifier(old);
    if (fv !== 0) inst.addModifier(new AttributeModifier(u, m.uuid, fv, op));
}
function KOMUTECH_WJSX_applyPlayerAttributes(p, data) {
    const els = (data.灵根 || '').split('、').filter(e => e);
    const q = parseFloat(data.总品质) || 0.01;
    const rc = KOMUTECH_WJSX_getRealmCoefficient(data);
    const gengu = data.根骨 || 1;
    KOMUTECH_WJSX_SWITCHABLE_ATTRS.forEach(attr => {
        const lc = KOMUTECH_WJSX_getLinggenFinalCoefficient(els, q, attr);
        let pts = data[attr] || 0;
        const val = pts === 0 ? 0 : KOMUTECH_WJSX_computeActualValue(pts, KOMUTECH_WJSX_BASE_GROWTH[attr] || 0, lc, rc, q, gengu);
        data[attr + '_实际'] = val;
        KOMUTECH_WJSX_applyAttribute(p, attr, val, data[attr + '_启用'] !== false);
    });
}
function KOMUTECH_WJSX_getActualBonusDisplay(data, attr) {
    if (!data.灵根 || !data.总品质) return '§7实际增加: §c未知';
    const els = (data.灵根 || '').split('、').filter(e => e);
    const q = parseFloat(data.总品质) || 0.01, rc = KOMUTECH_WJSX_getRealmCoefficient(data);
    const lc = KOMUTECH_WJSX_getLinggenFinalCoefficient(els, q, attr);
    let pts = data[attr] || 0;
    const gengu = data.根骨 || 1;
    if (pts === 0) {
        if (attr === '速度') return '§7实际增加: §a+0.00%';
        if (attr === '灵识') return '§7实际增加: §a+0.00 格';
        return `§7实际增加: §a0.00 ${attr}`;
    }
    const val = KOMUTECH_WJSX_computeActualValue(pts, KOMUTECH_WJSX_BASE_GROWTH[attr] || 0, lc, rc, q, gengu);
    if (attr === '速度') return val >= 200.0 ? '§7实际增加: §a+200.00% §7(已达上限)' : `§7实际增加: §a+${val.toFixed(2)}%`;
    if (attr === '灵识') { const c = Math.min(val, KOMUTECH_WJSX_MAX_REACH_BONUS); return val >= KOMUTECH_WJSX_MAX_REACH_BONUS ? `§7实际增加: §a+${c.toFixed(2)} 格 §7(已达上限)` : `§7实际增加: §a+${val.toFixed(2)} 格`; }
    return `§7实际增加: §a+${val.toFixed(2)} ${attr}`;
}
function KOMUTECH_WJSX_renderAttributes(inv, data, isAdm) {
    const suf = isAdm ? '§a右键修改' : null;
    for (let s in KOMUTECH_WJSX_ATTR_SLOTS) {
        const k = KOMUTECH_WJSX_ATTR_SLOTS[s];
        if (k === '根基' && !data.根基) continue;
        if (data[k] === undefined && k !== '根基') continue;
        if (k === '灵识' && !KOMUTECH_WJSX_isGoldenCoreRealm(data)) continue;
        const lore = [];
        if (k === '灵力') {
            const ling = KOMUTECH_WJSX_parseLingli(data);
            lore.push(`§7当前/最大: §f${ling.current}/${ling.totalMax}`, `§7额外加成: §a${ling.bonus >= 0 ? '+' + ling.bonus : ling.bonus}`);
            if (isAdm) lore.push('§a右键修改额外加成');
        } else if (k === '根基') {
            const foundation = data.根基;
            lore.push(`§7稳固值: §f${foundation.稳固值}`, `§7溢出的灵气: §f${foundation['溢出的灵气']}`);
            if (isAdm) lore.push('§a右键修改溢出灵气');
        } else {
            lore.push(`§7${data[k]}`);
            if (KOMUTECH_WJSX_SWITCHABLE_ATTRS.includes(k)) {
                lore.push(KOMUTECH_WJSX_getActualBonusDisplay(data, k), data[k + '_启用'] !== false ? '§a● 已启用' : '§c○ 已禁用');
                if (!isAdm) lore.push('§7§oShift+左键切换状态');
            }
            if (k === '属性点' && !isAdm) lore.push('§a左键 +1点  §c右键 -1点');
            if (suf && k !== '修为') lore.push(suf);
        }
        const m = KOMUTECH_WJSX_ATTR_META[k] || {};
        inv.setItem(parseInt(s), KOMUTECH_WJSX_createItem(m.mat || 'PAPER', m.name || k, lore));
    }
}
function KOMUTECH_WJSX_applyLinggenQualities(inv, data, isAdm) {
    const sec = data.灵根品质; if (!sec) return;
    const suf = isAdm ? '§a右键修改' : null;
    const linggenMat = {'金':'YELLOW_DYE','木':'GREEN_DYE','水':'BLUE_DYE','火':'BLAZE_POWDER','土':'BROWN_DYE','雷':'PURPLE_DYE','风':'WIND_CHARGE','冰':'LIGHT_BLUE_DYE','光':'WHITE_DYE','暗':'BLACK_DYE'};
    for (let s in QUALITY_SLOTS) { const el = QUALITY_SLOTS[s]; if (sec[el] === undefined) continue; const lore = [`§7品质: §f${sec[el]}`]; if (suf) lore.push(suf); inv.setItem(parseInt(s), KOMUTECH_WJSX_createItem(linggenMat[el] || 'PAPER', `§e${el}`, lore)); }
}
function KOMUTECH_WJSX_buildPlayerMenu(p, tmp) {
    const inv = KOMUTECH_WJSX_createInventory(TITLE_PLAYER);
    inv.setItem(SLOT.HEAD, KOMUTECH_WJSX_createItem('PLAYER_HEAD', `§6${p.getName()}`, ['§7当前玩家']));
    inv.setItem(SLOT.MODE, KOMUTECH_WJSX_createItem('COMPASS', '§a管理员模式', ['§7点击切换']));
    inv.setItem(SLOT.CLOSE, KOMUTECH_WJSX_createItem('BARRIER', '§c关闭', []));
    inv.setItem(SLOT.CONFIRM, KOMUTECH_WJSX_createItem('LIME_STAINED_GLASS_PANE', '§a确认加点', ['§7点击保存并应用属性']));
    inv.setItem(48, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(50, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    const data = tmp || loadPlayerData(p.getName());
    if (!data) { inv.setItem(SLOT.NO_DATA, KOMUTECH_WJSX_createItem('PAPER', '§c无玩家属性数据', ['§7你还没有进行过灵根鉴定'])); return {inv}; }
    if (data.修为) inv.setItem(SLOT.CULTIVATION, KOMUTECH_WJSX_createItem('PAINTING', '§6修为', [`§7${data.修为}`]));
    if (data.灵气) inv.setItem(SLOT.SPIRIT, KOMUTECH_WJSX_createItem('EXPERIENCE_BOTTLE', '§6灵气', [`§7${data.灵气}`]));
    KOMUTECH_WJSX_renderAttributes(inv, data, false);
    const lg = data.灵根;
    if (lg) inv.setItem(SLOT.LINGGEN_ATTR, KOMUTECH_WJSX_createItem('NETHER_STAR', '§6灵根属性', [`§7灵根: §e${lg}`, `§7属性: §e${data.灵根属性 || '未知'}`, `§7总品质: §e${data.总品质 || '0.00'}`]));
    KOMUTECH_WJSX_applyLinggenQualities(inv, data, false);
    const ae = KOMUTECH_WJSX_areAllEnabled(data);
    inv.setItem(SLOT.GLOBAL_TOGGLE, KOMUTECH_WJSX_createItem('LEVER', ae ? '§a全局启用中' : '§c全局禁用中', ['§7点击一键切换所有属性启用/禁用']));
    const pvpEnabled = getPvpStatus(p.getName());
    inv.setItem(SLOT.PVP, KOMUTECH_WJSX_createItem(pvpEnabled ? 'GREEN_DYE' : 'GRAY_DYE', pvpEnabled ? '§a§lPVP 已开启' : '§7§lPVP 已关闭', [
        '§7当前状态: ' + (pvpEnabled ? '§a允许对其他玩家造成伤害' : '§c禁止对其他玩家造成伤害'),
        '§7点击切换'
    ]));
    return {inv};
}
function KOMUTECH_WJSX_buildAdminList(page) {
    const dir = Paths.get(DATA_DIR_PATH);
    const files = Files.exists(dir) ? dir.toFile().listFiles().filter(f => f.getName().startsWith('[') && f.getName().endsWith('.json')) : [];
    const availableSlots = [10,11,12,13,14,15,16,19,20,21,22,23,24,25,28,29,30,31,32,33,34,37,38,39,40,41,42,43];
    const perPage = availableSlots.length;
    const total = Math.max(1, Math.ceil(files.length / perPage));
    const pFiles = files.slice((page - 1) * perPage, page * perPage);
    const inv = KOMUTECH_WJSX_createInventory(TITLE_ADMIN_LIST);
    inv.setItem(SLOT.PVP, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(SLOT.GLOBAL_TOGGLE, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(SLOT.CONFIRM, KOMUTECH_WJSX_createItem('TNT', '§c§l清除所有玩家数据', ['§7点击后需输入密码']));
    inv.setItem(SLOT.HEAD, KOMUTECH_WJSX_createItem('COMPASS', '§6管理员模式', ['§7当前为管理员模式']));
    inv.setItem(SLOT.PLAYER_COUNT, KOMUTECH_WJSX_createItem('PAPER', `§e总玩家数: ${files.length}`, []));
    inv.setItem(SLOT.MODE, KOMUTECH_WJSX_createItem('COMPASS', '§a个人模式', ['§7点击切换']));
    inv.setItem(SLOT.CLOSE, KOMUTECH_WJSX_createItem('BARRIER', '§c关闭', []));
    inv.setItem(SLOT.PREV, page > 1 ? KOMUTECH_WJSX_createItem('ARROW', '§a上一页', []) : KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(SLOT.NEXT, page < total ? KOMUTECH_WJSX_createItem('ARROW', '§a下一页', []) : KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    const slotMap = new java.util.HashMap();
    for (let i = 0; i < pFiles.length; i++) {
        const pn = pFiles[i].getName().replace(/^\[|\]\.json$/g, '');
        const slot = availableSlots[i];
        inv.setItem(slot, KOMUTECH_WJSX_createItem('PLAYER_HEAD', `§e${pn}`, ['§7左键查看', '§7Shift+右键删除']));
        slotMap.put(slot, pn);
    }
    return {inv, page, total, slotMap};
}
function KOMUTECH_WJSX_buildAdminView(pn, tmp) {
    const data = tmp || loadPlayerData(pn);
    const inv = KOMUTECH_WJSX_createInventory(TITLE_ADMIN_VIEW + pn);
    inv.setItem(SLOT.PVP, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(SLOT.GLOBAL_TOGGLE, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(SLOT.CONFIRM, KOMUTECH_WJSX_createItem('LIME_STAINED_GLASS_PANE', '§a确认修改', ['§7点击保存修改']));
    inv.setItem(SLOT.HEAD, KOMUTECH_WJSX_createItem('PLAYER_HEAD', `§6${pn}`, []));
    inv.setItem(SLOT.MODE, KOMUTECH_WJSX_createItem('COMPASS', '§a个人模式', ['§7返回个人属性']));
    inv.setItem(SLOT.BACK, KOMUTECH_WJSX_createItem('ARROW', '§a返回', ['§7返回玩家列表']));
    inv.setItem(SLOT.CLOSE, KOMUTECH_WJSX_createItem('BARRIER', '§c关闭', []));
    inv.setItem(48, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    inv.setItem(50, KOMUTECH_WJSX_createItem('WHITE_STAINED_GLASS_PANE', ' ', null));
    if (!data) { inv.setItem(SLOT.NO_DATA, KOMUTECH_WJSX_createItem('PAPER', '§c无玩家属性数据', [])); return {inv, playerName: pn}; }
    if (data.修为) inv.setItem(SLOT.CULTIVATION, KOMUTECH_WJSX_createItem('PAINTING', '§6修为', [`§7${data.修为}`]));
    if (data.灵气) inv.setItem(SLOT.SPIRIT, KOMUTECH_WJSX_createItem('EXPERIENCE_BOTTLE', '§6灵气', [`§7${data.灵气}`, '§a右键修改']));
    KOMUTECH_WJSX_renderAttributes(inv, data, true);
    const lg = data.灵根;
    if (lg) inv.setItem(SLOT.LINGGEN_ATTR, KOMUTECH_WJSX_createItem('NETHER_STAR', '§6灵根属性', [`§7灵根: §e${lg}`, `§7属性: §e${data.灵根属性 || '未知'}`, `§7总品质: §e${data.总品质 || '0.00'}`, '§a右键修改灵根']));
    KOMUTECH_WJSX_applyLinggenQualities(inv, data, true);
    return {inv, playerName: pn, data};
}
let KOMUTECH_WJSX_openPlayers = new java.util.HashMap(), KOMUTECH_WJSX_awaiting = new java.util.HashMap(), KOMUTECH_WJSX_listener = null;
function KOMUTECH_WJSX_unregisterListener() { if (KOMUTECH_WJSX_listener) { try { InventoryClickEvent.getHandlerList().unregister(KOMUTECH_WJSX_listener); } catch (e) {} try { InventoryCloseEvent.getHandlerList().unregister(KOMUTECH_WJSX_listener); } catch (e) {} KOMUTECH_WJSX_listener = null; } }
function KOMUTECH_WJSX_clearPlayerAttributes(player) { KOMUTECH_WJSX_SWITCHABLE_ATTRS.forEach(attr => KOMUTECH_WJSX_removeAttributeModifier(player, attr)); }
function handlePlayerMenuClick(p, slot, e, st) {
    if (slot === SLOT.PVP) {
        const current = getPvpStatus(p.getName());
        setPvpStatus(p.getName(), !current);
        const newState = !current;
        p.sendMessage(newState ? '§aPVP 已开启，现在可以对其他开启PVP的玩家造成伤害' : '§cPVP 已关闭，你将无法对其他玩家造成伤害');
        KOMUTECH_WJSX_openPlayer(p);
        return true;
    }
    if (slot === SLOT.GLOBAL_TOGGLE && e.isLeftClick() && !e.isShiftClick() && st.tempData) { KOMUTECH_WJSX_toggleAllAttributes(p, st.tempData); KOMUTECH_WJSX_openPlayerWithTemp(p, st.tempData); return true; }
    if (e.isShiftClick() && e.isLeftClick()) { const k = KOMUTECH_WJSX_ATTR_SLOTS[slot]; if (k && KOMUTECH_WJSX_SWITCHABLE_ATTRS.includes(k) && st.tempData) { const ep = k + '_启用', cur = st.tempData[ep] !== false; st.tempData[ep] = !cur; p.sendMessage('§a' + k + ' 已' + (!cur ? '启用' : '禁用')); KOMUTECH_WJSX_openPlayerWithTemp(p, st.tempData); return true; } }
    if (slot === SLOT.MODE) { KOMUTECH_WJSX_openAdminList(p, 1); return true; }
    if (slot === SLOT.CLOSE) { p.closeInventory(); return true; }
    if (slot === SLOT.CONFIRM && st.originalData && st.tempData) { KOMUTECH_WJSX_applyPlayerAttributes(p, st.tempData); savePlayerData(p.getName(), st.tempData); p.sendMessage('§a加点已保存并应用！'); KOMUTECH_WJSX_openPlayer(p); return true; }
    if (KOMUTECH_WJSX_UPGRADE_ATTRS.hasOwnProperty(slot) && st.originalData && st.tempData) { const k = KOMUTECH_WJSX_UPGRADE_ATTRS[slot], ov = parseInt(st.originalData[k]) || 0; let cv = parseInt(st.tempData[k]) || 0, ap = parseInt(st.tempData.属性点) || 0; if (e.isLeftClick() && ap > 0) { st.tempData[k] = cv + 1; st.tempData.属性点 = ap - 1; } else if (e.isRightClick() && cv > ov) { st.tempData[k] = cv - 1; st.tempData.属性点 = ap + 1; } else p.sendMessage('§c' + (e.isLeftClick() ? '属性点不足' : '不能低于原始值')); KOMUTECH_WJSX_openPlayerWithTemp(p, st.tempData); return true; }
    if (slot === SLOT.SPIRIT_SENSE && st.originalData && st.tempData) { const dt = st.tempData; if (!KOMUTECH_WJSX_isGoldenCoreRealm(dt)) { p.sendMessage('§c修为未达金丹期，无法分配灵识'); return true; } const ov = parseInt(st.originalData.灵识) || 0; let cv = parseInt(dt.灵识) || 0, ap = parseInt(dt.属性点) || 0; if (e.isLeftClick() && ap > 0) { dt.灵识 = cv + 1; dt.属性点 = ap - 1; } else if (e.isRightClick() && cv > ov) { dt.灵识 = cv - 1; dt.属性点 = ap + 1; } else p.sendMessage('§c' + (e.isLeftClick() ? '属性点不足' : '不能低于原始值')); KOMUTECH_WJSX_openPlayerWithTemp(p, dt); return true; }
    return false;
}
function handleAdminListClick(p, slot, e, st) {
    if (slot === SLOT.MODE) { KOMUTECH_WJSX_openPlayer(p); return true; }
    if (slot === SLOT.CLOSE) { p.closeInventory(); return true; }
    if (slot === SLOT.PREV && st.page > 1) { KOMUTECH_WJSX_openAdminList(p, st.page - 1); return true; }
    if (slot === SLOT.NEXT && st.page < st.total) { KOMUTECH_WJSX_openAdminList(p, st.page + 1); return true; }
    if (slot === SLOT.CONFIRM) {
        if (!e.isLeftClick()) return true;
        if (KOMUTECH_WJSX_awaiting.containsKey(p)) return true;
        KOMUTECH_WJSX_awaiting.put(p, true);
        p.sendMessage('§c请输入管理员密码:');
        getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
            KOMUTECH_WJSX_awaiting.remove(p);
            if (inp.replace(/§./g, '').trim() !== KOMUTECH_WJSX_ADMIN_PASSWORD) { p.sendMessage('§c密码错误'); return; }
            const dir = Paths.get(DATA_DIR_PATH);
            const fs = Files.exists(dir) ? dir.toFile().listFiles().filter(f => f.getName().startsWith('[') && f.getName().endsWith('.json')) : [];
            fs.forEach(f => { const pn = f.getName().replace(/^\[|\]\.json$/g, ''); const target = Bukkit.getPlayer(pn); if (target != null && target.isOnline()) { KOMUTECH_WJSX_clearPlayerAttributes(target); target.sendMessage('§c你的玩家属性数据已被管理员重置。'); } try { Files.delete(f.toPath()); } catch (ex) {} });
            p.sendMessage('§a已删除 ' + fs.length + ' 个玩家数据。');
            KOMUTECH_WJSX_openAdminList(p, st.page);
        }})));
        return true;
    }
    if (st.slotMap.containsKey(slot)) {
        const pn = st.slotMap.get(slot);
        if (e.isShiftClick() && e.isRightClick()) {
            if (KOMUTECH_WJSX_awaiting.containsKey(p)) return true;
            KOMUTECH_WJSX_awaiting.put(p, true);
            p.sendMessage('§c输入 "确认删除" 以删除 ' + pn + ':');
            getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
                KOMUTECH_WJSX_awaiting.remove(p);
                if (inp.replace(/§./g, '').trim() !== '确认删除') { p.sendMessage('§c操作取消'); return; }
                const path = Paths.get(DATA_DIR_PATH, '[' + pn + '].json');
                if (!Files.exists(path)) { p.sendMessage('§c文件不存在'); KOMUTECH_WJSX_openAdminList(p, st.page); return; }
                const target = Bukkit.getPlayer(pn);
                if (target != null && target.isOnline()) { KOMUTECH_WJSX_clearPlayerAttributes(target); target.sendMessage('§c你的玩家属性数据已被管理员移除。'); }
                try { Files.delete(path); } catch (ex) {}
                p.sendMessage('§a已删除玩家 ' + pn + ' 的属性数据。');
                KOMUTECH_WJSX_openAdminList(p, st.page);
            }})));
            return true;
        } else if (e.isLeftClick() && !e.isShiftClick()) { KOMUTECH_WJSX_openAdminView(p, pn); return true; }
    }
    return false;
}
function handleAdminViewClick(p, slot, e, st) {
    const pn = st.playerName, dt = st.data;
    if (slot === SLOT.MODE) { KOMUTECH_WJSX_openPlayer(p); return true; }
    if (slot === SLOT.BACK) { KOMUTECH_WJSX_openAdminList(p, 1); return true; }
    if (slot === SLOT.CLOSE) { p.closeInventory(); return true; }
    if (slot === SLOT.CONFIRM) { savePlayerData(pn, dt); const target = Bukkit.getPlayer(pn); if (target != null && target.isOnline()) { KOMUTECH_WJSX_applyPlayerAttributes(target, dt); p.sendMessage('§a修改已保存并应用。'); } else { p.sendMessage('§a修改已保存，玩家上线后将自动生效。'); } KOMUTECH_WJSX_openAdminView(p, pn); return true; }
    if (e.isRightClick() && dt) { KOMUTECH_WJSX_handleRightClick(p, slot, pn, dt); return true; }
    return false;
}
function KOMUTECH_WJSX_registerListener() {
    KOMUTECH_WJSX_unregisterListener();
    const L = Java.extend(Listener, {});
    KOMUTECH_WJSX_listener = new L();
    plugin.getServer().getPluginManager().registerEvent(InventoryClickEvent, KOMUTECH_WJSX_listener, EventPriority.NORMAL, (l, e) => {
        const p = e.getWhoClicked();
        if (!KOMUTECH_WJSX_openPlayers.containsKey(p)) return;
        const t = e.getView().getTitle();
        if (![TITLE_PLAYER, TITLE_ADMIN_LIST].includes(t) && !t.startsWith(TITLE_ADMIN_VIEW)) return;
        e.setCancelled(true);
        const slot = e.getSlot(), it = e.getCurrentItem();
        if (!it || it.getType() === Material.AIR) return;
        const st = KOMUTECH_WJSX_openPlayers.get(p);
        if (t === TITLE_PLAYER) { if (handlePlayerMenuClick(p, slot, e, st)) return; }
        else if (t === TITLE_ADMIN_LIST) { if (handleAdminListClick(p, slot, e, st)) return; }
        else if (t.startsWith(TITLE_ADMIN_VIEW)) { if (handleAdminViewClick(p, slot, e, st)) return; }
    }, plugin);
    plugin.getServer().getPluginManager().registerEvent(InventoryCloseEvent, KOMUTECH_WJSX_listener, EventPriority.NORMAL, (l, e) => { KOMUTECH_WJSX_openPlayers.remove(e.getPlayer()); if (KOMUTECH_WJSX_openPlayers.isEmpty()) KOMUTECH_WJSX_unregisterListener(); }, plugin);
}
function handleQualityModify(p, playerName, data, el, sec) {
    KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage(`§a输入${el}品质（0~1）:`);
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        const v = parseFloat(inp); if (isNaN(v) || v < 0 || v > 1) { p.sendMessage('§c无效数值'); return; }
        sec[el] = v; let tot = 0; for (let q in QUALITY_SLOTS) tot += sec[QUALITY_SLOTS[q]] || 0;
        data.总品质 = parseFloat(tot.toFixed(2)); data.灵根属性 = KOMUTECH_WJSX_computeLinggenAttr((data.灵根 || '').split('、').filter(e => e), tot);
        const ling = KOMUTECH_WJSX_parseLingli(data); const newBase = KOMUTECH_WJSX_computeBaseMaxLingli(data);
        data.灵力 = ling.current + '/' + newBase + (ling.bonus !== 0 ? '+' + ling.bonus : '');
        KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleSpeedModify(p, playerName, data) {
    KOMUTECH_WJSX_awaiting.put(p, true);
    const cp = data.速度 || 0;
    const cs = KOMUTECH_WJSX_computeActualValue(cp, KOMUTECH_WJSX_BASE_GROWTH['速度'], KOMUTECH_WJSX_getLinggenFinalCoefficient((data.灵根 || '').split('、').filter(e => e), parseFloat(data.总品质) || 0.01, '速度'), KOMUTECH_WJSX_getRealmCoefficient(data), parseFloat(data.总品质) || 0.01, data.根骨 || 1);
    p.sendMessage(`§a当前速度点数: §e${cp} §7(速度加成: §e+${cs.toFixed(2)}%§7)`); p.sendMessage('§a请输入要设置的属性点数量（整数）:');
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        let v = parseInt(inp); if (isNaN(v) || v < 0) { p.sendMessage('§c点数必须为非负整数'); return; }
        data.速度 = v; KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleSpiritModify(p, playerName, data) {
    KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage('§a请输入新的灵气值（直接输入数字如 100，或完整格式如 100/1000）:');
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        let nv = inp;
        if (/^\d+$/.test(inp)) { const cur = parseInt(inp), info = KOMUTECH_WJSX_getCultivationInfo(cur); nv = `${cur}/${info.maxStr}`; data.修为 = info.stage; }
        else if (!/^\d+\/\d+$/.test(inp) && inp !== '無') { p.sendMessage('§c格式错误'); return; }
        else { const m = inp.match(/^(\d+)\//); if (m) data.修为 = KOMUTECH_WJSX_getCultivationInfo(parseInt(m[1])).stage; }
        data.灵气 = nv; const ling = KOMUTECH_WJSX_parseLingli(data); const newBase = KOMUTECH_WJSX_computeBaseMaxLingli(data);
        data.灵力 = ling.current + '/' + newBase + (ling.bonus !== 0 ? '+' + ling.bonus : '');
        KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleLingliBonusModify(p, playerName, data) {
    const ling = KOMUTECH_WJSX_parseLingli(data);
    KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage(`§a当前灵力: §e${ling.current}/${ling.totalMax} §7(额外: ${ling.bonus})`); p.sendMessage('§a请输入新的额外加成值（整数，可正可负）:');
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        let newBonus = parseInt(inp); if (isNaN(newBonus)) { p.sendMessage('§c无效数字'); return; }
        const curLing = KOMUTECH_WJSX_parseLingli(data); data.灵力 = curLing.current + '/' + curLing.baseMax + (newBonus !== 0 ? '+' + newBonus : '');
        KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleLinggenAttrModify(p, playerName, data) {
    KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage('§a输入新灵根（用顿号分隔，或输入“混沌”）:');
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        let ns = inp.replace(/§./g, '').trim();
        if (ns === '混沌' || ns === '混沌灵根') {
            const allLinggen = VALID_LINGGEN; data.灵根 = allLinggen.join('、'); let sec = data.灵根品质 || {};
            allLinggen.forEach(e => sec[e] = 0.1); data.灵根品质 = sec; const tot = allLinggen.length * 0.1;
            data.总品质 = parseFloat(tot.toFixed(2)); data.灵根属性 = '混沌灵根';
            const ling = KOMUTECH_WJSX_parseLingli(data); const newBase = KOMUTECH_WJSX_computeBaseMaxLingli(data);
            data.灵力 = ling.current + '/' + newBase + (ling.bonus !== 0 ? '+' + ling.bonus : '');
            KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data); return;
        }
        if (!/[、，\s]/.test(ns)) ns = ns.split('').join('、'); else ns = ns.split(/[、，\s]+/).filter(e => e).join('、');
        const newEls = ns.split('、').filter(e => e); const invalid = newEls.filter(e => !VALID_LINGGEN.includes(e));
        if (invalid.length > 0) { p.sendMessage('§c无效的灵根: ' + invalid.join('、') + '，请重新输入'); return; }
        const oldEls = (data.灵根 || '').split('、').filter(e => e); data.灵根 = ns; let sec = data.灵根品质 || {};
        oldEls.filter(e => !newEls.includes(e)).forEach(e => delete sec[e]);
        newEls.filter(e => !oldEls.includes(e)).forEach(e => sec[e] = KOMUTECH_WJSX_MUTATED_COLORS[e] ? 1.0 : 0.01);
        data.灵根品质 = sec; let tot = 0; newEls.forEach(e => tot += sec[e] || 0);
        data.总品质 = parseFloat(tot.toFixed(2)); data.灵根属性 = KOMUTECH_WJSX_computeLinggenAttr(newEls, tot);
        const ling = KOMUTECH_WJSX_parseLingli(data); const newBase = KOMUTECH_WJSX_computeBaseMaxLingli(data);
        data.灵力 = ling.current + '/' + newBase + (ling.bonus !== 0 ? '+' + ling.bonus : '');
        KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleCommonAttrModify(p, playerName, data, key) {
    KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage(`§a请输入新的${key}值:`);
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
        let v = parseInt(inp); if (isNaN(v)) { p.sendMessage('§c无效数字'); return; }
        data[key] = v; KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function handleFoundationModify(p, playerName, data) {
    KOMUTECH_WJSX_awaiting.put(p, true);
    const foundation = data.根基 || { 稳固值: 0, '溢出的灵气': '0/0' };
    p.sendMessage(`§a当前溢出的灵气: §e${foundation['溢出的灵气']}`);
    p.sendMessage('§a请输入新的溢出灵气值（格式如 12.5/50）:');
    getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
        KOMUTECH_WJSX_awaiting.remove(p);
        if (inp.toLowerCase() === 'cancel') return;
        if (!/^\d+\.?\d*\/\d+\.?\d*$/.test(inp)) { p.sendMessage('§c格式错误，正确格式如 12.5/50'); return; }
        data.根基 = data.根基 || { 稳固值: 0, '溢出的灵气': '0/0' };
        data.根基['溢出的灵气'] = inp;
        let parts = inp.split('/');
        let current = parseFloat(parts[0]);
        let max = parseFloat(parts[1]);
        let unit = max * 0.01;
        data.根基.稳固值 = Math.min(25, Math.floor(current / unit));
        KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
    }})));
}
function KOMUTECH_WJSX_handleRightClick(p, slot, playerName, data) {
    if (KOMUTECH_WJSX_awaiting.containsKey(p)) return;
    if (QUALITY_SLOTS.hasOwnProperty(slot)) { const el = QUALITY_SLOTS[slot], sec = data.灵根品质; if (!sec || sec[el] === undefined) return; handleQualityModify(p, playerName, data, el, sec); return; }
    const key = KOMUTECH_WJSX_ATTR_SLOTS[slot]; if (!key || (key !== '根基' && data[key] === undefined)) return;
    if (key === '修为') { p.sendMessage('§c修为不可直接修改，请通过修改灵气值来调整修为。'); return; }
    if (key === '根基') { handleFoundationModify(p, playerName, data); return; }
    if (slot === SLOT.WUXING || slot === SLOT.GENGU) {
        KOMUTECH_WJSX_awaiting.put(p, true); p.sendMessage(`§a请输入新的${key}值（当前: ${data[key]}，需≤10）:`);
        getChatInput(p, new (Java.extend(Consumer, { accept: inp => {
            KOMUTECH_WJSX_awaiting.remove(p); if (inp.toLowerCase() === 'cancel') return;
            const v = parseFloat(inp); if (isNaN(v) || v > 10) { p.sendMessage('§c无效数值（必须≤10）'); return; }
            data[key] = parseFloat(v.toFixed(2)); KOMUTECH_WJSX_openAdminViewWithTemp(p, playerName, data);
        }})));
        return;
    }
    if (slot === SLOT.SPEED) { handleSpeedModify(p, playerName, data); return; }
    if (slot === SLOT.SPIRIT && data.灵气) { handleSpiritModify(p, playerName, data); return; }
    if (slot === SLOT.LINGLI && data.灵力) { handleLingliBonusModify(p, playerName, data); return; }
    if (slot === SLOT.LINGGEN_ATTR && data.灵根) { handleLinggenAttrModify(p, playerName, data); return; }
    handleCommonAttrModify(p, playerName, data, key);
}
function KOMUTECH_WJSX_openMenu(p, inv, st) { p.openInventory(inv); KOMUTECH_WJSX_openPlayers.put(p, st); KOMUTECH_WJSX_registerListener(); }
function KOMUTECH_WJSX_openPlayer(p) { const d = loadPlayerData(p.getName()); if (!d) { KOMUTECH_WJSX_openMenu(p, KOMUTECH_WJSX_buildPlayerMenu(p, null).inv, {}); return; } const t = JSON.parse(JSON.stringify(d)), o = JSON.parse(JSON.stringify(d)); KOMUTECH_WJSX_openMenu(p, KOMUTECH_WJSX_buildPlayerMenu(p, t).inv, {originalData: o, tempData: t}); }
function KOMUTECH_WJSX_openPlayerWithTemp(p, t) { const s = KOMUTECH_WJSX_openPlayers.get(p); KOMUTECH_WJSX_openMenu(p, KOMUTECH_WJSX_buildPlayerMenu(p, t).inv, {originalData: s.originalData, tempData: t}); }
function KOMUTECH_WJSX_openAdminList(p, pg) { if (!KOMUTECH_WJSX_isAdmin(p)) { p.sendMessage('§c无权限'); KOMUTECH_WJSX_openPlayer(p); return; } const {inv, page: c, total, slotMap} = KOMUTECH_WJSX_buildAdminList(pg); KOMUTECH_WJSX_openMenu(p, inv, {page: c, total, slotMap}); }
function KOMUTECH_WJSX_openAdminView(p, pn) { if (!KOMUTECH_WJSX_isAdmin(p)) { p.sendMessage('§c无权限'); KOMUTECH_WJSX_openPlayer(p); return; } const d = loadPlayerData(pn); if (!d) { p.sendMessage('§c无数据'); return; } const t = JSON.parse(JSON.stringify(d)); KOMUTECH_WJSX_openMenu(p, KOMUTECH_WJSX_buildAdminView(pn, t).inv, {playerName: pn, data: t}); }
function KOMUTECH_WJSX_openAdminViewWithTemp(p, pn, t) { KOMUTECH_WJSX_openMenu(p, KOMUTECH_WJSX_buildAdminView(pn, t).inv, {playerName: pn, data: t}); }
function KOMUTECH_WJSX_getCultivationInfo(v) {
    const val = parseInt(v) || 0;
    if (val < 100) return {stage: '『引气入体』', spiritCap: 100, maxStr: '100'};
    const b = [{base:100,next:1000,name:'练气'},{base:1000,next:10000,name:'筑基'},{base:10000,next:100000,name:'金丹'},{base:100000,next:1000000,name:'元婴'},{base:1000000,next:10000000,name:'化神'},{base:10000000,next:100000000,name:'大成'},{base:100000000,next:1000000000,name:'渡劫'},{base:1000000000,next:100000000000,name:'飞升'}];
    for (let i of b) { if (val < i.next) { const r = i.next - i.base, s = Math.floor(r / 9); const rank = Math.floor((val - i.base) / s); const spiritCap = Math.floor(i.next * ((rank + 1) * 0.1)); return {stage: `『${i.name}·${rank + 1}阶』`, spiritCap: spiritCap, maxStr: i.next.toString()}; } }
    const rk = Math.floor((val - 100000000000) / 100000000000) + 1; const spiritCap = Math.floor(100000000000 * (rk * 0.1)); return {stage: `『神人·${rk}阶』`, spiritCap: spiritCap, maxStr: '無'};
}
function onButtonGroupClick(p) { try { KOMUTECH_WJSX_openPlayer(p); return true; } catch (e) { KOMUTECH_WJSX_log('打开失败: ' + e); p.sendMessage('§c错误，联系 Komu_A'); return false; } }