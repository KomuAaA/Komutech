const HashMap = Java.type('java.util.HashMap');
const ChatColor = org.bukkit.ChatColor;
const SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");
const Material = org.bukkit.Material;

// 配置
const CONFIG = {
    id: "KOMUTECH_L_WD_PWS",
    southMachineId: "KOMUTECH_L_JQ_FZCZQ",
    targetSlot: 49,
    time: 15000,
    interval: 3000,
    maxEmptyChecks: 5,
    startSlot: 9,
    endSlot: 44,
    baseAmount: 1,
    rules: [{
        pattern: /^(KOMUTECH_L_FZ_)(XX)(.*)$/,
        replacement: "$1WZ$3"
    }]
};

const states = new HashMap();

function tick(info) {
    if (info.machine().getId() !== CONFIG.id) return;
    
    const loc = info.block().getLocation();
    const now = Date.now();
    let state = states.get(loc);
    
    // 如果没有状态或已停用，直接返回
    if (!state || state.deactivated) return;
    
    // 检查间隔
    if (now - state.last < CONFIG.interval) return;
    
    state.last = now;
    const player = findPlayer(loc);
    
    if (player) {
        state.empty = 0;
        process(loc, player, now, state);
    } else if (++state.empty >= CONFIG.maxEmptyChecks) {
        state.deactivated = true;
        state.timer = null; // 清除计时器
    }
    
    states.put(loc, state);
}

function process(loc, player, now, state) {
    const southLoc = loc.clone().add(0, 0, 1);
    const menu = StorageCacheUtils.getMenu(southLoc);
    if (!menu) return;
    
    if (!state.timer) {
        const southMachine = StorageCacheUtils.getSfItem(southLoc);
        if (!southMachine || southMachine.getId() !== CONFIG.southMachineId) {
            player.sendMessage(ChatColor.RED + "南侧机器出错");
            return;
        }
        
        const check = checkIncrementalCondition(menu);
        if (!check.valid) {
            player.sendMessage(ChatColor.RED + check.message);
            return;
        }
        
        if (!canPlace(menu, check.targetId)) {
            player.sendMessage(ChatColor.RED + "目标槽位不可用");
            return;
        }
        
        state.timer = { 
            player: player.getUniqueId().toString(), 
            start: now,
            from: check.sourceId,
            to: check.targetId,
            half: false,
            final: false
        };
        player.sendMessage(ChatColor.AQUA + "开始破妄");
        return;
    }
    
    // 检查玩家是否更换
    if (state.timer.player !== player.getUniqueId().toString()) {
        player.sendMessage(ChatColor.RED + "玩家已更换，中断！");
        state.timer = null;
        return;
    }
    
    const elapsed = now - state.timer.start;
    
    if (!state.timer.half && elapsed >= CONFIG.time / 2) {
        player.sendMessage(ChatColor.YELLOW + "灵台渐清");
        state.timer.half = true;
    } else if (!state.timer.final && elapsed >= CONFIG.time - 3000) {
        player.sendMessage(ChatColor.YELLOW + "迷障渐散");
        state.timer.final = true;
    } else if (elapsed >= CONFIG.time) {
        convert(loc, player, southLoc, state.timer);
        state.timer = null;
    }
}

