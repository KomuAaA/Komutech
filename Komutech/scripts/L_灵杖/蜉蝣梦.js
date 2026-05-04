(function() {
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const File = Java.type('java.io.File');
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const Player = Java.type('org.bukkit.entity.Player');
const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const Vector = Java.type('org.bukkit.util.Vector');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
const plugin = Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
globalThis.KOMUTECH = globalThis.KOMUTECH || {}; globalThis.KOMUTECH.灵杖冷却 = globalThis.KOMUTECH.灵杖冷却 || new java.util.HashMap();
const KOMUTECH_L_Q_FYM_STAFF_NAME = "蜉蝣梦";
const KOMUTECH_L_Q_FYM_ATTR_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const KOMUTECH_L_Q_FYM_CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵杖属性.json";
const KOMUTECH_L_Q_FYM_SCROLL_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣";
const KOMUTECH_L_Q_FYM_SCROLL_SCRIPT_DIR = "L_卷轴"; const KOMUTECH_L_Q_FYM_SCROLL_PREFIX = "KOMUTECH_L_JZ_"; const KOMUTECH_L_Q_FYM_CAST_FUNC_NAME = "castScroll";
const KOMUTECH_L_Q_FYM_PVP_LIST_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json";
const KOMUTECH_L_Q_FYM_PROJECTILE_SPEED = 0.4; const KOMUTECH_L_Q_FYM_SPLIT_DISTANCE_RATIO = 0.5; const KOMUTECH_L_Q_FYM_SUB_SPEED = 0.35; const KOMUTECH_L_Q_FYM_SUB_ANGLE = 0.26;
const KOMUTECH_L_Q_FYM_TRAIL_SPARK_INTERVAL = 3; const KOMUTECH_L_Q_FYM_TRAIL_SPARK_DURATION = 20; const KOMUTECH_L_Q_FYM_RESIDUE_RADIUS = 2.5; const KOMUTECH_L_Q_FYM_RESIDUE_DURATION = 30;
const KOMUTECH_L_Q_FYM_RESIDUE_DAMAGE_INTERVAL = 5; const KOMUTECH_L_Q_FYM_RESIDUE_DAMAGE_RATIO = 0.2; const KOMUTECH_L_Q_FYM_BLIND_DURATION = 20; const KOMUTECH_L_Q_FYM_HIT_PARTICLE_COUNT = 18;
let KOMUTECH_L_Q_FYM_DAMAGE_MAP, KOMUTECH_L_Q_FYM_REALM_TABLE, KOMUTECH_L_Q_FYM_REALM_NAMES, KOMUTECH_L_Q_FYM_ATTR_MAP, KOMUTECH_L_Q_FYM_CD_REDUCTION, KOMUTECH_L_Q_FYM_MIN_CD, KOMUTECH_L_Q_FYM_GENGU_FACTOR, KOMUTECH_L_Q_FYM_MERIT_MIN, KOMUTECH_L_Q_FYM_MERIT_MAX, KOMUTECH_L_Q_FYM_WHITE_LIST, KOMUTECH_L_Q_FYM_BASE_CD, KOMUTECH_L_Q_FYM_BASE_COST, KOMUTECH_L_Q_FYM_MAX_DIST;
let KOMUTECH_L_Q_FYM_configLoaded = false; let KOMUTECH_L_Q_FYM_configErrorMsg = "";
try {
    const pth = Paths.get(KOMUTECH_L_Q_FYM_CONFIG_PATH); if (!Files.exists(pth)) throw "配置文件不存在";
    const cfg = JSON.parse(Files.readString(pth, StandardCharsets.UTF_8));
    KOMUTECH_L_Q_FYM_DAMAGE_MAP = cfg["伤害倍率"]; if (!KOMUTECH_L_Q_FYM_DAMAGE_MAP) throw "缺少 伤害倍率";
    KOMUTECH_L_Q_FYM_REALM_TABLE = cfg["修为倍率"]; if (!KOMUTECH_L_Q_FYM_REALM_TABLE) throw "缺少 修为倍率";
    KOMUTECH_L_Q_FYM_REALM_NAMES = ["引气入体","练气","筑基","金丹","元婴","化神","大成","渡劫","飞升","神人"];
    KOMUTECH_L_Q_FYM_ATTR_MAP = cfg["灵根属性倍率"]; if (!KOMUTECH_L_Q_FYM_ATTR_MAP) throw "缺少 灵根属性倍率";
    const FORMULA = cfg["公式参数"]; if (!FORMULA) throw "缺少 公式参数";
    KOMUTECH_L_Q_FYM_CD_REDUCTION = FORMULA["冷却减免因子"]; KOMUTECH_L_Q_FYM_MIN_CD = FORMULA["最小冷却"]; KOMUTECH_L_Q_FYM_GENGU_FACTOR = FORMULA["根骨消耗因子"];
    if (KOMUTECH_L_Q_FYM_CD_REDUCTION === undefined || KOMUTECH_L_Q_FYM_MIN_CD === undefined || KOMUTECH_L_Q_FYM_GENGU_FACTOR === undefined) throw "公式参数不完整";
    const meritRange = cfg["功德变化范围"]; if (!meritRange || !Array.isArray(meritRange) || meritRange.length !== 2) throw "功德变化范围缺失";
    KOMUTECH_L_Q_FYM_MERIT_MIN = meritRange[0]; KOMUTECH_L_Q_FYM_MERIT_MAX = meritRange[1];
    KOMUTECH_L_Q_FYM_WHITE_LIST = cfg["白名单生物"]; if (!KOMUTECH_L_Q_FYM_WHITE_LIST || !Array.isArray(KOMUTECH_L_Q_FYM_WHITE_LIST)) throw "白名单生物缺失";
    const staffCfg = cfg[KOMUTECH_L_Q_FYM_STAFF_NAME]; if (!staffCfg) throw "缺少 " + KOMUTECH_L_Q_FYM_STAFF_NAME + " 配置";
    KOMUTECH_L_Q_FYM_BASE_CD = staffCfg["基础冷却"]; KOMUTECH_L_Q_FYM_BASE_COST = staffCfg["基础消耗"]; KOMUTECH_L_Q_FYM_MAX_DIST = staffCfg["射程"];
    if (KOMUTECH_L_Q_FYM_BASE_CD === undefined || KOMUTECH_L_Q_FYM_BASE_COST === undefined || KOMUTECH_L_Q_FYM_MAX_DIST === undefined) throw KOMUTECH_L_Q_FYM_STAFF_NAME + " 配置不完整";
    KOMUTECH_L_Q_FYM_configLoaded = true;
} catch(e) { KOMUTECH_L_Q_FYM_configErrorMsg = String(e); print("[" + KOMUTECH_L_Q_FYM_STAFF_NAME + "] 配置加载失败: " + e); }
function KOMUTECH_L_Q_FYM_hexToColor(hex) { const h = hex.replace('#',''); return Color.fromRGB(parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)); }
function KOMUTECH_L_Q_FYM_sendActionBar(p, msg) { p.spigot().sendMessage(ChatMessageType.ACTION_BAR, TextComponent.fromLegacyText(msg)); }
function KOMUTECH_L_Q_FYM_parseLingLi(s) { if (!s) return null; const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)?$/); if (m) return { current: parseFloat(m[1]), baseMax: parseFloat(m[2]), extraMax: m[3] ? parseFloat(m[3]) : 0 }; const sm = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/); if (sm) return { current: parseFloat(sm[1]), baseMax: parseFloat(sm[2]), extraMax: 0 }; return null; }
function KOMUTECH_L_Q_FYM_readAttr(name) { try { const p = Paths.get(KOMUTECH_L_Q_FYM_ATTR_DIR, "[" + name + "].json"); return Files.exists(p) ? JSON.parse(Files.readString(p, StandardCharsets.UTF_8)) : null; } catch(e) { print("[" + KOMUTECH_L_Q_FYM_STAFF_NAME + "] 读取属性失败: " + e); return null; } }
function KOMUTECH_L_Q_FYM_writeAttr(name, data) { try { const p = Paths.get(KOMUTECH_L_Q_FYM_ATTR_DIR, "[" + name + "].json"); new File(KOMUTECH_L_Q_FYM_ATTR_DIR).mkdirs(); Files.writeString(p, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[" + KOMUTECH_L_Q_FYM_STAFF_NAME + "] 写入属性失败: " + e); } }
function KOMUTECH_L_Q_FYM_spiritVal(data) { const s = data["灵气"]; if (!s) return 0; const m = s.match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; }
function KOMUTECH_L_Q_FYM_realmCoef(spirit) { if (spirit < 100) return 0.1; if (spirit >= 100000000000) return 66; const thresholds = [100,1000,10000,100000,1000000,10000000,100000000,1000000000]; let idx = 0; for (let i=1;i<thresholds.length;i++) { if (spirit < thresholds[i]) { idx = i - 1; break; } idx = i; } if (spirit >= 1000000000) idx = 7; const realmName = KOMUTECH_L_Q_FYM_REALM_NAMES[idx]; const realmArr = KOMUTECH_L_Q_FYM_REALM_TABLE[realmName]; if (!realmArr) return 1; const base = idx === 0 ? 100 : thresholds[idx]; const range = idx === 7 ? 100000000000 - 1000000000 : thresholds[idx+1] - base; const step = Math.floor(range/9); const rank = Math.floor((spirit-base)/step); return realmArr[Math.min(rank, realmArr.length-1)]; }
function KOMUTECH_L_Q_FYM_calcEnergyCost(data) { const rCo = KOMUTECH_L_Q_FYM_realmCoef(KOMUTECH_L_Q_FYM_spiritVal(data)); const attrName = data["灵根属性"] || "单灵根"; const lCo = KOMUTECH_L_Q_FYM_ATTR_MAP[attrName] || 1.0; const gengu = parseFloat(data["根骨"]) || 1; return Math.max(1, Math.round(KOMUTECH_L_Q_FYM_BASE_COST * rCo * lCo * gengu * KOMUTECH_L_Q_FYM_GENGU_FACTOR)); }
function KOMUTECH_L_Q_FYM_calcCooldown(data) { const wuxing = parseFloat(data["悟性"]) || 1; return Math.max(KOMUTECH_L_Q_FYM_MIN_CD, Math.floor(KOMUTECH_L_Q_FYM_BASE_CD * (1 - (wuxing - 1) * KOMUTECH_L_Q_FYM_CD_REDUCTION))); }
function KOMUTECH_L_Q_FYM_getDamageScale(item) { if (!item || !item.hasItemMeta()) return 1.0; const lore = item.getItemMeta().getLore(); if (!lore) return 1.0; for (let line of lore) { if (!line) continue; const clean = line.replace(/§./g,''); const m = clean.match(/『([^』]+)阶』/); if (m) return KOMUTECH_L_Q_FYM_DAMAGE_MAP[m[1]+'阶'] || 1.0; } return 1.0; }
function KOMUTECH_L_Q_FYM_loadScrollData(name) { try { const p = Paths.get(KOMUTECH_L_Q_FYM_SCROLL_DIR, '[' + name + ']云篆匣.json'); if (!Files.exists(p)) return null; return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[" + KOMUTECH_L_Q_FYM_STAFF_NAME + "] 读取卷轴数据失败: " + e); return null; } }
function KOMUTECH_L_Q_FYM_getOwnedScrollIds(name) { const data = KOMUTECH_L_Q_FYM_loadScrollData(name); if (!data || !data.卷轴数据) return []; return data.卷轴数据.filter(id => id != null); }
function KOMUTECH_L_Q_FYM_extractSkillName(fullId) { return fullId.startsWith(KOMUTECH_L_Q_FYM_SCROLL_PREFIX) ? fullId.substring(KOMUTECH_L_Q_FYM_SCROLL_PREFIX.length) : fullId; }
function KOMUTECH_L_Q_FYM_getBoundSkillName(staff) { if (!staff || !staff.hasItemMeta()) return null; const lore = staff.getItemMeta().getLore(); if (!lore) return null; for (let line of lore) { if (line.startsWith("§b绑定卷轴：")) return line.substring("§b绑定卷轴：§f".length).trim(); } return null; }
function KOMUTECH_L_Q_FYM_setBoundSkillName(staff, skillName) { const meta = staff.getItemMeta(); let lore = meta.getLore() || []; let found = false; const lineText = "§b绑定卷轴：§f" + skillName; for (let i=0;i<lore.length;i++) { if (lore[i].startsWith("§b绑定卷轴：")) { lore[i] = lineText; found = true; break; } } if (!found) lore.push(lineText); meta.setLore(lore); staff.setItemMeta(meta); }
function KOMUTECH_L_Q_FYM_switchScroll(player, staff) { const name = player.getName(); const owned = KOMUTECH_L_Q_FYM_getOwnedScrollIds(name); if (owned.length === 0) { player.sendMessage("§c云篆匣中没有卷轴"); return; } let cur = KOMUTECH_L_Q_FYM_getBoundSkillName(staff); let idx = -1; for (let i=0;i<owned.length;i++) { if (KOMUTECH_L_Q_FYM_extractSkillName(owned[i]) === cur) { idx = i; break; } } const nextFullId = owned[(idx+1)%owned.length]; const nextSkillName = KOMUTECH_L_Q_FYM_extractSkillName(nextFullId); KOMUTECH_L_Q_FYM_setBoundSkillName(staff, nextSkillName); player.sendMessage("§a切换卷轴: §f" + nextSkillName); }
function KOMUTECH_L_Q_FYM_castScroll(player, staff) { const skillName = KOMUTECH_L_Q_FYM_getBoundSkillName(staff); if (!skillName) { player.sendMessage("§c未绑定卷轴"); return; } const scriptPath = KOMUTECH_L_Q_FYM_SCROLL_SCRIPT_DIR + "/" + skillName + ".js"; try { load(scriptPath); } catch(e) { print("[" + KOMUTECH_L_Q_FYM_STAFF_NAME + "] 加载脚本失败: " + scriptPath + " - " + e); player.sendMessage("§c技能加载失败"); return; } const func = globalThis[KOMUTECH_L_Q_FYM_CAST_FUNC_NAME]; if (typeof func !== 'function') { player.sendMessage("§c施法函数未找到"); return; } const name = player.getName(); const attr = KOMUTECH_L_Q_FYM_readAttr(name); if (!attr) { player.sendMessage("§c无法读取属性数据"); return; } func(player, staff, attr); KOMUTECH_L_Q_FYM_writeAttr(name, attr); }
const KOMUTECH_L_Q_FYM_lastClickMap = new java.util.HashMap();
function KOMUTECH_L_Q_FYM_isDoubleClick(uuid) { const now = Date.now(); const last = KOMUTECH_L_Q_FYM_lastClickMap.getOrDefault(uuid, 0); KOMUTECH_L_Q_FYM_lastClickMap.put(uuid, now); return (now - last) < 150; }
function KOMUTECH_L_Q_FYM_loadPvpList() {
    try {
        const path = Paths.get(KOMUTECH_L_Q_FYM_PVP_LIST_PATH);
        if (!Files.exists(path)) return [];
        const data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        return Array.isArray(data) ? data : Object.keys(data);
    } catch (e) { return []; }
}
function KOMUTECH_L_Q_FYM_isPvpEnabled(playerName) {
    const list = KOMUTECH_L_Q_FYM_loadPvpList();
    return !list.includes(playerName);
}
function KOMUTECH_L_Q_FYM_applyMeritChange(attr, isWhite) { const change = Math.floor(Math.random() * (KOMUTECH_L_Q_FYM_MERIT_MAX - KOMUTECH_L_Q_FYM_MERIT_MIN + 1)) + KOMUTECH_L_Q_FYM_MERIT_MIN; if (isWhite) { attr["功德"] = Math.max(0, (attr["功德"] || 0) - change); attr["煞气"] = (attr["煞气"] || 0) + change; } else { attr["功德"] = (attr["功德"] || 0) + change; } return change; }
function KOMUTECH_L_Q_FYM_damageEntity(entity, player, damage, attr) {
    if (entity instanceof Player) {
        if (!KOMUTECH_L_Q_FYM_isPvpEnabled(player.getName()) || !KOMUTECH_L_Q_FYM_isPvpEnabled(entity.getName())) return 0;
        entity.damage(damage, player);
        return 0;
    }
    entity.damage(damage, player);
    const isWhite = KOMUTECH_L_Q_FYM_WHITE_LIST.includes(entity.getType().name());
    const change = KOMUTECH_L_Q_FYM_applyMeritChange(attr, isWhite);
    if (!(entity instanceof Player)) {
        const blindness = PotionEffectType.BLINDNESS;
        if (blindness) entity.addPotionEffect(new PotionEffect(blindness, KOMUTECH_L_Q_FYM_BLIND_DURATION, 0));
    }
    return change;
}
function KOMUTECH_L_Q_FYM_spawnResidue(world, center, player, attr, damage, color) { const residueColor = KOMUTECH_L_Q_FYM_hexToColor("#e6e6fa"); let tick = 0; const RunnableImpl = Java.extend(Java.type('java.lang.Runnable'), { run: function() { if (tick >= KOMUTECH_L_Q_FYM_RESIDUE_DURATION) { task.cancel(); return; } for (let i = 0; i < 6; i++) { const angle = Math.random() * 2 * Math.PI; const r = Math.random() * KOMUTECH_L_Q_FYM_RESIDUE_RADIUS; world.spawnParticle(Particle.DUST, center.getX() + Math.cos(angle)*r, center.getY() + Math.random()*0.5, center.getZ() + Math.sin(angle)*r, 1, 0, 0, 0, 0, new DustOptions(residueColor, 1.0)); } if (tick % KOMUTECH_L_Q_FYM_RESIDUE_DAMAGE_INTERVAL === 0) { const entities = world.getNearbyLivingEntities(center, KOMUTECH_L_Q_FYM_RESIDUE_RADIUS, KOMUTECH_L_Q_FYM_RESIDUE_RADIUS, KOMUTECH_L_Q_FYM_RESIDUE_RADIUS); for (let i = 0; i < entities.size(); i++) { const e = entities.get(i); if (e === player || e.getType().name() === "ARMOR_STAND" || e.isDead()) continue; KOMUTECH_L_Q_FYM_damageEntity(e, player, damage * KOMUTECH_L_Q_FYM_RESIDUE_DAMAGE_RATIO, attr); } } tick++; } }); const task = Bukkit.getScheduler().runTaskTimer(plugin, new RunnableImpl(), 0, 1); }
function KOMUTECH_L_Q_FYM_hitBurst(world, location, color) { for (let i = 0; i < KOMUTECH_L_Q_FYM_HIT_PARTICLE_COUNT; i++) { const ox = (Math.random() - 0.5) * 2.0, oy = (Math.random() - 0.5) * 2.0, oz = (Math.random() - 0.5) * 2.0; world.spawnParticle(Particle.DUST, location.getX()+ox, location.getY()+oy, location.getZ()+oz, 1, 0, 0, 0, 0, new DustOptions(color, 1.5)); } }
function KOMUTECH_L_Q_FYM_createTrailSpark(world, location, color) { const endColor = KOMUTECH_L_Q_FYM_hexToColor("#ffffff"); let tick = 0; const RunnableImpl = Java.extend(Java.type('java.lang.Runnable'), { run: function() { if (tick >= KOMUTECH_L_Q_FYM_TRAIL_SPARK_DURATION) { task.cancel(); return; } world.spawnParticle(Particle.DUST, location.getX(), location.getY(), location.getZ(), 1, 0, 0, 0, 0, new DustOptions(tick%2===0 ? color : endColor, 1.2)); tick++; } }); const task = Bukkit.getScheduler().runTaskTimer(plugin, new RunnableImpl(), 0, 1); }
function KOMUTECH_L_Q_FYM_launchSubProjectile(world, startLoc, dir, player, attr, damage, color) { let traveled = 0; const RunnableImpl = Java.extend(Java.type('java.lang.Runnable'), { run: function() { if (traveled >= KOMUTECH_L_Q_FYM_MAX_DIST * 0.7 || !player.isOnline() || player.getWorld() !== world) { task.cancel(); return; } traveled += KOMUTECH_L_Q_FYM_SUB_SPEED; const currentLoc = startLoc.clone().add(dir.clone().multiply(traveled)); for (let i = 0; i < 6; i++) { const off = (Math.random()-0.5)*0.5; world.spawnParticle(Particle.DUST, currentLoc.getX()+off, currentLoc.getY()+off, currentLoc.getZ()+off, 1, 0, 0, 0, 0, new DustOptions(color, 0.8)); } const entities = world.getNearbyLivingEntities(currentLoc, 0.8, 0.8, 0.8); let hit = false; for (let i = 0; i < entities.size(); i++) { const e = entities.get(i); if (e !== player && e.getType().name() !== "ARMOR_STAND" && !e.isDead()) { KOMUTECH_L_Q_FYM_damageEntity(e, player, damage * 0.6, attr); hit = true; } } if (hit) { task.cancel(); KOMUTECH_L_Q_FYM_hitBurst(world, currentLoc, color); } } }); const task = Bukkit.getScheduler().runTaskTimer(plugin, new RunnableImpl(), 0, 1); }
function KOMUTECH_L_Q_FYM_launchMainProjectile(player, attr, item) {
    const world = player.getWorld(); const eye = player.getEyeLocation(); const dir = eye.getDirection(); const startLoc = eye.clone().add(dir);
    const damage = (attr["攻击力_实际"] || 0) * KOMUTECH_L_Q_FYM_getDamageScale(item) * KOMUTECH_L_Q_FYM_realmCoef(KOMUTECH_L_Q_FYM_spiritVal(attr)) * (KOMUTECH_L_Q_FYM_ATTR_MAP[attr["灵根属性"]] || 1.0);
    const color = KOMUTECH_L_Q_FYM_hexToColor("#b0e0e6"); const endColor = KOMUTECH_L_Q_FYM_hexToColor("#ffffff");
    let traveled = 0, splitTriggered = false, sparkTick = 0;
    const RunnableImpl = Java.extend(Java.type('java.lang.Runnable'), { run: function() {
        if (traveled >= KOMUTECH_L_Q_FYM_MAX_DIST || !player.isOnline() || player.isDead() || player.getWorld() !== world) { task.cancel(); if (traveled >= KOMUTECH_L_Q_FYM_MAX_DIST) { const finalLoc = startLoc.clone().add(dir.clone().multiply(traveled)); KOMUTECH_L_Q_FYM_hitBurst(world, finalLoc, color); KOMUTECH_L_Q_FYM_spawnResidue(world, finalLoc, player, attr, damage, color); } return; }
        traveled += KOMUTECH_L_Q_FYM_PROJECTILE_SPEED; const currentLoc = startLoc.clone().add(dir.clone().multiply(traveled));
        for (let i = 0; i < 10; i++) { const off = (Math.random()-0.5)*0.6; world.spawnParticle(Particle.DUST, currentLoc.getX()+off, currentLoc.getY()+off, currentLoc.getZ()+off, 1, 0, 0, 0, 0, new DustOptions(color, 1.2)); }
        for (let i = 0; i < 2; i++) { const off = (Math.random()-0.5)*1.2; world.spawnParticle(Particle.DUST, currentLoc.getX()+off, currentLoc.getY()+off, currentLoc.getZ()+off, 1, 0, 0, 0, 0, new DustOptions(endColor, 0.5)); }
        sparkTick++; if (sparkTick % KOMUTECH_L_Q_FYM_TRAIL_SPARK_INTERVAL === 0) KOMUTECH_L_Q_FYM_createTrailSpark(world, currentLoc.clone(), color);
        if (!splitTriggered && traveled >= KOMUTECH_L_Q_FYM_MAX_DIST * KOMUTECH_L_Q_FYM_SPLIT_DISTANCE_RATIO) { splitTriggered = true; const right = dir.clone().crossProduct(new Vector(0,1,0)).normalize(); const subDir1 = dir.clone().add(right.clone().multiply(KOMUTECH_L_Q_FYM_SUB_ANGLE)).normalize(); const subDir2 = dir.clone().add(right.clone().multiply(-KOMUTECH_L_Q_FYM_SUB_ANGLE)).normalize(); KOMUTECH_L_Q_FYM_launchSubProjectile(world, currentLoc.clone(), subDir1, player, attr, damage, color); KOMUTECH_L_Q_FYM_launchSubProjectile(world, currentLoc.clone(), subDir2, player, attr, damage, color); KOMUTECH_L_Q_FYM_launchSubProjectile(world, currentLoc.clone(), dir, player, attr, damage, color); }
        const entities = world.getNearbyLivingEntities(currentLoc, 1, 1, 1); let hitEntity = null; for (let i = 0; i < entities.size(); i++) { const e = entities.get(i); if (e !== player && e.getType().name() !== "ARMOR_STAND" && !e.isDead()) { hitEntity = e; break; } }
        if (hitEntity) { task.cancel(); KOMUTECH_L_Q_FYM_hitBurst(world, currentLoc, color); const chg = KOMUTECH_L_Q_FYM_damageEntity(hitEntity, player, damage, attr); if (hitEntity instanceof Player) return; player.sendMessage((KOMUTECH_L_Q_FYM_WHITE_LIST.includes(hitEntity.getType().name()) ? "§c攻击§6" + hitEntity.getType().name() + "§c，煞气+" + Math.abs(chg) + "§c！" : "§a攻击§6" + hitEntity.getType().name() + "§a，功德+" + chg + "§a！")); KOMUTECH_L_Q_FYM_spawnResidue(world, currentLoc, player, attr, damage, color); }
    }});
    const task = Bukkit.getScheduler().runTaskTimer(plugin, new RunnableImpl(), 0, 1);
}
function KOMUTECH_L_Q_FYM_onUse(e) {
    if (!KOMUTECH_L_Q_FYM_configLoaded) { e.getPlayer().sendMessage("§c" + KOMUTECH_L_Q_FYM_STAFF_NAME + "配置缺失: " + KOMUTECH_L_Q_FYM_configErrorMsg); return; }
    if (e.getHand() !== EquipmentSlot.HAND) return;
    const p = e.getPlayer(); const item = e.getItem(); if (!item || !item.hasItemMeta()) return;
    const name = p.getName(); const uuid = p.getUniqueId().toString();
    if (p.isSneaking()) { KOMUTECH_L_Q_FYM_castScroll(p, item); return; }
    if (KOMUTECH_L_Q_FYM_isDoubleClick(uuid)) { KOMUTECH_L_Q_FYM_switchScroll(p, item); return; }
    const attr = KOMUTECH_L_Q_FYM_readAttr(name);
    if (!attr) { p.sendMessage("§c无法读取属性数据"); return; }
    const cd = KOMUTECH_L_Q_FYM_calcCooldown(attr); const cost = KOMUTECH_L_Q_FYM_calcEnergyCost(attr);
    const cooldowns = globalThis.KOMUTECH.灵杖冷却;
    const now = Bukkit.getServer().getCurrentTick(); const last = cooldowns.getOrDefault(uuid, 0);
    if (now - last < cd) { KOMUTECH_L_Q_FYM_sendActionBar(p, "§c✖ 冷却中！剩余 §6" + ((cd - (now - last)) * 0.05).toFixed(1) + " §c秒"); return; }
    const parsedLi = KOMUTECH_L_Q_FYM_parseLingLi(attr["灵力"]); const curLi = parsedLi ? parsedLi.current : 0;
    if (curLi < cost) { KOMUTECH_L_Q_FYM_sendActionBar(p, `§c灵力不足！当前 §6${curLi.toFixed(2)}§c / 需要 §6${cost}`); return; }
    parsedLi.current -= cost;
    attr["灵力"] = parsedLi.current.toFixed(2) + "/" + parsedLi.baseMax + "+" + parsedLi.extraMax;
    cooldowns.put(uuid, now);
    KOMUTECH_L_Q_FYM_sendActionBar(p, `§a消耗 ${cost} 灵力 §7| §f剩余 ${parsedLi.current.toFixed(0)}/${parsedLi.baseMax + parsedLi.extraMax}`);
    p.getWorld().playSound(p.getLocation(), "entity.evoker.cast_spell", 1, 1);
    KOMUTECH_L_Q_FYM_launchMainProjectile(p, attr, item);
    KOMUTECH_L_Q_FYM_writeAttr(name, attr);
}
globalThis.onUse = KOMUTECH_L_Q_FYM_onUse;
})();