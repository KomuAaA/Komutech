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
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const plugin = Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
globalThis.KOMUTECH = globalThis.KOMUTECH || {};
globalThis.KOMUTECH.卷轴冷却 = globalThis.KOMUTECH.卷轴冷却 || new java.util.HashMap();
const KOMUTECH_L_JZ_YLHSJ_CONFIG_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/卷轴属性.json";
const KOMUTECH_L_JZ_YLHSJ_SKILL_ID = "御龙护身决";
const KOMUTECH_L_JZ_YLHSJ_SCROLL_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/云篆匣";
const KOMUTECH_L_JZ_YLHSJ_ATTR_DIR = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const KOMUTECH_L_JZ_YLHSJ_PVP_LIST_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/灵PVP列表.json";
let KOMUTECH_L_JZ_YLHSJ_COMMON, KOMUTECH_L_JZ_YLHSJ_SELF, KOMUTECH_L_JZ_YLHSJ_cfgLoaded = false, KOMUTECH_L_JZ_YLHSJ_configErrorMsg = "";
try {
    const raw = Files.readString(Paths.get(KOMUTECH_L_JZ_YLHSJ_CONFIG_PATH), StandardCharsets.UTF_8);
    const all = JSON.parse(raw);
    KOMUTECH_L_JZ_YLHSJ_COMMON = all["公共规则"];
    KOMUTECH_L_JZ_YLHSJ_SELF = all[KOMUTECH_L_JZ_YLHSJ_SKILL_ID];
    if (!KOMUTECH_L_JZ_YLHSJ_COMMON) throw "缺少 公共规则";
    if (!KOMUTECH_L_JZ_YLHSJ_SELF) throw "缺少 " + KOMUTECH_L_JZ_YLHSJ_SKILL_ID;
    const required = ["基础伤害","射程","基础灵力消耗","基础冷却","熟练度上限"];
    for (let k of required) if (KOMUTECH_L_JZ_YLHSJ_SELF[k] === undefined) throw "缺少 " + k;
    KOMUTECH_L_JZ_YLHSJ_cfgLoaded = true;
} catch(e) { KOMUTECH_L_JZ_YLHSJ_configErrorMsg = String(e); print("[御龙护身决] 配置加载失败: " + e); }
function KOMUTECH_L_JZ_YLHSJ_sendActionBar(p, msg) { p.spigot().sendMessage(ChatMessageType.ACTION_BAR, TextComponent.fromLegacyText(msg)); }
function KOMUTECH_L_JZ_YLHSJ_hexToColor(hex) { const h = hex.replace('#',''); return Color.fromRGB(parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)); }
function KOMUTECH_L_JZ_YLHSJ_parseLingLi(s) {
    if (!s) return null;
    const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)?$/);
    if (m) return { current: parseFloat(m[1]), baseMax: parseFloat(m[2]), extraMax: m[3] ? parseFloat(m[3]) : 0 };
    const sm = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (sm) return { current: parseFloat(sm[1]), baseMax: parseFloat(sm[2]), extraMax: 0 };
    return null;
}
function KOMUTECH_L_JZ_YLHSJ_spiritVal(data) { const s = data["灵气"]; if (!s) return 0; const m = s.match(/^(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; }
function KOMUTECH_L_JZ_YLHSJ_realmCoef(spirit, realmTable) {
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
function KOMUTECH_L_JZ_YLHSJ_getDamageScale(staff) {
    if (!staff || !staff.hasItemMeta()) return 1.0;
    const lore = staff.getItemMeta().getLore();
    if (!lore) return 1.0;
    const damageMap = KOMUTECH_L_JZ_YLHSJ_COMMON["品阶伤害倍率"];
    if (!damageMap) return 1.0;
    for (let line of lore) { if (!line) continue; const clean = line.replace(/§./g, ''); const m = clean.match(/『([^』]+)阶』/); if (m) return damageMap[m[1] + '阶']; }
    return 1.0;
}
function KOMUTECH_L_JZ_YLHSJ_loadScrollData(name) { try { const p = Paths.get(KOMUTECH_L_JZ_YLHSJ_SCROLL_DIR, '[' + name + ']云篆匣.json'); if (!Files.exists(p)) return null; return JSON.parse(Files.readString(p, StandardCharsets.UTF_8)); } catch(e) { print("[御龙护身决] 读取卷轴数据失败: " + e); return null; } }
function KOMUTECH_L_JZ_YLHSJ_saveScrollData(name, data) { try { const p = Paths.get(KOMUTECH_L_JZ_YLHSJ_SCROLL_DIR, '[' + name + ']云篆匣.json'); new File(KOMUTECH_L_JZ_YLHSJ_SCROLL_DIR).mkdirs(); Files.writeString(p, JSON.stringify(data, null, 2), StandardCharsets.UTF_8); } catch(e) { print("[御龙护身决] 保存卷轴数据失败: " + e); } }
function KOMUTECH_L_JZ_YLHSJ_getProficiency(playerName, skillId) { const data = KOMUTECH_L_JZ_YLHSJ_loadScrollData(playerName); if (!data || !data.熟练度记录) return 0; return data.熟练度记录[skillId] || 0; }
function KOMUTECH_L_JZ_YLHSJ_addProficiency(playerName, skillId, amount, max) {
    const data = KOMUTECH_L_JZ_YLHSJ_loadScrollData(playerName);
    if (!data) return 0;
    if (!data.熟练度记录) data.熟练度记录 = {};
    const old = data.熟练度记录[skillId] || 0;
    const added = Math.min(amount, max - old);
    if (added > 0) { data.熟练度记录[skillId] = old + added; KOMUTECH_L_JZ_YLHSJ_saveScrollData(playerName, data); }
    return added;
}
function KOMUTECH_L_JZ_YLHSJ_loadPvpList() {
    try {
        const path = Paths.get(KOMUTECH_L_JZ_YLHSJ_PVP_LIST_PATH);
        if (!Files.exists(path)) return [];
        const data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8));
        return Array.isArray(data) ? data : Object.keys(data);
    } catch (e) { return []; }
}
function KOMUTECH_L_JZ_YLHSJ_isPvpEnabled(playerName) {
    const list = KOMUTECH_L_JZ_YLHSJ_loadPvpList();
    return !list.includes(playerName);
}
const KOMUTECH_L_JZ_YLHSJ_TRAIL_COLORS = ["#f0e68c","#ffd700","#ffb400","#ff8c00"];
const KOMUTECH_L_JZ_YLHSJ_TRAIL_CFG = { 旋转速度:0.1, 最小半径:1, 最大半径:4, 高度速度:0.5, 最低高度:-3, 最高高度:3, 数量:5, 大小:16 };
const KOMUTECH_L_JZ_YLHSJ_DURATION = 240;
const KOMUTECH_L_JZ_YLHSJ_RADIUS = 4.0;
const KOMUTECH_L_JZ_YLHSJ_DMG_INTERVAL = 8;
const KOMUTECH_L_JZ_YLHSJ_SOUND_CAST = "entity.evoker.cast_spell";
globalThis.castScroll = function(player, staff, attr) {
    if (!KOMUTECH_L_JZ_YLHSJ_cfgLoaded) { player.sendMessage("§c配置文件丢失: " + KOMUTECH_L_JZ_YLHSJ_configErrorMsg); return; }
    const baseDamage = KOMUTECH_L_JZ_YLHSJ_SELF["基础伤害"];
    const maxDist = KOMUTECH_L_JZ_YLHSJ_SELF["射程"];
    const energyCost = KOMUTECH_L_JZ_YLHSJ_SELF["基础灵力消耗"];
    const baseCooldown = KOMUTECH_L_JZ_YLHSJ_SELF["基础冷却"];
    const maxProficiency = KOMUTECH_L_JZ_YLHSJ_SELF["熟练度上限"];
    const meritRange = KOMUTECH_L_JZ_YLHSJ_COMMON["功德变化范围"];
    const whiteList = KOMUTECH_L_JZ_YLHSJ_COMMON["白名单生物"];
    const realmTable = KOMUTECH_L_JZ_YLHSJ_COMMON["修为倍率"];
    const attrMap = KOMUTECH_L_JZ_YLHSJ_COMMON["灵根属性倍率"];
    const formula = KOMUTECH_L_JZ_YLHSJ_COMMON["公式参数"];
    const spirit = KOMUTECH_L_JZ_YLHSJ_spiritVal(attr);
    const realmCo = KOMUTECH_L_JZ_YLHSJ_realmCoef(spirit, realmTable);
    const linggenAttr = attr["灵根属性"];
    const linggenCo = attrMap[linggenAttr];
    if (!linggenCo) { player.sendMessage("§c未知灵根属性: " + linggenAttr); return; }
    const gengu = parseFloat(attr["根骨"]);
    const wuxing = parseFloat(attr["悟性"]);
    let attackActual = attr["攻击力_实际"];
    if (typeof attackActual !== 'number' || isNaN(attackActual)) attackActual = 1.0;
    const damageScale = KOMUTECH_L_JZ_YLHSJ_getDamageScale(staff);
    const playerName = player.getName();
    let prof = KOMUTECH_L_JZ_YLHSJ_getProficiency(playerName, KOMUTECH_L_JZ_YLHSJ_SKILL_ID);
    const profDmgFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增伤因子"] || 0);
    let finalDamage = attackActual * damageScale * realmCo * linggenCo * baseDamage * profDmgFactor;
    if (isNaN(finalDamage) || finalDamage <= 0) finalDamage = 5.0;
    const profCostFactor = 1 + Math.floor(prof / 100) * (formula["熟练度增耗因子"] || 0);
    const finalCost = Math.max(1, Math.round(energyCost * realmCo * linggenCo * gengu * profCostFactor));
    const wxReduction = Math.min(formula["悟性最大减免比例"] || 0.5, (wuxing - 1) * (formula["冷却减免因子_悟性"] || 0.05));
    const profReduction = Math.min(formula["熟练度最大减免比例"] || 0.3, Math.floor(prof / 100) * (formula["冷却减免因子_熟练度"] || 0.003));
    const totalReduction = Math.min(0.8, wxReduction + profReduction);
    const finalCd = Math.max(formula["最小冷却"] || 4, Math.floor(baseCooldown * (1 - totalReduction)));
    const cdMap = globalThis.KOMUTECH.卷轴冷却;
    const uuid = player.getUniqueId().toString();
    const cdKey = uuid + "_" + KOMUTECH_L_JZ_YLHSJ_SKILL_ID;
    const now = Bukkit.getServer().getCurrentTick();
    const last = cdMap.getOrDefault(cdKey, 0);
    if (now - last < finalCd) { KOMUTECH_L_JZ_YLHSJ_sendActionBar(player, "§c✖ 冷却中！剩余 §6" + ((finalCd - (now - last)) * 0.05).toFixed(1) + " §c秒"); return; }
    const parsedLi = KOMUTECH_L_JZ_YLHSJ_parseLingLi(attr["灵力"]);
    const curLi = parsedLi ? parsedLi.current : 0;
    if (curLi < finalCost) { KOMUTECH_L_JZ_YLHSJ_sendActionBar(player, `§c灵力不足！当前 §6${curLi.toFixed(2)}§c / 需要 §6${finalCost}`); return; }
    parsedLi.current -= finalCost;
    attr["灵力"] = parsedLi.current.toFixed(2) + "/" + parsedLi.baseMax + "+" + parsedLi.extraMax;
    cdMap.put(cdKey, now);
    KOMUTECH_L_JZ_YLHSJ_sendActionBar(player, `§a消耗 ${finalCost} 灵力 §7| §f剩余 ${parsedLi.current.toFixed(0)}/${parsedLi.baseMax + parsedLi.extraMax}`);
    const actualAdd = KOMUTECH_L_JZ_YLHSJ_addProficiency(playerName, KOMUTECH_L_JZ_YLHSJ_SKILL_ID, Math.floor(Math.random() * 10) + 1, maxProficiency);
    if (actualAdd > 0) player.sendMessage(`§b熟练度+${actualAdd}`);
    const world = player.getWorld();
    world.playSound(player.getLocation(), KOMUTECH_L_JZ_YLHSJ_SOUND_CAST, 1, 1);
    const cache = { damage: finalDamage, white: 0, nonWhite: 0 };
    const attackerPvpEnabled = KOMUTECH_L_JZ_YLHSJ_isPvpEnabled(playerName);
    function KOMUTECH_L_JZ_YLHSJ_isValidTarget(entity) {
        if (!entity || entity === player || entity.getType().name() === "ARMOR_STAND" || entity.isDead() || !(entity instanceof LivingEntity)) return false;
        if (entity instanceof Player) {
            if (!attackerPvpEnabled) return false;
            const victimName = entity.getName();
            if (!KOMUTECH_L_JZ_YLHSJ_isPvpEnabled(victimName)) return false;
        }
        return true;
    }
    function KOMUTECH_L_JZ_YLHSJ_applyDamage(entity, mult) {
        if (!KOMUTECH_L_JZ_YLHSJ_isValidTarget(entity)) return;
        entity.damage(cache.damage * mult, player);
        if (!(entity instanceof Player)) {
            const w = whiteList.includes(entity.getType().name());
            if (w) cache.white++; else cache.nonWhite++;
        }
    }
    function KOMUTECH_L_JZ_YLHSJ_getTrailPos(progress, time, center, cfg) {
        const base = progress * Math.PI * 8 + time * cfg.旋转速度;
        const rVar = Math.sin(time * 0.7 + progress * 3) * 0.4 + Math.sin(time * 1.3 + progress * 5) * 0.2;
        const r = cfg.最小半径 + (cfg.最大半径 - cfg.最小半径) * (0.5 + rVar * 0.5);
        const hVar = Math.sin(time * cfg.高度速度 + progress * 4) * 1.2 + Math.sin(time * cfg.高度速度 * 1.7 + progress * 7) * 0.6;
        const h = (cfg.最低高度 + cfg.最高高度) / 2 + hVar + 1;
        const offX = Math.sin(time * 0.9 + progress * 6) * 0.2;
        return center.clone().add(Math.cos(base) * r + offX, h, Math.sin(base) * r + offX);
    }
    const startTime = Date.now() / 1000;
    let tick = 0;
    const task = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, () => {
        if (!player.isOnline() || player.isDead() || player.getWorld() !== world) { Bukkit.getScheduler().cancelTask(task); return; }
        if (tick >= KOMUTECH_L_JZ_YLHSJ_DURATION) {
            Bukkit.getScheduler().cancelTask(task);
            const [min, max] = meritRange; let ch = 0;
            if (cache.white > 0) ch -= cache.white * (Math.floor(Math.random() * (max - min + 1)) + min);
            if (cache.nonWhite > 0) ch += cache.nonWhite * (Math.floor(Math.random() * (max - min + 1)) + min);
            if (ch !== 0) { attr["功德"] = Math.max(0, (attr["功德"] || 0) + ch); if (ch < 0) attr["煞气"] = (attr["煞气"] || 0) + Math.abs(ch); }
            player.sendMessage("§7龙魂消散");
            return;
        }
        const time = (Date.now() / 1000 - startTime);
        const center = player.getLocation().clone().add(0, 1, 0);
        for (let i = 0; i < KOMUTECH_L_JZ_YLHSJ_TRAIL_CFG.数量; i++) {
            const pProg = (tick + i * 0.2) / KOMUTECH_L_JZ_YLHSJ_DURATION;
            const pos = KOMUTECH_L_JZ_YLHSJ_getTrailPos(pProg, time, center, KOMUTECH_L_JZ_YLHSJ_TRAIL_CFG);
            const heightRatio = (pos.getY() - center.getY()) / 3;
            const idx = Math.min(Math.floor((heightRatio + 1) * 2), KOMUTECH_L_JZ_YLHSJ_TRAIL_COLORS.length - 1);
            world.spawnParticle(Particle.DUST, pos, 1, 0, 0, 0, 0, new DustOptions(KOMUTECH_L_JZ_YLHSJ_hexToColor(KOMUTECH_L_JZ_YLHSJ_TRAIL_COLORS[Math.max(0, idx)]), KOMUTECH_L_JZ_YLHSJ_TRAIL_CFG.大小));
        }
        if (tick % KOMUTECH_L_JZ_YLHSJ_DMG_INTERVAL === 0) {
            const entities = world.getNearbyLivingEntities(center, KOMUTECH_L_JZ_YLHSJ_RADIUS, KOMUTECH_L_JZ_YLHSJ_RADIUS, KOMUTECH_L_JZ_YLHSJ_RADIUS);
            for (let i = 0; i < entities.size(); i++) {
                KOMUTECH_L_JZ_YLHSJ_applyDamage(entities.get(i), 1);
            }
        }
        tick++;
    }, 0, 1);
    player.sendMessage("§6✦ §e龙魂护体·御敌无形！");
};
})();