const KOMUTECH_L_X_PT_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_L_X_PT_Material = Java.type('org.bukkit.Material');
const KOMUTECH_L_X_PT_ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const KOMUTECH_L_X_PT_EntityType = Java.type('org.bukkit.entity.EntityType');
const KOMUTECH_L_X_PT_Pose = Java.type('org.bukkit.entity.Pose');
const KOMUTECH_L_X_PT_NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const KOMUTECH_L_X_PT_PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');
const KOMUTECH_L_X_PT_EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const KOMUTECH_L_X_PT_Color = Java.type('org.bukkit.Color');
const KOMUTECH_L_X_PT_InvClick = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const KOMUTECH_L_X_PT_InvClose = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const KOMUTECH_L_X_PT_EventPriority = Java.type('org.bukkit.event.EventPriority');
const KOMUTECH_L_X_PT_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_L_X_PT_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_X_PT_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_X_PT_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_X_PT_BlockDisplay = Java.type('org.bukkit.entity.BlockDisplay');
const KOMUTECH_L_X_PT_Display = Java.type('org.bukkit.entity.Display');
const KOMUTECH_L_X_PT_Transformation = Java.type('org.bukkit.util.Transformation');
const KOMUTECH_L_X_PT_Vector3f = Java.type('org.joml.Vector3f');
const KOMUTECH_L_X_PT_AxisAngle4f = Java.type('org.joml.AxisAngle4f');
const KOMUTECH_L_X_PT_Particle = Java.type('org.bukkit.Particle');
const KOMUTECH_L_X_PT_DEFAULT_ID = 'KOMUTECH_L_X_蒲团';
const KOMUTECH_L_X_PT_SEAT_KEY = new KOMUTECH_L_X_PT_NamespacedKey('rsc_meditation', 'seat');
const KOMUTECH_L_X_PT_SEAT_TAG = 'meditation_seat';
const KOMUTECH_L_X_PT_PROJ_KEY = new KOMUTECH_L_X_PT_NamespacedKey('rsc_meditation', 'proj');
const KOMUTECH_L_X_PT_PROJ_TAG = 'meditation_proj';
const KOMUTECH_L_X_PT_STATE_KEY = 'meditation_state';
const KOMUTECH_L_X_PT_SEAT_UUID_KEY = 'meditation_seat_uuid';
const KOMUTECH_L_X_PT_PROJ_UUID_KEY = 'meditation_proj_uuid';
const KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY = 'prayer_mat_id';
const KOMUTECH_L_X_PT_DATA_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const KOMUTECH_L_X_PT_CONFIG_PATH = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/蒲团配置.json';
const KOMUTECH_L_X_PT_REALM_BONUS = [
    [0.10,0.13,0.16,0.19,0.22,0.25,0.28,0.31,0.34],[0.50,0.55,0.60,0.65,0.70,0.75,0.80,0.85,0.90],
    [1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00],[2.50,2.70,2.90,3.10,3.30,3.50,3.70,3.90,4.10],
    [4.50,4.80,5.10,5.40,5.70,6.00,6.30,6.60,6.90],[7.50,8.00,8.50,9.00,9.50,10.00,10.50,11.00,11.50],
    [12.50,13.50,14.50,15.50,16.50,17.50,18.50,19.50,20.50],[22.00,23.50,25.00,26.50,28.00,29.50,31.00,32.50,34.00],
    [36.00,38.00,40.00,42.00,44.00,46.00,48.00,50.00,52.00]
];
const KOMUTECH_L_X_PT_BREAK_DUR = 15;
const KOMUTECH_L_X_PT_DECAY = {1:1.0,2:0.8,3:0.5,4:0.3,5:0.1};
const KOMUTECH_L_X_PT_LINGLI = {'金':1.0,'木':1.2,'水':1.5,'火':0.8,'土':0.9,'雷':1.5,'风':1.3,'冰':1.4,'光':1.5,'暗':1.3};
const KOMUTECH_L_X_PT_MUTATED = {'雷':true,'风':true,'冰':true,'光':true,'暗':true};
const KOMUTECH_L_X_PT_ATTR_COEFF = {'杂灵根':0.1,'四灵根':0.3,'三灵根':0.5,'双灵根':0.8,'单灵根':1.0,'天灵根':1.2,'变异灵根':1.3,'变异多灵根':1.0,'混沌灵根':1.0};
const KOMUTECH_L_X_PT_TRIBULATION_MAP = {100000:9,1000000:16,10000000:21,100000000:36,1000000000:49,10000000000:81,100000000000:99};
let KOMUTECH_L_X_PT_MAT_CONFIG = (() => {
    const path = KOMUTECH_L_X_PT_Paths.get(KOMUTECH_L_X_PT_CONFIG_PATH);
    const defaultConfig = { 'KOMUTECH_L_X_蒲团': { baseGain: 1, projMaterial: 'minecraft:horn_coral_fan' } };
    try {
        if (KOMUTECH_L_X_PT_Files.exists(path)) {
            const raw = KOMUTECH_L_X_PT_Files.readString(path, KOMUTECH_L_X_PT_StandardCharsets.UTF_8);
            const loaded = JSON.parse(raw);
            const translated = {};
            for (const [id, props] of Object.entries(loaded)) {
                translated[id] = {
                    baseGain: props['基础修炼速度'] || props.baseGain || 1,
                    projMaterial: props['投影材质'] || props.projMaterial || 'minecraft:horn_coral_fan'
                };
            }
            return translated;
        }
    } catch (e) { print('[蒲团] 读取配置失败，使用默认值: ' + e); }
    return defaultConfig;
})();
let KOMUTECH_L_X_PT_BASE_GROWTH = {'血量':3,'攻击力':1,'防御力':1,'速度':0.1,'灵识':0.01,'灵力':0.1};
let KOMUTECH_L_X_PT_tasks = new java.util.HashMap();
function KOMUTECH_L_X_PT_locKey(loc) { return loc.getWorld().getName() + ',' + loc.getBlockX() + ',' + loc.getBlockY() + ',' + loc.getBlockZ(); }
function KOMUTECH_L_X_PT_cancelTask(loc) { let k = KOMUTECH_L_X_PT_locKey(loc); let t = KOMUTECH_L_X_PT_tasks.get(k); if (t) { try { KOMUTECH_L_X_PT_Bukkit.getScheduler().cancelTask(t); } catch (e) {} KOMUTECH_L_X_PT_tasks.remove(k); } }
function KOMUTECH_L_X_PT_cancelTribulationTask(loc) { let k = KOMUTECH_L_X_PT_locKey(loc) + '_trib'; let t = KOMUTECH_L_X_PT_tasks.get(k); if (t) { try { KOMUTECH_L_X_PT_Bukkit.getScheduler().cancelTask(t); } catch (e) {} KOMUTECH_L_X_PT_tasks.remove(k); } }
function KOMUTECH_L_X_PT_load(p) { let path = KOMUTECH_L_X_PT_Paths.get(KOMUTECH_L_X_PT_DATA_DIR, '[' + p.getName() + '].json'); if (!KOMUTECH_L_X_PT_Files.exists(path)) return null; try { return JSON.parse(KOMUTECH_L_X_PT_Files.readString(path, KOMUTECH_L_X_PT_StandardCharsets.UTF_8)); } catch (e) { return null; } }
function KOMUTECH_L_X_PT_save(p, d) { let path = KOMUTECH_L_X_PT_Paths.get(KOMUTECH_L_X_PT_DATA_DIR, '[' + p.getName() + '].json'); try { KOMUTECH_L_X_PT_Files.writeString(path, JSON.stringify(d, null, 2), KOMUTECH_L_X_PT_StandardCharsets.UTF_8); return true; } catch (e) { return false; } }
function KOMUTECH_L_X_PT_parseSpirit(s) { let m = s.match(/^(\d+\.?\d*)\/(\d+)(?:\+(-?\d+))?$/); if (!m) return { cur: 0, max: 0, bonus: 0 }; return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: m[3] ? parseInt(m[3]) : 0 }; }
function KOMUTECH_L_X_PT_realmCoeff(v) { let val = parseInt(v) || 0; if (val < 100) return 0; if (val >= 100000000000) return 18 + Math.floor((val - 100000000000) / 100000000000) * 2; const rb = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]; let idx = 0; for (let i = 0; i < rb.length; i++) if (val < rb[i]) { idx = i - 1; break; } if (idx === -1) idx = 0; if (val >= 1000000000) idx = 7; let base = rb[idx], range = idx === 7 ? 90000000000 : rb[idx + 1] - base, step = Math.floor(range / 9), rank = Math.floor((val - base) / step); if (rank >= 9) rank = 8; return KOMUTECH_L_X_PT_REALM_BONUS[idx][rank]; }
function KOMUTECH_L_X_PT_cultivation(v) {
    let val = parseInt(v) || 0;
    if (val <= 100) return { stage: '『引气入体』', spiritCap: 100, maxStr: '100' };
    let b = [
        { base: 101, next: 1000, name: '练气' }, { base: 1001, next: 10000, name: '筑基' },
        { base: 10001, next: 100000, name: '金丹' }, { base: 100001, next: 1000000, name: '元婴' },
        { base: 1000001, next: 10000000, name: '化神' }, { base: 10000001, next: 100000000, name: '大成' },
        { base: 100000001, next: 1000000000, name: '渡劫' }, { base: 1000000001, next: 100000000000, name: '飞升' }
    ];
    for (let i of b) {
        if (val <= i.next) {
            let r = i.next - i.base + 1, s = Math.floor(r / 9), rank = Math.floor((val - i.base) / s);
            if (rank >= 9) rank = 8;
            let cap = Math.floor(i.next * ((rank + 1) * 0.1));
            return { stage: `『${i.name}·${rank + 1}阶』`, spiritCap: cap, maxStr: i.next.toString() };
        }
    }
    let rk = Math.floor((val - 100000000000) / 100000000000) + 1, cap = Math.floor(100000000000 * (rk * 0.1));
    return { stage: `『神人·${rk}阶』`, spiritCap: cap, maxStr: '無' };
}
function KOMUTECH_L_X_PT_linggenFinal(els, q) {
    if (!els.length) return 1.0;
    let c = els.length, decay = KOMUTECH_L_X_PT_DECAY[c] || 0.1, sum = 0;
    for (let e of els) sum += KOMUTECH_L_X_PT_LINGLI[e] || 1.0;
    let base = (sum / c) * q * decay;
    let attrType = (function(els, q) {
        let c = els.length, mc = els.filter(e => KOMUTECH_L_X_PT_MUTATED[e]).length;
        if (c === 1) { let e = els[0]; if (KOMUTECH_L_X_PT_MUTATED[e]) return '变异灵根'; if (q > 0.9) return '天灵根'; return '单灵根'; }
        if (c >= 5) return '杂灵根';
        if (c > 1 && mc > 0) return '变异多灵根';
        if (c === 4) return '四灵根'; if (c === 3) return '三灵根'; if (c === 2) return '双灵根';
        return '未知';
    })(els, q);
    let extra = KOMUTECH_L_X_PT_ATTR_COEFF[attrType] || 1.0;
    return (1.0 + base) * extra;
}
function KOMUTECH_L_X_PT_computeLingliMax(d) {
    let els = (d.灵根 || '').split('、').filter(e => e), q = parseFloat(d.总品质) || 0.01;
    let lc = KOMUTECH_L_X_PT_linggenFinal(els, q), info = KOMUTECH_L_X_PT_cultivation(d.灵气 || '0');
    let decay = KOMUTECH_L_X_PT_DECAY[els.length] || 0.1, gengu = d.根骨 || 1;
    return Math.floor(info.spiritCap * lc * decay * q * (KOMUTECH_L_X_PT_BASE_GROWTH['灵力'] || 0.1) * (gengu / 10)) + 100;
}
function KOMUTECH_L_X_PT_updateLingliMax(d) {
    let nmax = KOMUTECH_L_X_PT_computeLingliMax(d), m = d.灵力.match(/^(\d+)\/(\d+)\+?(-?\d+)?$/);
    let cur = m ? parseInt(m[1]) : nmax; if (cur > nmax) cur = nmax;
    let bonus = m && m[3] ? parseInt(m[3]) : 0;
    d.灵力 = cur + '/' + nmax + (bonus !== 0 ? '+' + bonus : '');
}
function KOMUTECH_L_X_PT_createItem(mat, name, lore) { let i = new KOMUTECH_L_X_PT_ItemStack(KOMUTECH_L_X_PT_Material[mat] || KOMUTECH_L_X_PT_Material.getMaterial(mat)), m = i.getItemMeta(); m.setDisplayName(name); if (lore) m.setLore(Array.isArray(lore) ? lore : [lore]); i.setItemMeta(m); return i; }
function KOMUTECH_L_X_PT_isSeat(e) { if (!e) return false; try { let p = e.getPersistentDataContainer(); return p.has(KOMUTECH_L_X_PT_SEAT_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING) && KOMUTECH_L_X_PT_SEAT_TAG === p.get(KOMUTECH_L_X_PT_SEAT_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING); } catch (x) { return false; } }
function KOMUTECH_L_X_PT_markSeat(e) { if (!e) return; try { e.getPersistentDataContainer().set(KOMUTECH_L_X_PT_SEAT_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING, KOMUTECH_L_X_PT_SEAT_TAG); } catch (x) {} }
function KOMUTECH_L_X_PT_isProj(e) { if (!e) return false; try { let p = e.getPersistentDataContainer(); return p.has(KOMUTECH_L_X_PT_PROJ_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING) && KOMUTECH_L_X_PT_PROJ_TAG === p.get(KOMUTECH_L_X_PT_PROJ_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING); } catch (x) { return false; } }
function KOMUTECH_L_X_PT_markProj(e) { if (!e) return; try { e.getPersistentDataContainer().set(KOMUTECH_L_X_PT_PROJ_KEY, KOMUTECH_L_X_PT_PersistentDataType.STRING, KOMUTECH_L_X_PT_PROJ_TAG); } catch (x) {} }
function KOMUTECH_L_X_PT_removeSeat(s) { if (s && !s.isDead()) { s.eject(); s.remove(); } }
function KOMUTECH_L_X_PT_removeProj(p) { if (p && !p.isDead()) p.remove(); }
function KOMUTECH_L_X_PT_findSeat(loc, uid) { try { return loc.getWorld().getEntity(java.util.UUID.fromString(uid)); } catch (e) { return null; } }
function KOMUTECH_L_X_PT_findProj(loc, uid) { try { return loc.getWorld().getEntity(java.util.UUID.fromString(uid)); } catch (e) { return null; } }
function KOMUTECH_L_X_PT_nearbySeat(loc) { let ents = loc.getWorld().getNearbyEntities(loc, 2, 2, 2); for (let i = 0; i < ents.size(); i++) { let e = ents.get(i); if (e.getType() === KOMUTECH_L_X_PT_EntityType.ARMOR_STAND && KOMUTECH_L_X_PT_isSeat(e)) return e; } return null; }
function KOMUTECH_L_X_PT_nearbyProj(loc) { let ents = loc.getWorld().getNearbyEntities(loc, 2, 3, 2); for (let i = 0; i < ents.size(); i++) { let e = ents.get(i); if (e instanceof KOMUTECH_L_X_PT_BlockDisplay && KOMUTECH_L_X_PT_isProj(e)) return e; } return null; }
function KOMUTECH_L_X_PT_createSeat(loc, p, color, med) {
    let w = loc.getWorld(), seat = w.spawnEntity(loc.clone().add(0.5, 0.0, 0.5), KOMUTECH_L_X_PT_EntityType.ARMOR_STAND);
    seat.setInvisible(true); seat.setInvulnerable(true); seat.setSilent(true); seat.setGravity(false);
    seat.setAI(false); seat.setCollidable(false); seat.setSmall(true); seat.setArms(false); seat.setBasePlate(false);
    let h = new KOMUTECH_L_X_PT_ItemStack(KOMUTECH_L_X_PT_Material.LEATHER_HELMET), m_ = h.getItemMeta(); m_.setColor(color); h.setItemMeta(m_);
    seat.getEquipment().setHelmet(h); KOMUTECH_L_X_PT_markSeat(seat); seat.addPassenger(p); p.setPose(KOMUTECH_L_X_PT_Pose.SITTING);
    if (med) {
        let projLoc = loc.clone().add(-0.5, 1.0, -0.5), proj = w.spawn(projLoc, KOMUTECH_L_X_PT_BlockDisplay.class);
        let mid = StorageCacheUtils.getData(loc, KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY) || KOMUTECH_L_X_PT_DEFAULT_ID;
        let config = KOMUTECH_L_X_PT_MAT_CONFIG[mid] || KOMUTECH_L_X_PT_MAT_CONFIG[KOMUTECH_L_X_PT_DEFAULT_ID];
        proj.setBlock(KOMUTECH_L_X_PT_Bukkit.createBlockData(config.projMaterial));
        proj.setTransformation(new KOMUTECH_L_X_PT_Transformation(new KOMUTECH_L_X_PT_Vector3f(0,0,0), new KOMUTECH_L_X_PT_AxisAngle4f(0,0,1,0), new KOMUTECH_L_X_PT_Vector3f(2.0,2.0,2.0), new KOMUTECH_L_X_PT_AxisAngle4f(0,0,1,0)));
        proj.setBrightness(new KOMUTECH_L_X_PT_Display.Brightness(15,15)); proj.setViewRange(100); proj.setGravity(false); proj.setInvulnerable(true);
        KOMUTECH_L_X_PT_markProj(proj); KOMUTECH_L_X_PT_setProjUUID(loc, proj.getUniqueId());
    }
    return seat;
}
function KOMUTECH_L_X_PT_getState(loc) { let d = StorageCacheUtils.getData(loc, KOMUTECH_L_X_PT_STATE_KEY); return d ? parseInt(d) : 0; }
function KOMUTECH_L_X_PT_setState(loc, s) { StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_STATE_KEY, String(s)); }
function KOMUTECH_L_X_PT_getSeatUUID(loc) { return StorageCacheUtils.getData(loc, KOMUTECH_L_X_PT_SEAT_UUID_KEY); }
function KOMUTECH_L_X_PT_setSeatUUID(loc, u) { StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_SEAT_UUID_KEY, u ? u.toString() : null); }
function KOMUTECH_L_X_PT_getProjUUID(loc) { return StorageCacheUtils.getData(loc, KOMUTECH_L_X_PT_PROJ_UUID_KEY); }
function KOMUTECH_L_X_PT_setProjUUID(loc, u) { StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_PROJ_UUID_KEY, u ? u.toString() : null); }
function KOMUTECH_L_X_PT_cleanup(loc, p) {
    KOMUTECH_L_X_PT_cancelTask(loc); KOMUTECH_L_X_PT_cancelTribulationTask(loc);
    let uid = KOMUTECH_L_X_PT_getSeatUUID(loc), seat = uid ? KOMUTECH_L_X_PT_findSeat(loc, uid) : null;
    if (!seat || seat.isDead()) seat = KOMUTECH_L_X_PT_nearbySeat(loc); if (seat) KOMUTECH_L_X_PT_removeSeat(seat);
    let pid = KOMUTECH_L_X_PT_getProjUUID(loc), proj = pid ? KOMUTECH_L_X_PT_findProj(loc, pid) : null;
    if (!proj || proj.isDead()) proj = KOMUTECH_L_X_PT_nearbyProj(loc); if (proj) KOMUTECH_L_X_PT_removeProj(proj);
    KOMUTECH_L_X_PT_setSeatUUID(loc, null); KOMUTECH_L_X_PT_setProjUUID(loc, null);
    StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY, null);
    if (p) { let v = p.getVehicle(); if (v && KOMUTECH_L_X_PT_isSeat(v)) v.eject(); p.setPose(KOMUTECH_L_X_PT_Pose.STANDING); }
}
function KOMUTECH_L_X_PT_addSpirit(p, loc) {
    let d = KOMUTECH_L_X_PT_load(p); if (!d || !d.灵气) return false;
    let oldStage = d.修为;
    let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气), wuxing = parseFloat(d.悟性) || 1, quality = parseFloat(d.总品质) || 0.5;
    let attr = d.灵根属性 || '', coeff = (KOMUTECH_L_X_PT_ATTR_COEFF[attr] || 1.0) * KOMUTECH_L_X_PT_realmCoeff(d.灵气);
    let mid = StorageCacheUtils.getData(loc, KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY) || KOMUTECH_L_X_PT_DEFAULT_ID;
    let config = KOMUTECH_L_X_PT_MAT_CONFIG[mid] || KOMUTECH_L_X_PT_MAT_CONFIG[KOMUTECH_L_X_PT_DEFAULT_ID];
    let gain = Math.max(0.01, wuxing * quality * coeff + config.baseGain);
    if (!d.根基) d.根基 = { 稳固值: 0, 溢出的灵气: '0/0', 破镜药力: 0, 保阶药力: 0 };
    if (typeof d.根基.稳固值 !== 'number') d.根基.稳固值 = 0;
    if (typeof d.根基.破镜药力 !== 'number') d.根基.破镜药力 = 0;
    if (typeof d.根基.保阶药力 !== 'number') d.根基.保阶药力 = 0;
    let ovStr = d.根基.溢出的灵气 || '0/0', ovMatch = ovStr.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/), ovCur = ovMatch ? parseFloat(ovMatch[1]) : 0;
    let gengu = parseFloat(d.根骨) || 1, ovLimit = Math.floor((gengu / 10) * max * 100) / 100;
    if (cur < max) { cur = Math.min(cur + gain, max); d.灵气 = cur.toFixed(2) + '/' + max; }
    if (cur >= max) {
        let extra = cur + gain - max, newOv = ovCur + extra; if (newOv > ovLimit) newOv = ovLimit;
        let unit = max * 0.01, points = Math.floor(newOv / unit);
        d.根基.稳固值 = points; d.根基.溢出的灵气 = newOv.toFixed(2) + '/' + ovLimit.toFixed(2); ovCur = newOv;
    } else { d.根基.溢出的灵气 = ovCur.toFixed(2) + '/' + ovLimit.toFixed(2); }
    d.修为 = KOMUTECH_L_X_PT_cultivation(cur).stage;
    if (oldStage && oldStage !== d.修为) {
        d.属性点 = (d.属性点 || 0) + Math.floor(Math.random() * 4) + 3;
        if (Math.random() < 0.5) d.血量 = (d.血量 || 0) + 1;
        if (Math.random() < 0.5) d.攻击力 = (d.攻击力 || 0) + 1;
        if (Math.random() < 0.5) d.防御力 = (d.防御力 || 0) + 1;
        if (Math.random() < 0.5) d.速度 = (d.速度 || 0) + 1;
        p.sendMessage('§a恭喜！修为突破小阶段，获得属性点奖励！');
    }
    KOMUTECH_L_X_PT_updateLingliMax(d); KOMUTECH_L_X_PT_save(p, d);
    return ovCur >= ovLimit;
}
function KOMUTECH_L_X_PT_particles(p, type, bcnt, rRange, yRange) {
    let loc = p.getLocation(), w = p.getWorld(), cnt = bcnt + Math.floor(Math.random() * (bcnt / 2));
    for (let i = 0; i < cnt; i++) {
        let angle = Math.random() * 2 * Math.PI, radius = 0.6 + Math.random() * rRange;
        let x = loc.getX() + radius * Math.cos(angle), z = loc.getZ() + radius * Math.sin(angle);
        let y = loc.getY() + 0.5 + Math.random() * yRange;
        w.spawnParticle(type, x, y, z, 0, 0, 0, 0, 0);
    }
}
let KOMUTECH_L_X_PT_monitorLocs = new java.util.HashSet(), KOMUTECH_L_X_PT_monitorTaskId = null;
function KOMUTECH_L_X_PT_ensureMonitor() {
    if (KOMUTECH_L_X_PT_monitorTaskId !== null) return;
    let task = Java.extend(Java.type('java.lang.Runnable'), { run: function() {
        let iter = KOMUTECH_L_X_PT_monitorLocs.iterator();
        while (iter.hasNext()) {
            let loc = iter.next(), st = KOMUTECH_L_X_PT_getState(loc); if (st !== 1 && st !== 2) { iter.remove(); continue; }
            let uid = KOMUTECH_L_X_PT_getSeatUUID(loc); if (!uid) { KOMUTECH_L_X_PT_setState(loc, 0); iter.remove(); continue; }
            let seat = KOMUTECH_L_X_PT_findSeat(loc, uid);
            if (!seat || seat.isDead() || seat.getPassengers().isEmpty()) { KOMUTECH_L_X_PT_cleanup(loc, null); KOMUTECH_L_X_PT_setState(loc, 0); iter.remove(); continue; }
            if (st === 1) {
                let pass = seat.getPassengers().get(0);
                if (pass instanceof Java.type('org.bukkit.entity.Player') && pass.isOnline()) {
                    let d = KOMUTECH_L_X_PT_load(pass); if (!d) continue;
                    let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气), full = KOMUTECH_L_X_PT_addSpirit(pass, loc);
                    KOMUTECH_L_X_PT_particles(pass, KOMUTECH_L_X_PT_Particle.END_ROD, 3, 0.4, 1.0);
                    if (full && cur >= max) { pass.sendMessage('§6溢出的灵气已达上限，修炼自动结束。'); KOMUTECH_L_X_PT_cleanup(loc, pass); KOMUTECH_L_X_PT_setState(loc, 0); iter.remove(); }
                }
            }
        }
        if (KOMUTECH_L_X_PT_monitorLocs.isEmpty()) { if (KOMUTECH_L_X_PT_monitorTaskId) KOMUTECH_L_X_PT_Bukkit.getScheduler().cancelTask(KOMUTECH_L_X_PT_monitorTaskId); KOMUTECH_L_X_PT_monitorTaskId = null; }
    }});
    KOMUTECH_L_X_PT_monitorTaskId = KOMUTECH_L_X_PT_Bukkit.getScheduler().runTaskTimer(KOMUTECH_L_X_PT_plugin, new task(), 0, 60).getTaskId();
}
let KOMUTECH_L_X_PT_openPlayers = new java.util.HashSet(), KOMUTECH_L_X_PT_playerLocMap = new java.util.HashMap(), KOMUTECH_L_X_PT_menuListener = null, KOMUTECH_L_X_PT_listenerActive = false;
function KOMUTECH_L_X_PT_unreg() { if (KOMUTECH_L_X_PT_menuListener) { try { KOMUTECH_L_X_PT_InvClick.getHandlerList().unregister(KOMUTECH_L_X_PT_menuListener); } catch (e) {} try { KOMUTECH_L_X_PT_InvClose.getHandlerList().unregister(KOMUTECH_L_X_PT_menuListener); } catch (e) {} KOMUTECH_L_X_PT_menuListener = null; KOMUTECH_L_X_PT_listenerActive = false; } }
function KOMUTECH_L_X_PT_reg() {
    if (KOMUTECH_L_X_PT_listenerActive) return;
    let Impl = Java.extend(Java.type('org.bukkit.event.Listener'), {}); KOMUTECH_L_X_PT_menuListener = new Impl();
    KOMUTECH_L_X_PT_Bukkit.getPluginManager().registerEvent(KOMUTECH_L_X_PT_InvClick, KOMUTECH_L_X_PT_menuListener, KOMUTECH_L_X_PT_EventPriority.NORMAL, (l, e) => {
        let p = e.getWhoClicked(); if (!KOMUTECH_L_X_PT_openPlayers.contains(p) || e.getInventory().getTitle() !== '§d修炼蒲团') return;
        e.setCancelled(true); let slot = e.getSlot(), it = e.getCurrentItem(); if (!it || it.getType() === KOMUTECH_L_X_PT_Material.AIR) return;
        let loc = KOMUTECH_L_X_PT_playerLocMap.get(p); if (!loc) { p.closeInventory(); return; } let st = KOMUTECH_L_X_PT_getState(loc);
        if (slot === 3) {
            if (st === 0) {
                let sfItem = StorageCacheUtils.getSfItem(loc);
                let mid = sfItem ? sfItem.getId() : KOMUTECH_L_X_PT_DEFAULT_ID;
                StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY, mid);
                let seat = KOMUTECH_L_X_PT_createSeat(loc, p, KOMUTECH_L_X_PT_Color.WHITE, true); KOMUTECH_L_X_PT_setState(loc, 1); KOMUTECH_L_X_PT_setSeatUUID(loc, seat.getUniqueId()); KOMUTECH_L_X_PT_monitorLocs.add(loc); KOMUTECH_L_X_PT_ensureMonitor(); p.sendMessage('§a你开始修炼了。');
            } else if (st === 1) { KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc); p.sendMessage('§e你停止了修炼。'); }
            else p.sendMessage('§c请先停止突破。'); p.closeInventory();
        } else if (slot === 5) {
            if (st === 0) {
                let d = KOMUTECH_L_X_PT_load(p); if (!d) { p.sendMessage('§c无法读取玩家数据'); p.closeInventory(); return; }
                let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气); if (cur < max) { p.sendMessage('§c灵气未满，无法突破'); p.closeInventory(); return; }
                let sfItem = StorageCacheUtils.getSfItem(loc);
                let mid = sfItem ? sfItem.getId() : KOMUTECH_L_X_PT_DEFAULT_ID;
                StorageCacheUtils.setData(loc, KOMUTECH_L_X_PT_PRAYER_MAT_ID_KEY, mid);
                let seat = KOMUTECH_L_X_PT_createSeat(loc, p, KOMUTECH_L_X_PT_Color.RED, true); KOMUTECH_L_X_PT_setState(loc, 2); KOMUTECH_L_X_PT_setSeatUUID(loc, seat.getUniqueId()); KOMUTECH_L_X_PT_monitorLocs.add(loc); KOMUTECH_L_X_PT_ensureMonitor(); p.sendMessage('§a你开始突破了！'); p.closeInventory(); KOMUTECH_L_X_PT_startBreak(loc, p, d);
            } else if (st === 2) { KOMUTECH_L_X_PT_cancelTask(loc); KOMUTECH_L_X_PT_cancelTribulationTask(loc); KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc); p.sendMessage('§e你停止了突破。'); p.closeInventory(); }
            else p.sendMessage('§c请先停止修炼。'); p.closeInventory();
        } else if (slot === 8) { KOMUTECH_L_X_PT_cancelTask(loc); KOMUTECH_L_X_PT_cancelTribulationTask(loc); KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc); p.closeInventory(); }
    }, KOMUTECH_L_X_PT_plugin);
    KOMUTECH_L_X_PT_Bukkit.getPluginManager().registerEvent(KOMUTECH_L_X_PT_InvClose, KOMUTECH_L_X_PT_menuListener, KOMUTECH_L_X_PT_EventPriority.NORMAL, (l, e) => { let p = e.getPlayer(); if (KOMUTECH_L_X_PT_openPlayers.remove(p)) KOMUTECH_L_X_PT_playerLocMap.remove(p); if (KOMUTECH_L_X_PT_openPlayers.isEmpty()) KOMUTECH_L_X_PT_unreg(); }, KOMUTECH_L_X_PT_plugin);
    KOMUTECH_L_X_PT_listenerActive = true;
}
function KOMUTECH_L_X_PT_startBreak(loc, p, d) {
    let key = KOMUTECH_L_X_PT_locKey(loc); KOMUTECH_L_X_PT_cancelTask(loc); KOMUTECH_L_X_PT_cancelTribulationTask(loc);
    let solid = (d.根基 || {}).稳固值 || 0, drug = (d.根基 || {}).破镜药力 || 0;
    let rate = Math.min(25 + solid + drug, 100), success = Math.random() * 100 < rate;
    p.sendMessage('§6突破中... 成功率: §e' + rate + '%'); let taskId = null, tick = 0;
    let runnable = Java.extend(Java.type('java.lang.Runnable'), { run: function() {
        tick++; if (p.isOnline()) KOMUTECH_L_X_PT_particles(p, KOMUTECH_L_X_PT_Particle.HAPPY_VILLAGER, 8, 0.6, 1.8);
        if (tick >= KOMUTECH_L_X_PT_BREAK_DUR) { KOMUTECH_L_X_PT_Bukkit.getScheduler().cancelTask(taskId); KOMUTECH_L_X_PT_tasks.remove(key); KOMUTECH_L_X_PT_finishBreak(loc, p, d, success); }
    }});
    taskId = KOMUTECH_L_X_PT_Bukkit.getScheduler().runTaskTimer(KOMUTECH_L_X_PT_plugin, new runnable(), 0, 60).getTaskId(); KOMUTECH_L_X_PT_tasks.put(key, taskId);
}
function KOMUTECH_L_X_PT_finishBreak(loc, p, d, ok) {
    if (!ok) {
        let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气);
        let baseReduce = 0.15 + Math.random() * 0.15;
        let reduction = ((d.根基 || {}).保阶药力 || 0) / 100;
        let reduce = Math.max(0, baseReduce - reduction);
        let reduced = cur * (1 - reduce); if (reduced < 0) reduced = 0;
        d.灵气 = reduced.toFixed(2) + '/' + max; d.根基.破镜药力 = 0; d.根基.保阶药力 = 0;
        p.sendMessage('§c突破失败... 灵气损失了 ' + (reduce * 100).toFixed(0) + '%');
        KOMUTECH_L_X_PT_save(p, d); KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc);
        return;
    }
    let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气);
    let nmax = max * 10; if (nmax > 100000000000000) nmax = 100000000000000;
    if (nmax >= 100000) {
        let tribCount = 0;
        for (let t in KOMUTECH_L_X_PT_TRIBULATION_MAP) { if (nmax >= parseInt(t)) tribCount = KOMUTECH_L_X_PT_TRIBULATION_MAP[t]; }
        p.sendMessage('§c§l雷劫降临！需承受 ' + tribCount + ' 道天雷！');
        KOMUTECH_L_X_PT_startTribulation(loc, p, d, nmax, tribCount, 1, cur);
    } else {
        KOMUTECH_L_X_PT_applyBreakSuccess(loc, p, d, nmax, cur);
    }
}
function KOMUTECH_L_X_PT_startTribulation(loc, p, d, nmax, total, current, cur) {
    if (!p.isOnline() || p.isDead()) { p.sendMessage('§c渡劫失败...'); KOMUTECH_L_X_PT_failTribulation(loc, p, d); return; }
    if (current > total) { p.sendMessage('§a§l雷劫渡过！突破成功！'); KOMUTECH_L_X_PT_applyBreakSuccess(loc, p, d, nmax, cur); return; }
    p.sendMessage('§e第 ' + current + '/' + total + ' 道雷劫');
    let world = p.getWorld(), locP = p.getLocation();
    world.strikeLightning(locP);
    let baseDmg = (d.血量 || 0) * 5;
    let realmMult = KOMUTECH_L_X_PT_realmCoeff(cur);
    let els = (d.灵根 || '').split('、').filter(e => e);
    let q = parseFloat(d.总品质) || 0.5;
    let linggenMult = KOMUTECH_L_X_PT_linggenFinal(els, q);
    let shaQiMult = 1 + (d.煞气 || 0) / 10000;
    let genguReduce = Math.min((d.根骨 || 0) * 0.03, 0.8);
    let genguMult = 1 - genguReduce;
    let growth = Math.pow(1.05, current - 1);
    let finalDmg = baseDmg * realmMult * linggenMult * shaQiMult * genguMult * growth;
    let gongDeReduce = Math.floor((d.功德 || 0) / 100);
    let reduced = Math.min(finalDmg, gongDeReduce);
    finalDmg = Math.max(1, Math.floor(finalDmg - reduced));
    d.功德 = (d.功德 || 0) - reduced * 100;
    p.damage(finalDmg);
    p.sendMessage('§c受到了 ' + finalDmg + ' 点雷劫伤害');
    if (p.isDead()) { p.sendMessage('§c你未能承受雷劫...'); KOMUTECH_L_X_PT_failTribulation(loc, p, d); return; }
    KOMUTECH_L_X_PT_save(p, d);
    let nextTask = Java.extend(Java.type('java.lang.Runnable'), { run: function() { KOMUTECH_L_X_PT_startTribulation(loc, p, d, nmax, total, current + 1, cur); } });
    let taskId = KOMUTECH_L_X_PT_Bukkit.getScheduler().runTaskLater(KOMUTECH_L_X_PT_plugin, new nextTask(), 60).getTaskId();
    KOMUTECH_L_X_PT_tasks.put(KOMUTECH_L_X_PT_locKey(loc) + '_trib', taskId);
}
function KOMUTECH_L_X_PT_failTribulation(loc, p, d) {
    let { cur, max } = KOMUTECH_L_X_PT_parseSpirit(d.灵气);
    let baseReduce = 0.15 + Math.random() * 0.15;
    let reduction = ((d.根基 || {}).保阶药力 || 0) / 100;
    let reduce = Math.max(0, baseReduce - reduction);
    let reduced = cur * (1 - reduce); if (reduced < 0) reduced = 0;
    d.灵气 = reduced.toFixed(2) + '/' + max; d.根基.破镜药力 = 0; d.根基.保阶药力 = 0;
    p.sendMessage('§c雷劫失败... 灵气损失了 ' + (reduce * 100).toFixed(0) + '%');
    KOMUTECH_L_X_PT_save(p, d); KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc);
}
function KOMUTECH_L_X_PT_applyBreakSuccess(loc, p, d, nmax, cur) {
    let ncur = nmax / 10 + 1; if (ncur > nmax) ncur = nmax; d.灵气 = ncur.toFixed(2) + '/' + nmax; d.修为 = KOMUTECH_L_X_PT_cultivation(ncur).stage;
    KOMUTECH_L_X_PT_updateLingliMax(d); let ovLimit = Math.floor((d.根骨 / 10) * nmax * 100) / 100;
    let hasDrug = ((d.根基 || {}).破镜药力 || 0) > 0;
    let hasTribDrug = ((d.根基 || {}).保阶药力 || 0) > 0;
    if (hasDrug || hasTribDrug) {
        d.属性点 = (d.属性点 || 0) + Math.floor(Math.random() * 6) + 5;
    } else {
        d.属性点 = (d.属性点 || 0) + 10;
        if (Math.random() < 0.5) d.血量 = (d.血量 || 0) + 1;
        if (Math.random() < 0.5) d.攻击力 = (d.攻击力 || 0) + 1;
        if (Math.random() < 0.5) d.防御力 = (d.防御力 || 0) + 1;
        if (Math.random() < 0.5) d.速度 = (d.速度 || 0) + 1;
    }
    d.根基 = { 稳固值: 0, 溢出的灵气: '0.00/' + ovLimit.toFixed(2), 破镜药力: 0, 保阶药力: 0 };
    p.playSound(p.getLocation(), 'entity.experience_orb.pickup', 1.0, 1.0);
    p.sendMessage('§a§l恭喜！突破成功！修为提升至 ' + d.修为 + '，获得属性点奖励！');
    KOMUTECH_L_X_PT_save(p, d); KOMUTECH_L_X_PT_cleanup(loc, p); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_monitorLocs.remove(loc);
}
function KOMUTECH_L_X_PT_openMenu(p, loc) {
    let st = KOMUTECH_L_X_PT_getState(loc), inv = KOMUTECH_L_X_PT_Bukkit.createInventory(null, 9, '§d修炼蒲团');
    inv.setItem(0, KOMUTECH_L_X_PT_createItem('GRAY_STAINED_GLASS_PANE', '§7 ', [])); inv.setItem(1, KOMUTECH_L_X_PT_createItem('GRAY_STAINED_GLASS_PANE', '§7 ', [])); inv.setItem(2, KOMUTECH_L_X_PT_createItem('GRAY_STAINED_GLASS_PANE', '§7 ', []));
    inv.setItem(3, st === 1 ? KOMUTECH_L_X_PT_createItem('REDSTONE', '§c■ 停止修炼 ■', ['§7点击结束修炼']) : KOMUTECH_L_X_PT_createItem('EMERALD', '§a✦ 开始修炼 ✦', ['§7点击坐下并开始修炼']));
    let status = st === 0 ? '§7○ 空闲' : (st === 1 ? '§a● 修炼中' : '§d● 突破中'); inv.setItem(4, KOMUTECH_L_X_PT_createItem('BOOK', status, ['§7当前状态']));
    inv.setItem(5, st === 2 ? KOMUTECH_L_X_PT_createItem('REDSTONE', '§c■ 停止突破 ■', ['§7点击结束突破']) : KOMUTECH_L_X_PT_createItem('DIAMOND', '§b✦ 开始突破 ✦', ['§7点击坐下并开始突破']));
    inv.setItem(6, KOMUTECH_L_X_PT_createItem('GRAY_STAINED_GLASS_PANE', '§7 ', [])); inv.setItem(7, KOMUTECH_L_X_PT_createItem('GRAY_STAINED_GLASS_PANE', '§7 ', [])); inv.setItem(8, KOMUTECH_L_X_PT_createItem('BARRIER', '§c关闭并重置', ['§7强制清理并关闭']));
    p.openInventory(inv);
}
function onUse(e) { if (e.getHand() !== KOMUTECH_L_X_PT_EquipmentSlot.HAND) return; let p = e.getPlayer(), b = e.getClickedBlock(); if (!b || !b.isPresent()) return; let loc = b.get().getLocation(), sf = StorageCacheUtils.getSfItem(loc); if (!sf || !KOMUTECH_L_X_PT_MAT_CONFIG.hasOwnProperty(sf.getId())) return; KOMUTECH_L_X_PT_playerLocMap.put(p, loc); KOMUTECH_L_X_PT_openPlayers.add(p); KOMUTECH_L_X_PT_unreg(); KOMUTECH_L_X_PT_reg(); KOMUTECH_L_X_PT_openMenu(p, loc); }
function onBreak(e, it, drops) { let loc = e.getBlock().getLocation(), sf = StorageCacheUtils.getSfItem(loc); if (!sf || !KOMUTECH_L_X_PT_MAT_CONFIG.hasOwnProperty(sf.getId())) return; KOMUTECH_L_X_PT_cancelTask(loc); KOMUTECH_L_X_PT_cancelTribulationTask(loc); KOMUTECH_L_X_PT_cleanup(loc, null); KOMUTECH_L_X_PT_setState(loc, 0); KOMUTECH_L_X_PT_setSeatUUID(loc, null); KOMUTECH_L_X_PT_setProjUUID(loc, null); KOMUTECH_L_X_PT_monitorLocs.remove(loc); let iter = KOMUTECH_L_X_PT_playerLocMap.entrySet().iterator(); while (iter.hasNext()) { let en = iter.next(); if (en.getValue().equals(loc)) { en.getKey().closeInventory(); iter.remove(); KOMUTECH_L_X_PT_openPlayers.remove(en.getKey()); } } }