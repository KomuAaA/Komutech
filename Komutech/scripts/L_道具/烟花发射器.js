// 随机烟花脚本 - Slimefun RSC附属
// 功能：右键发射随机烟花，支持三种物品类型

// ========== 配置区 ==========
const CONFIG = {
  // 数量设置
  minFireworks: 24,     // 压缩烟花最少数量
  maxFireworks: 32,     // 压缩烟花最多数量
  
  // 位置设置
  headBaseHeight: 5.0,  // 头顶基础高度
  minHeight: 1.6,       // 最低附加高度
  maxHeight: 1.8,       // 最高附加高度
  spreadRange: 32.0,    // 水平散布范围
  
  // 速度设置
  baseVerticalSpeed: 0.20,  // 基础上升速度
  minVerticalSpeed: 0.20,   // 最小速度浮动
  maxVerticalSpeed: 0.22,   // 最大速度浮动
  
  // 冷却设置
  cooldownTime: 3000,   // 冷却时间（毫秒）
  
  // 消息设置
  launchMessage: "🎆 §a烟花发射成功！",
  cooldownMessage: "§e请等待 {time} 秒后再发射烟花！",
  noItemMessage: "§c请使用正确的烟花发射器！"
};

// 物品检测关键词
const ITEM_KEYWORDS = {
  MULTI_LAUNCHER: "烟花发射器",    // 多发不消耗
  SINGLE_FIREWORK: "节日烟花",     // 单发消耗
  MULTI_FIREWORK: "压缩节日烟花"   // 多发消耗
};

// 随机选项
const COLORS = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "AQUA", "LIME", "FUCHSIA", "WHITE"];
const SHAPES = ["BALL", "BALL_LARGE", "STAR", "BURST", "CREEPER"];

// 烟花大小权重
const SIZES = [
  {value: 1, weight: 3},  // 小
  {value: 2, weight: 3},  // 中
  {value: 3, weight: 4}   // 大
];

// ========== Bukkit导入 ==========
const Bukkit = Java.type('org.bukkit.Bukkit');
const FireworkEffect = Java.type('org.bukkit.FireworkEffect');
const Firework = Java.type('org.bukkit.entity.Firework');
const Color = Java.type('org.bukkit.Color');
const Vector = Java.type('org.bukkit.util.Vector');
const ArrayList = Java.type('java.util.ArrayList');

// 颜色映射
const COLOR_MAP = {
  RED: Color.RED, BLUE: Color.BLUE, GREEN: Color.GREEN, YELLOW: Color.YELLOW,
  PURPLE: Color.PURPLE, ORANGE: Color.ORANGE, PINK: Color.fromRGB(255, 192, 203),
  AQUA: Color.AQUA, LIME: Color.LIME, FUCHSIA: Color.FUCHSIA, WHITE: Color.WHITE
};

// 形状映射
const SHAPE_MAP = {
  BALL: FireworkEffect.Type.BALL,
  BALL_LARGE: FireworkEffect.Type.BALL_LARGE,
  STAR: FireworkEffect.Type.STAR,
  BURST: FireworkEffect.Type.BURST,
  CREEPER: FireworkEffect.Type.CREEPER
};

// 冷却管理
let playerCooldowns = {};

// ========== 工具函数 ==========
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;
  let weightSum = 0;
  
  for (const item of items) {
    weightSum += item.weight;
    if (random <= weightSum) return item.value;
  }
  return items[items.length - 1].value;
}

