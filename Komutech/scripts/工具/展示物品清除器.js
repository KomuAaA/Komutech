const KOMUTECH_GJ_ZSWPQCQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_GJ_ZSWPQCQ_ItemDisplay = Java.type('org.bukkit.entity.ItemDisplay');
const KOMUTECH_GJ_ZSWPQCQ_TextDisplay = Java.type('org.bukkit.entity.TextDisplay');
const KOMUTECH_GJ_ZSWPQCQ_Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
const KOMUTECH_GJ_ZSWPQCQ_Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
const KOMUTECH_GJ_ZSWPQCQ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const KOMUTECH_GJ_ZSWPQCQ_MODES = {
    SINGLE: { lore: "§6§l当前模式: §7单个清除", name: "单个清除" },
    RANGE:  { lore: "§6§l当前模式: §b范围清除", name: "范围清除" }
};
let KOMUTECH_GJ_ZSWPQCQ_cooldowns = new java.util.HashMap();
const KOMUTECH_GJ_ZSWPQCQ_COOLDOWN_MS = 1000;
function KOMUTECH_GJ_ZSWPQCQ_hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") || player.hasPermission("komutech.hologram.bypass") || player.isOp()) return true;
    const pm = KOMUTECH_GJ_ZSWPQCQ_Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, KOMUTECH_GJ_ZSWPQCQ_Interaction.BREAK_BLOCK) && pm.hasPermission(player, location, KOMUTECH_GJ_ZSWPQCQ_Interaction.INTERACT_BLOCK);
}
function KOMUTECH_GJ_ZSWPQCQ_checkCooldown(player) {
    const now = Date.now();
    const uuid = player.getUniqueId().toString();
    const last = KOMUTECH_GJ_ZSWPQCQ_cooldowns.get(uuid);
    if (last && now - last < KOMUTECH_GJ_ZSWPQCQ_COOLDOWN_MS) return false;
    KOMUTECH_GJ_ZSWPQCQ_cooldowns.put(uuid, now);
    return true;
}
function KOMUTECH_GJ_ZSWPQCQ_getMode(lore) {
    if (!lore) return KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line && line.includes("§6§l当前模式:")) {
            return line.includes("范围") ? KOMUTECH_GJ_ZSWPQCQ_MODES.RANGE : KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE;
        }
    }
    return KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE;
}
function KOMUTECH_GJ_ZSWPQCQ_switchMode(item, player) {
    const meta = item.getItemMeta();
    let lore = meta.getLore() || [];
    const current = KOMUTECH_GJ_ZSWPQCQ_getMode(lore);
    const next = current === KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE ? KOMUTECH_GJ_ZSWPQCQ_MODES.RANGE : KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE;
    const newLore = [];
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line && !line.includes("§6§l当前模式:")) newLore.push(line);
    }
    newLore.push(next.lore);
    meta.setLore(newLore);
    item.setItemMeta(meta);
    player.sendActionBar("§a已切换至: " + next.name);
    player.playSound(player.getLocation(), "entity.experience_orb.pickup", 1.0, 1.0);
}
function KOMUTECH_GJ_ZSWPQCQ_clearSingle(player, loc) {
    const world = loc.getWorld();
    let nearest = null;
    let minDist = Infinity;
    for (let ent of world.getEntities()) {
        if ((ent instanceof KOMUTECH_GJ_ZSWPQCQ_ItemDisplay || ent instanceof KOMUTECH_GJ_ZSWPQCQ_TextDisplay) && !ent.isDead()) {
            const d = ent.getLocation().distanceSquared(loc);
            if (d < minDist) { minDist = d; nearest = ent; }
        }
    }
    if (!nearest) { player.sendMessage("§c附近没有全息物品"); return false; }
    if (!KOMUTECH_GJ_ZSWPQCQ_hasPermission(player, nearest.getLocation())) {
        player.sendMessage("§c你没有权限移除这个全息物品！");
        player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        return false;
    }
    nearest.remove();
    player.sendActionBar("§a已清除最近的全息物品及文字");
    player.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    return true;
}
function KOMUTECH_GJ_ZSWPQCQ_clearRange(player, loc) {
    const world = loc.getWorld();
    let count = 0, skipped = 0;
    for (let ent of world.getNearbyEntities(loc, 10, 10, 10)) {
        if ((ent instanceof KOMUTECH_GJ_ZSWPQCQ_ItemDisplay || ent instanceof KOMUTECH_GJ_ZSWPQCQ_TextDisplay) && !ent.isDead()) {
            if (KOMUTECH_GJ_ZSWPQCQ_hasPermission(player, ent.getLocation())) {
                ent.remove();
                count++;
            } else skipped++;
        }
    }
    if (count > 0) {
        player.sendActionBar("§a已清除 " + count + " 个全息物品及文字" + (skipped > 0 ? "，跳过 " + skipped + " 个无权限的" : ""));
        player.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    } else if (skipped > 0) {
        player.sendMessage("§c没有可清除的全息物品（无权限）");
        player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
    } else {
        player.sendMessage("§c范围内没有全息物品");
        player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
    }
}
function KOMUTECH_GJ_ZSWPQCQ_onUse(e) {
    try {
        const p = e.getPlayer();
        const item = e.getItem();
        if (!p || !item || !KOMUTECH_GJ_ZSWPQCQ_checkCooldown(p)) return;
        const loc = p.getLocation();
        if (!KOMUTECH_GJ_ZSWPQCQ_hasPermission(p, loc)) {
            p.sendMessage("§c你没有权限在此区域清除展示物品！");
            p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
            return;
        }
        if (p.isSneaking()) {
            KOMUTECH_GJ_ZSWPQCQ_switchMode(item, p);
            return;
        }
        const meta = item.getItemMeta();
        const lore = meta.getLore() || [];
        const mode = KOMUTECH_GJ_ZSWPQCQ_getMode(lore);
        if (mode === KOMUTECH_GJ_ZSWPQCQ_MODES.SINGLE) {
            KOMUTECH_GJ_ZSWPQCQ_clearSingle(p, loc);
        } else {
            KOMUTECH_GJ_ZSWPQCQ_clearRange(p, loc);
        }
    } catch (err) { print("展示物品清除器错误: " + err); }
}
function onUse(e) { KOMUTECH_GJ_ZSWPQCQ_onUse(e); }