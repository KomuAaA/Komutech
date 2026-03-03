var RECIPE = {
    12: "KOMUTECH_L_DJ_JPLS",
    13: "KOMUTECH_L_DJ_蕴灵身",
    14: "KOMUTECH_L_DJ_JPLS",
    21: "KOMUTECH_L_JCWP_SPLNHX",
    22: "KOMUTECH_L_WD_WDS",
    23: "KOMUTECH_L_JCWP_SPLNHX",
    30: "KOMUTECH_L_DJ_JPLS",
    31: "KOMUTECH_L_JQ_FZCZQ",
    32: "KOMUTECH_L_DJ_JPLS"
};

var OUTPUT_ITEM = "KOMUTECH_L_JQ_万相悟道仪";
var WORK_SLOT = 41;
var OUTPUT_SLOT = 49;

var SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");

function onClick(player, slot, slotItem, clickAction) {
    if (slot === WORK_SLOT && !clickAction.isRightClicked() && !clickAction.isShiftClicked()) {
        tryCraft(player);
    }
}

function tryCraft(player) {
    try {
        var inv = player.getOpenInventory().getTopInventory();
        var outputItem = inv.getItem(OUTPUT_SLOT);
        
        if (outputItem && outputItem.getAmount() >= 64) {
            player.sendMessage("§c输出槽位已满！");
            return;
        }
        
        // 检查材料
        for (var slotStr in RECIPE) {
            var slot = parseInt(slotStr);
            var item = inv.getItem(slot);
            var sfItem = item ? SlimefunItem.getByItem(item) : null;
            
            if (!sfItem || sfItem.getId() !== RECIPE[slot]) {
                player.sendMessage("§c材料不正确！");
                return;
            }
            
            if (slot === 13 && !isItemBoundToPlayer(item, player)) {
                player.sendMessage("§c大胆！何人竟敢行苟且之事！");
                return;
            }
        }
        
        var outputSfItem = SlimefunItem.getById(OUTPUT_ITEM);
        if (!outputSfItem) {
            player.sendMessage("§c合成失败！");
            return;
        }
        
        if (outputItem && SlimefunItem.getByItem(outputItem).getId() !== OUTPUT_ITEM) {
            player.sendMessage("§c输出槽位已有其他物品！");
            return;
        }
        
        // 扣除材料（跳过槽位13）
        for (var slotStr in RECIPE) {
            var slot = parseInt(slotStr);
            if (slot === 13) continue;
            
            var item = inv.getItem(slot);
            if (item.getAmount() === 1) {
                inv.setItem(slot, null);
            } else {
                item.setAmount(item.getAmount() - 1);
            }
        }
        
        // 生成输出物品
        var output = outputSfItem.getItem().clone();
        if (!outputItem) {
            inv.setItem(OUTPUT_SLOT, output);
        } else {
            outputItem.setAmount(outputItem.getAmount() + 1);
        }
        
        player.sendMessage("§a合成成功！");
        
    } catch (e) {
        player.sendMessage("§c合成失败！");
    }
}

function isItemBoundToPlayer(item, player) {
    try {
        var meta = item.getItemMeta();
        if (!meta || !meta.hasLore()) return false;
        
        var lore = meta.getLore();
        var playerName = player.getName();
        
        for (var i = 0; i < lore.size(); i++) {
            var line = lore.get(i);
            if (line && line.includes("§b已绑定：§a" + playerName)) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

function onOpen(player) {}
function onClose(player) {}