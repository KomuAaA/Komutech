// 试炼僵尸
let isWaitingInput = false;
let settingMode = 0; // 0=护甲, 1=血量

function spawnZombie(player, armorLevel, health) {
    const loc = player.getLocation();
    const spawnLoc = loc.add(loc.getDirection().multiply(2)).add(0, 1, 0);
    
    const zombie = player.getWorld().spawnEntity(spawnLoc, org.bukkit.entity.EntityType.ZOMBIE);
    
    zombie.setAdult();
    zombie.setMaxHealth(health);
    zombie.setHealth(health);
    zombie.setAware(false);
    zombie.setCanPickupItems(false);
    zombie.setCustomName("§c测试");
    zombie.setCustomNameVisible(true);
    
    const equip = zombie.getEquipment();
    equip.setHelmetDropChance(0);
    equip.setChestplateDropChance(0);
    equip.setLeggingsDropChance(0);
    equip.setBootsDropChance(0);
    
    if (armorLevel >= 0) {
        const protection = org.bukkit.enchantments.Enchantment.getByKey(
            org.bukkit.NamespacedKey.minecraft("protection")
        );
        
        if (armorLevel !== -1) {
            const items = [
                org.bukkit.Material.NETHERITE_HELMET,
                org.bukkit.Material.NETHERITE_CHESTPLATE,
                org.bukkit.Material.NETHERITE_LEGGINGS,
                org.bukkit.Material.NETHERITE_BOOTS
            ];
            
            [equip.setHelmet, equip.setChestplate, equip.setLeggings, equip.setBoots].forEach((setFunc, index) => {
                const item = new org.bukkit.inventory.ItemStack(items[index]);
                if (armorLevel > 0 && protection) {
                    const meta = item.getItemMeta();
                    meta.addEnchant(protection, Math.min(armorLevel, 255), true);
                    item.setItemMeta(meta);
                }
                setFunc.call(equip, item);
            });
        }
    }
    
    return zombie;
}

function updateLore(event, input) {
    const item = event.getItem();
    const meta = item.getItemMeta();
    const lore = meta.hasLore() ? meta.getLore() : [];
    
    const key = settingMode === 0 ? "§b§l已设置护甲 :" : "§b§l已设置血量 :";
    const value = settingMode === 0 ? (input == -1 ? "无护甲" : input == 0 ? "合金甲无保护" : `保护${input}合金甲`) : `${input} 血`;
    
    const newLine = `${key} §a§l${value}`;
    
    for (let i = 0; i < lore.size(); i++) {
        if (lore.get(i).startsWith(key)) {
            lore.set(i, newLine);
            meta.setLore(lore);
            item.setItemMeta(meta);
            return;
        }
    }
    
    lore.add(newLine);
    meta.setLore(lore);
    item.setItemMeta(meta);
}

function readSettings(meta) {
    let armor = 0;
    let health = 1024;
    
    if (meta && meta.hasLore()) {
        meta.getLore().forEach(line => {
            if (line.startsWith("§b§l已设置护甲 :")) {
                const value = line.split("§a§l")[1];
                if (value === "无护甲") armor = -1;
                else if (value === "合金甲无保护") armor = 0;
                else if (value.startsWith("保护")) armor = parseInt(value.match(/\d+/)[0]);
            } else if (line.startsWith("§b§l已设置血量 :")) {
                health = parseInt(line.split("§a§l")[1]);
            }
        });
    }
    
    return { armor, health };
}

function handleSneakClick(event) {
    const player = event.getPlayer();
    
    if (isWaitingInput) {
        player.sendMessage("§c请先完成当前输入或输入 'cancel' 取消");
        return;
    }
    
    const modes = ["护甲等级", "血量"];
    const prompts = [
        "§a请输入僵尸的护甲等级: §e(-1=无护甲, 0=合金甲无保护, 1-255=保护等级)",
        "§a请输入僵尸的血量: §e(0＞血量≥1024)"
    ];
    
    player.sendMessage(`§6当前设置: ${modes[settingMode]}`);
    player.sendMessage(prompts[settingMode]);
    isWaitingInput = true;
    
    const Consumer = Java.type('java.util.function.Consumer');
    getChatInput(player, new (Java.extend(Consumer))({
        accept: function(input) {
            isWaitingInput = false;
            
            if (input.toLowerCase() === "cancel") {
                player.sendMessage("§a已取消操作");
                return;
            }
            
            const num = parseInt(input.trim());
            
            if (settingMode === 0) {
                if (num < -1 || num > 255) {
                    player.sendMessage("§c护甲等级必须在-1到255之间");
                    return;
                }
            } else {
                if (num <= 0) {
                    player.sendMessage("§c血量必须大于0小于1024");
                    return;
                }
            }
            
            updateLore(event, num);
            player.sendMessage(`§a已设置${modes[settingMode]}`);
            settingMode = settingMode === 0 ? 1 : 0;
        }
    }));
}

function handleNormalClick(player, item) {
    const meta = item.getItemMeta();
    const settings = readSettings(meta);
    
    if (spawnZombie(player, settings.armor, settings.health)) {
        const desc = settings.armor === -1 ? "无护甲" : 
                    settings.armor === 0 ? "合金甲无保护" : 
                    `保护${settings.armor}合金甲`;
        player.sendMessage(`§a已生成${settings.health}血僵尸，${desc}`);
    }
}

function onUse(event) {
    const player = event.getPlayer();
    const item = event.getItem();
    
    if (player.isSneaking()) {
        handleSneakClick(event);
    } else {
        handleNormalClick(player, item);
    }
}

if (typeof plugin !== 'undefined') {
    org.bukkit.Bukkit.getPluginManager().registerEvents(new (Java.extend(org.bukkit.event.Listener, {
        onPlayerQuit: () => isWaitingInput = false,
        onPlayerItemHeld: (e) => {
            if (isWaitingInput) {
                e.getPlayer().sendMessage("§c已取消输入");
                isWaitingInput = false;
            }
        }
    })), plugin);
}