const KOMUTECH_GJ_QXWZQCQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_GJ_QXWZQCQ_EntityType = Java.type('org.bukkit.entity.EntityType');
const KOMUTECH_GJ_QXWZQCQ_Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
const KOMUTECH_GJ_QXWZQCQ_Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
const KOMUTECH_GJ_QXWZQCQ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
let KOMUTECH_GJ_QXWZQCQ_targets = new java.util.HashMap();
let KOMUTECH_GJ_QXWZQCQ_cooldowns = new java.util.HashMap();
const KOMUTECH_GJ_QXWZQCQ_COOLDOWN_MS = 500;
function KOMUTECH_GJ_QXWZQCQ_hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") || player.hasPermission("komutech.hologram.bypass") || player.isOp()) return true;
    const pm = KOMUTECH_GJ_QXWZQCQ_Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, KOMUTECH_GJ_QXWZQCQ_Interaction.BREAK_BLOCK) && pm.hasPermission(player, location, KOMUTECH_GJ_QXWZQCQ_Interaction.INTERACT_BLOCK);
}
function KOMUTECH_GJ_QXWZQCQ_checkCooldown(player) {
    const now = Date.now();
    const uuid = player.getUniqueId().toString();
    const last = KOMUTECH_GJ_QXWZQCQ_cooldowns.get(uuid);
    if (last && now - last < KOMUTECH_GJ_QXWZQCQ_COOLDOWN_MS) return false;
    KOMUTECH_GJ_QXWZQCQ_cooldowns.put(uuid, now);
    return true;
}
function KOMUTECH_GJ_QXWZQCQ_onUse(e) {
    try {
        const p = e.getPlayer();
        const loc = p.getLocation();
        const uuid = p.getUniqueId().toString();
        if (!KOMUTECH_GJ_QXWZQCQ_checkCooldown(p)) return;
        if (!KOMUTECH_GJ_QXWZQCQ_hasPermission(p, loc)) {
            p.sendMessage("§c你没有权限在此区域移除全息文字！");
            p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
            return;
        }
        const targetData = KOMUTECH_GJ_QXWZQCQ_targets.get(uuid);
        if (targetData && targetData.entity && targetData.entity.isValid()) {
            const target = targetData.entity;
            if (!KOMUTECH_GJ_QXWZQCQ_hasPermission(p, target.getLocation())) {
                p.sendMessage("§c你没有权限移除这个全息文字！");
                p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
                KOMUTECH_GJ_QXWZQCQ_targets.remove(uuid);
                return;
            }
            target.remove();
            p.sendActionBar("§a成功清除已选中的全息文字！");
            p.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
            KOMUTECH_GJ_QXWZQCQ_targets.remove(uuid);
            return;
        } else if (targetData && !targetData.entity.isValid()) {
            KOMUTECH_GJ_QXWZQCQ_targets.remove(uuid);
            p.sendMessage("§e之前选中的全息文字已消失，请重新选择。");
        }
        let nearestHologram = null;
        let nearestDistance = 999;
        for (let ent of loc.getNearbyEntities(3, 3, 3)) {
            if (ent.getType() === KOMUTECH_GJ_QXWZQCQ_EntityType.ARMOR_STAND) {
                const as = ent;
                if (as.isInvisible() && !as.hasGravity() && as.isMarker()) {
                    const distance = loc.distance(as.getLocation());
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestHologram = as;
                    }
                }
            }
        }
        if (nearestHologram) {
            let content = nearestHologram.getCustomName();
            if (content === null) content = "§7(无文字)";
            p.sendMessage("§e检测到最近的全息文字: " + content);
            p.sendMessage("§7再次右键可清除该文字。");
            p.playSound(loc, "block.note_block.chime", 0.5, 1.0);
            KOMUTECH_GJ_QXWZQCQ_targets.put(uuid, { entity: nearestHologram });
        } else {
            p.sendMessage("§e3格范围内未找到全息文字！");
            p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        }
    } catch (err) { print("全息文字清除器错误: " + err); }
}
function onUse(e) { KOMUTECH_GJ_QXWZQCQ_onUse(e); }