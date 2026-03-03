var ChatColor = org.bukkit.ChatColor;
var playerData = {};

// 严格比较物品
function itemsMatch(a, b) {
    if (!a || !b || a.getType() !== b.getType()) return false;
    return a.isSimilar(b);
}

// 从背包取物
function takeFromInventory(player, targetItem, needAmount) {
    var inv = player.getInventory();
    var taken = 0;
    
    for (var i = 0; i < 36 && taken < needAmount; i++) {
        var slotItem = inv.getItem(i);
        if (!slotItem || slotItem.getType().isAir()) continue;
        
        if (itemsMatch(slotItem, targetItem)) {
            var take = Math.min(slotItem.getAmount(), needAmount - taken);
            if (take > 0) {
                if (slotItem.getAmount() > take) {
                    slotItem.setAmount(slotItem.getAmount() - take);
                } else {
                    inv.setItem(i, null);
                }
                taken += take;
            }
        }
    }
    return taken;
}

// 更新物品Lore
function updateItemLore(player, machineName) {
    var item = player.getInventory().getItemInMainHand();
    if (!item) return;
    
    var meta = item.getItemMeta();
    var lore = meta.hasLore() ? meta.getLore() : new java.util.ArrayList();
    var newLore = new java.util.ArrayList();
    
    // 保留非机器信息的Lore
    for (var i = 0; i < lore.size(); i++) {
        var line = lore.get(i);
        if (line && line.indexOf("已复制机器:") === -1) { // 使用 Java 的 indexOf
            newLore.add(line);
        }
    }
    
    newLore.add(ChatColor.GRAY + "已复制机器: " + ChatColor.AQUA + machineName);
    meta.setLore(newLore);
    item.setItemMeta(meta);
}

function onUse(event) {
    var player = event.getPlayer();
    var uid = player.getUniqueId().toString();
    var sneak = player.isSneaking();
    
    var block = event.getClickedBlock();
    if (!block.isPresent()) {
        player.sendMessage(ChatColor.RED + "请右键机器");
        return;
    }
    
    var loc = block.get().getLocation();
    var machine = StorageCacheUtils.getSfItem(loc);
    
    if (!machine) {
        player.sendMessage(ChatColor.RED + "不是粘液机器");
        return;
    }
    
    var menu = StorageCacheUtils.getMenu(loc);
    if (!menu) {
        player.sendMessage(ChatColor.RED + "机器无存储");
        return;
    }
    
    var machineId = machine.getId();
    var machineName = machine.getItemName() || machineId;
    
    if (sneak) {
        copyStorage(player, uid, machineId, machineName, menu);
    } else {
        applyStorage(player, uid, machineId, machineName, menu);
    }
    
    event.cancel();
}

// 复制存储
function copyStorage(player, uid, machineId, machineName, menu) {
    var storage = [];
    var itemCount = 0;
    
    for (var slot = 0; slot < menu.getContents().length; slot++) {
        var item = menu.getItemInSlot(slot);
        if (item && !item.getType().isAir()) {
            storage.push({
                slot: slot,
                item: item.clone(),
                amount: item.getAmount()
            });
            itemCount += item.getAmount();
        }
    }
    
    playerData[uid] = {
        id: machineId,
        name: machineName,
        storage: storage
    };
    
    updateItemLore(player, machineName);
    
    player.sendMessage(ChatColor.GOLD + "已复制: " + ChatColor.AQUA + machineName);
    player.sendMessage(ChatColor.GRAY + "物品: " + itemCount + "个 (" + storage.length + "槽)");
    player.playSound(player.getLocation(), "block.note_block.chime", 0.5, 1.0);
}

// 应用存储
function applyStorage(player, uid, targetId, targetName, menu) {
    var data = playerData[uid];
    if (!data) {
        player.sendMessage(ChatColor.RED + "请先复制存储");
        return;
    }
    
    if (data.id !== targetId) {
        player.sendMessage(ChatColor.RED + "机器不匹配");
        return;
    }
    
    var fillSlots = [];
    var totalNeed = 0;
    
    // 计算需要补充的物品
    for (var i = 0; i < data.storage.length; i++) {
        var target = data.storage[i];
        var current = menu.getItemInSlot(target.slot);
        var currentAmount = 0;
        
        if (current && !current.getType().isAir()) {
            if (itemsMatch(current, target.item)) {
                currentAmount = current.getAmount();
            } else {
                continue;
            }
        }
        
        var need = target.amount - currentAmount;
        if (need > 0) {
            totalNeed += need;
            fillSlots.push({
                slot: target.slot,
                item: target.item,
                need: need
            });
        }
    }
    
    if (fillSlots.length === 0) {
        player.sendMessage(ChatColor.GREEN + "存储已满足");
        player.playSound(player.getLocation(), "block.note_block.pling", 0.5, 2.0);
        return;
    }
    
    var takenTotal = 0;
    var filledCount = 0;
    
    // 补充物品
    for (var i = 0; i < fillSlots.length; i++) {
        var slot = fillSlots[i];
        var taken = takeFromInventory(player, slot.item, slot.need);
        
        if (taken > 0) {
            takenTotal += taken;
            filledCount++;
            
            var current = menu.getItemInSlot(slot.slot);
            if (current) {
                current.setAmount(current.getAmount() + taken);
                menu.replaceExistingItem(slot.slot, current);
            } else {
                var newItem = slot.item.clone();
                newItem.setAmount(taken);
                menu.replaceExistingItem(slot.slot, newItem);
            }
        }
        
        if (takenTotal >= totalNeed) break;
    }
    
    // 结果反馈
    if (takenTotal > 0) {
        player.sendMessage(ChatColor.GREEN + "已补充: " + takenTotal + "个物品");
        player.playSound(player.getLocation(), "block.note_block.bell", 0.5, 1.0);
        try { if (menu.push) menu.push(); } catch(e) {}
    } else {
        player.sendMessage(ChatColor.RED + "背包无匹配物品");
        player.playSound(player.getLocation(), "block.note_block.bass", 0.5, 0.5);
    }
}