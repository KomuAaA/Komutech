let plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");
if (!plugin) throw new Error("未找到 RykenSlimefunCustomizer 插件！");

let Bukkit = Java.type('org.bukkit.Bukkit');
let Consumer = Java.type('java.util.function.Consumer');
let FixedMetadataValue = Java.type('org.bukkit.metadata.FixedMetadataValue');

let lastClickTime = new java.util.HashMap();
const DOUBLE_CLICK_THRESHOLD = 500;

const RANK_CONFIG = {
    黄阶: { matchStr: "§e§l黄阶", replaceStr: "§e§l黄阶", profMax: 500 },
    玄阶: { matchStr: "§8§l玄阶", replaceStr: "§8§l玄阶", profMax: 1500 },
    地阶: { matchStr: "§d§l地阶", replaceStr: "§d§l地阶", profMax: 3000 },
    天阶: { matchStr: "§4§l天阶", replaceStr: "§4§l天阶", profMax: 10000 }
};
const RANK_KEYWORDS = ["黄阶", "玄阶", "地阶", "天阶"];
const EDIT_MODES = ["功德值", "品阶", "灵力最大值", "熟练度"];

let isWaitingForInput = false;
let currentEditMode = null;

function parseMeritValue(item) {
    if (!item || !item.hasItemMeta()) return 0;
    const lore = item.getItemMeta().getLore() || [];
    const meritPattern = /§b功德值：§6(\d+)/;
    const demeritPattern = /§c缺德值：§6(\d+)/;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        let match = line.match(meritPattern);
        if (match) return parseInt(match[1]) || 0;
        match = line.match(demeritPattern);
        if (match) return -parseInt(match[1]) || 0;
    }
    return 0;
}

function setMeritValue(item, value) {
    if (!item || !item.hasItemMeta()) return false;
    const meta = item.getItemMeta();
    const lore = meta.getLore() || [];
    const targetLine = value >= 0 ? `§b功德值：§6${Math.abs(value)}` : `§c缺德值：§6${Math.abs(value)}`;
    const pattern = /§[bc]功德?值：§6\d+/;
    let idx = -1;
    for (let i = 0; i < lore.size(); i++) {
        if (pattern.test(lore[i])) { idx = i; break; }
    }
    if (idx >= 0) lore.set(idx, targetLine);
    else lore.add(targetLine);
    meta.setLore(lore);
    item.setItemMeta(meta);
    return true;
}

function parseItemRank(item) {
    if (!item || !item.hasItemMeta() || !item.getItemMeta().hasLore()) return null;
    const lore = item.getItemMeta().getLore();
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        for (const keyword of RANK_KEYWORDS) {
            if (line && line.includes(keyword)) return keyword;
        }
    }
    return null;
}

function setItemRank(item, targetRank) {
    if (!item || !item.hasItemMeta() || !item.getItemMeta().hasLore() || !RANK_CONFIG[targetRank]) return false;
    const meta = item.getItemMeta();
    const lore = meta.getLore();
    const targetConfig = RANK_CONFIG[targetRank];
    const profMaxPattern = /(§7\/ §6)(\d+)/;
    let rankUpdated = false, profUpdated = false;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore[i];
        let newLine = line;
        if (!rankUpdated) {
            for (const key in RANK_CONFIG) {
                const old = RANK_CONFIG[key];
                if (line.includes(old.matchStr)) {
                    newLine = line.replace(old.matchStr, targetConfig.replaceStr);
                    rankUpdated = true;
                    break;
                }
            }
        }
        if (!profUpdated && profMaxPattern.test(line)) {
            newLine = line.replace(profMaxPattern, `$1${targetConfig.profMax}`);
            profUpdated = true;
        }
        if (newLine !== line) lore.set(i, newLine);
    }
    if (!rankUpdated) return false;
    meta.setLore(lore);
    item.setItemMeta(meta);
    return true;
}

function parseSpiritMaxValue(item) {
    if (!item || !item.hasItemMeta()) return 0;
    const lore = item.getItemMeta().getLore() || [];
    const pattern = /§b灵力剩余：§6\d+ §7\/ §6(\d+)/;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        const match = line.match(pattern);
        if (match) return parseInt(match[1]) || 0;
    }
    return 0;
}

function setSpiritMaxValue(item, maxValue) {
    if (!item || !item.hasItemMeta()) return false;
    const meta = item.getItemMeta();
    const lore = meta.getLore() || [];
    const pattern = /(§b灵力剩余：§6\d+ §7\/ §6)\d+/;
    for (let i = 0; i < lore.size(); i++) {
        if (pattern.test(lore[i])) {
            lore.set(i, lore[i].replace(pattern, `$1${maxValue}`));
            meta.setLore(lore);
            item.setItemMeta(meta);
            return true;
        }
    }
    return false;
}

