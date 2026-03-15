const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const EntityType = Java.type('org.bukkit.entity.EntityType');
const Bukkit = Java.type('org.bukkit.Bukkit');
const ItemDisplay = Java.type('org.bukkit.entity.ItemDisplay');
const Brightness = Java.type('org.bukkit.entity.Display.Brightness');
const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');

// 可更改配置
const ITEM_SLOT = 13, STATUS_SLOT = 4, MANUAL_SLOT = 8, OPEN_SLOT = 22, CLOSE_SLOT = 26;
const MOVE_UP_SLOT = 0, MOVE_DOWN_SLOT = 18, YAW_LEFT_SLOT = 1, YAW_RIGHT_SLOT = 19;
const PITCH_DOWN_SLOT = 2, PITCH_UP_SLOT = 20, ROLL_LEFT_SLOT = 3, ROLL_RIGHT_SLOT = 21;
const RESET_POS_SLOT = 9, RESET_YAW_SLOT = 10, RESET_PITCH_SLOT = 11, RESET_ROLL_SLOT = 12;
const GLOW_SLOT = 6, NAME_SLOT = 24;

const MACHINE_ID = "KOMUTECH_JZ_JCJQ_物品展台";
const MOVE_STEP = 0.1, ANGLE_STEP = 5;

const MACHINE_KEY = new NamespacedKey("komutech", "wpzt");

const projections = new java.util.HashMap();
const projYaw = new java.util.HashMap(), projPitch = new java.util.HashMap(), projRoll = new java.util.HashMap();

function getLocationKey(block) { return block.getWorld().getName() + "," + block.getX() + "," + block.getY() + "," + block.getZ(); }
function getTargetBlock(p) { const r = p.getWorld().rayTraceBlocks(p.getEyeLocation(), p.getEyeLocation().getDirection(), 5); return r ? r.getHitBlock() : null; }
function isValidMachine(b) { if (!b) return false; const sf = StorageCacheUtils.getSfItem(b.getLocation()); return sf && sf.getId() === MACHINE_ID; }

function applyRotation(proj, y, p, r) {
    try {
        const t = proj.getTransformation();
        t.getLeftRotation().identity().rotateY(java.lang.Math.toRadians(y)).rotateX(java.lang.Math.toRadians(p)).rotateZ(java.lang.Math.toRadians(r));
        proj.setTransformation(t);
    } catch (e) {}
}

function createProjection(b, item) {
    const e = b.getWorld().spawnEntity(b.getLocation().clone().add(0.5, 2.0, 0.5), EntityType.ITEM_DISPLAY);
    e.setItemStack(item.clone()); e.setInvulnerable(true); e.setGravity(false); e.setBrightness(new Brightness(15,15));
    const meta = item.getItemMeta();
    e.setCustomName(meta?.hasDisplayName() ? meta.getDisplayName() : item.getType().name().toLowerCase().replace('_',' '));
    e.setCustomNameVisible(false);
    e.getPersistentDataContainer().set(MACHINE_KEY, PersistentDataType.STRING, getLocationKey(b));
    applyRotation(e,0,0,0);
    return e;
}

function removeProjection(b) { const k = getLocationKey(b), e = projections.get(k); if (e && !e.isDead()) e.remove(); projections.remove(k); projYaw.remove(k); projPitch.remove(k); projRoll.remove(k); }

function getItemDisplayName(i) { if (!i || i.getType() === Material.AIR) return "§c空"; const m = i.getItemMeta(); return m?.hasDisplayName() ? m.getDisplayName() + " §7(" + i.getType().name() + ")" : "§e" + i.getType().name().toLowerCase().replace('_',' '); }
function hasProjection(b) { const k = getLocationKey(b); return projections.containsKey(k) && !projections.get(k).isDead(); }

