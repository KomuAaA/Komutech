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
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
const FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const Vector = Java.type('org.bukkit.util.Vector');
const Location = Java.type('org.bukkit.Location');
const plugin = Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
globalThis.KOMUTECH = globalThis.KOMUTECH || {};
globalThis.KOMUTECH.卷轴冷却 = globalThis.KOMUTECH.卷轴冷却 || new java.util.HashMap();
const KOMUTECH_L_JZ_YLJHJ_CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/卷轴属性.json";
const KOMUTECH_L_JZ_YLJHJ_SKILL_ID = "游龙惊鸿诀";
const KOMUTECH_L_JZ_YLJHJ_SCROLL_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣";
const KOMUTECH_L_JZ_YLJHJ_ATTR_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const KOMUTECH_L_JZ_YLJHJ_PVP_LIST_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json";
let KOMUTECH_L_JZ_YLJHJ_COMMON, KOMUTECH_L_JZ_YLJHJ_SELF, KOMUTECH_L_JZ_YLJHJ_cfgLoaded = false, KOMUTECH_L_JZ_YLJHJ_configErrorMsg = "";
try {
    const raw = Files.readString(Paths.get(KOMUTECH_L_JZ_YLJHJ_CONFIG_PATH), StandardCharsets.UTF_8);
    if (!raw) throw "配置文件不存在";
    const all = JSON.parse(raw);
    KOMUTECH_L_JZ_YLJHJ_COMMON = all["公共规则"];
    KOMUTECH_L_JZ_YLJHJ_SELF = all[KOMUTECH_L_JZ_YLJHJ_SKILL_ID];
    if (!KOMUTECH_L_JZ_YLJHJ_COMMON) throw "缺少 公共规则";
    if (!KOMUTECH_L_JZ_YLJHJ_SELF) throw "缺少 " + KOMUTECH_L_JZ_YLJHJ_SKILL_ID;
    const required = ["基础伤害","射程","基础灵力消耗","基础冷却","熟练度上限"];
    for (let k of required) if (KOMUTECH_L_JZ_YLJHJ_SELF[k] === undefined) throw "缺少 " + k;
    KOMUTECH_L_JZ_YLJHJ_cfgLoaded = true;
} catch(e) { KOMUTECH_L_JZ_YLJHJ_configErrorMsg = String(e); print("[游龙惊鸿诀] 配置加载失败: " + e); }
function KOMUTECH_L_JZ_YLJHJ_sendActionBar(p, msg) { p.spigot().sendMessage(ChatMessageType.ACTION_BAR, TextComponent.fromLegacyText(msg)); }
function KOMUTECH_L_JZ_YLJHJ_hexToColor(hex) { const h = hex.replace('#',''); return Color.fromRGB(parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)); }
function KOMUTECH_L_JZ_YLJHJ_parseLingLi(s) {
    if (!s) return null;
    const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)?$/);
    if (m) return { current: parseFloat(m[1]), baseMax: parseFloat(m[2]), extraMax: m[3] ? parseFloat(m[3]) : 0 };
    const sm = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (sm) return { current: parseFloat(sm[1]), baseMax: parseFloat(sm[2]), extraMax: 0 };
    return null;
}
function KOMUTECH_L_JZ_YLJHJ_spiritVal(data) { const s = data["灵气"]; if (!s) return 0; const m = s.match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; }
function KOMUTECH_L_JZ_YLJHJ_realmCoef(spirit, realmTable) {
    if (spirit < 100) return 0.1;
    if (spirit >= 100000000000) return 66;
    const thresholds = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
    const realmNames = ["引气入体","练气","筑基","金丹","元婴","化神","大成","渡劫","飞升","神人"];
    let idx = 0;
    for (let i = 1; i < thresholds.length; i++) { if (spirit < thresholds[i]) { idx = i - 1; break; } idx = i; }
    if (spirit >= 1000000000) idx = 7;
    const realmArr = realmTable[realmNames[idx]];
    if (!realmArr) return 1;
    const base = idx === 0 ? 100 : thresholds[idx];
    const range = idx === 7 ? 100000000000 - 1000000000 : thresholds[idx + 1] - base;
    const step = Math.floor(range / 9);
    const rank = Math.floor((spirit - base) / step);
    return realmArr[Math.min(rank, realmArr.length - 1)];
}
function KOMUTECH_L_JZ_YLJHJ_getDamageScale(staff) {
    if (!staff || !staff.hasItemMeta()) return 1.0;
    const lore = staff.getItemMeta().getLore();
    if (!lore) return 1.0;
    const damageMap = KOMUTECH_L_JZ_YLJHJ_COMMON["品阶伤害倍率"];
    if (!damageMap) return 1.0;
    for (let line of lore) { if (!line) continue; const clean = line.replace(/§./g, ''); const m = clean.match(/『([^』]+)阶』/); if (m) return damageMap[m[1] + '阶']; }
    return 1.0;
}
function KOMUTECH_L_JZ_YLJHJ_loadScrollData(name) { try { const p = Paths.get(KOMUTECH_L_JZ_YLJHJ_SCROLL_DIR, '[' + name + ']云篆匣.json'); if (!Files.exists(p)) return null; return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[游龙惊鸿诀] 读取卷轴数据失败: " + e); return null; } }
function KOMUTECH_L_JZ_YLJHJ_saveScrollData(name, data) { try { const p = Paths.get(KOMUTECH_L_JZ_YLJHJ_SCROLL_DIR, '[' + name + ']云篆匣.json'); new File(KOMUTECH_L_JZ_YLJHJ_SCROLL_DIR).mkdirs(); Files.writeString(p, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[游龙惊鸿诀] 保存卷轴数据失败: " + e); } }
function KOMUTECH_L_JZ_YLJHJ_getProficiency(playerName, skillId) { const data = KOMUTECH_L_JZ_YLJHJ_loadScrollData(playerName); if (!data || !data.熟练度记录) return 0; return data.熟练度记录[skillId] || 0; }
function KOMUTECH_L_JZ_YLJHJ_addProficiency(playerName, skillId, amount, max) {
    const data = KOMUTECH_L_JZ_YLJHJ_loadScrollData(playerName);
    if (!data) return 0;
    if (!data.熟练度记录) data.熟练度记录 = {};
    const old = data.熟练度记录[skillId] || 0;
    const added = Math.min(amount, max - old);
    if (added > 0) { data.熟练度记录[skillId] = old + added; KOMUTECH_L_JZ_YLJHJ_saveScrollData(playerName, data); }
    return added;
}
function KOMUTECH_L_JZ_YLJHJ_loadPvpList() {
    try {
        const path = Paths.get(KOMUTECH_L_JZ_YLJHJ_PVP_LIST_PATH);
        if (!Files.exists(path)) return [];
        const data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        return Array.isArray(data) ? data : Object.keys(data);
    } catch (e) { return []; }
}
function KOMUTECH_L_JZ_YLJHJ_isPvpEnabled(playerName) {
    const list = KOMUTECH_L_JZ_YLJHJ_loadPvpList();
    return !list.includes(playerName);
}
const KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_MAIN = ["#f0e68c","#ffd700","#ffb400","#ff8c00"];
const KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_SUB1 = ["#fc6076","#fd7a5f","#ff9a44","#fd7a5f","#fc6076"];
const KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_SUB2 = ["#fbc2eb","#d1c2ed","#a6c1ee","#d1c2ed","#fbc2eb"];
const KOMUTECH_L_JZ_YLJHJ_DRAGON_FLAP = "entity.ender_dragon.flap";
const KOMUTECH_L_JZ_YLJHJ_SOUND_CAST = "entity.evoker.cast_spell";
const KOMUTECH_L_JZ_YLJHJ_POSITIVE_EFFECTS = [
    { type: "RESISTANCE", duration: 3600, amplifier: 4 },
    { type: "STRENGTH", duration: 3600, amplifier: 3 },
    { type: "REGENERATION", duration: 3600, amplifier: 4 },
    { type: "ABSORPTION", duration: 3600, amplifier: 4 }
];
const KOMUTECH_L_JZ_YLJHJ_NEGATIVE_NAMES = ["SLOWNESS","MINING_FATIGUE","INSTANT_DAMAGE","NAUSEA","BLINDNESS","HUNGER","WEAKNESS","POISON","WITHER","LEVITATION","UNLUCK","BAD_OMEN","DARKNESS"];
const KOMUTECH_L_JZ_YLJHJ_PHASE1_TICKS = 60;
const KOMUTECH_L_JZ_YLJHJ_TOTAL_TICKS = 380;
const KOMUTECH_L_JZ_YLJHJ_MAIN_SPEED = 1.5;
const KOMUTECH_L_JZ_YLJHJ_MAIN_ATTACK_SPEED = 2.2;
const KOMUTECH_L_JZ_YLJHJ_MAIN_RETURN_SPEED = 0.3;
const KOMUTECH_L_JZ_YLJHJ_SUB_ATTACK_SPEED = 2.5;
const KOMUTECH_L_JZ_YLJHJ_SUB_RETURN_SPEED = 0.5;
const KOMUTECH_L_JZ_YLJHJ_SUB_BOUNCE_SPEED = 1.5;
const KOMUTECH_L_JZ_YLJHJ_SUB_HIT_RANGE_SQ = 6.25;
const KOMUTECH_L_JZ_YLJHJ_SUB_RETURN_SYNC_DIST_SQ = 1.0;
const KOMUTECH_L_JZ_YLJHJ_SUB_SCAN_INTERVAL = 20;
const KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_WRAP = 6;
const KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_ATK = 5;
const KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_SUB = 6;
const KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_AOE = 8;
const KOMUTECH_L_JZ_YLJHJ_SOUND_INTERVAL = 40;
const KOMUTECH_L_JZ_YLJHJ_END_ASCEND_SPEED = 1.0;
const KOMUTECH_L_JZ_YLJHJ_END_DAMAGE_INTERVAL = 5;
const KOMUTECH_L_JZ_YLJHJ_END_LIFT_POWER = 0.8;
const KOMUTECH_L_JZ_YLJHJ_HISTORY_SIZE = 5;
function KOMUTECH_L_JZ_YLJHJ_getTrailPosMain(center, time) {
    const baseAngle = time * KOMUTECH_L_JZ_YLJHJ_MAIN_SPEED;
    const radius = 2.3 + Math.sin(time * 0.4) * 0.3;
    const height = Math.sin(time * 0.5) * 1.2;
    const x = center.getX() + radius * Math.cos(baseAngle);
    const z = center.getZ() + radius * Math.sin(baseAngle);
    const y = center.getY() + 1.5 + height;
    return new Location(center.getWorld(), x, y, z);
}
function KOMUTECH_L_JZ_YLJHJ_getTrailPosSub(center, time, phaseOffset) {
    const baseAngle = time * 0.5 + phaseOffset;
    const radius = 3.8 + Math.sin(time * 0.3) * 0.4;
    const height = Math.sin(time * 0.8) * 1.5;
    const x = center.getX() + radius * Math.cos(baseAngle);
    const z = center.getZ() + radius * Math.sin(baseAngle);
    const y = center.getY() + 2.0 + height;
    return new Location(center.getWorld(), x, y, z);
}
globalThis.castScroll = function(player, staff, attr) {
    if (!KOMUTECH_L_JZ_YLJHJ_cfgLoaded) { player.sendMessage("§c配置文件丢失: " + KOMUTECH_L_JZ_YLJHJ_configErrorMsg); return; }
    const baseDamage = KOMUTECH_L_JZ_YLJHJ_SELF["基础伤害"];
    const maxDist = KOMUTECH_L_JZ_YLJHJ_SELF["射程"];
    const energyCost = KOMUTECH_L_JZ_YLJHJ_SELF["基础灵力消耗"];
    const baseCooldown = KOMUTECH_L_JZ_YLJHJ_SELF["基础冷却"];
    const maxProficiency = KOMUTECH_L_JZ_YLJHJ_SELF["熟练度上限"];
    const meritRange = KOMUTECH_L_JZ_YLJHJ_COMMON["功德变化范围"];
    const whiteList = KOMUTECH_L_JZ_YLJHJ_COMMON["白名单生物"];
    const realmTable = KOMUTECH_L_JZ_YLJHJ_COMMON["修为倍率"];
    const attrMap = KOMUTECH_L_JZ_YLJHJ_COMMON["灵根属性倍率"];
    const formula = KOMUTECH_L_JZ_YLJHJ_COMMON["公式参数"];
    const spirit = KOMUTECH_L_JZ_YLJHJ_spiritVal(attr);
    const realmCo = KOMUTECH_L_JZ_YLJHJ_realmCoef(spirit, realmTable);
    const linggenAttr = attr["灵根属性"];
    const linggenCo = attrMap[linggenAttr];
    if (!linggenCo) { player.sendMessage("§c未知灵根属性: " + linggenAttr); return; }
    const gengu = parseFloat(attr["根骨"]) || 1;
    const wuxing = parseFloat(attr["悟性"]) || 1;
    let attackActual = attr["攻击力_实际"];
    if (typeof attackActual !== 'number' || isNaN(attackActual)) attackActual = 1.0;
    const damageScale = KOMUTECH_L_JZ_YLJHJ_getDamageScale(staff);
    const playerName = player.getName();
    let prof = KOMUTECH_L_JZ_YLJHJ_getProficiency(playerName, KOMUTECH_L_JZ_YLJHJ_SKILL_ID);
    const profDmgFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增伤因子"] || 0);
    let finalDamage = attackActual * damageScale * realmCo * linggenCo * baseDamage * profDmgFactor;
    if (isNaN(finalDamage) || finalDamage <= 0) finalDamage = 5.0;
    const profCostFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增耗因子"] || 0);
    const finalCost = Math.max(1, Math.round(energyCost * realmCo * linggenCo * gengu * profCostFactor));
    const wxReduction = Math.min(formula["悟性最大减免比例"] || 0.5, (wuxing - 1) * (formula["冷却减免因子_悟性"] || 0.05));
    const profReduction = Math.min(formula["熟练度最大减免比例"] || 0.3, Math.floor(prof / 100) * (formula["冷却减免因子_熟练度"] || 0.003));
    const totalReduction = Math.min(0.95, wxReduction + profReduction);
    const finalCd = Math.max(formula["最小冷却"] || 4, Math.floor(baseCooldown * (1 - totalReduction)));
    const cdMap = globalThis.KOMUTECH.卷轴冷却;
    const uuid = player.getUniqueId().toString();
    const cdKey = uuid + "_" + KOMUTECH_L_JZ_YLJHJ_SKILL_ID;
    const now = Bukkit.getServer().getCurrentTick();
    const last = cdMap.getOrDefault(cdKey, 0);
    if (now - last < finalCd) { KOMUTECH_L_JZ_YLJHJ_sendActionBar(player, "§c✖ 冷却中！剩余 §6" + ((finalCd - (now - last)) * 0.05).toFixed(1) + " §c秒"); return; }
    const parsedLi = KOMUTECH_L_JZ_YLJHJ_parseLingLi(attr["灵力"]);
    const curLi = parsedLi ? parsedLi.current : 0;
    if (curLi < finalCost) { KOMUTECH_L_JZ_YLJHJ_sendActionBar(player, `§c灵力不足！当前 §6${curLi.toFixed(2)}§c / 需要 §6${finalCost}`); return; }
    parsedLi.current -= finalCost;
    attr["灵力"] = parsedLi.current.toFixed(2) + "/" + parsedLi.baseMax + "+" + parsedLi.extraMax;
    cdMap.put(cdKey, now);
    KOMUTECH_L_JZ_YLJHJ_sendActionBar(player, `§a消耗 ${finalCost} 灵力 §7| §f剩余 ${parsedLi.current.toFixed(0)}/${parsedLi.baseMax + parsedLi.extraMax}`);
    const actualAdd = KOMUTECH_L_JZ_YLJHJ_addProficiency(playerName, KOMUTECH_L_JZ_YLJHJ_SKILL_ID, Math.floor(Math.random() * 10) + 1, maxProficiency);
    if (actualAdd > 0) player.sendMessage(`§b熟练度+${actualAdd}`);
    const world = player.getWorld();
    world.playSound(player.getLocation(), KOMUTECH_L_JZ_YLJHJ_SOUND_CAST, 1, 1);
    for (let e of KOMUTECH_L_JZ_YLJHJ_POSITIVE_EFFECTS) { const t = PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft(e.type.toLowerCase())); if (t) player.addPotionEffect(new PotionEffect(t, e.duration, e.amplifier)); }
    for (let n of KOMUTECH_L_JZ_YLJHJ_NEGATIVE_NAMES) { const t = PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft(n.toLowerCase())); if (t) player.removePotionEffect(t); }
    const cache = { damage: finalDamage, white: 0, nonWhite: 0 };
    const attackerPvpEnabled = KOMUTECH_L_JZ_YLJHJ_isPvpEnabled(playerName);
    function KOMUTECH_L_JZ_YLJHJ_isValidTarget(entity) {
        if (!entity || entity === player || entity.getType().name() === "ARMOR_STAND" || entity.isDead() || !(entity instanceof LivingEntity)) return false;
        if (entity instanceof Player) {
            if (!attackerPvpEnabled) return false;
            const victimName = entity.getName();
            if (!KOMUTECH_L_JZ_YLJHJ_isPvpEnabled(victimName)) return false;
        }
        return true;
    }
    function KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(center, range, mult) {
        const ents = world.getNearbyLivingEntities(center, range, range, range);
        for (let i = 0; i < ents.size(); i++) {
            const e = ents.get(i);
            if (!KOMUTECH_L_JZ_YLJHJ_isValidTarget(e)) continue;
            e.damage(cache.damage * mult, player);
            if (!(e instanceof Player)) {
                const w = whiteList.includes(e.getType().name());
                if (w) cache.white++; else cache.nonWhite++;
            }
        }
    }
    function KOMUTECH_L_JZ_YLJHJ_getClosestEnemyExcluding(center, range, exclude) {
        let best = null, bestDist = range * range;
        const ents = world.getNearbyLivingEntities(center, range, range, range);
        for (let i = 0; i < ents.size(); i++) {
            const e = ents.get(i);
            if (!KOMUTECH_L_JZ_YLJHJ_isValidTarget(e)) continue;
            if (exclude && e === exclude) continue;
            const d = e.getLocation().distanceSquared(center);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }
    const dragons = [
        { pos: new Vector(), history: [], colors: KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_MAIN, target: null },
        { pos: new Vector(), history: [], colors: KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_SUB1, target: null },
        { pos: new Vector(), history: [], colors: KOMUTECH_L_JZ_YLJHJ_TRAIL_COLORS_SUB2, target: null }
    ];
    let globalTick = 0, ending = false, sightEnemy = null;
    function KOMUTECH_L_JZ_YLJHJ_tick() {
        try {
            if (!player.isOnline() || player.isDead() || player.getWorld() !== world) return;
            if (ending) {
                for (let d of dragons) {
                    d.pos.add(new Vector(0, KOMUTECH_L_JZ_YLJHJ_END_ASCEND_SPEED, 0));
                    d.history.unshift(d.pos.clone());
                    if (d.history.length > KOMUTECH_L_JZ_YLJHJ_HISTORY_SIZE) d.history.pop();
                    for (let i = 0; i < d.history.length; i++) {
                        const p = d.history[i];
                        const factor = 1 - i / KOMUTECH_L_JZ_YLJHJ_HISTORY_SIZE;
                        const colorHex = d.colors[Math.floor((Date.now()/1000*4+i) % d.colors.length)];
                        const size = 1 + factor * 6;
                        world.spawnParticle(Particle.DUST, p.toLocation(world), 1, 0, 0, 0, 0, new DustOptions(KOMUTECH_L_JZ_YLJHJ_hexToColor(colorHex), size));
                        if (i === 0) world.spawnParticle(Particle.FLAME, p.toLocation(world), 1, 0, 0, 0, 0.01);
                    }
                    if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_AOE === 0) {
                        const loc = d.pos.toLocation(world);
                        KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(loc, 2, 0.3);
                        const nearby = world.getNearbyLivingEntities(loc, 2, 2, 2);
                        for (let j = 0; j < nearby.size(); j++) {
                            const ent = nearby.get(j);
                            if (!KOMUTECH_L_JZ_YLJHJ_isValidTarget(ent)) continue;
                            ent.setVelocity(new Vector(0, KOMUTECH_L_JZ_YLJHJ_END_LIFT_POWER, 0));
                        }
                    }
                }
                if (globalTick % KOMUTECH_L_JZ_YLJHJ_END_DAMAGE_INTERVAL === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(player.getLocation().add(0, 1, 0), 3, 0.5);
                if (globalTick < 40) {
                    globalTick++;
                    runLater(KOMUTECH_L_JZ_YLJHJ_tick, 1);
                } else {
                    player.sendMessage("§6✦ §e龙魂归元·消散无踪");
                    const [min, max] = meritRange; let ch = 0;
                    if (cache.white > 0) ch -= cache.white * (Math.floor(Math.random() * (max - min + 1)) + min);
                    if (cache.nonWhite > 0) ch += cache.nonWhite * (Math.floor(Math.random() * (max - min + 1)) + min);
                    if (ch !== 0) { attr["功德"] = Math.max(0, (attr["功德"] || 0) + ch); if (ch < 0) attr["煞气"] = (attr["煞气"] || 0) + Math.abs(ch); }
                }
                return;
            }
            const center = player.getLocation().add(0, 1, 0);
            const playerLoc = player.getLocation();
            const time = Date.now() / 1000;
            const isPhase1 = globalTick < KOMUTECH_L_JZ_YLJHJ_PHASE1_TICKS;
            const isPhase2 = globalTick >= KOMUTECH_L_JZ_YLJHJ_PHASE1_TICKS && globalTick < KOMUTECH_L_JZ_YLJHJ_TOTAL_TICKS;
            if (isPhase2) {
                const eye = player.getEyeLocation();
                const dir = eye.getDirection();
                const hit = world.rayTrace(eye, dir, maxDist, FluidCollisionMode.NEVER, false, 0.3, e => KOMUTECH_L_JZ_YLJHJ_isValidTarget(e));
                sightEnemy = (hit && hit.getHitEntity()) ? hit.getHitEntity() : null;
            }
            const mainDragon = dragons[0];
            if (isPhase1) {
                mainDragon.pos = KOMUTECH_L_JZ_YLJHJ_getTrailPosMain(center, time).toVector();
                if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_WRAP === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(mainDragon.pos.toLocation(world), 3, 1.0);
            } else if (sightEnemy) {
                const targetLoc = sightEnemy.getLocation().add(0, 1, 0);
                mainDragon.pos.add(targetLoc.toVector().subtract(mainDragon.pos).normalize().multiply(KOMUTECH_L_JZ_YLJHJ_MAIN_ATTACK_SPEED));
                if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_ATK === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(mainDragon.pos.toLocation(world), 3, 0.8);
            } else {
                const idlePos = KOMUTECH_L_JZ_YLJHJ_getTrailPosMain(center, time).toVector();
                if (mainDragon.pos.distanceSquared(idlePos) > 1.0) {
                    mainDragon.pos.add(idlePos.subtract(mainDragon.pos).normalize().multiply(KOMUTECH_L_JZ_YLJHJ_MAIN_RETURN_SPEED));
                } else {
                    mainDragon.pos = idlePos;
                }
                if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_WRAP === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(mainDragon.pos.toLocation(world), 3, 1.0);
            }
            for (let d = 1; d <= 2; d++) {
                const dragon = dragons[d];
                const otherDragon = dragons[d === 1 ? 2 : 1];
                const phaseOffset = d === 1 ? 0 : Math.PI;
                if (!isPhase2) {
                    dragon.pos = KOMUTECH_L_JZ_YLJHJ_getTrailPosSub(center, time, phaseOffset).toVector();
                    if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_SUB === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(dragon.pos.toLocation(world), 3, 0.6);
                    continue;
                }
                if (globalTick % KOMUTECH_L_JZ_YLJHJ_SUB_SCAN_INTERVAL === 0 || !dragon.target || !KOMUTECH_L_JZ_YLJHJ_isValidTarget(dragon.target) || dragon.target.getWorld() !== world) {
                    dragon.target = KOMUTECH_L_JZ_YLJHJ_getClosestEnemyExcluding(playerLoc, maxDist, otherDragon.target);
                }
                if (dragon.target) {
                    const targetLoc = dragon.target.getLocation().add(0, 1, 0);
                    const moveDir = targetLoc.toVector().subtract(dragon.pos).normalize().multiply(KOMUTECH_L_JZ_YLJHJ_SUB_ATTACK_SPEED);
                    dragon.pos.add(moveDir);
                    if (dragon.pos.distanceSquared(targetLoc.toVector()) < KOMUTECH_L_JZ_YLJHJ_SUB_HIT_RANGE_SQ) {
                        if (globalTick % KOMUTECH_L_JZ_YLJHJ_DAMAGE_INTERVAL_MAIN_ATK === 0) KOMUTECH_L_JZ_YLJHJ_applyAoeDamage(dragon.pos.toLocation(world), 3, 0.6);
                        dragon.target = null;
                        const away = dragon.pos.clone().subtract(targetLoc.toVector()).normalize().multiply(KOMUTECH_L_JZ_YLJHJ_SUB_BOUNCE_SPEED);
                        dragon.pos.add(away);
                    }
                } else {
                    const idlePos = KOMUTECH_L_JZ_YLJHJ_getTrailPosSub(center, time, phaseOffset).toVector();
                    const distSq = dragon.pos.distanceSquared(idlePos);
                    if (distSq > KOMUTECH_L_JZ_YLJHJ_SUB_RETURN_SYNC_DIST_SQ) {
                        dragon.pos.add(idlePos.subtract(dragon.pos).normalize().multiply(KOMUTECH_L_JZ_YLJHJ_SUB_RETURN_SPEED));
                    } else {
                        dragon.pos = idlePos;
                    }
                }
            }
            for (let d = 0; d < 3; d++) {
                const dragon = dragons[d];
                dragon.history.unshift(dragon.pos.clone());
                if (dragon.history.length > KOMUTECH_L_JZ_YLJHJ_HISTORY_SIZE) dragon.history.pop();
                for (let i = 0; i < dragon.history.length; i++) {
                    const p = dragon.history[i];
                    const factor = 1 - i / KOMUTECH_L_JZ_YLJHJ_HISTORY_SIZE;
                    const colorHex = dragon.colors[Math.floor((time*4+i) % dragon.colors.length)];
                    const size = 2 + factor * 6;
                    world.spawnParticle(Particle.DUST, p.toLocation(world), 1, 0, 0, 0, 0, new DustOptions(KOMUTECH_L_JZ_YLJHJ_hexToColor(colorHex), size));
                    if (i === 0) world.spawnParticle(Particle.FLAME, p.toLocation(world), 1, 0, 0, 0, 0.01);
                }
            }
            if (globalTick % KOMUTECH_L_JZ_YLJHJ_SOUND_INTERVAL === 0) world.playSound(center, KOMUTECH_L_JZ_YLJHJ_DRAGON_FLAP, 0.08, 0.8 + Math.random() * 0.5);
            globalTick++;
            if (globalTick >= KOMUTECH_L_JZ_YLJHJ_TOTAL_TICKS) {
                ending = true;
                globalTick = 0;
                player.sendMessage("§6✦ §e龙魂冲天·牵引归元");
            }
            runLater(KOMUTECH_L_JZ_YLJHJ_tick, 1);
        } catch (e) { }
    }
    runLater(KOMUTECH_L_JZ_YLJHJ_tick, 1);
};
})();