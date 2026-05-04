(function() {
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const File = Java.type('java.io.File');
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
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
const KOMUTECH_L_Q_KYJ_STAFF_NAME = "空引津";
const KOMUTECH_L_Q_KYJ_ATTR_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const KOMUTECH_L_Q_KYJ_CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵杖属性.json";
const KOMUTECH_L_Q_KYJ_SCROLL_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣";
const KOMUTECH_L_Q_KYJ_SCROLL_SCRIPT_DIR = "L_卷轴"; const KOMUTECH_L_Q_KYJ_SCROLL_PREFIX = "KOMUTECH_L_JZ_"; const KOMUTECH_L_Q_KYJ_CAST_FUNC_NAME = "castScroll";
const KOMUTECH_L_Q_KYJ_PVP_LIST_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json";
const KOMUTECH_L_Q_KYJ_SPHERE_RADIUS = 1.5; const KOMUTECH_L_Q_KYJ_SPHERE_PARTICLE_COUNT = 8; const KOMUTECH_L_Q_KYJ_SPHERE_MOVE_STEPS = 12; const KOMUTECH_L_Q_KYJ_SPHERE_MOVE_INTERVAL = 2;
const KOMUTECH_L_Q_KYJ_AREA_DAMAGE_INTERVAL = 2; const KOMUTECH_L_Q_KYJ_CIRCLE_RADIUS = 6; const KOMUTECH_L_Q_KYJ_CIRCLE_HEIGHT = 1; const KOMUTECH_L_Q_KYJ_CIRCLE_PARTICLE_COUNT = 8; const KOMUTECH_L_Q_KYJ_CIRCLE_DAMAGE_INTERVAL = 10;
let KOMUTECH_L_Q_KYJ_DAMAGE_MAP, KOMUTECH_L_Q_KYJ_REALM_TABLE, KOMUTECH_L_Q_KYJ_REALM_NAMES, KOMUTECH_L_Q_KYJ_ATTR_MAP, KOMUTECH_L_Q_KYJ_CD_REDUCTION, KOMUTECH_L_Q_KYJ_MIN_CD, KOMUTECH_L_Q_KYJ_GENGU_FACTOR, KOMUTECH_L_Q_KYJ_MERIT_MIN, KOMUTECH_L_Q_KYJ_MERIT_MAX, KOMUTECH_L_Q_KYJ_WHITE_LIST, KOMUTECH_L_Q_KYJ_BASE_CD, KOMUTECH_L_Q_KYJ_BASE_COST, KOMUTECH_L_Q_KYJ_MAX_DIST;
let KOMUTECH_L_Q_KYJ_configLoaded = false; let KOMUTECH_L_Q_KYJ_configErrorMsg = "";
try {
    const pth = Paths.get(KOMUTECH_L_Q_KYJ_CONFIG_PATH); if (!Files.exists(pth)) throw "配置文件不存在";
    const cfg = JSON.parse(Files.readString(pth, StandardCharsets.UTF_8));
    KOMUTECH_L_Q_KYJ_DAMAGE_MAP = cfg["伤害倍率"]; if (!KOMUTECH_L_Q_KYJ_DAMAGE_MAP) throw "缺少 伤害倍率";
    KOMUTECH_L_Q_KYJ_REALM_TABLE = cfg["修为倍率"]; if (!KOMUTECH_L_Q_KYJ_REALM_TABLE) throw "缺少 修为倍率";
    KOMUTECH_L_Q_KYJ_REALM_NAMES = ["引气入体","练气","筑基","金丹","元婴","化神","大成","渡劫","飞升","神人"];
    KOMUTECH_L_Q_KYJ_ATTR_MAP = cfg["灵根属性倍率"]; if (!KOMUTECH_L_Q_KYJ_ATTR_MAP) throw "缺少 灵根属性倍率";
    const FORMULA = cfg["公式参数"]; if (!FORMULA) throw "缺少 公式参数";
    KOMUTECH_L_Q_KYJ_CD_REDUCTION = FORMULA["冷却减免因子"]; KOMUTECH_L_Q_KYJ_MIN_CD = FORMULA["最小冷却"]; KOMUTECH_L_Q_KYJ_GENGU_FACTOR = FORMULA["根骨消耗因子"];
    if (KOMUTECH_L_Q_KYJ_CD_REDUCTION === undefined || KOMUTECH_L_Q_KYJ_MIN_CD === undefined || KOMUTECH_L_Q_KYJ_GENGU_FACTOR === undefined) throw "公式参数不完整";
    const meritRange = cfg["功德变化范围"]; if (!meritRange || !Array.isArray(meritRange) || meritRange.length !== 2) throw "功德变化范围缺失";
    KOMUTECH_L_Q_KYJ_MERIT_MIN = meritRange[0]; KOMUTECH_L_Q_KYJ_MERIT_MAX = meritRange[1];
    KOMUTECH_L_Q_KYJ_WHITE_LIST = cfg["白名单生物"]; if (!KOMUTECH_L_Q_KYJ_WHITE_LIST || !Array.isArray(KOMUTECH_L_Q_KYJ_WHITE_LIST)) throw "白名单生物缺失";
    const staffCfg = cfg[KOMUTECH_L_Q_KYJ_STAFF_NAME]; if (!staffCfg) throw "缺少 " + KOMUTECH_L_Q_KYJ_STAFF_NAME + " 配置";
    KOMUTECH_L_Q_KYJ_BASE_CD = staffCfg["基础冷却"]; KOMUTECH_L_Q_KYJ_BASE_COST = staffCfg["基础消耗"]; KOMUTECH_L_Q_KYJ_MAX_DIST = staffCfg["射程"];
    if (KOMUTECH_L_Q_KYJ_BASE_CD === undefined || KOMUTECH_L_Q_KYJ_BASE_COST === undefined || KOMUTECH_L_Q_KYJ_MAX_DIST === undefined) throw KOMUTECH_L_Q_KYJ_STAFF_NAME + " 配置不完整";
    KOMUTECH_L_Q_KYJ_configLoaded = true;
} catch(e) { KOMUTECH_L_Q_KYJ_configErrorMsg = String(e); print("[" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "] 配置加载失败: " + e); }
function KOMUTECH_L_Q_KYJ_sendActionBar(p, msg) { p.spigot().sendMessage(ChatMessageType.ACTION_BAR, TextComponent.fromLegacyText(msg)); }
function KOMUTECH_L_Q_KYJ_parseLingLi(s) { if (!s) return null; const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)?$/); if (m) return { current: parseFloat(m[1]), baseMax: parseFloat(m[2]), extraMax: m[3] ? parseFloat(m[3]) : 0 }; const sm = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/); if (sm) return { current: parseFloat(sm[1]), baseMax: parseFloat(sm[2]), extraMax: 0 }; return null; }
function KOMUTECH_L_Q_KYJ_readAttr(name) { try { const p = Paths.get(KOMUTECH_L_Q_KYJ_ATTR_DIR, "[" + name + "].json"); return Files.exists(p) ? JSON.parse(Files.readString(p, StandardCharsets.UTF_8)) : null; } catch(e) { print("[" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "] 读取属性失败: " + e); return null; } }
function KOMUTECH_L_Q_KYJ_writeAttr(name, data) { try { const p = Paths.get(KOMUTECH_L_Q_KYJ_ATTR_DIR, "[" + name + "].json"); new File(KOMUTECH_L_Q_KYJ_ATTR_DIR).mkdirs(); Files.writeString(p, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "] 写入属性失败: " + e); } }
function KOMUTECH_L_Q_KYJ_spiritVal(data) { const s = data["灵气"]; if (!s) return 0; const m = s.match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; }
function KOMUTECH_L_Q_KYJ_realmCoef(spirit) { if (spirit < 100) return 0.1; if (spirit >= 100000000000) return 66; const thresholds = [100,1000,10000,100000,1000000,10000000,100000000,1000000000]; let idx = 0; for (let i=1;i<thresholds.length;i++) { if (spirit < thresholds[i]) { idx = i - 1; break; } idx = i; } if (spirit >= 1000000000) idx = 7; const realmName = KOMUTECH_L_Q_KYJ_REALM_NAMES[idx]; const realmArr = KOMUTECH_L_Q_KYJ_REALM_TABLE[realmName]; if (!realmArr) return 1; const base = idx === 0 ? 100 : thresholds[idx]; const range = idx === 7 ? 100000000000 - 1000000000 : thresholds[idx+1] - base; const step = Math.floor(range/9); const rank = Math.floor((spirit-base)/step); return realmArr[Math.min(rank, realmArr.length-1)]; }
function KOMUTECH_L_Q_KYJ_calcEnergyCost(data) { const rCo = KOMUTECH_L_Q_KYJ_realmCoef(KOMUTECH_L_Q_KYJ_spiritVal(data)); const attrName = data["灵根属性"] || "单灵根"; const lCo = KOMUTECH_L_Q_KYJ_ATTR_MAP[attrName] || 1.0; const gengu = parseFloat(data["根骨"]) || 1; return Math.max(1, Math.round(KOMUTECH_L_Q_KYJ_BASE_COST * rCo * lCo * gengu * KOMUTECH_L_Q_KYJ_GENGU_FACTOR)); }
function KOMUTECH_L_Q_KYJ_calcCooldown(data) { const wuxing = parseFloat(data["悟性"]) || 1; return Math.max(KOMUTECH_L_Q_KYJ_MIN_CD, Math.floor(KOMUTECH_L_Q_KYJ_BASE_CD * (1 - (wuxing - 1) * KOMUTECH_L_Q_KYJ_CD_REDUCTION))); }
function KOMUTECH_L_Q_KYJ_getDamageScale(item) { if (!item || !item.hasItemMeta()) return 1.0; const lore = item.getItemMeta().getLore(); if (!lore) return 1.0; for (let line of lore) { if (!line) continue; const clean = line.replace(/§./g,''); const m = clean.match(/『([^』]+)阶』/); if (m) return KOMUTECH_L_Q_KYJ_DAMAGE_MAP[m[1]+'阶'] || 1.0; } return 1.0; }
function KOMUTECH_L_Q_KYJ_loadScrollData(name) { try { const p = Paths.get(KOMUTECH_L_Q_KYJ_SCROLL_DIR, '[' + name + ']云篆匣.json'); if (!Files.exists(p)) return null; return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "] 读取卷轴数据失败: " + e); return null; } }
function KOMUTECH_L_Q_KYJ_getOwnedScrollIds(name) { const data = KOMUTECH_L_Q_KYJ_loadScrollData(name); if (!data || !data.卷轴数据) return []; return data.卷轴数据.filter(id => id != null); }
function KOMUTECH_L_Q_KYJ_extractSkillName(fullId) { return fullId.startsWith(KOMUTECH_L_Q_KYJ_SCROLL_PREFIX) ? fullId.substring(KOMUTECH_L_Q_KYJ_SCROLL_PREFIX.length) : fullId; }
function KOMUTECH_L_Q_KYJ_getBoundSkillName(staff) { if (!staff || !staff.hasItemMeta()) return null; const lore = staff.getItemMeta().getLore(); if (!lore) return null; for (let line of lore) { if (line.startsWith("§b绑定卷轴：")) return line.substring("§b绑定卷轴：§f".length).trim(); } return null; }
function KOMUTECH_L_Q_KYJ_setBoundSkillName(staff, skillName) { const meta = staff.getItemMeta(); let lore = meta.getLore() || []; let found = false; const lineText = "§b绑定卷轴：§f" + skillName; for (let i=0;i<lore.length;i++) { if (lore[i].startsWith("§b绑定卷轴：")) { lore[i] = lineText; found = true; break; } } if (!found) lore.push(lineText); meta.setLore(lore); staff.setItemMeta(meta); }
function KOMUTECH_L_Q_KYJ_switchScroll(player, staff) { const name = player.getName(); const owned = KOMUTECH_L_Q_KYJ_getOwnedScrollIds(name); if (owned.length === 0) { player.sendMessage("§c云篆匣中没有卷轴"); return; } let cur = KOMUTECH_L_Q_KYJ_getBoundSkillName(staff); let idx = -1; for (let i=0;i<owned.length;i++) { if (KOMUTECH_L_Q_KYJ_extractSkillName(owned[i]) === cur) { idx = i; break; } } const nextFullId = owned[(idx+1)%owned.length]; const nextSkillName = KOMUTECH_L_Q_KYJ_extractSkillName(nextFullId); KOMUTECH_L_Q_KYJ_setBoundSkillName(staff, nextSkillName); player.sendMessage("§a切换卷轴: §f" + nextSkillName); }
function KOMUTECH_L_Q_KYJ_castScroll(player, staff) { const skillName = KOMUTECH_L_Q_KYJ_getBoundSkillName(staff); if (!skillName) { player.sendMessage("§c未绑定卷轴"); return; } const scriptPath = KOMUTECH_L_Q_KYJ_SCROLL_SCRIPT_DIR + "/" + skillName + ".js"; try { load(scriptPath); } catch(e) { print("[" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "] 加载脚本失败: " + scriptPath + " - " + e); player.sendMessage("§c技能加载失败"); return; } const func = globalThis[KOMUTECH_L_Q_KYJ_CAST_FUNC_NAME]; if (typeof func !== 'function') { player.sendMessage("§c施法函数未找到"); return; } const name = player.getName(); const attr = KOMUTECH_L_Q_KYJ_readAttr(name); if (!attr) { player.sendMessage("§c无法读取属性数据"); return; } func(player, staff, attr); KOMUTECH_L_Q_KYJ_writeAttr(name, attr); }
const KOMUTECH_L_Q_KYJ_lastClickMap = new java.util.HashMap();
function KOMUTECH_L_Q_KYJ_isDoubleClick(uuid) { const now = Date.now(); const last = KOMUTECH_L_Q_KYJ_lastClickMap.getOrDefault(uuid, 0); KOMUTECH_L_Q_KYJ_lastClickMap.put(uuid, now); return (now - last) < 150; }
function KOMUTECH_L_Q_KYJ_loadPvpList() {
    try {
        const path = Paths.get(KOMUTECH_L_Q_KYJ_PVP_LIST_PATH);
        if (!Files.exists(path)) return [];
        const data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        return Array.isArray(data) ? data : Object.keys(data);
    } catch (e) { return []; }
}
function KOMUTECH_L_Q_KYJ_isPvpEnabled(playerName) {
    const list = KOMUTECH_L_Q_KYJ_loadPvpList();
    return !list.includes(playerName);
}
function KOMUTECH_L_Q_KYJ_applyMeritChange(attr, isWhite) { const change = Math.floor(Math.random() * (KOMUTECH_L_Q_KYJ_MERIT_MAX - KOMUTECH_L_Q_KYJ_MERIT_MIN + 1)) + KOMUTECH_L_Q_KYJ_MERIT_MIN; if (isWhite) { attr["功德"] = Math.max(0, (attr["功德"] || 0) - change); attr["煞气"] = (attr["煞气"] || 0) + change; return -change; } attr["功德"] = (attr["功德"] || 0) + change; return change; }
function KOMUTECH_L_Q_KYJ_safePull(world, center, player, strength) { const entities = world.getNearbyLivingEntities(center, 4.0, 4.0, 4.0); for (let i = 0; i < entities.size(); i++) { const e = entities.get(i); if (e === player || e.getType().name() === "ARMOR_STAND" || e.isDead() || (e instanceof Player && (!KOMUTECH_L_Q_KYJ_isPvpEnabled(player.getName()) || !KOMUTECH_L_Q_KYJ_isPvpEnabled(e.getName())))) continue; try { const diff = center.toVector().subtract(e.getLocation().toVector()); if (diff.lengthSquared() > 0.0001) { e.setVelocity(e.getVelocity().add(diff.normalize().multiply(strength))); } } catch(ex) {} } }
function KOMUTECH_L_Q_KYJ_noteExplosion(world, center, player, attr, damage, pullStrength) { for (let i = 0; i < 50; i++) { const angle = Math.random() * 2 * Math.PI; const r = Math.random() * 5.0; world.spawnParticle(Particle.NOTE, center.getX() + Math.cos(angle)*r, center.getZ() + Math.sin(angle)*r, center.getY() + Math.random()*2.0, 1, 0, 0, 0, Math.floor(Math.random()*25)); } let totalChange = 0; const entities = world.getNearbyLivingEntities(center, 5.0, 5.0, 5.0); for (let i = 0; i < entities.size(); i++) { const e = entities.get(i); if (e === player || e.getType().name() === "ARMOR_STAND" || e.isDead()) continue; if (e instanceof Player) { if (!KOMUTECH_L_Q_KYJ_isPvpEnabled(player.getName()) || !KOMUTECH_L_Q_KYJ_isPvpEnabled(e.getName())) continue; e.damage(damage, player); continue; } const isWhite = KOMUTECH_L_Q_KYJ_WHITE_LIST.includes(e.getType().name()); e.damage(damage, player); totalChange += KOMUTECH_L_Q_KYJ_applyMeritChange(attr, isWhite); const slowness = PotionEffectType.SLOWNESS; if (slowness) e.addPotionEffect(new PotionEffect(slowness, 40, 1)); } if (pullStrength > 0) KOMUTECH_L_Q_KYJ_safePull(world, center, player, pullStrength); if (totalChange !== 0) { player.sendMessage(totalChange > 0 ? "§2✦ §a[空引津] 积德行善！§6+" + totalChange + "功德" : "§4✧ §c[空引津] 损德败行！§6" + totalChange + "功德"); } world.playSound(center, "block.note_block.chime", 0.8, 1.5); }
function KOMUTECH_L_Q_KYJ_createSphereParticles(world, center) { for (let i=0;i<KOMUTECH_L_Q_KYJ_SPHERE_PARTICLE_COUNT;i++) { const theta = Math.random()*2*Math.PI, phi = Math.random()*Math.PI; const r = KOMUTECH_L_Q_KYJ_SPHERE_RADIUS * (0.8+Math.random()*0.2); world.spawnParticle(Particle.NOTE, center.getX()+r*Math.sin(phi)*Math.cos(theta), center.getY()+r*Math.sin(phi)*Math.sin(theta), center.getZ()+r*Math.cos(phi), 1,0,0,0, Math.floor(Math.random()*25)); } }
function KOMUTECH_L_Q_KYJ_createCircleParticles(world, center) { for (let i=0;i<KOMUTECH_L_Q_KYJ_CIRCLE_PARTICLE_COUNT;i++) { const angle = Math.random()*2*Math.PI, r = Math.random()*KOMUTECH_L_Q_KYJ_CIRCLE_RADIUS; world.spawnParticle(Particle.NOTE, center.getX()+Math.cos(angle)*r, center.getY()+(Math.random()-0.5)*KOMUTECH_L_Q_KYJ_CIRCLE_HEIGHT*2, center.getZ()+Math.sin(angle)*r, 1,0,0,0, Math.floor(Math.random()*25)); } }
function KOMUTECH_L_Q_KYJ_processEntityDamage(entity, player, damage, attr) { if (entity===player || !entity.isValid() || entity.getType().name()==="ARMOR_STAND" || entity.isDead()) return 0; if (entity instanceof Player) { if (!KOMUTECH_L_Q_KYJ_isPvpEnabled(player.getName()) || !KOMUTECH_L_Q_KYJ_isPvpEnabled(entity.getName())) return 0; entity.damage(damage, player); return 0; } entity.damage(damage, player); return KOMUTECH_L_Q_KYJ_applyMeritChange(attr, KOMUTECH_L_Q_KYJ_WHITE_LIST.includes(entity.getType().name())); }
function KOMUTECH_L_Q_KYJ_applyAreaDamage(world, center, player, damage, rx, ry, rz, attr) { const entities = world.getNearbyLivingEntities(center, rx, ry, rz); let total = 0; for (let i=0;i<entities.size();i++) total += KOMUTECH_L_Q_KYJ_processEntityDamage(entities.get(i), player, damage, attr); return total; }
function KOMUTECH_L_Q_KYJ_onUse(e) {
    if (!KOMUTECH_L_Q_KYJ_configLoaded) { e.getPlayer().sendMessage("§c" + KOMUTECH_L_Q_KYJ_STAFF_NAME + "配置缺失: " + KOMUTECH_L_Q_KYJ_configErrorMsg); return; }
    if (e.getHand() !== EquipmentSlot.HAND) return;
    const p = e.getPlayer(); const item = e.getItem(); if (!item || !item.hasItemMeta()) return;
    const name = p.getName(); const uuid = p.getUniqueId().toString();
    if (p.isSneaking()) { KOMUTECH_L_Q_KYJ_castScroll(p, item); return; }
    if (KOMUTECH_L_Q_KYJ_isDoubleClick(uuid)) { KOMUTECH_L_Q_KYJ_switchScroll(p, item); return; }
    const attr = KOMUTECH_L_Q_KYJ_readAttr(name); if (!attr) { p.sendMessage("§c无法读取属性数据"); return; }
    const cd = KOMUTECH_L_Q_KYJ_calcCooldown(attr); const cost = KOMUTECH_L_Q_KYJ_calcEnergyCost(attr);
    const cooldowns = globalThis.KOMUTECH.灵杖冷却;
    const now = Bukkit.getServer().getCurrentTick(); const last = cooldowns.getOrDefault(uuid, 0);
    if (now - last < cd) { KOMUTECH_L_Q_KYJ_sendActionBar(p, "§c✖ 冷却中！剩余 §6" + ((cd - (now - last)) * 0.05).toFixed(1) + " §c秒"); return; }
    const parsedLi = KOMUTECH_L_Q_KYJ_parseLingLi(attr["灵力"]); const curLi = parsedLi ? parsedLi.current : 0;
    if (curLi < cost) { KOMUTECH_L_Q_KYJ_sendActionBar(p, `§c灵力不足！当前 §6${curLi.toFixed(2)}§c / 需要 §6${cost}`); return; }
    parsedLi.current -= cost; attr["灵力"] = parsedLi.current.toFixed(2) + "/" + parsedLi.baseMax + "+" + parsedLi.extraMax;
    cooldowns.put(uuid, now); KOMUTECH_L_Q_KYJ_sendActionBar(p, `§a消耗 ${cost} 灵力 §7| §f剩余 ${parsedLi.current.toFixed(0)}/${parsedLi.baseMax + parsedLi.extraMax}`);
    const world = p.getWorld(); world.playSound(p.getLocation(), "entity.evoker.cast_spell", 1, 1);
    const finalDamage = (attr["攻击力_实际"] || 0) * KOMUTECH_L_Q_KYJ_getDamageScale(item) * KOMUTECH_L_Q_KYJ_realmCoef(KOMUTECH_L_Q_KYJ_spiritVal(attr)) * (KOMUTECH_L_Q_KYJ_ATTR_MAP[attr["灵根属性"]] || 1.0);
    const eyeLoc = p.getEyeLocation(); const dir = eyeLoc.getDirection(); const startLoc = eyeLoc.clone().add(dir);
    const stepDist = KOMUTECH_L_Q_KYJ_MAX_DIST / KOMUTECH_L_Q_KYJ_SPHERE_MOVE_STEPS;
    let step = 0, circleTick = 0, totalChange = 0; let firstHit = false;
    const circleLoops = Math.max(1, Math.floor(KOMUTECH_L_Q_KYJ_CIRCLE_DAMAGE_INTERVAL / KOMUTECH_L_Q_KYJ_SPHERE_MOVE_INTERVAL));
    const RunnableImpl = Java.extend(Java.type('java.lang.Runnable'), { run: function() {
        if (!p.isOnline() || p.isDead() || p.getWorld() !== world || step >= KOMUTECH_L_Q_KYJ_SPHERE_MOVE_STEPS) { task.cancel(); if (!firstHit) { const finalLoc = startLoc.clone().add(dir.clone().multiply(stepDist * step)); KOMUTECH_L_Q_KYJ_noteExplosion(world, finalLoc, p, attr, finalDamage, 0.5); } if (totalChange !== 0) { p.sendMessage(totalChange > 0 ? "§2✦ §a[空引津] 积德行善！§6+" + totalChange + "功德" : "§4✧ §c[空引津] 损德败行！§6" + totalChange + "功德"); } KOMUTECH_L_Q_KYJ_writeAttr(name, attr); return; }
        const sphereCenter = startLoc.clone().add(dir.clone().multiply(stepDist * step)); KOMUTECH_L_Q_KYJ_createSphereParticles(world, sphereCenter); KOMUTECH_L_Q_KYJ_createCircleParticles(world, p.getLocation());
        if (step % KOMUTECH_L_Q_KYJ_AREA_DAMAGE_INTERVAL === 0) { const nearby = world.getNearbyLivingEntities(sphereCenter, KOMUTECH_L_Q_KYJ_SPHERE_RADIUS, KOMUTECH_L_Q_KYJ_SPHERE_RADIUS, KOMUTECH_L_Q_KYJ_SPHERE_RADIUS); let hitEntity = null; for (let i = 0; i < nearby.size(); i++) { const e = nearby.get(i); if (e === p || e.getType().name() === "ARMOR_STAND" || e.isDead()) continue; if (!hitEntity) hitEntity = e; totalChange += KOMUTECH_L_Q_KYJ_processEntityDamage(e, p, finalDamage, attr); } if (hitEntity && !firstHit) { firstHit = true; KOMUTECH_L_Q_KYJ_noteExplosion(world, hitEntity.getLocation(), p, attr, finalDamage, 0.6); } }
        circleTick++; if (circleTick >= circleLoops) { circleTick = 0; totalChange += KOMUTECH_L_Q_KYJ_applyAreaDamage(world, p.getLocation(), p, finalDamage, KOMUTECH_L_Q_KYJ_CIRCLE_RADIUS, KOMUTECH_L_Q_KYJ_CIRCLE_HEIGHT, KOMUTECH_L_Q_KYJ_CIRCLE_RADIUS, attr); }
        step++;
    }});
    const task = Bukkit.getScheduler().runTaskTimer(plugin, new RunnableImpl(), 0, KOMUTECH_L_Q_KYJ_SPHERE_MOVE_INTERVAL);
}
globalThis.onUse = KOMUTECH_L_Q_KYJ_onUse;
})();