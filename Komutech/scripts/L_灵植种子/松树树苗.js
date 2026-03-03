const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const Material = Java.type('org.bukkit.Material');

// 存储树木生长状态
let treeStates = new java.util.HashMap();

// ===== 配置项 =====
const config = {
    "KOMUTECH_L_LZZZ_SSSM": { // 云杉树种子ID
        seedToTreeTime: 150000,                     // 生长时间(毫秒) - 2.5分钟
        requiredBlock: Material.GRASS_BLOCK,        // 下方必需方块类型
        trunkMaterial: Material.SPRUCE_LOG,         // 树干方块类型
        leavesMaterial: Material.SPRUCE_LEAVES,     // 树叶方块类型
        customDropItemId: "KOMUTECH_L_LZ_SM",       // 成熟掉落物品ID
        minTreeHeight: 7,                           // 最小树高
        maxTreeHeight: 11,                          // 最大树高
        spaceCheckHeight: 12                        // 空间检测高度
    }
};

// ===== 树叶生成模式 =====
const LEAF_PATTERN = [
    {y: 1, radius: 1},   // 树干顶部上方1格
    {y: 0, radius: 2},   // 树干顶部
    {y: -1, radius: 1},  // 树干顶部下方1格
    {y: -2, radius: 3},  // 树干顶部下方2格
    {y: -3, radius: 2},  // 树干顶部下方3格
    {y: -4, radius: 4}   // 树干顶部下方4格
];

// ===== 主循环 =====
function tick(info) {
    const machineId = info.machine().getId();
    if (!config[machineId]) return;
    
    const location = info.block().getLocation();
    const state = treeStates.get(location);
    
    // 如果已成熟或已失败，直接返回
    if (state && (state.mature || state.failed)) return;
    
    const settings = config[machineId];
    const world = location.getWorld();
    const x = location.getBlockX();
    const y = location.getBlockY();
    const z = location.getBlockZ();
    
    // 如果没有状态，进行初始化
    if (!state) {
        // 第一次检测：种下时检测草地
        if (world.getBlockAt(x, y - 1, z).getType() !== settings.requiredBlock) {
            treeStates.put(location, {failed: true}); // 标记为失败状态
            return;
        }
        
        treeStates.put(location, {
            startTime: Date.now(),
            mature: false,
            failed: false
        });
        return;
    }
    
    // 如果方块已消失，清理状态
    if (info.block().getType() === Material.AIR) {
        treeStates.remove(location);
        return;
    }
    
    const elapsedTime = Date.now() - state.startTime;
    
    // 检查是否到了成熟时间
    if (elapsedTime >= settings.seedToTreeTime) {
        // 第二次检测：成熟前检测
        if (world.getBlockAt(x, y - 1, z).getType() !== settings.requiredBlock) {
            state.failed = true; // 标记为失败状态
            return;
        }
        
        if (!canGenerateTree(world, x, y, z, settings.spaceCheckHeight)) {
            state.failed = true; // 标记为失败状态
            return;
        }
        
        // 生成树木
        const treeHeight = generateTree(world, location, settings);
        if (treeHeight > 0) {
            state.mature = true;
            state.treeHeight = treeHeight;
        } else {
            state.failed = true; // 生成失败也标记为失败
        }
    }
}

// ===== 生成树木 =====
function generateTree(world, rootLocation, settings) {
    const x = rootLocation.getBlockX();
    const y = rootLocation.getBlockY();
    const z = rootLocation.getBlockZ();
    
    // 随机确定树高
    const treeHeight = settings.minTreeHeight + 
        Math.floor(Math.random() * (settings.maxTreeHeight - settings.minTreeHeight + 1));
    
    // 生成树干（包括种子位置）
    for (let i = 0; i < treeHeight; i++) {
        world.getBlockAt(x, y + i, z).setType(settings.trunkMaterial);
    }
    
    // 生成树叶
    generateLeaves(world, x, y + treeHeight - 1, z, settings.leavesMaterial);
    
    return treeHeight;
}

// ===== 生成树叶 =====
function generateLeaves(world, centerX, centerY, centerZ, leavesMaterial) {
    for (let pattern of LEAF_PATTERN) {
        const currentY = centerY + pattern.y;
        const radiusSquared = pattern.radius * pattern.radius;
        
        for (let dx = -pattern.radius; dx <= pattern.radius; dx++) {
            for (let dz = -pattern.radius; dz <= pattern.radius; dz++) {
                if (dx * dx + dz * dz <= radiusSquared) {
                    const leafBlock = world.getBlockAt(centerX + dx, currentY, centerZ + dz);
                    if (leafBlock.getType().isAir()) {
                        leafBlock.setType(leavesMaterial);
                    }
                }
            }
        }
    }
}

// ===== 检查生成空间 =====
function canGenerateTree(world, x, y, z, checkHeight) {
    for (let i = 1; i <= checkHeight; i++) {
        const blockType = world.getBlockAt(x, y + i, z).getType();
        if (!blockType.isAir() && blockType !== Material.SPRUCE_SAPLING) {
            return false;
        }
    }
    return true;
}

// ===== 放置事件 =====
function onPlace(event) {
    treeStates.remove(event.getBlock().getLocation());
}

// ===== 破坏事件 =====
function onBreak(event, itemStack, drops) {
    const location = event.getBlock().getLocation();
    const state = treeStates.get(location);
    
    // 处理成熟树木掉落
    if (state && state.mature && state.treeHeight) {
        const settings = config["KOMUTECH_L_LZZZ_SSSM"];
        const customItem = SlimefunItem.getById(settings.customDropItemId);
        if (customItem) {
            drops.add(customItem.getItem().clone().asQuantity(state.treeHeight));
        }
        
        // 清理树干
        const world = location.getWorld();
        const x = location.getBlockX();
        const y = location.getBlockY();
        const z = location.getBlockZ();
        
        for (let i = 1; i < state.treeHeight; i++) {
            world.getBlockAt(x, y + i, z).setType(Material.AIR);
        }
    }
    
    // 清理缓存
    treeStates.remove(location);
}