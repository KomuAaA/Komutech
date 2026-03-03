const POSITION_KEYS = {
    FIRST: "§6§l位置一：",
    SECOND: "§6§l位置二："
};

const RAY_TRACE_DISTANCE = 5;

function onUse(event) {
    const player = event.getPlayer();
    const item = event.getItem();
    if (!player || !item) return;

    const rayTrace = player.getWorld().rayTrace(
        player.getEyeLocation(),
        player.getEyeLocation().getDirection(),
        RAY_TRACE_DISTANCE,
        org.bukkit.FluidCollisionMode.NEVER,
        true,
        0.1,
        e => e instanceof org.bukkit.block.Block
    );
    const hitBlock = rayTrace ? rayTrace.getHitBlock() : null;

    if (hitBlock) {
        const loc = hitBlock.getLocation();
        const locStr = `X:${Math.floor(loc.getX())} Y:${Math.floor(loc.getY())} Z:${Math.floor(loc.getZ())}`;
        const isSneaking = player.isSneaking();
        const key = isSneaking ? POSITION_KEYS.SECOND : POSITION_KEYS.FIRST;
        const positionName = isSneaking ? "位置二" : "位置一";

        const meta = item.getItemMeta();
        if (!meta) return;
        
        const lore = meta.hasLore() ? meta.getLore() : new java.util.ArrayList();
        let found = false;
        
        for (let i = 0; i < lore.size(); i++) {
            const line = lore.get(i);
            if (line && line.startsWith(key)) {
                lore.set(i, key + locStr);
                found = true;
                break;
            }
        }
        if (!found) lore.add(key + locStr);

        meta.setLore(lore);
        item.setItemMeta(meta);
        player.sendMessage(`§a已记录${positionName}：${locStr}`);
        return;
    }

    const meta = item.getItemMeta();
    if (!meta) return;
    
    const lore = meta.hasLore() ? meta.getLore() : null;
    if (!lore || lore.isEmpty()) {
        player.sendMessage("§e暂无记录的位置");
        return;
    }

    let pos1 = null, pos2 = null;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line) {
            if (line.startsWith(POSITION_KEYS.FIRST)) {
                pos1 = line.substring(POSITION_KEYS.FIRST.length);
            } else if (line.startsWith(POSITION_KEYS.SECOND)) {
                pos2 = line.substring(POSITION_KEYS.SECOND.length);
            }
        }
    }

    if (pos1 || pos2) {
        player.sendMessage("§6=== 当前记录的位置 ===");
        if (pos1) player.sendMessage(`§a位置一：${pos1}`);
        if (pos2) player.sendMessage(`§a位置二：${pos2}`);
    } else {
        player.sendMessage("§e暂无记录的位置");
    }
}