function parseProficiencyInfo(item) {
    if (!item || !item.hasItemMeta()) return { current: 0, max: 0 };
    const lore = item.getItemMeta().getLore() || [];
    const pattern = /§b熟练度：§6(\d+) §7\/ §6(\d+)/;
    for (let i = 0; i < lore.size(); i++) {
        const line = lore.get(i);
        const match = line.match(pattern);
        if (match) return { current: parseInt(match[1]) || 0, max: parseInt(match[2]) || 0 };
    }
    return { current: 0, max: 0 };
}

function setProficiency(item, newProf) {
    if (!item || !item.hasItemMeta()) return false;
    const meta = item.getItemMeta();
    const lore = meta.getLore() || [];
    const pattern = /§b熟练度：§6\d+ §7\/ §6(\d+)/;
    for (let i = 0; i < lore.size(); i++) {
        const match = lore[i].match(pattern);
        if (match) {
            const maxVal = parseInt(match[1]) || 0;
            if (maxVal <= 0) return false;
            lore.set(i, `§b熟练度：§6${newProf} §7/ §6${maxVal}`);
            meta.setLore(lore);
            item.setItemMeta(meta);
            return true;
        }
    }
    return false;
}

function resetPlayerState(player) {
    player.removeMetadata("editMode", plugin);
    player.removeMetadata("targetValue", plugin);
    player.removeMetadata("adjusterWaitingInput", plugin);
    isWaitingForInput = false;
    currentEditMode = null;
    player.sendMessage("§a已重置状态，可以重新选择属性");
}

function showHelp(player) {
    player.sendMessage("§6===== 物品属性调整器 =====");
    player.sendMessage("§e支持的功能:");
    player.sendMessage("§a功德值 §7- 调整功德/缺德值 (正数=功德，负数=缺德)");
    player.sendMessage("§a品阶 §7- 调整物品品阶 (黄阶/玄阶/地阶/天阶)");
    player.sendMessage("§a灵力最大值 §7- 调整灵力最大值");
    player.sendMessage("§a熟练度 §7- 调整熟练度当前值");
    player.sendMessage("§6使用方法:");
    player.sendMessage("§e1. §7首次蹲下右键选择要修改的属性");
    player.sendMessage("§e2. §7再次蹲下右键输入数值/品阶");
    player.sendMessage("§e3. §7普通右键应用到副手物品");
    player.sendMessage("§c输入 'cancel' 可取消当前操作");
    player.sendMessage("§c快速双击右键可强制重置状态");
}

function handleFirstInput(player) {
    player.sendMessage("§6请选择要修改的属性:");
    player.sendMessage("§e功德值 §7| §e品阶 §7| §e灵力最大值 §7| §e熟练度");
    player.sendMessage("§a输入属性名称，或输入 'help' 查看帮助");
    isWaitingForInput = true;

    let JSConsumer = Java.extend(Consumer, {
        accept: function(input) {
            isWaitingForInput = false;
            input = input.trim();
            const lower = input.toLowerCase();
            if (lower === "cancel") {
                player.sendMessage("§a✅ 已取消操作");
                return;
            }
            if (lower === "help") {
                showHelp(player);
                return;
            }
            let foundMode = null;
            for (const mode of EDIT_MODES) {
                if (input.includes(mode)) {
                    foundMode = mode;
                    break;
                }
            }
            if (!foundMode) {
                player.sendMessage("§c❌ 不支持的属性！请从以下选择:");
                player.sendMessage("§e功德值 §7| §e品阶 §7| §e灵力最大值 §7| §e熟练度");
                return;
            }
            currentEditMode = foundMode;
            player.setMetadata("editMode", new FixedMetadataValue(plugin, foundMode));
            player.sendMessage(`§a✅ 已选择: §6${foundMode}`);
            if (foundMode === "品阶")
                player.sendMessage("§a请再次蹲下右键，输入目标品阶 (黄阶/玄阶/地阶/天阶)");
            else
                player.sendMessage(`§a请再次蹲下右键，输入目标${foundMode}数值`);
        }
    });
    getChatInput(player, new JSConsumer());
}

function handleSecondInput(player) {
    const mode = player.getMetadata("editMode")[0].asString();
    if (mode === "品阶")
        player.sendMessage("§6请输入目标品阶: 黄阶/玄阶/地阶/天阶");
    else
        player.sendMessage(`§6请输入目标${mode}:`);
    isWaitingForInput = true;

    let JSConsumer = Java.extend(Consumer, {
        accept: function(input) {
            isWaitingForInput = false;
            input = input.trim();
            const lower = input.toLowerCase();
            if (lower === "cancel") {
                player.sendMessage("§a✅ 已取消操作");
                player.removeMetadata("editMode", plugin);
                currentEditMode = null;
                return;
            }
            const mode = player.getMetadata("editMode")[0].asString();
            let targetValue = null;
            if (mode === "品阶") {
                let foundRank = null;
                for (const rank of RANK_KEYWORDS) {
                    if (input.includes(rank)) {
                        foundRank = rank;
                        break;
                    }
                }
                if (!foundRank) {
                    player.sendMessage("§c❌ 无效的品阶！请输入: 黄阶/玄阶/地阶/天阶");
                    return;
                }
                targetValue = foundRank;
            } else {
                const num = parseInt(input);
                if (isNaN(num)) {
                    player.sendMessage("§c❌ 请输入有效的数字！");
                    return;
                }
                if (mode === "功德值") {
                    targetValue = num;
                } else {
                    if (num < 0) {
                        player.sendMessage("§c❌ 请输入非负整数！");
                        return;
                    }
                    targetValue = num;
                }
            }
            player.setMetadata("targetValue", new FixedMetadataValue(plugin, targetValue));
            player.sendMessage(`§a✅ 已设置: §6${mode} = ${targetValue}`);
            player.sendMessage("§a请使用普通右键应用到副手物品");
        }
    });
    getChatInput(player, new JSConsumer());
}