function getMachineKeyFromStatus(inv) {
    const s = inv.getItem(STATUS_SLOT); if (!s || s.getType() !== Material.PAPER || !s.hasItemMeta()) return null;
    const l = s.getItemMeta().getLore(); if (!l?.length) return null;
    try { return l[0].replace(/§[0-9a-fklmnor]/g, '').substring(5).trim(); } catch (e) { return null; }
}
function getMachineFromStatus(inv) {
    const key = getMachineKeyFromStatus(inv); if (!key) return null;
    const p = key.split(","); if (p.length !== 4) return null;
    const w = Bukkit.getWorld(p[0]); if (!w) return null;
    return w.getBlockAt(parseInt(p[1]), parseInt(p[2]), parseInt(p[3]));
}
function saveStatusToSlot(inv, b) {
    const key = getLocationKey(b), has = hasProjection(b);
    const it = new ItemStack(Material.PAPER); const m = it.getItemMeta(); m.setDisplayName("§7机器状态");
    let lore = ["§b机器位置: " + key];
    if (has) {
        const p = projections.get(key);
        lore.push("§bUUID: " + p.getUniqueId().toString(), "§b偏航: " + projYaw.getOrDefault(key,0), "§b俯仰: " + projPitch.getOrDefault(key,0), "§b翻滚: " + projRoll.getOrDefault(key,0), "§b发光: " + p.isGlowing(), "§b名称显示: " + p.isCustomNameVisible());
    } else lore.push("§7无投影");
    m.setLore(lore); it.setItemMeta(m); inv.setItem(STATUS_SLOT, it);
}
function restoreFromStatus(inv, b) {
    const s = inv.getItem(STATUS_SLOT); if (!s || s.getType() !== Material.PAPER || !s.hasItemMeta()) return false;
    const l = s.getItemMeta().getLore(); if (!l || l.length < 2 || l[1].replace(/§[0-9a-fklmnor]/g,'') === "无投影") return false;
    try {
        const key = l[0].replace(/§[0-9a-fklmnor]/g,'').substring(5).trim();
        if (getLocationKey(b) !== key) return false;
        let uuidStr; for (let line of l) { const s = line.replace(/§[0-9a-fklmnor]/g,''); if (s.startsWith("UUID:")) { uuidStr = s.substring(5).trim(); break; } }
        if (!uuidStr) return false;
        const e = Bukkit.getEntity(java.util.UUID.fromString(uuidStr));
        if (!e || e.getType() !== EntityType.ITEM_DISPLAY || e.isDead()) return false;
        let y=0,p=0,r=0,g=false,n=false;
        for (let line of l) { const s = line.replace(/§[0-9a-fklmnor]/g,'');
            if (s.startsWith("偏航:")) try { y = parseFloat(s.substring(3).trim()); } catch(e) {}
            else if (s.startsWith("俯仰:")) try { p = parseFloat(s.substring(3).trim()); } catch(e) {}
            else if (s.startsWith("翻滚:")) try { r = parseFloat(s.substring(3).trim()); } catch(e) {}
            else if (s.startsWith("发光:")) g = s.substring(3).trim() === "true";
            else if (s.startsWith("名称显示:")) n = s.substring(5).trim() === "true";
        }
        projections.put(key, e); projYaw.put(key, y); projPitch.put(key, p); projRoll.put(key, r);
        if (g) e.setGlowing(true); e.setCustomNameVisible(n);
        return true;
    } catch (e) { return false; }
}
function findProjectionByMachine(b) {
    const t = getLocationKey(b);
    for (let e of b.getWorld().getEntities()) {
        if (e.getType() === EntityType.ITEM_DISPLAY && !e.isDead()) {
            const pdc = e.getPersistentDataContainer();
            if (pdc.has(MACHINE_KEY, PersistentDataType.STRING) && pdc.get(MACHINE_KEY, PersistentDataType.STRING) === t) return e;
        }
    }
    return null;
}

