const KOMUTECH_L_DJ_LS_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_L_DJ_LS_EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
const KOMUTECH_L_DJ_LS_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_DJ_LS_Files = Java.type('java.nio.file.Files');
const KOMUTECH_L_DJ_LS_Paths = Java.type('java.nio.file.Paths');
const KOMUTECH_L_DJ_LS_StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const KOMUTECH_L_DJ_LS_DATA_DIR = 'plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性';
const KOMUTECH_L_DJ_LS_STONE_MAP = {
    'KOMUTECH_L_DJ_XPLS': { energy: 1, name: '下品灵石' },
    'KOMUTECH_L_DJ_ZPLS': { energy: 100, name: '中品灵石' },
    'KOMUTECH_L_DJ_SPLS': { energy: 10000, name: '上品灵石' },
    'KOMUTECH_L_DJ_JPLS': { energy: 1000000, name: '极品灵石' }
};
function KOMUTECH_L_DJ_LS_load(name) { let p = KOMUTECH_L_DJ_LS_Paths.get(KOMUTECH_L_DJ_LS_DATA_DIR, '[' + name + '].json'); if (!KOMUTECH_L_DJ_LS_Files.exists(p)) return null; try { return JSON.parse(KOMUTECH_L_DJ_LS_Files.readString(p, KOMUTECH_L_DJ_LS_StandardCharsets.UTF_8)); } catch (e) { return null; } }
function KOMUTECH_L_DJ_LS_save(name, d) { let p = KOMUTECH_L_DJ_LS_Paths.get(KOMUTECH_L_DJ_LS_DATA_DIR, '[' + name + '].json'); try { KOMUTECH_L_DJ_LS_Files.writeString(p, JSON.stringify(d, null, 2), KOMUTECH_L_DJ_LS_StandardCharsets.UTF_8); return true; } catch (e) { return false; } }
function KOMUTECH_L_DJ_LS_parseLingli(raw) { if (typeof raw !== 'string') raw = '100/100+0'; let m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)\+(-?\d+)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: parseInt(m[3]) }; m = raw.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/); if (m) return { cur: parseFloat(m[1]), max: parseFloat(m[2]), bonus: 0 }; return { cur: 100, max: 100, bonus: 0 }; }
function KOMUTECH_L_DJ_LS_formatLingli(cur, max, bonus) { return cur.toFixed(2) + '/' + max + (bonus !== 0 ? '+' + bonus : ''); }
function KOMUTECH_L_DJ_LS_getStoneConfig(item) { if (!item) return null; let sf = KOMUTECH_L_DJ_LS_SlimefunItem.getByItem(item); return sf ? (KOMUTECH_L_DJ_LS_STONE_MAP[sf.getId()] || null) : null; }
function onUse(e) {
    if (e.getHand() !== KOMUTECH_L_DJ_LS_EquipmentSlot.HAND) return;
    let p = e.getPlayer(), main = p.getInventory().getItemInMainHand();
    if (!main || main.getType().isEmpty() || main.getAmount() < 1) { p.sendMessage("§c主手物品不足！"); return; }
    let config = KOMUTECH_L_DJ_LS_getStoneConfig(main);
    if (!config) { p.sendMessage("§c主手物品不是有效的灵石！"); return; }
    let data = KOMUTECH_L_DJ_LS_load(p.getName());
    if (!data) { p.sendMessage("§c你还没有玩家属性数据，无法充能！"); return; }
    if (!data.灵力) data.灵力 = '100/100+0';
    let ling = KOMUTECH_L_DJ_LS_parseLingli(data.灵力), totalMax = ling.max + ling.bonus;
    if (ling.cur >= totalMax) { p.sendMessage("§e灵力已满，无需充能！"); return; }
    let remain = totalMax - ling.cur, useCount = 1;
    if (p.isSneaking()) useCount = Math.min(main.getAmount(), Math.max(1, Math.floor(remain / config.energy)));
    let add = Math.min(useCount * config.energy, remain), realUse = Math.floor(add / config.energy) || 1;
    ling.cur = Math.min(ling.cur + add, totalMax);
    data.灵力 = KOMUTECH_L_DJ_LS_formatLingli(ling.cur, ling.max, ling.bonus);
    KOMUTECH_L_DJ_LS_save(p.getName(), data);
    main.setAmount(main.getAmount() - realUse);
    p.sendMessage("§a[" + config.name + "] 充能成功！");
    p.sendMessage("§b当前灵力：§6" + ling.cur.toFixed(2) + " §7/ §6" + totalMax + " §7（消耗§6" + realUse + "§7颗）");
    p.getWorld().playSound(p.getLocation(), "block.note_block.bell", 1, 1);
}