// 灵石充能系统 - 统一处理所有品级灵石
const Bukkit = Java.type('org.bukkit.Bukkit');

// 灵石配置表
const STONE_CONFIG = {
    "下品": { energy: 1, name: "下品灵石" },
    "中品": { energy: 100, name: "中品灵石" },
    "上品": { energy: 10000, name: "上品灵石" },
    "极品": { energy: 1000000, name: "极品灵石" }
};

// 检测灵石品级
function detectStoneGrade(item) {
    if (!item || !item.hasItemMeta()) return null;
    
    const meta = item.getItemMeta();
    let itemName = meta.hasDisplayName() ? meta.getDisplayName() : "";
    
    // 优先检查显示名称
    for (const [grade, config] of Object.entries(STONE_CONFIG)) {
        if (itemName.includes(config.name)) return grade;
    }
    
    // 其次检查Lore
    if (meta.hasLore()) {
        const lore = meta.getLore();
        for (let i = 0; i < lore.size(); i++) {
            const line = lore.get(i);
            for (const [grade, config] of Object.entries(STONE_CONFIG)) {
                if (line.includes(config.name)) return grade;
            }
        }
    }
    
    return null;
}

// 解析法杖灵力值
function parseSpiritEnergy(offItem) {
    if (!offItem || !offItem.hasItemMeta()) return { current: 0, max: 0 };
    
    const meta = offItem.getItemMeta();
    if (!meta.hasLore()) return { current: 0, max: 0 };
    
    const lore = meta.getLore();
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        if (line && line.includes("灵力剩余")) {
            const match = line.match(/§b灵力剩余：§6(\d+) §7\/ §6(\d+)/);
            if (match) {
                return {
                    current: parseInt(match[1]) || 0,
                    max: parseInt(match[2]) || 0
                };
            }
        }
    }
    
    return { current: 0, max: 0 };
}

// 更新法杖灵力显示
function updateSpiritEnergy(offItem, current, max) {
    if (!offItem || !offItem.hasItemMeta()) return false;
    
    const meta = offItem.getItemMeta();
    if (!meta.hasLore()) return false;
    
    const lore = meta.getLore();
    for (let i = 0; i < lore.size(); i++) {
        if (lore.get(i).includes("灵力剩余")) {
            lore.set(i, `§b灵力剩余：§6${current} §7/ §6${max}`);
            meta.setLore(lore);
            offItem.setItemMeta(meta);
            return true;
        }
    }
    
    return false;
}

// 主处理函数
function onUse(event) {
    const player = event.getPlayer();
    const hand = event.getHand();
    
    // 仅处理主手使用
    if (hand !== org.bukkit.inventory.EquipmentSlot.HAND) return;
    
    const mainItem = player.getInventory().getItemInMainHand(); // 主手灵石
    const offItem = player.getInventory().getItemInOffHand();   // 副手法杖
    
    // 物品基础检查
    if (!mainItem || mainItem.getType().isAir() || mainItem.getAmount() < 1) {
        player.sendMessage("§c主手物品数量不足！");
        return;
    }
    
    if (!offItem || offItem.getType().isAir()) {
        player.sendMessage("§c副手请手持法杖！");
        return;
    }
    
    // 灵石品级检测
    const stoneGrade = detectStoneGrade(mainItem);
    if (!stoneGrade) {
        player.sendMessage("§c主手物品不是有效的灵石！");
        return;
    }
    
    const stoneConfig = STONE_CONFIG[stoneGrade];
    
    // 法杖灵力检测
    const spirit = parseSpiritEnergy(offItem);
    if (spirit.max <= 0) {
        player.sendMessage(`§c[${stoneConfig.name}] 检测不到灵力上限！`);
        return;
    }
    
    // 检查灵力是否已满
    if (spirit.current >= spirit.max) {
        player.sendMessage(`§e[${stoneConfig.name}] 法杖灵力已满！`);
        return;
    }
    
    // 计算充能参数
    const remain = spirit.max - spirit.current; // 剩余可充能量
    let useCount = 1; // 默认使用1颗
    
    // 潜行时使用最大数量
    if (player.isSneaking()) {
        useCount = Math.min(
            mainItem.getAmount(),
            Math.max(1, Math.floor(remain / stoneConfig.energy))
        );
    }
    
    // 计算实际充能值
    const addEnergy = Math.min(useCount * stoneConfig.energy, remain);
    const newEnergy = spirit.current + addEnergy;
    const realUse = Math.floor(addEnergy / stoneConfig.energy) || 1;
    
    // 更新法杖数据
    if (!updateSpiritEnergy(offItem, newEnergy, spirit.max)) {
        player.sendMessage(`§c[${stoneConfig.name}] 更新灵力失败！`);
        return;
    }
    
    // 消耗灵石
    mainItem.setAmount(mainItem.getAmount() - realUse);
    
    // 玩家反馈
    player.sendMessage(`§a[${stoneConfig.name}] 充能成功！`);
    player.sendMessage(`§b当前灵力：§6${newEnergy} §7/ §6${spirit.max} §7（消耗§6${realUse}§7颗）`);
    
    // 播放清晰音效
    player.getWorld().playSound(player.getLocation(), "block.note_block.bell", 1, 1);
}