const HashMap = Java.type('java.util.HashMap');
const ChatColor = org.bukkit.ChatColor;
const Material = org.bukkit.Material;

// 配置常量
const WUDAO_STONE = "KOMUTECH_L_WD_KJWDS";
const TARGET_MACHINE_ID = "KOMUTECH_L_JQ_FZCZQ";
const TARGET_ITEM_ID = "KOMUTECH_L_FZ_YSKJFZ";

const GENERATION_TIME = 15000;
const CLEAR_DELAY = 3000;
const DETECTION_INTERVAL = 3000;
const FINAL_COUNTDOWN = 3000;

const MIN_ITEMS = 1;
const BASE_MAX_ITEMS = 8;
const PORTAL_BONUS = 8;
const MAX_ITEMS_LIMIT = 32;
const MAX_EMPTY_CHECKS = 5;

// 状态缓存
const machineStates = new HashMap();

// 主函数
function tick(info) {
    if (info.machine().getId() === WUDAO_STONE) {
        handleWudaoStone(info.block().getLocation());
    }
}

function handleWudaoStone(loc) {
    let state = machineStates.get(loc);
    
    if (!state) {
        state = { lastCheck: 0, emptyChecks: 0, deactivated: false };
        machineStates.put(loc, state);
    }
    
    if (state.deactivated) return;
    
    const now = Date.now();
    if (now - state.lastCheck < DETECTION_INTERVAL) return;
    
    state.lastCheck = now;
    const player = findPlayerOnStone(loc);
    
    if (player) {
        state.emptyChecks = 0;
        processPlayer(loc, player, now, state);
    } else {
        handleNoPlayer(state);
    }
}

// 无玩家处理
function handleNoPlayer(state) {
    state.emptyChecks++;
    if (state.timer) delete state.timer;
    if (state.emptyChecks >= MAX_EMPTY_CHECKS) state.deactivated = true;
}

// 玩家处理
function processPlayer(loc, player, now, state) {
    let timer = state.timer;
    
    if (!timer) {
        const portalBlockCount = findAndRemovePortals(loc);
        if (portalBlockCount === 0) return;
        
        state.timer = {
            playerId: player.getUniqueId().toString(),
            startTime: now,
            maxItems: Math.min(BASE_MAX_ITEMS + portalBlockCount * PORTAL_BONUS, MAX_ITEMS_LIMIT),
            portalBlockCount: portalBlockCount
        };
        
        player.sendMessage(ChatColor.DARK_PURPLE + `[悟道石] 检测到${portalBlockCount}个传送门方块并已移除，开始悟道！`);
        return;
    }
    
    if (timer.playerId !== player.getUniqueId().toString()) {
        player.sendMessage(ChatColor.RED + "[悟道石] 玩家已更换，悟道中断！");
        if (timer.generated) clearMachineSlots(loc.clone().add(0, 0, 1));
        delete state.timer;
        return;
    }
    
    const elapsed = now - timer.startTime;
    
    if (!timer.notifiedHalf && elapsed >= GENERATION_TIME / 2) {
        player.sendMessage(ChatColor.LIGHT_PURPLE + "[悟道石] 唔~唔~唔~");
        timer.notifiedHalf = true;
    }
    
    if (!timer.notifiedFinal && elapsed >= GENERATION_TIME - FINAL_COUNTDOWN) {
        player.sendMessage(ChatColor.LIGHT_PURPLE + "[悟道石] 来啦！");
        timer.notifiedFinal = true;
    }
    
    if (!timer.generated && elapsed >= GENERATION_TIME) {
        generateItems(loc, player, timer.maxItems, timer.portalBlockCount);
        timer.generated = true;
        return;
    }
    
    if (timer.generated && elapsed >= GENERATION_TIME + CLEAR_DELAY) {
        clearMachineSlots(loc.clone().add(0, 0, 1));
        delete state.timer;
    }
}

// 辅助函数
function findPlayerOnStone(loc) {
    const world = loc.getWorld();
    const center = loc.clone().add(0.5, 1, 0.5);
    
    const entities = world.getNearbyEntities(center, 0.7, 1.5, 0.7);
    for (let i = 0; i < entities.size(); i++) {
        const entity = entities.get(i);
        if (entity instanceof org.bukkit.entity.Player) {
            return entity;
        }
    }
    return null;
}

function findAndRemovePortals(loc) {
    const world = loc.getWorld();
    const centerX = loc.getBlockX();
    const centerY = loc.getBlockY();
    const centerZ = loc.getBlockZ();
    let portalBlockCount = 0;
    
    for (let x = centerX - 2; x <= centerX + 2; x++) {
        for (let y = centerY - 1; y <= centerY + 1; y++) {
            for (let z = centerZ - 2; z <= centerZ + 2; z++) {
                const block = world.getBlockAt(x, y, z);
                if (block.getType() === Material.NETHER_PORTAL) {
                    portalBlockCount++;
                    block.setType(Material.AIR);
                }
            }
        }
    }
    
    return portalBlockCount;
}

// 物品生成
function generateItems(wudaoLoc, player, maxItems, portalBlockCount) {
    const targetLoc = wudaoLoc.clone().add(0, 0, 1);
    const targetMachine = StorageCacheUtils.getSfItem(targetLoc);
    
    if (!targetMachine || targetMachine.getId() !== TARGET_MACHINE_ID) {
        player.sendMessage(ChatColor.RED + "[悟道石] 目标机器不存在！");
        return;
    }
    
    const menu = StorageCacheUtils.getMenu(targetLoc);
    if (!menu) return;
    
    const sfItem = getSlimefunItem(TARGET_ITEM_ID);
    if (!sfItem) {
        player.sendMessage(ChatColor.RED + `[悟道石] 无法找到物品: ${TARGET_ITEM_ID}`);
        return;
    }
    
    const contents = menu.getContents();
    const emptySlots = [];
    
    for (let slot = 9; slot <= 44; slot++) {
        if (!contents[slot] || contents[slot].getType() === Material.AIR) {
            emptySlots.push(slot);
        }
    }
    
    if (emptySlots.length === 0) return;
    
    const count = Math.min(
        MIN_ITEMS + Math.floor(Math.random() * (maxItems - MIN_ITEMS + 1)),
        emptySlots.length
    );
    
    const itemStack = sfItem.getItem().clone();
    itemStack.setAmount(1);
    
    for (let i = 0; i < count; i++) {
        menu.replaceExistingItem(emptySlots[i], itemStack.clone());
    }
    
    player.sendMessage(ChatColor.DARK_PURPLE + "[悟道石] 我悟了！！！");
    player.sendMessage(ChatColor.LIGHT_PURPLE + `[悟道石] 移除${portalBlockCount}个传送门方块，生成 ${count} 个物品`);
}

// 清空机器槽位
function clearMachineSlots(loc) {
    const menu = StorageCacheUtils.getMenu(loc);
    if (!menu) return;
    
    for (let slot = 9; slot <= 44; slot++) {
        if (menu.getContents()[slot]) {
            menu.replaceExistingItem(slot, null);
        }
    }
}

// 获取Slimefun物品
function getSlimefunItem(itemId) {
    try {
        return Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem").getById(itemId);
    } catch (e) {
        return null;
    }
}

// 事件处理
function onPlace(event) {
    event.getPlayer().sendMessage(ChatColor.DARK_PURPLE + "✓ 已放置悟道石");
}

function onBreak(event, itemStack, drops) {
    machineStates.remove(event.getBlock().getLocation());
}