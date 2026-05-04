const Material = Java.type('org.bukkit.Material');
const Consumer = Java.type('java.util.function.Consumer');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const VALID_ELEMENTS = ["金","木","水","火","土","雷","风","冰","光","暗"];
const DATA_DIR_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const ITEM_ID = "KOMUTECH_L_DJ_擇靈珠";
function savePlayerData(playerName, data) {
    let path = Paths.get(DATA_DIR_PATH, '[' + playerName + '].json');
    try {
        let parent = path.getParent();
        if (!Files.exists(parent)) Files.createDirectories(parent);
        Files.writeString(path, JSON.stringify(data, null, 2), StandardCharsets.UTF_8);
        return true;
    } catch (e) { return false; }
}
function onUse(e) {
    const p = e.getPlayer();
    const item = e.getItem();
    if (!getSfItemByItem(item) || getSfItemByItem(item).getId() !== ITEM_ID) { p.sendMessage("§c请手持擇靈珠使用！"); return; }
    if (p.isSneaking()) {
        p.sendMessage("§a请输入定向灵根（用顿号或空格分隔，也可直接连写如“金木水火土”），输入 cancel 取消：");
        getChatInput(p, new (Java.extend(Consumer, {
            accept: function(inp) {
                if (!p.isOnline()) return;
                if (inp.toLowerCase() === "cancel") { p.sendMessage("§c已取消"); return; }
                let els = /[、，\s]/.test(inp) ? inp.split(/[、，\s]+/).filter(e => e) : inp.split('').filter(e => e);
                const v = [];
                for (let e of els) VALID_ELEMENTS.includes(e) ? v.push(e) : p.sendMessage("§c忽略无效元素: " + e);
                if (!v.length) { p.sendMessage("§c无有效元素"); return; }
                const hand = p.getInventory().getItemInMainHand();
                const meta = hand.getItemMeta();
                let lore = meta.hasLore() ? meta.getLore() : new java.util.ArrayList();
                const newLore = new java.util.ArrayList();
                for (let line of lore) if (String(line).indexOf("定向灵根:") === -1) newLore.add(line);
                newLore.add("§7定向灵根: §e" + v.join("、"));
                meta.setLore(newLore);
                hand.setItemMeta(meta);
                p.sendMessage("§a定向灵根已记录到物品上！");
            }
        })));
        return;
    }
    const meta = item.getItemMeta();
    if (!meta.hasLore()) { p.sendMessage("§c该物品尚未设置定向灵根，请蹲下右键设置！"); return; }
    let targetElements = null;
    for (let line of meta.getLore()) { if (String(line).includes("定向灵根:")) { targetElements = String(line).split(":")[1].trim().replace(/§./g, '').split("、"); break; } }
    if (!targetElements || !targetElements.length) { p.sendMessage("§c未检测到有效的定向灵根，请蹲下右键设置！"); return; }
    let path = Paths.get(DATA_DIR_PATH, '[' + p.getName() + '].json');
    if (Files.exists(path)) { p.sendMessage("§c你已经鉴灵了，无法使用擇靈珠"); return; }
    const hand = p.getInventory().getItemInMainHand();
    hand.setAmount(hand.getAmount() - 1);
    if (hand.getAmount() === 0) p.getInventory().setItemInMainHand(null);
    const totalQuality = (0.80 + Math.random() * 0.19).toFixed(2);
    let data = {"定向": true, "灵根": targetElements.join("、"), "总品质": parseFloat(totalQuality)};
    if (savePlayerData(p.getName(), data)) p.sendMessage("§a定向成功！灵根：" + targetElements.join("、") + "，总品质：" + totalQuality);
    else p.sendMessage("§c定向失败，请联系管理员");
}