function checkIncrementalCondition(menu) {
    const contents = menu.getContents();
    
    const firstItem = contents[CONFIG.startSlot];
    if (!firstItem || firstItem.getType() === Material.AIR) {
        return { valid: false, message: "物品放置错误: 有空槽位" };
    }
    
    const firstSfItem = SlimefunItem.getByItem(firstItem);
    if (!firstSfItem) {
        return { valid: false, message: "物品放置错误: 物品类型错误" };
    }
    
    const firstItemId = firstSfItem.getId();
    let targetId = null;
    for (const rule of CONFIG.rules) {
        if (rule.pattern.test(firstItemId)) {
            targetId = firstItemId.replace(rule.pattern, rule.replacement);
            break;
        }
    }
    
    if (!targetId) {
        return { valid: false, message: "物品放置错误: 物品不符合规则" };
    }
    
    if (firstItem.getAmount() !== CONFIG.baseAmount) {
        return { valid: false, message: "物品放置错误: 物品数量错误" };
    }
    
    for (let i = CONFIG.startSlot + 1; i <= CONFIG.endSlot; i++) {
        const expectedAmount = i - CONFIG.startSlot + CONFIG.baseAmount;
        const item = contents[i];
        
        if (!item || item.getType() === Material.AIR) {
            return { valid: false, message: "物品放置错误: 有空槽位" };
        }
        
        const sfItem = SlimefunItem.getByItem(item);
        if (!sfItem || sfItem.getId() !== firstItemId) {
            return { valid: false, message: "物品放置错误: 物品类型不一致" };
        }
        
        if (item.getAmount() !== expectedAmount) {
            return { valid: false, message: "物品放置错误: 物品数量错误" };
        }
    }
    
    return { valid: true, sourceId: firstItemId, targetId };
}

function convert(loc, player, southLoc, timer) {
    const menu = StorageCacheUtils.getMenu(southLoc);
    if (!menu) return;
    
    if (convertItems(menu, timer)) {
        player.sendMessage(ChatColor.GOLD + "法则自成");
    } else {
        player.sendMessage(ChatColor.RED + "转换条件不满足");
    }
}

function convertItems(menu, timer) {
    // 先检查条件是否仍然满足
    const check = checkIncrementalCondition(menu);
    if (!check.valid || check.sourceId !== timer.from) {
        return false;
    }
    
    // 先检查输出槽位是否可以放置目标物品
    const targetSlot = CONFIG.targetSlot;
    const targetItem = menu.getContents()[targetSlot];
    const result = SlimefunItem.getById(timer.to);
    
    if (!result) return false;
    
    // 如果目标槽位有物品但不是目标物品，直接返回false，不进行任何操作
    if (targetItem && targetItem.getType() !== Material.AIR) {
        const sfItem = SlimefunItem.getByItem(targetItem);
        if (!sfItem || sfItem.getId() !== timer.to) {
            return false;
        }
        // 检查堆叠是否已满
        if (targetItem.getAmount() >= targetItem.getMaxStackSize()) {
            return false;
        }
    }
    
    // 清空所有源物品槽位
    for (let slot = CONFIG.startSlot; slot <= CONFIG.endSlot; slot++) {
        menu.replaceExistingItem(slot, null);
    }
    
    // 放置目标物品
    const stack = result.getItem().clone();
    stack.setAmount(1);
    
    if (targetItem && targetItem.getType() !== Material.AIR) {
        targetItem.setAmount(targetItem.getAmount() + 1);
        menu.replaceExistingItem(targetSlot, targetItem);
    } else {
        menu.replaceExistingItem(targetSlot, stack);
    }
    
    return true;
}

function findPlayer(loc) {
    const center = loc.clone().add(0.5, 1, 0.5);
    const nearby = loc.getWorld().getNearbyEntities(center, 0.7, 1.5, 0.7);
    
    for (let entity of nearby) {
        if (entity instanceof org.bukkit.entity.Player) {
            return entity;
        }
    }
    return null;
}

function canPlace(menu, itemId) {
    const targetSlot = CONFIG.targetSlot;
    const item = menu.getContents()[targetSlot];
    
    if (!item || item.getType() === Material.AIR) return true;
    
    const sfItem = SlimefunItem.getByItem(item);
    return sfItem && sfItem.getId() === itemId && item.getAmount() < item.getMaxStackSize();
}

function onPlace(event) {
    const loc = event.getBlock().getLocation();
    const machine = StorageCacheUtils.getSfItem(loc);
    
    if (machine && machine.getId() === CONFIG.id) {
        // 创建新状态，确保deactivated为false
        states.put(loc, { last: 0, empty: 0, deactivated: false });
        event.getPlayer().sendMessage(ChatColor.GOLD + "✓ 已放置破妄石");
    }
}

function onBreak(event) {
    states.remove(event.getBlock().getLocation());
}