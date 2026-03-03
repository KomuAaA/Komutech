function onUse(e) {
    const player = e.getPlayer();
    const world = player.getWorld();
    
    // 检查世界和方块目标
    if (!world) {
        player.sendMessage("§c无法获取世界信息！");
        return false;
    }
    
    const targetBlock = player.getTargetBlock(null, 10);
    if (!targetBlock || targetBlock.getType() === org.bukkit.Material.AIR) {
        player.sendMessage("§c请对准一个方块右键！");
        return false;
    }
    
    // 生成位置
    const spawnLoc = targetBlock.getLocation().add(0.5, 1, 0.5);
    
    // 随机生成僵尸或骷髅
    const isSkeleton = Math.random() < 0.5;
    const entity = isSkeleton ? 
        world.spawn(spawnLoc, org.bukkit.entity.Skeleton.class) : 
        world.spawn(spawnLoc, org.bukkit.entity.Zombie.class);
    
    // 基础配置
    entity.setCustomName("§c§l小岛人");
    entity.setCustomNameVisible(true);
    entity.setMaxHealth(100);
    entity.setHealth(100);
    
    if (!isSkeleton) entity.setAdult(); // 僵尸设为成年
    
    // 装备和效果设置
    setupEquipment(entity, isSkeleton);
    setupPotionEffects(entity);
    
    // 消耗物品
    const item = e.getItem();
    if (item) {
        const amount = item.getAmount();
        if (amount > 1) {
            item.setAmount(amount - 1);
        } else {
            player.getInventory().setItemInMainHand(null);
        }
    }
    
    player.sendMessage(`§a小岛人（${isSkeleton ? "骷髅" : "僵尸"}）生成完成`);
    return true;
}

// 装备设置
function setupEquipment(entity, isSkeleton) {
    const eq = entity.getEquipment();
    if (!eq) return;
    
    // 护甲颜色和附魔
    const yellowColor = org.bukkit.Color.fromRGB(210, 180, 140);
    const protection = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("protection"));
    const unbreaking = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("unbreaking"));
    
    // 头盔
    const helmet = getSfItemById("KOMUTECH_L_SW_XDRHH");
    if (helmet) {
        eq.setHelmet(helmet.getItem());
        eq.setHelmetDropChance(0.8);
    }
    
    // 护甲套装
    setupArmor(eq, org.bukkit.Material.LEATHER_CHESTPLATE, yellowColor, protection, unbreaking);
    setupArmor(eq, org.bukkit.Material.LEATHER_LEGGINGS, yellowColor, protection, unbreaking);
    setupArmor(eq, org.bukkit.Material.LEATHER_BOOTS, yellowColor, protection, unbreaking);
    
    // 武器设置
    if (isSkeleton) {
        // 骷髅：附魔弓
        const bow = new org.bukkit.inventory.ItemStack(org.bukkit.Material.BOW);
        const bowMeta = bow.getItemMeta();
        
        const power = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("power"));
        const punch = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("punch"));
        const infinity = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("infinity"));
        
        if (power) bowMeta.addEnchant(power, 8, true);
        if (unbreaking) bowMeta.addEnchant(unbreaking, 5, true);
        if (punch) bowMeta.addEnchant(punch, 1, true);
        if (infinity) bowMeta.addEnchant(infinity, 1, true);
        
        bow.setItemMeta(bowMeta);
        eq.setItemInMainHand(bow);
        
        // 骷髅特殊设置
        entity.setCanPickupItems(false);
        entity.setRemoveWhenFarAway(false);
    } else {
        // 僵尸：附魔铁剑
        const sword = new org.bukkit.inventory.ItemStack(org.bukkit.Material.IRON_SWORD);
        const swordMeta = sword.getItemMeta();
        
        const sharpness = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("sharpness"));
        const fireAspect = org.bukkit.enchantments.Enchantment.getByKey(org.bukkit.NamespacedKey.minecraft("fire_aspect"));
        
        if (sharpness) swordMeta.addEnchant(sharpness, 8, true);
        if (unbreaking) swordMeta.addEnchant(unbreaking, 5, true);
        if (fireAspect) swordMeta.addEnchant(fireAspect, 2, true);
        
        sword.setItemMeta(swordMeta);
        eq.setItemInMainHand(sword);
    }
    
    eq.setItemInMainHandDropChance(0.0);
    
    // 副手功德券
    const gongdequan = getSfItemById("KOMUTECH_L_DJ_功德券");
    if (gongdequan) {
        eq.setItemInOffHand(gongdequan.getItem());
        eq.setItemInOffHandDropChance(0.9);
    }
}

// 护甲设置辅助函数
function setupArmor(eq, material, color, protection, unbreaking) {
    const armor = new org.bukkit.inventory.ItemStack(material);
    const meta = armor.getItemMeta();
    
    if (meta) {
        meta.setColor(color);
        if (protection) meta.addEnchant(protection, 3, true);
        if (unbreaking) meta.addEnchant(unbreaking, 5, true);
        armor.setItemMeta(meta);
    }
    
    // 根据材质判断装备位置
    switch(material) {
        case org.bukkit.Material.LEATHER_CHESTPLATE:
            eq.setChestplate(armor);
            eq.setChestplateDropChance(0.0);
            break;
        case org.bukkit.Material.LEATHER_LEGGINGS:
            eq.setLeggings(armor);
            eq.setLeggingsDropChance(0.0);
            break;
        case org.bukkit.Material.LEATHER_BOOTS:
            eq.setBoots(armor);
            eq.setBootsDropChance(0.0);
            break;
    }
}

// 药水效果设置
function setupPotionEffects(entity) {
    const effects = [
        {type: org.bukkit.potion.PotionEffectType.SPEED, level: 2},
        {type: org.bukkit.potion.PotionEffectType.INCREASE_DAMAGE, level: 2},
        {type: org.bukkit.potion.PotionEffectType.DAMAGE_RESISTANCE, level: 1}
    ];
    
    effects.forEach(effect => {
        if (effect.type) {
            entity.addPotionEffect(new org.bukkit.potion.PotionEffect(
                effect.type,
                999999 * 20, // 永久效果
                effect.level,
                true,
                true
            ));
        }
    });
}