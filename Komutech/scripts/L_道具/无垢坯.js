// 当物品被右键时
function onUse(event) {
    var player = event.getPlayer();
    var playerName = player.getName();
    
    // 扣除最大生命值的99%
    var maxHealth = player.getMaxHealth(); // 获取玩家最大生命值
    var healthToRemove = maxHealth * 0.99; // 计算要扣除的生命值
    var newHealth = player.getHealth() - healthToRemove; // 计算新的生命值
    
    // 设置新的生命值（如果小于等于0，则设置为0，玩家会死亡）
    player.setHealth(Math.max(newHealth, 0));
    
    // 消耗道具
    var itemInHand = player.getInventory().getItemInMainHand();
    if (itemInHand && itemInHand.getAmount() > 0) {
        itemInHand.setAmount(itemInHand.getAmount() - 1);
    }
    
    // 获取粘液科技物品并添加绑定信息
    var slimefunItem = SlimefunItem.getById("KOMUTECH_L_DJ_蕴灵身");
    
    if (slimefunItem) {
        var itemStack = slimefunItem.getItem().clone();
        var itemMeta = itemStack.getItemMeta();
        
        // 获取现有Lore（如果有的话）
        var lore = itemMeta.getLore();
        if (lore == null) {
            lore = new java.util.ArrayList();
        }
        
        // 在原有Lore基础上添加绑定信息
        lore.add("§b已绑定：§a" + playerName);
        itemMeta.setLore(lore);
        
        itemStack.setItemMeta(itemMeta);
        player.getInventory().addItem(itemStack);
        
        player.sendMessage("§a你已绑定蕴灵身！");
        player.sendMessage("§c已扣除最大生命值的99%！");
        
        // 如果玩家死亡，发送额外信息
        if (newHealth <= 0) {
            player.sendMessage("§4警告：生命值耗尽！");
        }
    } else {
        player.sendMessage("§c错误：未找到蕴灵身物品！");
    }
}