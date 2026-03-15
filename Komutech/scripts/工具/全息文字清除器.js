var playerTarget = new java.util.HashMap();

function onUse(event) {
    var p = event.getPlayer();
    var loc = p.getLocation();
    var uuid = p.getUniqueId().toString();

    if (!hasPermission(p, loc)) {
        p.sendMessage("§c你没有权限在此区域移除全息文字！");
        p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        return;
    }

    var targetData = playerTarget.get(uuid);
    if (targetData && targetData.entity && targetData.entity.isValid()) {
        var target = targetData.entity;
        if (!hasPermission(p, target.getLocation())) {
            p.sendMessage("§c你没有权限移除这个全息文字！");
            p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
            playerTarget.remove(uuid);
            return;
        }
        target.remove();
        p.sendMessage("§a成功清除已选中的全息文字！");
        p.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
        playerTarget.remove(uuid);
        return;
    } else if (targetData && !targetData.entity.isValid()) {
        playerTarget.remove(uuid);
        p.sendMessage("§e之前选中的全息文字已消失，请重新选择。");
    }

    var entities = loc.getNearbyEntities(3, 3, 3);
    var nearestHologram = null;
    var nearestDistance = 999;

    for (var i = 0; i < entities.size(); i++) {
        var e = entities.get(i);
        if (e.getType() === org.bukkit.entity.EntityType.ARMOR_STAND) {
            var as = e;
            if (as.isInvisible() && !as.hasGravity() && as.isMarker()) {
                var distance = loc.distance(as.getLocation());
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestHologram = as;
                }
            }
        }
    }

    if (nearestHologram) {
        var content = nearestHologram.getCustomName();
        if (content === null) content = "§7(无文字)";
        p.sendMessage("§e检测到最近的全息文字: " + content);
        p.sendMessage("§7再次右键可清除该文字。");
        p.playSound(loc, "block.note_block.chime", 0.5, 1.0);
        playerTarget.put(uuid, {entity: nearestHologram});
    } else {
        p.sendMessage("§e3格范围内未找到全息文字！");
        p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
    }
}

function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) {
        return true;
    }

    var Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
    var Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
    var pm = Slimefun.getProtectionManager();

    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}