const KOMUTECH_GJ_CZTHQ_Bukkit = Java.type('org.bukkit.Bukkit');
const KOMUTECH_GJ_CZTHQ_Material = Java.type('org.bukkit.Material');
const KOMUTECH_GJ_CZTHQ_Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
const KOMUTECH_GJ_CZTHQ_Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
const KOMUTECH_GJ_CZTHQ_plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
let KOMUTECH_GJ_CZTHQ_stored = new java.util.HashMap();
function KOMUTECH_GJ_CZTHQ_hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") || player.hasPermission("komutech.hologram.bypass") || player.isOp()) return true;
    const pm = KOMUTECH_GJ_CZTHQ_Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, KOMUTECH_GJ_CZTHQ_Interaction.BREAK_BLOCK) && pm.hasPermission(player, location, KOMUTECH_GJ_CZTHQ_Interaction.INTERACT_BLOCK);
}
function KOMUTECH_GJ_CZTHQ_onUse(e) {
    try {
        const player = e.getPlayer();
        const target = player.getTargetBlock(null, 3);
        if (!target || target.getType() === KOMUTECH_GJ_CZTHQ_Material.AIR) {
            player.sendActionBar("§c❌ 未瞄准有效方块！");
            return;
        }
        const loc = target.getLocation();
        if (!KOMUTECH_GJ_CZTHQ_hasPermission(player, loc)) {
            player.sendMessage("§c你没有权限在此区域操作方块！");
            player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
            return;
        }
        if (player.isSneaking()) {
            KOMUTECH_GJ_CZTHQ_stored.put(player.getName(), target.getType());
            player.sendActionBar(`§a✅ 存储：§e${target.getType().name().replace(/_/g, " ")}`);
            player.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.0);
            return;
        }
        const mat = KOMUTECH_GJ_CZTHQ_stored.get(player.getName());
        if (!mat) {
            player.sendActionBar("§c❌ 请先用Shift+右键存储材质！");
            return;
        }
        if (target.getType() === mat) {
            player.sendActionBar("§c❌ 目标方块已经是该材质，无需替换");
            return;
        }
        target.setType(mat);
        player.sendActionBar(`§a✅ 替换为：§e${mat.name().replace(/_/g, " ")}`);
        player.playSound(loc, "entity.experience_orb.pickup", 1.0, 1.5);
    } catch (err) { print("材质替换器错误: " + err); }
}
function onUse(e) { KOMUTECH_GJ_CZTHQ_onUse(e); }