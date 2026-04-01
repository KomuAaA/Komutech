const HELMET_ID = "KOMUTECH_L_SW_XDRHH";
const OFFHAND_ID = "KOMUTECH_L_DJ_功德券";
const CHEST_ID = "KOMUTECH_L_J_布衣";
const LEGS_ID = "KOMUTECH_L_J_布裤";
const BOOTS_ID = "KOMUTECH_L_J_布鞋";
const SWORD_ID = "KOMUTECH_L_W_玄铁剑";
const BOW_ID = "KOMUTECH_L_W_玄铁弓";
const EQUIP_CONFIG = [
    { slot: "helmet", id: HELMET_ID, dropChance: 0.95 },
    { slot: "chestplate", id: CHEST_ID, dropChance: 0.0 },
    { slot: "leggings", id: LEGS_ID, dropChance: 0.0 },
    { slot: "boots", id: BOOTS_ID, dropChance: 0.0 },
    { slot: "offhand", id: OFFHAND_ID, dropChance: 0.75 }
];
const WEAPON_CONFIG = [
    { type: "skeleton", id: BOW_ID },
    { type: "zombie", id: SWORD_ID }
];
const ITEM_STACK_CACHE = {};
function cacheItems() {
    const allIds = EQUIP_CONFIG.map(c => c.id).concat(WEAPON_CONFIG.map(w => w.id));
    for (let i = 0; i < allIds.length; i++) {
        const id = allIds[i];
        try {
            const sfItem = getSfItemById(id);
            if (sfItem) ITEM_STACK_CACHE[id] = sfItem.getItem().clone();
        } catch (e) {}
    }
}
cacheItems();
const cdMap = new Map();
const COOLDOWN = 1000;
function onUse(e) {
    const p = e.getPlayer();
    const now = Date.now();
    const uid = p.getUniqueId().toString();
    if (cdMap.has(uid) && now - cdMap.get(uid) < COOLDOWN) {
        p.sendActionBar("§c请不要连续召唤");
        return false;
    }
    cdMap.set(uid, now);
    const world = p.getWorld();
    if (!world) {
        p.sendMessage("§c无法获取世界信息！");
        return false;
    }
    const eyeLoc = p.getEyeLocation();
    const dir = eyeLoc.getDirection();
    const spawnLoc = eyeLoc.clone().add(dir.multiply(3));
    const block = spawnLoc.getBlock();
    if (block.getType().isSolid() || block.getType() === org.bukkit.Material.WATER || block.getType() === org.bukkit.Material.LAVA) {
        p.sendMessage("§c目标位置无法生成生物！");
        return false;
    }
    const isSk = Math.random() < 0.5;
    const entity = isSk
        ? world.spawn(spawnLoc, org.bukkit.entity.Skeleton.class)
        : world.spawn(spawnLoc, org.bukkit.entity.Zombie.class);
    entity.setCustomName("§c§l小岛人");
    entity.setCustomNameVisible(true);
    entity.setMaxHealth(100);
    entity.setHealth(100);
    entity.setRemoveWhenFarAway(false);
    entity.setCanPickupItems(false);
    const eq = entity.getEquipment();
    if (eq) {
        for (let i = 0; i < EQUIP_CONFIG.length; i++) {
            const cfg = EQUIP_CONFIG[i];
            const item = ITEM_STACK_CACHE[cfg.id];
            if (item) {
                const clone = item.clone();
                switch (cfg.slot) {
                    case "helmet": eq.setHelmet(clone); break;
                    case "chestplate": eq.setChestplate(clone); break;
                    case "leggings": eq.setLeggings(clone); break;
                    case "boots": eq.setBoots(clone); break;
                    case "offhand": eq.setItemInOffHand(clone); break;
                }
                if (cfg.slot === "helmet") eq.setHelmetDropChance(cfg.dropChance);
                else if (cfg.slot === "chestplate") eq.setChestplateDropChance(cfg.dropChance);
                else if (cfg.slot === "leggings") eq.setLeggingsDropChance(cfg.dropChance);
                else if (cfg.slot === "boots") eq.setBootsDropChance(cfg.dropChance);
                else if (cfg.slot === "offhand") eq.setItemInOffHandDropChance(cfg.dropChance);
            }
        }
        const weaponId = isSk ? BOW_ID : SWORD_ID;
        const weapon = ITEM_STACK_CACHE[weaponId];
        if (weapon) {
            eq.setItemInMainHand(weapon.clone());
            eq.setItemInMainHandDropChance(0.0);
        }
    }
    const RES = org.bukkit.potion.PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft("resistance"));
    const SPD = org.bukkit.potion.PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft("speed"));
    if (RES) entity.addPotionEffect(new org.bukkit.potion.PotionEffect(RES, 999999 * 20, 1, true, true));
    if (SPD) entity.addPotionEffect(new org.bukkit.potion.PotionEffect(SPD, 999999 * 20, 3, true, true));
    const item = e.getItem();
    if (item) {
        const amt = item.getAmount();
        if (amt > 1) item.setAmount(amt - 1);
        else p.getInventory().setItemInMainHand(null);
    }
    p.sendMessage("§a小岛人（" + (isSk ? "骷髅" : "僵尸") + "）生成完成");
    return true;
}