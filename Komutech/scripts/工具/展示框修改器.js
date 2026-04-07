const KOMUTECH_JZ_GJ_ZSKXGQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_JZ_GJ_ZSKXGQ_Material = Java.type('org.bukkit.Material');
const KOMUTECH_JZ_GJ_ZSKXGQ_ItemFrame = Java.type('org.bukkit.entity.ItemFrame');
const KOMUTECH_JZ_GJ_ZSKXGQ_FluidCollisionMode = Java.type('org.bukkit.FluidCollisionMode');
const KOMUTECH_JZ_GJ_ZSKXGQ_Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
const KOMUTECH_JZ_GJ_ZSKXGQ_Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
const KOMUTECH_JZ_GJ_ZSKXGQ_SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_JZ_GJ_ZSKXGQ_COMPRESSED_ID = "KOMUTECH_JZ_GJ_压缩展示框修改器";
const KOMUTECH_JZ_GJ_ZSKXGQ_MODES = {
    HIDE: { lore: "§6§l当前模式: §7隐形", action: false, name: "隐形" },
    SHOW: { lore: "§6§l当前模式: §b显形", action: true, name: "显形" }
};
let KOMUTECH_JZ_GJ_ZSKXGQ_cooldowns = new java.util.HashMap();
const KOMUTECH_JZ_GJ_ZSKXGQ_COOLDOWN_MS = 1000;
function KOMUTECH_JZ_GJ_ZSKXGQ_hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") || player.hasPermission("komutech.hologram.bypass") || player.isOp()) return true;
    const pm = KOMUTECH_JZ_GJ_ZSKXGQ_Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, KOMUTECH_JZ_GJ_ZSKXGQ_Interaction.BREAK_BLOCK) && pm.hasPermission(player, location, KOMUTECH_JZ_GJ_ZSKXGQ_Interaction.INTERACT_BLOCK);
}
function KOMUTECH_JZ_GJ_ZSKXGQ_getCurrentMode(lore) {
    if (!lore) return KOMUTECH_JZ_GJ_ZSKXGQ_MODES.HIDE;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line && line.includes("§7隐形")) return KOMUTECH_JZ_GJ_ZSKXGQ_MODES.HIDE;
        if (line && line.includes("§b显形")) return KOMUTECH_JZ_GJ_ZSKXGQ_MODES.SHOW;
    }
    return KOMUTECH_JZ_GJ_ZSKXGQ_MODES.HIDE;
}
function KOMUTECH_JZ_GJ_ZSKXGQ_checkCooldown(player) {
    const now = Date.now();
    const uuid = player.getUniqueId().toString();
    const last = KOMUTECH_JZ_GJ_ZSKXGQ_cooldowns.get(uuid);
    if (last && now - last < KOMUTECH_JZ_GJ_ZSKXGQ_COOLDOWN_MS) return false;
    KOMUTECH_JZ_GJ_ZSKXGQ_cooldowns.put(uuid, now);
    return true;
}
function KOMUTECH_JZ_GJ_ZSKXGQ_isCompressedVersion(item) {
    const sf = KOMUTECH_JZ_GJ_ZSKXGQ_SlimefunItem.getByItem(item);
    return sf && sf.getId() === KOMUTECH_JZ_GJ_ZSKXGQ_COMPRESSED_ID;
}
function KOMUTECH_JZ_GJ_ZSKXGQ_onUse(event) {
    try {
        const player = event.getPlayer();
        const item = event.getItem();
        if (!player || !item || !KOMUTECH_JZ_GJ_ZSKXGQ_checkCooldown(player)) return;
        if (player.isSneaking()) {
            const meta = item.getItemMeta();
            let lore = meta.getLore() || [];
            const currentMode = KOMUTECH_JZ_GJ_ZSKXGQ_getCurrentMode(lore);
            const newMode = currentMode === KOMUTECH_JZ_GJ_ZSKXGQ_MODES.HIDE ? KOMUTECH_JZ_GJ_ZSKXGQ_MODES.SHOW : KOMUTECH_JZ_GJ_ZSKXGQ_MODES.HIDE;
            const newLore = [];
            for (let i = 0; i < lore.size(); i++) {
                const line = lore.get(i);
                if (line && !line.includes("§6§l当前模式")) newLore.push(line);
            }
            newLore.push(newMode.lore);
            meta.setLore(newLore);
            item.setItemMeta(meta);
            player.sendActionBar("§a已切换至: " + newMode.name);
            return;
        }
        const rayTrace = player.getWorld().rayTrace(
            player.getEyeLocation(),
            player.getEyeLocation().getDirection(),
            5,
            KOMUTECH_JZ_GJ_ZSKXGQ_FluidCollisionMode.NEVER,
            true,
            0.1,
            function(e) { return e instanceof KOMUTECH_JZ_GJ_ZSKXGQ_ItemFrame; }
        );
        if (!rayTrace || !rayTrace.getHitEntity()) return;
        const frame = rayTrace.getHitEntity();
        if (!KOMUTECH_JZ_GJ_ZSKXGQ_hasPermission(player, frame.getLocation())) {
            player.sendMessage("§c你没有权限修改这个展示框！");
            player.playSound(player.getLocation(), "block.note_block.bass", 1.0, 0.5);
            return;
        }
        const mode = KOMUTECH_JZ_GJ_ZSKXGQ_getCurrentMode(item.getItemMeta().getLore());
        if (KOMUTECH_JZ_GJ_ZSKXGQ_isCompressedVersion(item)) {
            const centerLoc = frame.getLocation();
            const world = frame.getWorld();
            const facing = frame.getFacing();
            const affected = [frame];
            const nearby = world.getNearbyEntities(centerLoc, 1.5, 1.5, 1.5);
            for (let ent of nearby) {
                if (ent instanceof KOMUTECH_JZ_GJ_ZSKXGQ_ItemFrame && ent.getFacing() === facing) {
                    const el = ent.getLocation();
                    const dx = Math.abs(el.getBlockX() - centerLoc.getBlockX());
                    const dy = Math.abs(el.getBlockY() - centerLoc.getBlockY());
                    const dz = Math.abs(el.getBlockZ() - centerLoc.getBlockZ());
                    if (dx <= 1 && dy <= 1 && dz <= 1 && KOMUTECH_JZ_GJ_ZSKXGQ_hasPermission(player, ent.getLocation())) {
                        affected.push(ent);
                    }
                }
            }
            affected.forEach(f => f.setVisible(mode.action));
            player.sendActionBar(mode.name + " §7(影响了 " + affected.length + " 个展示框)");
        } else {
            frame.setVisible(mode.action);
            player.sendActionBar("§a已" + mode.name + "！");
        }
        player.playSound(player.getLocation(), "entity.experience_orb.pickup", 1.0, 1.5);
    } catch (err) { print("展示框修改器错误: " + err); }
}
function onUse(e) { KOMUTECH_JZ_GJ_ZSKXGQ_onUse(e); }