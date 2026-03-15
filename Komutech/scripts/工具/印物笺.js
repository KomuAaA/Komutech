var playerData = {};

function itemsMatch(a, b) {
    if (!a || !b || a.getType() !== b.getType()) return false;
    return a.isSimilar(b);
}

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

function updateItemLore(player, machineName) {
    var item = player.getInventory().getItemInMainHand();
    if (!item) return;
    var meta = item.getItemMeta();
    var lore = meta.hasLore() ? meta.getLore() : new java.util.ArrayList();
    var newLore = new java.util.ArrayList();
    for (var i = 0; i < lore.size(); i++) {
        var line = lore.get(i);
        if (line && line.indexOf("已复制机器:") === -1) newLore.add(line);
    }
    newLore.add("§7已复制机器: §b" + machineName);
    meta.setLore(newLore);
    item.setItemMeta(meta);
}

function hasPermission(player, location) {
    if (player.hasPermission("slimefun.inventory.bypass") ||
        player.hasPermission("komutech.hologram.bypass") ||
        player.isOp()) return true;
    var Slimefun = Java.type('io.github.thebusybiscuit.slimefun4.implementation.Slimefun');
    var Interaction = Java.type('io.github.thebusybiscuit.slimefun4.libraries.dough.protection.Interaction');
    var pm = Slimefun.getProtectionManager();
    return pm.hasPermission(player, location, Interaction.BREAK_BLOCK) &&
           pm.hasPermission(player, location, Interaction.INTERACT_BLOCK);
}

function onUse(event) {
    var player = event.getPlayer();
    var uid = player.getUniqueId().toString();
    var sneak = player.isSneaking();
    var block = event.getClickedBlock();
    if (!block.isPresent()) {
        player.sendMessage("§c请右键机器");
        return;
    }
    var loc = block.get().getLocation();
    if (!hasPermission(player, loc)) {
        player.sendMessage("§c你没有权限在此区域操作机器！");
        player.playSound(loc, "block.note_block.bass", 1.0, 0.5);
        return;
    }
    var machine = StorageCacheUtils.getSfItem(loc);
    if (!machine) {
        player.sendMessage("§c不是粘液机器");
        return;
    }
    var menu = StorageCacheUtils.getMenu(loc);
    if (!menu) {
        player.sendMessage("§c机器无存储");
        return;
    }
    var machineId = machine.getId();
    var machineName = machine.getItemName() || machineId;
    if (sneak) copyStorage(player, uid, machineId, machineName, menu);
    else applyStorage(player, uid, machineId, machineName, menu);
    event.cancel();
}

function copyStorage(player, uid, machineId, machineName, menu) {
    var storage = [];
    var itemCount = 0;
    for (var slot = 0; slot < menu.getContents().length; slot++) {
        var item = menu.getItemInSlot(slot);
        if (item && !item.getType().isAir()) {
            storage.push({slot: slot, item: item.clone(), amount: item.getAmount()});
            itemCount += item.getAmount();
        }
    }
    playerData[uid] = {id: machineId, name: machineName, storage: storage};
    updateItemLore(player, machineName);
    player.sendMessage("§6已复制: §b" + machineName);
    player.sendMessage("§7物品: " + itemCount + "个 (" + storage.length + "槽)");
    player.playSound(player.getLocation(), "block.note_block.chime", 0.5, 1.0);
}

function applyStorage(player, uid, targetId, targetName, menu) {
    var data = playerData[uid];
    if (!data) {
        player.sendMessage("§c请先复制存储");
        return;
    }
    if (data.id !== targetId) {
        player.sendMessage("§c机器不匹配");
        return;
    }
    var fillSlots = [];
    var totalNeed = 0;
    for (var i = 0; i < data.storage.length; i++) {
        var target = data.storage[i];
        var current = menu.getItemInSlot(target.slot);
        var currentAmount = 0;
        if (current && !current.getType().isAir()) {
            if (itemsMatch(current, target.item)) currentAmount = current.getAmount();
            else continue;
        }
        var need = target.amount - currentAmount;
        if (need > 0) {
            totalNeed += need;
            fillSlots.push({slot: target.slot, item: target.item, need: need});
        }
    }
    if (fillSlots.length === 0) {
        player.sendMessage("§a存储已满足");
        player.playSound(player.getLocation(), "block.note_block.pling", 0.5, 2.0);
        return;
    }
    var takenTotal = 0;
    var filledCount = 0;
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
    if (takenTotal > 0) {
        player.sendMessage("§a已补充: " + takenTotal + "个物品");
        player.playSound(player.getLocation(), "block.note_block.bell", 0.5, 1.0);
        try { if (menu.push) menu.push(); } catch(e) {}
    } else {
        player.sendMessage("§c背包无匹配物品");
        player.playSound(player.getLocation(), "block.note_block.bass", 0.5, 0.5);
    }
}