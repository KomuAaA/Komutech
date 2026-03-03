const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Material = Java.type('org.bukkit.Material');
const Location = Java.type('org.bukkit.Location');

// 配置参数
const SEED_TO_SAPLING_TIME = 3000;
const SAPLING_TO_BAMBOO_TIME = 5000;
const TARGET_PDC_ID = "KOMUTECH_L_DJ_XSDLY";
const MAX_PRODUCTS = 16;
const TICK_INTERVAL = 1000;

// 存储结构
const stateMap = new java.util.HashMap();

// PDC缓存
const pdcCache = new java.util.WeakHashMap();

// 检测方块PDC
function hasTargetPDC(block) {
    const key = block.getLocation().toString();
    if (pdcCache.containsKey(key)) return pdcCache.get(key);
    
    let result = false;
    try {
        const pdc = block.getState().getPersistentDataContainer();
        const keys = pdc.getKeys();
        const stringType = Java.type('org.bukkit.persistence.PersistentDataType').STRING;
        
        for (const key of keys) {
            if (pdc.get(key, stringType)?.includes(TARGET_PDC_ID)) {
                result = true;
                break;
            }
        }
    } catch (error) {}
    
    pdcCache.put(key, result);
    return result;
}

// 消耗周围PDC方块
function consumePDCBlocks(location) {
    const world = location.getWorld();
    const x = location.getBlockX();
    const y = location.getBlockY();
    const z = location.getBlockZ();
    let blocksConsumed = 0;
    
    const offsets = [[1,0], [-1,0], [0,1], [0,-1]];
    for (const [dx, dz] of offsets) {
        const block = world.getBlockAt(x + dx, y, z + dz);
        if (hasTargetPDC(block)) {
            block.setType(Material.POPPY);
            blocksConsumed++;
            pdcCache.remove(block.getLocation().toString());
        }
    }
    
    return blocksConsumed;
}

// 计算竹子高度（仅在破坏时调用）
function getBambooHeight(location) {
    const world = location.getWorld();
    const x = location.getBlockX();
    const y = location.getBlockY();
    const z = location.getBlockZ();
    let height = 0;
    
    for (let currentY = y; currentY < world.getMaxHeight(); currentY++) {
        if (world.getBlockAt(x, currentY, z).getType() === Material.BAMBOO) {
            height++;
        } else {
            break;
        }
    }
    
    return height;
}

// 主循环逻辑
function tick(info) {
    const location = info.block().getLocation();
    const world = location.getWorld();
    const block = info.block();
    
    let state = stateMap.get(location);
    if (!state) {
        state = { stage: 0, lastTime: 0, pdcCount: 0, lastCheck: 0 };
        stateMap.put(location, state);
    }
    
    const currentTime = Date.now();
    if (currentTime - state.lastCheck < TICK_INTERVAL) return;
    state.lastCheck = currentTime;
    
    // 检查下方方块
    if (world.getBlockAt(location.getBlockX(), location.getBlockY() - 1, location.getBlockZ()).getType() !== Material.GRASS_BLOCK) return;
    
    if (state.stage === 0) {
        if (state.lastTime === 0) state.lastTime = currentTime;
        if (currentTime - state.lastTime >= SEED_TO_SAPLING_TIME) {
            block.setType(Material.BAMBOO_SAPLING);
            state.stage = 1;
            state.lastTime = currentTime;
        }
    } else if (state.stage === 1) {
        if (currentTime - state.lastTime >= SAPLING_TO_BAMBOO_TIME) {
            state.pdcCount = consumePDCBlocks(location);
            block.setType(Material.BAMBOO);
            state.stage = 2;
        }
    }
}

// 方块放置事件
function onPlace(event) {
    const location = event.getBlock().getLocation();
    stateMap.put(location, { stage: 0, lastTime: 0, pdcCount: 0, lastCheck: 0 });
}

// 方块破坏事件
function onBreak(event, itemStack, drops) {
    const location = event.getBlock().getLocation();
    const state = stateMap.get(location);
    if (!state || state.stage !== 2) return;
    
    const productItem = SlimefunItem.getById("KOMUTECH_L_LZ_YG");
    if (!productItem) return;
    
    const bambooHeight = getBambooHeight(location);
    if (bambooHeight <= 0) return;
    
    let dropCount = Math.floor(bambooHeight * (1 + state.pdcCount * 0.25));
    dropCount = Math.min(Math.max(dropCount, 1), MAX_PRODUCTS);
    
    drops.add(productItem.getItem().clone().asQuantity(dropCount));
    stateMap.remove(location);
}