var MODES = {
    HIDE: { lore: "§6§l当前模式: §7隐形", action: false, name: "隐形" },
    SHOW: { lore: "§6§l当前模式: §b显形", action: true, name: "显形" }
};
var cooldowns = new java.util.HashMap();
var COOLDOWN_TIME = 10;

function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) return true;
    var Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
    var Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
    var pm = Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}

function getCurrentMode(lore) {
    if (!lore) return MODES.HIDE;
    return Object.values(MODES).find(mode => lore.some(line => line.includes(mode.lore.split(": ")[1]))) || MODES.HIDE;
}

function checkCooldown(player) {
    var now = org.bukkit.Bukkit.getServer().getCurrentTick();
    var uuid = player.getUniqueId().toString();
    if (cooldowns.containsKey(uuid) && now - cooldowns.get(uuid) < COOLDOWN_TIME) return false;
    cooldowns.put(uuid, now);
    return true;
}

function isCompressedVersion(item) {
    var meta = item.getItemMeta();
    return meta && meta.getDisplayName() && meta.getDisplayName().includes("压缩");
}

function onUse(event) {
    var player = event.getPlayer();
    var item = event.getItem();
    if (!player || !item || !checkCooldown(player)) return;
    if (player.isSneaking()) {
        var meta = item.getItemMeta();
        var lore = meta.getLore() || [];
        var currentMode = getCurrentMode(lore);
        var newMode = currentMode === MODES.HIDE ? MODES.SHOW : MODES.HIDE;
        lore = lore.filter(line => !line.includes("§6§l当前模式"));
        lore.push(newMode.lore);
        meta.setLore(lore);
        item.setItemMeta(meta);
        player.sendMessage("§a已切换至: " + newMode.name);
        return;
    }
    var rayTrace = player.getWorld().rayTrace(
        player.getEyeLocation(),
        player.getEyeLocation().getDirection(),
        5,
        org.bukkit.FluidCollisionMode.NEVER,
        true,
        0.1,
        e => e instanceof org.bukkit.entity.ItemFrame
    );
    if (!rayTrace || !rayTrace.getHitEntity()) return;
    var frame = rayTrace.getHitEntity();
    if (!hasPermission(player, frame.getLocation())) {
        player.sendMessage("§c你没有权限修改这个展示框！");
        player.playSound(player.getLocation(), "block.note_block.bass", 1.0, 0.5);
        return;
    }
    var mode = getCurrentMode(item.getItemMeta().getLore());
    if (isCompressedVersion(item)) {
        var centerLoc = frame.getLocation();
        var world = frame.getWorld();
        var facing = frame.getFacing();
        var affected = [frame];
        var nearby = world.getNearbyEntities(centerLoc, 1.5, 1.5, 1.5);
        for (var ent of nearby) {
            if (ent instanceof org.bukkit.entity.ItemFrame && ent.getFacing() === facing) {
                var el = ent.getLocation();
                var dx = Math.abs(el.getBlockX() - centerLoc.getBlockX());
                var dy = Math.abs(el.getBlockY() - centerLoc.getBlockY());
                var dz = Math.abs(el.getBlockZ() - centerLoc.getBlockZ());
                if (dx <= 1 && dy <= 1 && dz <= 1 && hasPermission(player, ent.getLocation())) {
                    affected.push(ent);
                }
            }
        }
        affected.forEach(f => f.setVisible(mode.action));
        player.sendMessage(mode.name + " §7(影响了 " + affected.length + " 个展示框)");
    } else {
        frame.setVisible(mode.action);
        player.sendMessage("§a已" + mode.name + "！");
    }
    player.playSound(player.getLocation(), "entity.experience_orb.pickup", 1.0, 1.5);
}