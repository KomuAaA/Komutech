const HashMap = Java.type('java.util.HashMap');
const ChatColor = org.bukkit.ChatColor;
const Material = org.bukkit.Material;
const EntityType = org.bukkit.entity.EntityType;

// 配置常量
const WUDAO_STONE = "KOMUTECH_L_WD_SLWDS";
const TARGET_MACHINE_ID = "KOMUTECH_L_JQ_FZCZQ";
const TARGET_ITEM_ID = "KOMUTECH_L_FZ_YSSLFZ";

const GENERATION_TIME = 15000;
const CLEAR_DELAY = 3000;
const DETECTION_INTERVAL = 3000;
const FINAL_COUNTDOWN = 3000;

const MIN_ITEMS = 1;
const BASE_MAX_ITEMS = 8;
const ZOMBIE_BONUS = 4;
const MAX_ITEMS_LIMIT = 32;
const MAX_EMPTY_CHECKS = 5;

// 小岛人实体类型
const VALID_ISLANDER_TYPES = [EntityType.ZOMBIE, EntityType.SKELETON];

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
    
    // 初始化状态
    if (!state) {
        state = { lastCheck: 0, emptyChecks: 0, deactivated: false };
        machineStates.put(loc, state);
    }
    
    // 检查机器是否失效
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
    
    // 新玩家开始悟道
    if (!timer) {
        const zombies = findAndClearZombies(loc);
        if (zombies.length === 0) return;
        
        state.timer = {
            playerId: player.getUniqueId().toString(),
            startTime: now,
            maxItems: Math.min(BASE_MAX_ITEMS + zombies.length * ZOMBIE_BONUS, MAX_ITEMS_LIMIT),
            zombieCount: zombies.length
        };
        
        player.sendMessage(ChatColor.GREEN + `[悟道石] 感悟${zombies.length}个小岛人（僵尸/骷髅），开始悟道！`);
        return;
    }
    
    // 玩家不一致则中断
    if (timer.playerId !== player.getUniqueId().toString()) {
        player.sendMessage(ChatColor.RED + "[悟道石] 玩家已更换，悟道中断！");
        if (timer.generated) clearMachineSlots(loc.clone().add(0, 0, 1));
        delete state.timer;
        return;
    }
    
    const elapsed = now - timer.startTime;
    
    // 中途提醒
    if (!timer.notifiedHalf && elapsed >= GENERATION_TIME / 2) {
        player.sendMessage(ChatColor.YELLOW + "[悟道石] 唔~唔~唔~");
        timer.notifiedHalf = true;
    }
    
    // 最后提醒
    if (!timer.notifiedFinal && elapsed >= GENERATION_TIME - FINAL_COUNTDOWN) {
        player.sendMessage(ChatColor.YELLOW + "[悟道石] 来啦！");
        timer.notifiedFinal = true;
    }
    
    // 生成物品
    if (!timer.generated && elapsed >= GENERATION_TIME) {
        generateItems(loc, player, timer.maxItems, timer.zombieCount);
        timer.generated = true;
        return;
    }
    
    // 清空机器
    if (timer.generated && elapsed >= GENERATION_TIME + CLEAR_DELAY) {
        clearMachineSlots(loc.clone().add(0, 0, 1));
        delete state.timer;
    }
}

// 辅助函数
function findPlayerOnStone(loc) {
    const world = loc.getWorld();
    const players = world.getNearbyEntities(loc.clone().add(0.5, 1, 0.5), 0.7, 1.5, 0.7);
    
    for (let i = 0; i < players.size(); i++) {
        const entity = players.get(i);
        if (entity instanceof org.bukkit.entity.Player) {
            return entity;
        }
    }
    return null;
}

function findAndClearZombies(loc) {
    const world = loc.getWorld();
    const center = loc.clone().add(0.5, 1, 0.5);
    const zombies = [];
    
    // 检测周围5×5×3范围内的僵尸和骷髅
    const entities = world.getNearbyEntities(center, 2.5, 1.5, 2.5);
    
    for (let i = 0; i < entities.size(); i++) {
        const entity = entities.get(i);
        // 检测僵尸和骷髅类型的小岛人
        if (entity.getType() === EntityType.ZOMBIE || entity.getType() === EntityType.SKELETON) {
            const name = entity.getCustomName();
            if (name && ChatColor.stripColor(name.toString()).includes("小岛人")) {
                entity.remove();
                zombies.push(entity);
            }
        }
    }
    
    return zombies;
}

// 物品生成
function generateItems(wudaoLoc, player, maxItems, zombieCount) {
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
    
    // 查找空槽位(9-44)
    const contents = menu.getContents();
    const emptySlots = [];
    
    for (let slot = 9; slot <= 44; slot++) {
        if (!contents[slot] || contents[slot].getType() === Material.AIR) {
            emptySlots.push(slot);
        }
    }
    
    if (emptySlots.length === 0) return;
    
    // 计算产出数量
    const count = Math.min(
        MIN_ITEMS + Math.floor(Math.random() * (maxItems - MIN_ITEMS + 1)),
        emptySlots.length
    );
    
    const itemStack = sfItem.getItem().clone();
    itemStack.setAmount(1);
    
    // 生成物品
    for (let i = 0; i < count; i++) {
        menu.replaceExistingItem(emptySlots[i], itemStack.clone());
    }
    
    player.sendMessage(ChatColor.GOLD + "[悟道石] 我悟了！！！");
    player.sendMessage(ChatColor.GREEN + `[悟道石] 感悟${zombieCount}个小岛人，感悟 ${count} 个物品`);
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
    event.getPlayer().sendMessage(ChatColor.GREEN + "✓ 已放置悟道石");
}

function onBreak(event, itemStack, drops) {
    machineStates.remove(event.getBlock().getLocation());
}