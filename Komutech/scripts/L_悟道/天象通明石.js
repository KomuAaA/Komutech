const HashMap = Java.type('java.util.HashMap');
const ChatColor = org.bukkit.ChatColor;
const SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");
const Material = org.bukkit.Material;
const Random = Java.type('java.util.Random');

// 配置
const CONFIG = {
    id: "KOMUTECH_L_WD_TXTMS",
    southMachineId: "KOMUTECH_L_JQ_LXFZCZQ",
    time: 15000,
    interval: 3000,
    maxEmptyChecks: 5,
    outputId: "KOMUTECH_L_FZ_天象灵曦",
    outputSlots: [15, 16, 24, 25, 33, 34],
    rules: [
        {itemId: "KOMUTECH_L_FZ_WZBYSFZ", start: 0, end: 4},
        {itemId: "KOMUTECH_L_FZ_WZFYSFZ", start: 9, end: 13},
        {itemId: "KOMUTECH_L_FZ_WZLYSFZ", start: 18, end: 22},
    ]
};

const states = new HashMap();
const random = new Random();

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
        
        if (!checkRules(menu) || !canPlaceOutput(menu)) {
            player.sendMessage(ChatColor.RED + "物品放置错误或输出槽位不足");
            return;
        }
        
        state.timer = { 
            player: player.getUniqueId().toString(), 
            start: now,
            half: false,
            final: false
        };
        player.sendMessage(ChatColor.AQUA + "开始领悟");
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
        player.sendMessage(ChatColor.YELLOW + "天象汇聚");
        state.timer.half = true;
    } else if (!state.timer.final && elapsed >= CONFIG.time - 3000) {
        player.sendMessage(ChatColor.YELLOW + "迷惘渐散");
        state.timer.final = true;
    } else if (elapsed >= CONFIG.time) {
        convert(loc, player, southLoc);
        state.timer = null;
    }
}

function checkRules(menu) {
    const contents = menu.getContents();
    
    for (const rule of CONFIG.rules) {
        for (let i = rule.start; i <= rule.end; i++) {
            const expected = i - rule.start + 1;
            const item = contents[i];
            
            if (!item || item.getType() === Material.AIR) return false;
            
            const sfItem = SlimefunItem.getByItem(item);
            if (!sfItem || sfItem.getId() !== rule.itemId) return false;
            
            if (item.getAmount() !== expected) return false;
        }
    }
    
    return true;
}

function canPlaceOutput(menu) {
    const contents = menu.getContents();
    
    for (const slot of CONFIG.outputSlots) {
        const item = contents[slot];
        if (!item || item.getType() === Material.AIR) return true;
        
        const sfItem = SlimefunItem.getByItem(item);
        if (sfItem && sfItem.getId() === CONFIG.outputId && item.getAmount() < item.getMaxStackSize()) {
            return true;
        }
    }
    
    return false;
}

function convert(loc, player, southLoc) {
    const menu = StorageCacheUtils.getMenu(southLoc);
    if (!menu) return;
    
    const southMachine = StorageCacheUtils.getSfItem(southLoc);
    if (!southMachine || southMachine.getId() !== CONFIG.southMachineId) {
        player.sendMessage(ChatColor.RED + "南侧机器出错");
        return;
    }
    
    if (!checkRules(menu)) {
        player.sendMessage(ChatColor.RED + "物品已变更，无法完成");
        return;
    }
    
    if (convertItems(menu)) {
        player.sendMessage(ChatColor.GOLD + "大道自成");
    } else {
        player.sendMessage(ChatColor.RED + "转换失败");
    }
}

function convertItems(menu) {
    const contents = menu.getContents();
    const outputItem = SlimefunItem.getById(CONFIG.outputId);
    if (!outputItem) return false;
    
    const maxStack = outputItem.getItem().getMaxStackSize();
    const amount = 1 + random.nextInt(6);
    
    // 收集可用输出槽位
    const availableSlots = [];
    for (const slot of CONFIG.outputSlots) {
        const item = contents[slot];
        if (!item || item.getType() === Material.AIR) {
            availableSlots.push({ slot, item: null, available: maxStack });
        } else {
            const sfItem = SlimefunItem.getByItem(item);
            if (sfItem && sfItem.getId() === CONFIG.outputId) {
                const current = item.getAmount();
                if (current < maxStack) {
                    availableSlots.push({ slot, item, available: maxStack - current });
                }
            }
        }
    }
    
    // 计算总可用空间
    let totalAvailable = 0;
    for (const slotInfo of availableSlots) {
        totalAvailable += slotInfo.available;
    }
    
    if (totalAvailable < amount) return false;
    
    // 验证输入槽位
    for (const rule of CONFIG.rules) {
        for (let i = rule.start; i <= rule.end; i++) {
            const expected = i - rule.start + 1;
            const item = contents[i];
            
            if (!item || item.getType() === Material.AIR) return false;
            
            const sfItem = SlimefunItem.getByItem(item);
            if (!sfItem || sfItem.getId() !== rule.itemId) return false;
            
            if (item.getAmount() !== expected) return false;
        }
    }
    
    // 清空输入槽位
    for (const rule of CONFIG.rules) {
        for (let slot = rule.start; slot <= rule.end; slot++) {
            menu.replaceExistingItem(slot, null);
        }
    }
    
    // 分配产物
    let remaining = amount;
    
    // 打乱可用槽位
    for (let i = availableSlots.length - 1; i > 0; i--) {
        const j = random.nextInt(i + 1);
        [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }
    
    // 分配产物到可用槽位
    for (const slotInfo of availableSlots) {
        if (remaining <= 0) break;
        
        const give = Math.min(remaining, slotInfo.available);
        if (slotInfo.item) {
            slotInfo.item.setAmount(slotInfo.item.getAmount() + give);
            menu.replaceExistingItem(slotInfo.slot, slotInfo.item);
        } else {
            const newItem = outputItem.getItem().clone();
            newItem.setAmount(give);
            menu.replaceExistingItem(slotInfo.slot, newItem);
        }
        
        remaining -= give;
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

function onPlace(event) {
    const loc = event.getBlock().getLocation();
    const machine = StorageCacheUtils.getSfItem(loc);
    
    if (machine && machine.getId() === CONFIG.id) {
        // 创建新状态，确保deactivated为false
        states.put(loc, { last: 0, empty: 0, deactivated: false });
        event.getPlayer().sendMessage(ChatColor.GOLD + "✓ 已放置造化石");
    }
}

function onBreak(event) {
    states.remove(event.getBlock().getLocation());
}