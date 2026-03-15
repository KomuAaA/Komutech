// 功德值调整器 - 右键为副手道具增加1000功德值（上限1314520）
const Bukkit = Java.type('org.bukkit.Bukkit');

// 解析功德/缺德值
function parseMeritValue(item) {
    if (!item || !item.hasItemMeta()) return 0;
    const meta = item.getItemMeta();
    const lore = meta.hasLore() ? meta.getLore() : [];
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        let match = line.match(/§b功德值：§6(\d+)/);
        if (match) return parseInt(match[1]) || 0;
        match = line.match(/§c缺德值：§6(\d+)/);
        if (match) return -parseInt(match[1]) || 0;
    }
    return 0;
}

// 设置功德值
function setMeritValue(item, value) {
    if (!item || !item.hasItemMeta()) return false;
    const meta = item.getItemMeta();
    const lore = meta.hasLore() ? meta.getLore() : [];
    const absValue = Math.abs(value);
    const targetLine = value >= 0 ? `§b功德值：§6${absValue}` : `§c缺德值：§6${absValue}`;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (/§b功德值：§6\d+/.test(line) || /§c缺德值：§6\d+/.test(line)) {
            lore.set(i, targetLine);
            meta.setLore(lore);
            item.setItemMeta(meta);
            return true;
        }
    }
    return false;
}

// 检查是否有功德值属性
function hasMeritLine(item) {
    if (!item || !item.hasItemMeta()) return false;
    const meta = item.getItemMeta();
    const lore = meta.hasLore() ? meta.getLore() : [];
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (/§b功德值：§6\d+/.test(line) || /§c缺德值：§6\d+/.test(line)) return true;
    }
    return false;
}

// 主函数
function onUse(event) {
    const player = event.getPlayer();
    const mainItem = player.getInventory().getItemInMainHand();
    const offhandItem = player.getInventory().getItemInOffHand();

    if (!offhandItem || offhandItem.getType().isAir()) {
        player.sendMessage("§c请将需要调整的道具放在副手！");
        return;
    }
    if (!mainItem || mainItem.getAmount() < 1) {
        player.sendMessage("§c调整器数量不足！");
        return;
    }
    if (!hasMeritLine(offhandItem)) {
        player.sendMessage("§c副手道具没有功德值属性！");
        return;
    }

    const currentMerit = parseMeritValue(offhandItem);
    const MAX = 1314520;

    // 检查是否已达上限（仅针对正功德）
    if (currentMerit >= MAX) {
        player.sendMessage(`§c功德值已达到上限 ${MAX}，无法继续增加！`);
        return;
    }

    let newMerit = currentMerit + 1000;
    if (newMerit > MAX) newMerit = MAX;

    if (setMeritValue(offhandItem, newMerit)) {
        player.sendMessage("§a功德值调整成功！");
        player.sendMessage(`§6功德值：${currentMerit >= 0 ? currentMerit : "缺德" + Math.abs(currentMerit)} → ${newMerit >= 0 ? newMerit : "缺德" + Math.abs(newMerit)}`);
        mainItem.setAmount(mainItem.getAmount() - 1);
        player.getWorld().playSound(player.getLocation(), "block.note_block.bell", 1, 1);
    }
}