function applyToOffhand(player) {
    const offhand = player.getInventory().getItemInOffHand();
    if (!offhand || offhand.getType().isAir()) {
        player.sendMessage("§c❌ 副手未装备物品！请将目标物品放在副手");
        return;
    }
    if (!player.hasMetadata("editMode") || !player.hasMetadata("targetValue")) {
        player.sendMessage("§c❌ 未设置修改内容！请先蹲下右键设置");
        return;
    }
    const mode = player.getMetadata("editMode")[0].asString();
    const target = mode === "品阶"
        ? player.getMetadata("targetValue")[0].asString()
        : player.getMetadata("targetValue")[0].asInt();

    const cleanup = (msg) => {
        player.removeMetadata("editMode", plugin);
        player.removeMetadata("targetValue", plugin);
        if (msg) player.sendMessage(msg);
    };

    switch (mode) {
        case "功德值": {
            const old = parseMeritValue(offhand);
            if (setMeritValue(offhand, target))
                player.sendMessage(`§a✅ 功德值调整成功！\n§6原值: ${old >= 0 ? old : "缺德" + Math.abs(old)} §6→ §e${target >= 0 ? target : "缺德" + Math.abs(target)}`);
            else
                player.sendMessage("§c❌ 功德值调整失败！物品数据异常");
            break;
        }
        case "品阶": {
            const old = parseItemRank(offhand);
            if (!old) { cleanup("§c❌ 物品无品阶属性！"); return; }
            if (setItemRank(offhand, target))
                player.sendMessage(`§a✅ 品阶调整成功！\n§6原品阶: ${old} §6→ §e${target}`);
            else
                player.sendMessage("§c❌ 品阶调整失败！物品数据异常");
            break;
        }
        case "灵力最大值": {
            const old = parseSpiritMaxValue(offhand);
            if (old <= 0) { cleanup("§c❌ 物品无灵力最大值属性！"); return; }
            if (setSpiritMaxValue(offhand, target))
                player.sendMessage(`§a✅ 灵力最大值调整成功！\n§6原值: ${old} §6→ §e${target}`);
            else
                player.sendMessage("§c❌ 灵力最大值调整失败！物品数据异常");
            break;
        }
        case "熟练度": {
            const info = parseProficiencyInfo(offhand);
            if (info.max <= 0) { cleanup("§c❌ 物品无熟练度属性！"); return; }
            if (target > info.max) { cleanup(`§c❌ 熟练度(${target})不能超过最大值(${info.max})！`); return; }
            if (setProficiency(offhand, target))
                player.sendMessage(`§a✅ 熟练度调整成功！\n§6原值: ${info.current}/${info.max} §6→ §e${target}/${info.max}`);
            else
                player.sendMessage("§c❌ 熟练度调整失败！物品数据异常");
            break;
        }
    }
    player.removeMetadata("editMode", plugin);
    player.removeMetadata("targetValue", plugin);
    currentEditMode = null;
}

function onUse(event) {
    const player = event.getPlayer();
    const item = event.getItem();
    if (!item) return;

    const pid = player.getUniqueId().toString();
    const now = Date.now();
    const last = lastClickTime.get(pid) || 0;
    if (now - last <= DOUBLE_CLICK_THRESHOLD) {
        resetPlayerState(player);
        lastClickTime.put(pid, now);
        return;
    }
    lastClickTime.put(pid, now);

    if (isWaitingForInput) {
        player.sendMessage("§c⚠️ 请先完成当前输入或输入 'cancel' 取消");
        return;
    }

    if (player.isSneaking()) {
        if (!player.hasMetadata("editMode")) {
            handleFirstInput(player);
        } else if (!player.hasMetadata("targetValue")) {
            handleSecondInput(player);
        } else {
            player.sendMessage("§a检测到已设置目标值，自动进入第一次选择");
            player.removeMetadata("editMode", plugin);
            player.removeMetadata("targetValue", plugin);
            handleFirstInput(player);
        }
    } else {
        applyToOffhand(player);
    }
}

function onCommand(sender, command, label, args) {
    if (command.getName().equalsIgnoreCase("itemeditor")) {
        showHelp(sender);
        return true;
    }
    return false;
}