// ========== 核心函数 ==========
function getItemType(itemStack) {
  if (!itemStack || itemStack.getType().toString() === "AIR") return null;
  
  try {
    const meta = itemStack.getItemMeta();
    if (!meta || !meta.hasLore()) return null;
    
    const loreString = meta.getLore().join(" ");
    
    if (loreString.includes(ITEM_KEYWORDS.MULTI_FIREWORK)) {
      return ITEM_KEYWORDS.MULTI_FIREWORK;
    } else if (loreString.includes(ITEM_KEYWORDS.MULTI_LAUNCHER)) {
      return ITEM_KEYWORDS.MULTI_LAUNCHER;
    } else if (loreString.includes(ITEM_KEYWORDS.SINGLE_FIREWORK)) {
      return ITEM_KEYWORDS.SINGLE_FIREWORK;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

function checkCooldown(player) {
  const playerId = player.getUniqueId().toString();
  const now = Date.now();
  
  // 清理过期冷却
  const threshold = now - CONFIG.cooldownTime;
  for (const id in playerCooldowns) {
    if (playerCooldowns[id] < threshold) {
      delete playerCooldowns[id];
    }
  }
  
  // 检查冷却
  if (playerCooldowns[playerId]) {
    const remaining = CONFIG.cooldownTime - (now - playerCooldowns[playerId]);
    if (remaining > 0) {
      player.sendMessage(CONFIG.cooldownMessage.replace("{time}", (remaining / 1000).toFixed(1)));
      return false;
    }
  }
  
  playerCooldowns[playerId] = now;
  return true;
}

function consumeItem(player) {
  const mainHand = player.getInventory().getItemInMainHand();
  if (!mainHand || mainHand.getType().toString() === "AIR") return false;
  
  if (mainHand.getAmount() > 1) {
    mainHand.setAmount(mainHand.getAmount() - 1);
  } else {
    player.getInventory().setItemInMainHand(null);
  }
  return true;
}

function generatePositions(count) {
  const positions = [];
  const innerRadius = CONFIG.spreadRange * 0.3;
  const outerRadius = CONFIG.spreadRange;
  
  for (let i = 0; i < count; i++) {
    const distance = randomFloat(innerRadius, outerRadius);
    const angle = randomFloat(0, Math.PI * 2);
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    const distanceRatio = (distance - innerRadius) / (outerRadius - innerRadius);
    const heightAdjustment = 0.5 - distanceRatio * 0.3;
    const height = CONFIG.headBaseHeight + randomFloat(CONFIG.minHeight, CONFIG.maxHeight) + heightAdjustment;
    
    positions.push({x, z, height});
  }
  
  return positions;
}

function createFireworkEffect() {
  try {
    const builder = FireworkEffect.builder();
    const shapeName = randomItem(SHAPES);
    builder.with(SHAPE_MAP[shapeName] || FireworkEffect.Type.BALL);
    
    const colorCount = randomInt(1, 5);
    const colors = new ArrayList();
    const availableColors = COLORS.slice();
    
    for (let i = 0; i < colorCount && availableColors.length > 0; i++) {
      const colorIndex = Math.floor(Math.random() * availableColors.length);
      const colorName = availableColors[colorIndex];
      const color = COLOR_MAP[colorName];
      
      if (color && !colors.contains(color)) {
        colors.add(color);
        if (availableColors.length > 1) {
          availableColors.splice(colorIndex, 1);
        }
      }
    }
    
    if (colors.isEmpty()) colors.add(Color.RED);
    builder.withColor(colors);
    
    if (Math.random() > 0.7) builder.flicker(true);
    if (Math.random() > 0.5) builder.trail(true);
    
    return builder.build();
  } catch (e) {
    return FireworkEffect.builder()
      .with(FireworkEffect.Type.BALL)
      .withColor(Color.RED)
      .build();
  }
}

function spawnFirework(player, x, z, height) {
  try {
    const loc = player.getLocation().clone().add(x, height, z);
    const firework = player.getWorld().spawn(loc, Firework.class);
    const meta = firework.getFireworkMeta();
    
    meta.addEffect(createFireworkEffect());
    meta.setPower(weightedRandom(SIZES));
    firework.setFireworkMeta(meta);
    
    const velocityY = CONFIG.baseVerticalSpeed + randomFloat(CONFIG.minVerticalSpeed, CONFIG.maxVerticalSpeed);
    firework.setVelocity(new Vector(0, velocityY, 0));
    
    return firework;
  } catch (e) {
    return null;
  }
}

// ========== 发射逻辑 ==========
function launchSingleFirework(player) {
  const height = CONFIG.headBaseHeight + randomFloat(CONFIG.minHeight, CONFIG.maxHeight);
  if (spawnFirework(player, 0, 0, height)) {
    player.sendMessage(CONFIG.launchMessage);
    return true;
  }
  return false;
}

function launchMultipleFireworks(player) {
  const count = randomInt(CONFIG.minFireworks, CONFIG.maxFireworks);
  const positions = generatePositions(count);
  let successful = 0;
  
  positions.sort((a, b) => (a.x*a.x + a.z*a.z) - (b.x*b.x + b.z*b.z));
  
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    if (spawnFirework(player, pos.x, pos.z, pos.height)) successful++;
  }
  
  if (successful > 0) {
    player.sendMessage(CONFIG.launchMessage.replace("🎆", `🎆×${successful}`));
    return true;
  }
  return false;
}

function handleFireworkLaunch(player) {
  if (!checkCooldown(player)) return false;
  
  const mainHand = player.getInventory().getItemInMainHand();
  const itemType = getItemType(mainHand);
  
  if (!itemType) {
    player.sendMessage(CONFIG.noItemMessage);
    return false;
  }
  
  let success = false;
  let shouldConsume = false;
  
  switch (itemType) {
    case ITEM_KEYWORDS.MULTI_LAUNCHER:
      success = launchMultipleFireworks(player);
      shouldConsume = false;
      break;
    case ITEM_KEYWORDS.SINGLE_FIREWORK:
      success = launchSingleFirework(player);
      shouldConsume = true;
      break;
    case ITEM_KEYWORDS.MULTI_FIREWORK:
      success = launchMultipleFireworks(player);
      shouldConsume = true;
      break;
  }
  
  if (success && shouldConsume) {
    consumeItem(player);
  }
  
  return success;
}

// ========== 事件处理 ==========
function onUse(event) {
  try {
    const player = event.getPlayer();
    if (player && player.isValid() && player.isOnline()) {
      handleFireworkLaunch(player);
    }
  } catch (e) {}
}

function process(e) {
  try {
    const event = e.getEvent();
    if (event) onUse(event);
  } catch (e) {}
}

function onDisable() {
  playerCooldowns = {};
}