function refreshButtons(inv, b) {
    const d = inv.getItem(ITEM_SLOT), has = hasProjection(b), key = has ? getLocationKey(b) : null;
    const updateLore = (slot, lore) => { const i = inv.getItem(slot); if (i) { const m = i.getItemMeta(); m.setLore(lore); i.setItemMeta(m); } };
    updateLore(OPEN_SLOT, ["§7点击将13号槽物品投影", "§7当前物品: " + getItemDisplayName(d), has ? "§a投影已开启" : "§7投影未开启"]);
    updateLore(CLOSE_SLOT, ["§7点击关闭投影", has ? "§a点击关闭" : "§7无投影"]);
    updateLore(MOVE_UP_SLOT, ["§7向上移动" + (has ? "" : " §c(需先开启)")]);
    updateLore(MOVE_DOWN_SLOT, ["§7向下移动" + (has ? "" : " §c(需先开启)")]);
    updateLore(YAW_LEFT_SLOT, ["§7向左旋转" + (has ? " §a当前:" + projYaw.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(YAW_RIGHT_SLOT, ["§7向右旋转" + (has ? " §a当前:" + projYaw.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(PITCH_DOWN_SLOT, ["§7向下俯仰" + (has ? " §a当前:" + projPitch.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(PITCH_UP_SLOT, ["§7向上俯仰" + (has ? " §a当前:" + projPitch.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(ROLL_LEFT_SLOT, ["§7向左翻滚" + (has ? " §a当前:" + projRoll.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(ROLL_RIGHT_SLOT, ["§7向右翻滚" + (has ? " §a当前:" + projRoll.getOrDefault(key,0) : " §c(需先开启)")]);
    updateLore(RESET_POS_SLOT, ["§7重置位置" + (has ? "" : " §c(需先开启)")]);
    updateLore(RESET_YAW_SLOT, ["§7重置偏航" + (has ? "" : " §c(需先开启)")]);
    updateLore(RESET_PITCH_SLOT, ["§7重置俯仰" + (has ? "" : " §c(需先开启)")]);
    updateLore(RESET_ROLL_SLOT, ["§7重置翻滚" + (has ? "" : " §c(需先开启)")]);
    const glowState = has ? (projections.get(key).isGlowing() ? "§a开启" : "§7关闭") : "§7关闭";
    updateLore(GLOW_SLOT, ["§7切换发光", "§7当前: " + glowState + (has ? "" : " §c(需先开启)")]);
    const nameState = has ? (projections.get(key).isCustomNameVisible() ? "§a显示" : "§7隐藏") : "§7隐藏";
    updateLore(NAME_SLOT, ["§7切换名称", "§7当前: " + nameState + (has ? "" : " §c(需先开启)")]);
    updateLore(MANUAL_SLOT, ["§7手动检测并绑定当前瞄准的机器"]);
    if (b) saveStatusToSlot(inv, b);
}

function onOpen(p) {
    const inv = p.getOpenInventory().getTopInventory();
    let b = getMachineFromStatus(inv);
    if (!b || !isValidMachine(b)) {
        b = getTargetBlock(p);
        if (!b) { p.sendMessage("§c错误：请瞄准要操作的机器！"); return; }
        if (!isValidMachine(b)) { p.sendMessage("§c错误：瞄准的方块不是可操作的机器！"); return; }
    } else if (!restoreFromStatus(inv, b)) {
        const proj = findProjectionByMachine(b);
        if (proj) { const key = getLocationKey(b); projections.put(key, proj); projYaw.put(key,0); projPitch.put(key,0); projRoll.put(key,0); }
    }
    if (b) refreshButtons(inv, b);
}
function onClose(p) {
    const inv = p.getOpenInventory().getTopInventory();
    const mb = getMachineFromStatus(inv);
    if (!mb) return;
    const key = getLocationKey(mb);
    const proj = projections.get(key);
    if (!proj || proj.isDead()) return;
    const slotItem = inv.getItem(ITEM_SLOT);
    const projItem = proj.getItemStack();
    // 如果13号槽为空，或者物品与投影物品不相似，则移除投影
    if (!slotItem || slotItem.getType() === Material.AIR || !slotItem.isSimilar(projItem)) {
        proj.remove();
        projections.remove(key);
        projYaw.remove(key);
        projPitch.remove(key);
        projRoll.remove(key);
        inv.setItem(STATUS_SLOT, null);
    }
}

function onClick(p, slot, slotItem, act) {
    const inv = p.getOpenInventory().getTopInventory();
    if (slot === STATUS_SLOT) { p.sendMessage("§c不能操作状态槽"); return; }
    let mb = getMachineFromStatus(inv);
    if (!mb) { p.sendMessage("§c错误：未检测到机器，请瞄准后重新打开菜单"); return; }
    if (!isValidMachine(mb)) { p.sendMessage("§c错误：机器失效，请重新打开菜单"); return; }
    let key = getLocationKey(mb);
    let proj = projections.get(key);

    if (slot === MANUAL_SLOT) {
        const t = getTargetBlock(p);
        if (!t) { p.sendMessage("§c请先瞄准机器"); return; }
        if (!isValidMachine(t)) { p.sendMessage("§c瞄准的方块不是机器"); return; }
        const nk = getLocationKey(t);
        if (nk !== key) { mb = t; key = nk; proj = projections.get(key); p.sendMessage("§a已切换到新机器"); }
        const fp = findProjectionByMachine(mb);
        if (fp) { projections.put(key, fp); projYaw.put(key,0); projPitch.put(key,0); projRoll.put(key,0); p.sendMessage("§a找到并绑定投影"); }
        else p.sendMessage("§e未找到投影，可点击开启");
        saveStatusToSlot(inv, mb); refreshButtons(inv, mb);
        return;
    }
    if (slot === OPEN_SLOT) {
        const item = inv.getItem(ITEM_SLOT);
        if (!item || item.getType() === Material.AIR) { p.sendMessage("§c请放入物品"); return; }
        if (proj && !proj.isDead()) proj.remove();
        try { proj = createProjection(mb, item); projections.put(key, proj); projYaw.put(key,0); projPitch.put(key,0); projRoll.put(key,0); p.sendMessage("§a投影已开启"); }
        catch (e) { p.sendMessage("§c开启失败"); }
        saveStatusToSlot(inv, mb); refreshButtons(inv, mb);
        return;
    }
    if (slot === CLOSE_SLOT) {
        if (proj && !proj.isDead()) proj.remove();
        projections.remove(key); projYaw.remove(key); projPitch.remove(key); projRoll.remove(key);
        inv.setItem(STATUS_SLOT, null);
        p.sendMessage("§a投影已关闭");
        refreshButtons(inv, mb);
        return;
    }
    if (!proj || proj.isDead()) { p.sendMessage("§c请先开启投影"); return; }

    const updateAngle = (map, delta) => (map.get(key) + delta + 360) % 360;
    if (slot === MOVE_UP_SLOT) { proj.teleport(proj.getLocation().add(0, MOVE_STEP, 0)); p.sendMessage("§a向上移动 " + MOVE_STEP + " 格"); }
    else if (slot === MOVE_DOWN_SLOT) { proj.teleport(proj.getLocation().add(0, -MOVE_STEP, 0)); p.sendMessage("§a向下移动 " + MOVE_STEP + " 格"); }
    else if (slot === YAW_LEFT_SLOT) { let y = updateAngle(projYaw, -ANGLE_STEP); projYaw.put(key, y); applyRotation(proj, y, projPitch.get(key), projRoll.get(key)); p.sendMessage("§a向左旋转 " + ANGLE_STEP + "°，当前偏航 " + y); }
    else if (slot === YAW_RIGHT_SLOT) { let y = updateAngle(projYaw, ANGLE_STEP); projYaw.put(key, y); applyRotation(proj, y, projPitch.get(key), projRoll.get(key)); p.sendMessage("§a向右旋转 " + ANGLE_STEP + "°，当前偏航 " + y); }
    else if (slot === PITCH_DOWN_SLOT) { let pch = updateAngle(projPitch, -ANGLE_STEP); projPitch.put(key, pch); applyRotation(proj, projYaw.get(key), pch, projRoll.get(key)); p.sendMessage("§a向下俯仰 " + ANGLE_STEP + "°，当前俯仰 " + pch); }
    else if (slot === PITCH_UP_SLOT) { let pch = updateAngle(projPitch, ANGLE_STEP); projPitch.put(key, pch); applyRotation(proj, projYaw.get(key), pch, projRoll.get(key)); p.sendMessage("§a向上俯仰 " + ANGLE_STEP + "°，当前俯仰 " + pch); }
    else if (slot === ROLL_LEFT_SLOT) { let r = updateAngle(projRoll, -ANGLE_STEP); projRoll.put(key, r); applyRotation(proj, projYaw.get(key), projPitch.get(key), r); p.sendMessage("§a向左翻滚 " + ANGLE_STEP + "°，当前翻滚 " + r); }
    else if (slot === ROLL_RIGHT_SLOT) { let r = updateAngle(projRoll, ANGLE_STEP); projRoll.put(key, r); applyRotation(proj, projYaw.get(key), projPitch.get(key), r); p.sendMessage("§a向右翻滚 " + ANGLE_STEP + "°，当前翻滚 " + r); }
    else if (slot === RESET_POS_SLOT) { proj.teleport(mb.getLocation().clone().add(0.5,2.0,0.5)); p.sendMessage("§a位置已重置"); }
    else if (slot === RESET_YAW_SLOT) { projYaw.put(key, 0); applyRotation(proj, 0, projPitch.get(key), projRoll.get(key)); p.sendMessage("§a偏航已重置"); }
    else if (slot === RESET_PITCH_SLOT) { projPitch.put(key, 0); applyRotation(proj, projYaw.get(key), 0, projRoll.get(key)); p.sendMessage("§a俯仰已重置"); }
    else if (slot === RESET_ROLL_SLOT) { projRoll.put(key, 0); applyRotation(proj, projYaw.get(key), projPitch.get(key), 0); p.sendMessage("§a翻滚已重置"); }
    else if (slot === GLOW_SLOT) { proj.setGlowing(!proj.isGlowing()); p.sendMessage(proj.isGlowing() ? "§a发光开启" : "§7发光关闭"); }
    else if (slot === NAME_SLOT) { proj.setCustomNameVisible(!proj.isCustomNameVisible()); p.sendMessage(proj.isCustomNameVisible() ? "§a名称显示" : "§7名称隐藏"); }
    saveStatusToSlot(inv, mb);
    refreshButtons(inv, mb);
}

function removeProjectionAt(block) { removeProjection(block); }