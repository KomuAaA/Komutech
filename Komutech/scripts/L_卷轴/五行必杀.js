(function() {
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const File = Java.type('java.io.File');
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const Vector = Java.type('org.bukkit.util.Vector');
const Location = Java.type('org.bukkit.Location');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const Player = Java.type('org.bukkit.entity.Player');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const plugin = Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
globalThis.KOMUTECH = globalThis.KOMUTECH || {};
globalThis.KOMUTECH.卷轴冷却 = globalThis.KOMUTECH.卷轴冷却 || new java.util.HashMap();
const SKILL_ID = "五行必杀";
const CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/卷轴属性.json";
const SCROLL_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣";
const ATTR_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const PVP_LIST_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json";
let COMMON, SELF, cfgLoaded = false, configErrorMsg = "";
try {
    const raw = Files.readString(Paths.get(CONFIG_PATH), StandardCharsets.UTF_8);
    const all = JSON.parse(raw);
    COMMON = all["公共规则"];
    SELF = all[SKILL_ID];
    if (!COMMON) throw "缺少 公共规则";
    if (!SELF) throw "缺少 " + SKILL_ID;
    const required = ["基础伤害","射程","基础灵力消耗","基础冷却","熟练度上限"];
    for (let k of required) if (SELF[k] === undefined) throw "缺少 " + k;
    cfgLoaded = true;
} catch(e) { configErrorMsg = String(e); print("[五行必杀] 配置加载失败: " + e); }
function sendActionBar(p, msg) { p.spigot().sendMessage(ChatMessageType.ACTION_BAR, TextComponent.fromLegacyText(msg)); }
function parseLingLi(s) {
    if (!s) return null;
    const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)?$/);
    if (m) return { current: parseFloat(m[1]), baseMax: parseFloat(m[2]), extraMax: m[3] ? parseFloat(m[3]) : 0 };
    const sm = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (sm) return { current: parseFloat(sm[1]), baseMax: parseFloat(sm[2]), extraMax: 0 };
    return null;
}
function spiritVal(data) { const s = data["灵气"]; if (!s) return 0; const m = s.match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; }
function realmCoef(spirit, realmTable) {
    if (spirit < 100) return 0.1;
    if (spirit >= 100000000000) return 66;
    const thresholds = [100,1000,10000,100000,1000000,10000000,100000000,1000000000];
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
function getDamageScale(staff) {
    if (!staff || !staff.hasItemMeta()) return 1.0;
    const lore = staff.getItemMeta().getLore();
    if (!lore) return 1.0;
    const damageMap = COMMON["品阶伤害倍率"];
    if (!damageMap) return 1.0;
    for (let line of lore) { if (!line) continue; const clean = line.replace(/§./g, ''); const m = clean.match(/『([^』]+)阶』/); if (m) return damageMap[m[1] + '阶']; }
    return 1.0;
}
function loadScrollData(name) { try { const p = Paths.get(SCROLL_DIR, '[' + name + ']云篆匣.json'); if (!Files.exists(p)) return null; return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[五行必杀] 读取卷轴数据失败: " + e); return null; } }
function saveScrollData(name, data) { try { const p = Paths.get(SCROLL_DIR, '[' + name + ']云篆匣.json'); new File(SCROLL_DIR).mkdirs(); Files.writeString(p, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[五行必杀] 保存卷轴数据失败: " + e); } }
function getProficiency(playerName, skillId) { const data = loadScrollData(playerName); if (!data || !data.熟练度记录) return 0; return data.熟练度记录[skillId] || 0; }
function addProficiency(playerName, skillId, amount, max) {
    const data = loadScrollData(playerName);
    if (!data) return 0;
    if (!data.熟练度记录) data.熟练度记录 = {};
    const old = data.熟练度记录[skillId] || 0;
    const added = Math.min(amount, max - old);
    if (added > 0) { data.熟练度记录[skillId] = old + added; saveScrollData(playerName, data); }
    return added;
}
function loadPvpList() {
    try { const p = Paths.get(PVP_LIST_PATH); if (!Files.exists(p)) return []; const d = JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); return Array.isArray(d) ? d : Object.keys(d); } catch(e) { return []; }
}
function isPvpEnabled(playerName) { return !loadPvpList().includes(playerName); }
const FONT_SIZE = 3.0, GRID = FONT_SIZE / 15, SPAWN_DISTANCE = 3.5, Y_OFFSET = 0.5, TOTAL_TICK = 80, INIT_DELAY = 5, OFFSET_SCALE = 0.6;
function buildStrokes(drawFn) {
    const all = [], cur = [];
    drawFn((x, y) => { cur.push({ x: (7.5 - x) * GRID, y: (15 - y) * GRID }); }, () => { if (cur.length) { all.push([...cur]); cur.length = 0; } });
    if (cur.length) all.push([...cur]);
    return all;
}
function drawLine(add, end, x1, y1, x2, y2) { const n = 8; for (let i = 0; i <= n; i++) { const t = i / n; add(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t); } end(); }
const getGradientColor = (s, e, t) => Color.fromRGB(Math.round(s.r + (e.r - s.r) * t), Math.round(s.g + (e.g - s.g) * t), Math.round(s.b + (e.b - s.b) * t));
const ELEMENTS = {
    "金": { offset: 0, spark: "WAX_OFF", startColor: {r:245,g:240,b:220}, endColor: {r:255,g:215,b:0}, strokes: buildStrokes((add, end) => { drawLine(add, end, 8,1,1,8); drawLine(add, end, 8,1,15,8); drawLine(add, end, 5,6,12,6); drawLine(add, end, 2,10,14,10); drawLine(add, end, 8,7,8,14); drawLine(add, end, 1,15,15,15); drawLine(add, end, 11,12,9,14); drawLine(add, end, 6,12,7,14); }) },
    "木": { offset: 3, spark: "SCRAPE", startColor: {r:50,g:205,b:50}, endColor: {r:34,g:139,b:34}, strokes: buildStrokes((add, end) => { drawLine(add, end, 8,1,8,15); drawLine(add, end, 1,5,15,5); drawLine(add, end, 7,6,1,12); drawLine(add, end, 9,6,15,12); }) },
    "水": { offset: 6, spark: "SOUL_FIRE_FLAME", startColor: {r:30,g:144,b:255}, endColor: {r:0,g:0,b:255}, strokes: buildStrokes((add, end) => { drawLine(add, end, 8,1,8,15); drawLine(add, end, 8,15,5,13); drawLine(add, end, 2,5,7,5); drawLine(add, end, 7,5,2,11); drawLine(add, end, 12,2,9,5); drawLine(add, end, 9,5,14,11); }) },
    "火": { offset: 9, spark: "SMALL_FLAME", startColor: {r:255,g:69,b:0}, endColor: {r:255,g:0,b:0}, strokes: buildStrokes((add, end) => { drawLine(add, end, 3,3,6,6); drawLine(add, end, 7,1,8,7); drawLine(add, end, 8,7,1,15); drawLine(add, end, 13,3,10,6); drawLine(add, end, 9,8,15,15); }) },
    "土": { offset: 12, spark: "WAX_ON", startColor: {r:210,g:180,b:140}, endColor: {r:139,g:69,b:19}, strokes: buildStrokes((add, end) => { drawLine(add, end, 2,7,14,7); drawLine(add, end, 1,15,15,15); drawLine(add, end, 8,1,8,15); }) }
};
globalThis.castScroll = function(player, staff, attr) {
    if (!cfgLoaded) { player.sendMessage("§c配置文件丢失: " + configErrorMsg); return; }
    const baseDamage = SELF["基础伤害"], maxDist = SELF["射程"], energyCost = SELF["基础灵力消耗"], baseCooldown = SELF["基础冷却"], maxProficiency = SELF["熟练度上限"];
    const meritRange = COMMON["功德变化范围"], whiteList = COMMON["白名单生物"], realmTable = COMMON["修为倍率"], attrMap = COMMON["灵根属性倍率"], formula = COMMON["公式参数"];
    const spirit = spiritVal(attr), realmCo = realmCoef(spirit, realmTable), linggenAttr = attr["灵根属性"], linggenCo = attrMap[linggenAttr];
    if (!linggenCo) { player.sendMessage("§c未知灵根属性: " + linggenAttr); return; }
    const gengu = parseFloat(attr["根骨"]) || 1, wuxing = parseFloat(attr["悟性"]) || 1;
    let attackActual = attr["攻击力_实际"];
    if (typeof attackActual !== 'number' || isNaN(attackActual)) attackActual = 1.0;
    const damageScale = getDamageScale(staff);
    const playerName = player.getName();
    let prof = getProficiency(playerName, SKILL_ID);
    const profDmgFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增伤因子"] || 0);
    let finalDamage = attackActual * damageScale * realmCo * linggenCo * baseDamage * profDmgFactor;
    if (isNaN(finalDamage) || finalDamage <= 0) finalDamage = 5.0;
    const profCostFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增耗因子"] || 0);
    const finalCost = Math.max(1, Math.round(energyCost * realmCo * linggenCo * gengu * profCostFactor));
    const wxReduction = Math.min(formula["悟性最大减免比例"] || 0.5, (wuxing - 1) * (formula["冷却减免因子_悟性"] || 0.05));
    const profReduction = Math.min(formula["熟练度最大减免比例"] || 0.3, Math.floor(prof / 100) * (formula["冷却减免因子_熟练度"] || 0.003));
    const totalReduction = Math.min(0.8, wxReduction + profReduction);
    const finalCd = Math.max(formula["最小冷却"] || 4, Math.floor(baseCooldown * (1 - totalReduction)));
    const cdMap = globalThis.KOMUTECH.卷轴冷却, uuid = player.getUniqueId().toString(), cdKey = uuid + "_" + SKILL_ID;
    const now = Bukkit.getServer().getCurrentTick(), last = cdMap.getOrDefault(cdKey, 0);
    if (now - last < finalCd) { sendActionBar(player, "§c✖ 冷却中！剩余 §6" + ((finalCd - (now - last)) * 0.05).toFixed(1) + " §c秒"); return; }
    const parsedLi = parseLingLi(attr["灵力"]), curLi = parsedLi ? parsedLi.current : 0;
    if (curLi < finalCost) { sendActionBar(player, `§c灵力不足！当前 §6${curLi.toFixed(2)}§c / 需要 §6${finalCost}`); return; }
    parsedLi.current -= finalCost;
    attr["灵力"] = parsedLi.current.toFixed(2) + "/" + parsedLi.baseMax + "+" + parsedLi.extraMax;
    cdMap.put(cdKey, now);
    sendActionBar(player, `§a消耗 ${finalCost} 灵力 §7| §f剩余 ${parsedLi.current.toFixed(0)}/${parsedLi.baseMax + parsedLi.extraMax}`);
    const actualAdd = addProficiency(playerName, SKILL_ID, Math.floor(Math.random() * 10) + 1, maxProficiency);
    if (actualAdd > 0) player.sendMessage(`§b熟练度+${actualAdd}`);
    const world = player.getWorld();
    world.playSound(player.getLocation(), "entity.evoker.cast_spell", 1, 1.2);
    const attackerPvp = isPvpEnabled(playerName);
    function isValidTarget(e) {
        if (!e || e === player || e.getType().name() === "ARMOR_STAND" || e.isDead() || !(e instanceof LivingEntity)) return false;
        if (e instanceof Player) { if (!attackerPvp) return false; if (!isPvpEnabled(e.getName())) return false; }
        return true;
    }
    const cache = { damage: finalDamage, white: 0, nonWhite: 0 };
    function applyAoeDamage(center, range, mult) {
        const ents = world.getNearbyLivingEntities(center, range, range, range);
        for (let i = 0; i < ents.size(); i++) { const e = ents.get(i); if (!isValidTarget(e)) continue; e.damage(cache.damage * mult, player); if (!(e instanceof Player)) { const w = whiteList.includes(e.getType().name()); if (w) cache.white++; else cache.nonWhite++; } }
    }
    const startTick = Bukkit.getServer().getCurrentTick();
    const names = Object.keys(ELEMENTS);
    const eye = player.getEyeLocation(), dir = eye.getDirection();
    const yaw = -eye.getYaw() * Math.PI / 180, pitch = eye.getPitch() * Math.PI / 180;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw), cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const rotate = (x, y, z) => { const x1 = x, y1 = y * cosPitch - z * sinPitch, z1 = y * sinPitch + z * cosPitch; return new Vector(x1 * cosYaw + z1 * sinYaw, y1, -x1 * sinYaw + z1 * cosYaw); };
    const fixedCenters = names.map((name, ni) => { const cfg = ELEMENTS[name]; const distance = SPAWN_DISTANCE + cfg.offset * OFFSET_SCALE; return eye.clone().add(dir.clone().multiply(distance)).add(0, Y_OFFSET, 0); });
    function tick() {
        if (!player.isOnline() || player.isDead() || player.getWorld() !== world) return;
        const elapsed = Bukkit.getServer().getCurrentTick() - startTick;
        if (elapsed >= TOTAL_TICK) {
            player.sendMessage("§6✦ §e五行归元·化作尘埃");
            const [min,max] = meritRange; let ch = 0;
            if (cache.white > 0) ch -= cache.white * (Math.floor(Math.random() * (max - min + 1)) + min);
            if (cache.nonWhite > 0) ch += cache.nonWhite * (Math.floor(Math.random() * (max - min + 1)) + min);
            if (ch !== 0) { attr["功德"] = Math.max(0, (attr["功德"] || 0) + ch); if (ch < 0) attr["煞气"] = (attr["煞气"] || 0) + Math.abs(ch); }
            return;
        }
        for (let ni = 0; ni < names.length; ni++) {
            const name = names[ni], cfg = ELEMENTS[name];
            const charDelay = ni * INIT_DELAY, charElapsed = Math.max(0, elapsed - charDelay), charProgress = Math.min(1, charElapsed / 25);
            const center = fixedCenters[ni];
            let totalPts = 0; for (let s = 0; s < cfg.strokes.length; s++) totalPts += cfg.strokes[s].length;
            const targetPts = Math.floor(totalPts * charProgress);
            let drawnPts = 0;
            for (let s = 0; s < cfg.strokes.length; s++) {
                const stroke = cfg.strokes[s], strokeStart = drawnPts, strokeEnd = strokeStart + stroke.length;
                if (strokeEnd <= targetPts) {
                    for (let i = 0; i < stroke.length; i++) { const pt = stroke[i]; const wp = rotate(pt.x, pt.y, 0); const pos = center.clone().add(wp); const color = getGradientColor(cfg.startColor, cfg.endColor, i / stroke.length); const sparkParticle = Particle.valueOf(cfg.spark); if (Math.random() < 0.7) world.spawnParticle(sparkParticle, pos, 1, 0.05, 0.05, 0.05, 0.01); world.spawnParticle(Particle.DUST, pos, 1, 0, 0, 0, 0, new DustOptions(color, 2)); }
                } else if (strokeStart < targetPts) {
                    const partial = targetPts - strokeStart;
                    for (let i = 0; i < partial; i++) { const pt = stroke[i]; const wp = rotate(pt.x, pt.y, 0); const pos = center.clone().add(wp); const color = getGradientColor(cfg.startColor, cfg.endColor, i / stroke.length); const sparkParticle = Particle.valueOf(cfg.spark); if (Math.random() < 0.7) world.spawnParticle(sparkParticle, pos, 1, 0.05, 0.05, 0.05, 0.01); world.spawnParticle(Particle.DUST, pos, 1, 0, 0, 0, 0, new DustOptions(color, 2)); }
                    break;
                }
                drawnPts = strokeEnd;
            }
        }
        runLater(tick, 1);
    }
    runLater(tick, 1);
};
})();