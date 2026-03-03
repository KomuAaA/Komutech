const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Material = Java.type('org.bukkit.Material');

// 状态存储
let plantData = new java.util.HashMap();

// ===== 配置区域 =====
const config = {
    stages: [
        {material: Material.SHORT_GRASS, duration: 3000},        // 第一阶段：短草
        {material: Material.WHITE_TULIP, duration: 5000},        // 第二阶段：白色郁金香
        {material: Material.LILY_OF_THE_VALLEY, duration: 3000}  // 第三阶段：铃兰
    ],
    requiredBlock: Material.FARMLAND,                // 下方必须为耕地
    productItemId: "KOMUTECH_L_LZ_MH",              // 产物ID
    minProductDrop: 3,                              // 产物最小掉落数量
    maxProductDrop: 8                               // 产物最大掉落数量
};

// 缓存物品引用
let productItem = null;
// ===== 配置结束 =====

function tick(info) {
    // 快速ID检查
    if (info.machine().getId() !== "KOMUTECH_L_LZZZ_MHZZ") return;
    
    const location = info.block().getLocation();
    const world = location.getWorld();
    const block = info.block();
    const x = location.getBlockX();
    const y = location.getBlockY();
    const z = location.getBlockZ();
    const currentTime = Date.now();
    
    let data = plantData.get(location);
    
    // 初始化种植数据
    if (!data) {
        // 第一次检测：种下时检测耕地
        const belowBlock = world.getBlockAt(x, y - 1, z);
        if (belowBlock.getType() !== config.requiredBlock) {
            return; // 不是耕地，不存储数据，后续tick直接跳过
        }
        
        data = {startTime: currentTime, currentStage: -1, isMature: false, checkedForMature: false};
        plantData.put(location, data);
        return;
    }
    
    // 如果已成熟，无需处理
    if (data.isMature) return;
    
    const elapsedTime = currentTime - data.startTime;
    
    // 第二次检测：成熟前检测耕地（只检测一次）
    if (!data.checkedForMature && elapsedTime >= 10900) {
        const belowBlock = world.getBlockAt(x, y - 1, z);
        if (belowBlock.getType() !== config.requiredBlock) {
            plantData.remove(location); // 耕地被破坏，清除状态
            return;
        }
        data.checkedForMature = true;
    }
    
    let targetStage = -1;
    
    // 阶段判断（累积时间）
    if (elapsedTime >= 11000) {  // 3 + 5 + 3 = 11秒
        targetStage = 2;
        data.isMature = true;  // 标记为成熟
    } else if (elapsedTime >= 8000) {  // 3 + 5 = 8秒
        targetStage = 1;
    } else if (elapsedTime >= 3000) {  // 3秒
        targetStage = 0;
    }
    
    // 如果阶段有变化，更新方块
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
    const data = plantData.get(location);
    
    if (!data) return;
    
    // 如果已成熟，只生成产物掉落物
    if (data.isMature) {
        // 懒加载产物物品
        if (!productItem) {
            productItem = SlimefunItem.getById(config.productItemId);
        }
        
        // 产物掉落3-8个
        if (productItem) {
            const dropCount = config.minProductDrop + Math.floor(
                Math.random() * (config.maxProductDrop - config.minProductDrop + 1)
            );
            drops.add(productItem.getItem().clone().asQuantity(dropCount));
        }
    }
    
    // 清理数据
    plantData.remove(location);
}