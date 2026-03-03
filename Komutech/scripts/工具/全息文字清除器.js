function onUse(event) {
    var p = event.getPlayer();
    var loc = p.getLocation();
    
    // 检索3格内全息盔甲架
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
    
    // 执行清除/提示
    if (nearestHologram) {
        nearestHologram.remove();
        p.sendMessage("§a成功清除最近的1个全息文字！§7(距离: " + Math.round(nearestDistance*10)/10 + "格)");
        // 播放成功音效
        p.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    } else {
        p.sendMessage("§e3格范围内未找到全息文字！");
        // 播放失败音效
        p.playSound(loc, "block.note_block.bass", 1.0, 0.5);
    }
}