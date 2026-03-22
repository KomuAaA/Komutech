var ItemDisplay = Java.type('org.bukkit.entity.ItemDisplay');
var TextDisplay = Java.type('org.bukkit.entity.TextDisplay');
var Bukkit = Java.type('org.bukkit.Bukkit');
var Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
var Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
var cooldowns = new java.util.HashMap();
var COOLDOWN_TIME = 10;
var MODES = {
    SINGLE: { lore: "§6§l当前模式: §7单个清除", msg: "§a已清除最近的全息物品及文字" },
    RANGE:  { lore: "§6§l当前模式: §b范围清除", msg: "§a已清除周围20x20x20区域内的全息物品及文字" }
};
function getMode(lore) {
    if (!lore) return MODES.SINGLE;
    var line = lore.find(function(l) { return l.includes("§6§l当前模式:"); });
    return line && line.includes("范围") ? MODES.RANGE : MODES.SINGLE;
}
function checkCooldown(p) {
    var now = Bukkit.getCurrentTick();
    var uuid = p.getUniqueId().toString();
    if (cooldowns.containsKey(uuid) && now - cooldowns.get(uuid) < COOLDOWN_TIME) return false;
    cooldowns.put(uuid, now);
    return true;
}
function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) return true;
    var pm = Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}
function onUse(e) {
    var p = e.getPlayer();
    var item = e.getItem();
    if (!p || !item || !checkCooldown(p)) return;
    var loc = p.getLocation();
    if (!hasPermission(p, loc)) {
        p.sendMessage("§c你没有权限在此区域清除展示物品！");
        p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        return;
    }
    var meta = item.getItemMeta();
    var lore = meta.getLore() || [];
    if (p.isSneaking()) {
        var cur = getMode(lore);
        var next = cur === MODES.SINGLE ? MODES.RANGE : MODES.SINGLE;
        lore = lore.filter(function(l) { return !l.includes("§6§l当前模式:"); });
        lore.push(next.lore);
        meta.setLore(lore);
        item.setItemMeta(meta);
        p.sendMessage("§a已切换至: " + next.lore.split(": ")[1]);
        return;
    }
    var world = loc.getWorld();
    if (!world) return;
    var mode = getMode(lore);
    if (mode === MODES.SINGLE) {
        var nearest = null;
        var minDist = Infinity;
        for (var ent of world.getEntities()) {
            if ((ent instanceof ItemDisplay || ent instanceof TextDisplay) && !ent.isDead()) {
                var d = ent.getLocation().distanceSquared(loc);
                if (d < minDist) { minDist = d; nearest = ent; }
            }
        }
        if (!nearest) { p.sendMessage("§c附近没有全息物品"); return; }
        if (!hasPermission(p, nearest.getLocation())) {
            p.sendMessage("§c你没有权限移除这个全息物品！");
            p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
            return;
        }
        if (nearest instanceof TextDisplay) nearest.setText("");
        else if (nearest instanceof ItemDisplay) nearest.setCustomName(null);
        nearest.remove();
        p.sendMessage(mode.msg);
        p.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    } else {
        var count = 0, skipped = 0;
        for (var ent of world.getNearbyEntities(loc, 10, 10, 10)) {
            if ((ent instanceof ItemDisplay || ent instanceof TextDisplay) && !ent.isDead()) {
                if (hasPermission(p, ent.getLocation())) {
                    if (ent instanceof TextDisplay) ent.setText("");
                    else if (ent instanceof ItemDisplay) ent.setCustomName(null);
                    ent.remove();
                    count++;
                } else skipped++;
            }
        }
        p.sendMessage("§a已清除 " + count + " 个全息物品及文字" + (skipped > 0 ? "，跳过 " + skipped + " 个无权限的" : ""));
        if (skipped > 0) p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        else if (count > 0) p.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    }
}