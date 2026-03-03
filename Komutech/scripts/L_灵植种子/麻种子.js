const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Material = Java.type('org.bukkit.Material');

// 存储植物生长状态
let plantData = new java.util.HashMap();

// ===== 配置项 =====
const config = {
    // 生长阶段：方块材质 + 阶段持续时间(毫秒)
    stages: [
        {material: Material.SHORT_GRASS, duration: 3000},  // 阶段1: 短草
        {material: Material.TALL_GRASS, duration: 5000},   // 阶段2: 高草  
        {material: Material.LARGE_FERN, duration: 3000}    // 阶段3: 大蕨
    ],
    requiredBlock: Material.FARMLAND,               // 下方必须为耕地
    productItemId: "KOMUTECH_L_LZ_M",               // 产物Slimefun物品ID
    minProductDrop: 3,                              // 最小掉落数量
    maxProductDrop: 8                               // 最大掉落数量
};

// 缓存产物物品引用
let productItem = null;
// ===== 配置结束 =====

function tick(info) {
    if (info.machine().getId() !== "KOMUTECH_L_LZZZ_MZZ") return;
    
    const location = info.block().getLocation();
    const world = location.getWorld();
    const block = info.block();
    const currentTime = Date.now();
    
    // 检查是否有状态数据
    if (!plantData.containsKey(location)) {
        // 第一次检测：种下时检测下方是否为耕地
        const belowBlock = world.getBlockAt(location.getBlockX(), location.getBlockY() - 1, location.getBlockZ());
        if (belowBlock.getType() !== config.requiredBlock) {
            return; // 不是耕地，不存储数据，后续跳过
        }
        
        // 初始化状态数据
        plantData.put(location, {
            startTime: currentTime, 
            currentStage: -1, 
            isMature: false,
            checkedForMature: false // 标记是否完成成熟前耕地检测
        });
        return;
    }
    
    const data = plantData.get(location);
    
    // 成熟后不执行任何代码
    if (data.isMature) return;
    
    const elapsedTime = currentTime - data.startTime;
    
    // 第二次检测：成熟前检测耕地（只检测一次）
    if (!data.checkedForMature && elapsedTime >= 10900) {
        const belowBlock = world.getBlockAt(location.getBlockX(), location.getBlockY() - 1, location.getBlockZ());
        if (belowBlock.getType() !== config.requiredBlock) {
            plantData.remove(location); // 耕地被破坏，清除状态
            return;
        }
        data.checkedForMature = true;
    }
    
    let targetStage = -1;
    
    // 判断当前生长阶段
    if (elapsedTime >= 11000) {
        targetStage = 2;
        data.isMature = true;
    } else if (elapsedTime >= 8000) {
        targetStage = 1;
    } else if (elapsedTime >= 3000) {
        targetStage = 0;
    }
    
    // 更新方块显示当前阶段
    if (targetStage !== data.currentStage && targetStage >= 0) {
        block.setType(config.stages[targetStage].material);
        data.currentStage = targetStage;
    }
}

function onPlace(event) {
    plantData.remove(event.getBlock().getLocation());
}

function onBreak(event, itemStack, drops) {
    const location = event.getBlock().getLocation();
    
    if (plantData.containsKey(location)) {
        const data = plantData.get(location);
        
        // 成熟时掉落产物
        if (data.isMature) {
            if (!productItem) {
                productItem = SlimefunItem.getById(config.productItemId);
            }
            
            if (productItem) {
                const dropCount = config.minProductDrop + 
                    Math.floor(Math.random() * (config.maxProductDrop - config.minProductDrop + 1));
                drops.add(productItem.getItem().clone().asQuantity(dropCount));
            }
        }
        
        // 清除所有缓存
        plantData.remove(location);
    }
}