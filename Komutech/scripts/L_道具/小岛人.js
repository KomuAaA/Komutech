const KOMUTECH_XDR_HELMET_ID = "KOMUTECH_L_SW_XDRHH";
const KOMUTECH_XDR_OFFHAND_ID = "KOMUTECH_L_DJ_功德券";
const KOMUTECH_XDR_CHEST_ID = "KOMUTECH_L_J_布衣";
const KOMUTECH_XDR_LEGS_ID = "KOMUTECH_L_J_布裤";
const KOMUTECH_XDR_BOOTS_ID = "KOMUTECH_L_J_布鞋";
const KOMUTECH_XDR_SWORD_ID = "KOMUTECH_L_W_玄铁剑";
const KOMUTECH_XDR_BOW_ID = "KOMUTECH_L_W_玄铁弓";
const KOMUTECH_XDR_EQUIP_CONFIG = [
    { slot: "helmet", id: KOMUTECH_XDR_HELMET_ID, dropChance: 0.95 },
    { slot: "chestplate", id: KOMUTECH_XDR_CHEST_ID, dropChance: 0.0 },
    { slot: "leggings", id: KOMUTECH_XDR_LEGS_ID, dropChance: 0.0 },
    { slot: "boots", id: KOMUTECH_XDR_BOOTS_ID, dropChance: 0.0 },
    { slot: "offhand", id: KOMUTECH_XDR_OFFHAND_ID, dropChance: 0.75 }
];
const KOMUTECH_XDR_WEAPON_CONFIG = {
    skeleton: KOMUTECH_XDR_BOW_ID,
    zombie: KOMUTECH_XDR_SWORD_ID
};
const KOMUTECH_XDR_MAX_HEALTH = 100;
const KOMUTECH_XDR_RESISTANCE_LEVEL = 1;
const KOMUTECH_XDR_SPEED_LEVEL = 3;
const KOMUTECH_XDR_SPAWN_DISTANCE = 3;
const KOMUTECH_XDR_COOLDOWN_MS = 1000;
const KOMUTECH_XDR_DURATION_TICKS = 999999 * 20;
let KOMUTECH_XDR_itemCache = {};
function KOMUTECH_XDR_cacheItems() {
    const allIds = [KOMUTECH_XDR_HELMET_ID, KOMUTECH_XDR_OFFHAND_ID, KOMUTECH_XDR_CHEST_ID, KOMUTECH_XDR_LEGS_ID, KOMUTECH_XDR_BOOTS_ID, KOMUTECH_XDR_SWORD_ID, KOMUTECH_XDR_BOW_ID];
    for (let i = 0; i < allIds.length; i++) {
        const id = allIds[i];
        try {
            const sfItem = getSfItemById(id);
            if (sfItem) KOMUTECH_XDR_itemCache[id] = sfItem.getItem().clone();
        } catch(e) {}
    }
}
KOMUTECH_XDR_cacheItems();
const KOMUTECH_XDR_cdMap = new java.util.HashMap();
function KOMUTECH_XDR_onUse(e) {
    try {
        const p = e.getPlayer();
        const now = Date.now();
        const uid = p.getUniqueId().toString();
        if (KOMUTECH_XDR_cdMap.containsKey(uid) && now - KOMUTECH_XDR_cdMap.get(uid) < KOMUTECH_XDR_COOLDOWN_MS) {
            p.sendActionBar("§c请不要连续召唤");
            return false;
        }
        KOMUTECH_XDR_cdMap.put(uid, now);
        const world = p.getWorld();
        if (!world) {
            p.sendMessage("§c无法获取世界信息！");
            return false;
        }
        const eyeLoc = p.getEyeLocation();
        const dir = eyeLoc.getDirection().clone();
        const spawnLoc = eyeLoc.clone().add(dir.multiply(KOMUTECH_XDR_SPAWN_DISTANCE));
        const block = spawnLoc.getBlock();
        if (block.getType().isSolid() || block.getType() === org.bukkit.Material.WATER || block.getType() === org.bukkit.Material.LAVA) {
            p.sendMessage("§c目标位置无法生成生物！");
            return false;
        }
        const isSk = Math.random() < 0.5;
        const EntityType = Java.type('org.bukkit.entity.EntityType');
        const entity = isSk ? world.spawnEntity(spawnLoc, EntityType.SKELETON) : world.spawnEntity(spawnLoc, EntityType.ZOMBIE);
        entity.setCustomName("§c§l小岛人");
        entity.setCustomNameVisible(true);
        entity.setMaxHealth(KOMUTECH_XDR_MAX_HEALTH);
        entity.setHealth(KOMUTECH_XDR_MAX_HEALTH);
        entity.setRemoveWhenFarAway(false);
        entity.setCanPickupItems(false);
        const eq = entity.getEquipment();
        if (eq) {
            for (let i = 0; i < KOMUTECH_XDR_EQUIP_CONFIG.length; i++) {
                const cfg = KOMUTECH_XDR_EQUIP_CONFIG[i];
                const item = KOMUTECH_XDR_itemCache[cfg.id];
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
            const weaponId = isSk ? KOMUTECH_XDR_WEAPON_CONFIG.skeleton : KOMUTECH_XDR_WEAPON_CONFIG.zombie;
            const weapon = KOMUTECH_XDR_itemCache[weaponId];
            if (weapon) {
                eq.setItemInMainHand(weapon.clone());
                eq.setItemInMainHandDropChance(0.0);
            }
        }
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
        const resistance = PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft("resistance"));
        const speed = PotionEffectType.getByKey(org.bukkit.NamespacedKey.minecraft("speed"));
        if (resistance) entity.addPotionEffect(new PotionEffect(resistance, KOMUTECH_XDR_DURATION_TICKS, KOMUTECH_XDR_RESISTANCE_LEVEL, true, true));
        if (speed) entity.addPotionEffect(new PotionEffect(speed, KOMUTECH_XDR_DURATION_TICKS, KOMUTECH_XDR_SPEED_LEVEL, true, true));
        const hand = e.getHand();
        const EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
        const inv = p.getInventory();
        if (hand === EquipmentSlot.HAND) {
            const item = inv.getItemInMainHand();
            if (item && item.getAmount() > 0) {
                if (item.getAmount() > 1) item.setAmount(item.getAmount() - 1);
                else inv.setItemInMainHand(null);
            }
        } else if (hand === EquipmentSlot.OFF_HAND) {
            const item = inv.getItemInOffHand();
            if (item && item.getAmount() > 0) {
                if (item.getAmount() > 1) item.setAmount(item.getAmount() - 1);
                else inv.setItemInOffHand(null);
            }
        }
        p.updateInventory();
        p.sendMessage("§a小岛人（" + (isSk ? "骷髅" : "僵尸") + "）生成完成");
        p.playSound(p.getLocation(), "entity.player.levelup", 1.0, 1.0);
        return true;
    } catch (err) {
        print("小岛人错误: " + err);
        if (err.printStackTrace) err.printStackTrace();
        return false;
    }
}
function onUse(e) { return KOMUTECH_XDR_onUse(e); }