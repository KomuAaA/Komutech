// 导入必要的Java类
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Material = Java.type('org.bukkit.Material');

// 状态常量
const STATE_GROWING = 0;   // 种子正在生长中
const STATE_MATURE = 1;    // 已成熟，可收获
const STATE_DAMAGED = 2;   // 已损坏，无收获

// 配置常量
const GROWTH_TIME = 8000;           // 生长所需时间：8秒（5000毫秒）
const DAMAGE_DELAY = 2000;          // 损坏延迟：2秒（2000毫秒）
const REQUIRED_BLOCK_BELOW = Material.CAMPFIRE;   // 下方必须为篝火
const REQUIRED_BLOCK_ABOVE = Material.SMOKER;     // 上方必须为烟熏炉
const MATURE_BLOCK = Material.COAL_BLOCK;         // 成熟后变为煤炭块
const DAMAGED_BLOCK = Material.GRAY_WOOL;         // 损坏后变为灰色羊毛
const REQUIRED_ITEM_ID = "KOMUTECH_L_JCWP_JZJS";  // 消耗品粘液科技物品ID
const DROP_ITEM_ID = "KOMUTECH_L_JCWP_SYM";       // 掉落物粘液科技物品ID
// 状态存储 - 位置->[状态, 开始时间]
const growthStates = new java.util.HashMap();

// 缓存物品引用（懒加载）
let requiredItem = null;
let dropItem = null;

/**
 * 主循环逻辑
 */
function tick(info) {
    const location = info.block().getLocation();
    const world = location.getWorld();
    const x = location.getBlockX();
    const y = location.getBlockY();
    const z = location.getBlockZ();
    
    // 快速环境检查
    if (world.getBlockAt(x, y - 1, z).getType() !== REQUIRED_BLOCK_BELOW ||
        world.getBlockAt(x, y + 1, z).getType() !== REQUIRED_BLOCK_ABOVE) {
        growthStates.remove(location);
        return;
    }
    
    let stateData = growthStates.get(location);
    const currentTime = Date.now();
    
    // 初始化状态
    if (!stateData) {
        stateData = [STATE_GROWING, currentTime];
        growthStates.put(location, stateData);
        return;
    }
    
    // 只处理生长状态
    if (stateData[0] !== STATE_GROWING) return;
    
    const elapsedTime = currentTime - stateData[1];
    const aboveBlock = world.getBlockAt(x, y + 1, z);
    
    // 检查损坏条件
    if (elapsedTime >= DAMAGE_DELAY) {
        if (!checkItem(aboveBlock, false)) {
            info.block().setType(DAMAGED_BLOCK);
            stateData[0] = STATE_DAMAGED;
            return;
        }
    }
    
    // 检查成熟条件
    if (elapsedTime >= GROWTH_TIME) {
        if (checkItem(aboveBlock, true)) {
            info.block().setType(MATURE_BLOCK);
            stateData[0] = STATE_MATURE;
        } else {
            info.block().setType(DAMAGED_BLOCK);
            stateData[0] = STATE_DAMAGED;
        }
    }
}

/**
 * 检查并消耗物品
 */
function checkItem(aboveBlock, consume) {
    const inventory = aboveBlock.getState().getInventory();
    if (!inventory) return false;
    
    const item = inventory.getItem(0);
    if (!item) return false;
    
    // 懒加载物品
    if (!requiredItem) {
        requiredItem = SlimefunItem.getById(REQUIRED_ITEM_ID);
        if (!requiredItem) return false;
    }
    
    const slimefunItem = SlimefunItem.getByItem(item);
    if (!slimefunItem || slimefunItem !== requiredItem) return false;
    
    if (item.getAmount() < 1) return false;
    
    // 消耗物品
    if (consume) {
        if (item.getAmount() > 1) {
            item.setAmount(item.getAmount() - 1);
        } else {
            inventory.clear(0);
        }
    }
    
    return true;
}

/**
 * 放置事件
 */
function onPlace(event) {
    growthStates.remove(event.getBlock().getLocation());
}

/**
 * 粘液科技破坏事件
 */
function onBreak(event, itemStack, drops) {
    const location = event.getBlock().getLocation();
    const stateData = growthStates.get(location);
    
    if (!stateData) return;
    
    // 阻止原版掉落
    event.setDropItems(false);
    drops.clear();
    
    // 处理自定义掉落
    if (stateData[0] === STATE_MATURE) {
        // 懒加载掉落物
        if (!dropItem) {
            dropItem = SlimefunItem.getById(DROP_ITEM_ID);
        }
        
        if (dropItem) {
            const dropCount = 1 + Math.floor(Math.random() * 3);
            location.getWorld().dropItemNaturally(
                location, 
                dropItem.getItem().clone().asQuantity(dropCount)
            );
        }
    } else if (stateData[0] === STATE_DAMAGED) {
        event.setExpToDrop(0);
    }
    
    growthStates.remove(location);
}

/**
 * 原版方块破坏事件
 */
function onBlockBreak(event) {
    const block = event.getBlock();
    const location = block.getLocation();
    const stateData = growthStates.get(location);
    
    if (!stateData) return;
    
    event.setDropItems(false);
    event.setExpToDrop(0);
    
    if (stateData[0] === STATE_MATURE) {
        if (!dropItem) {
            dropItem = SlimefunItem.getById(DROP_ITEM_ID);
        }
        
        if (dropItem) {
            const dropCount = 1 + Math.floor(Math.random() * 3);
            location.getWorld().dropItemNaturally(
                location,
                dropItem.getItem().clone().asQuantity(dropCount)
            );
        }
    }
    
    growthStates.remove(location);
}

/**
 * 物理事件 - 防止作物被破坏
 */
function onBlockPhysics(event) {
    const block = event.getBlock();
    const location = block.getLocation();
    
    if (growthStates.get(location)) {
        event.setCancelled(true);
    }
}