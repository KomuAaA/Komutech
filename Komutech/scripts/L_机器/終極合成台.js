const Bukkit = Java.type('org.bukkit.Bukkit');
const Location = Java.type('org.bukkit.Location');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const StorageCacheUtils = Java.type('com.xzavier0722.mc.plugin.slimefun4.storage.util.StorageCacheUtils');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const BlockBreakEvent = Java.type('org.bukkit.event.block.BlockBreakEvent');
const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
const KOMUTECH_L_ZJ_ZJHC_CORE_ID = "KOMUTECH_L_ZJ_終極合成台核心";
const KOMUTECH_L_ZJ_ZJHC_PROCESSOR_ID = "KOMUTECH_L_ZJ_終極合成台";
const KOMUTECH_L_ZJ_ZJHC_OUTPUT_SLOTS = [6,7,8,15,16,17,24,25,26];
const KOMUTECH_L_ZJ_ZJHC_WORK_SLOT = 13;
const KOMUTECH_L_ZJ_ZJHC_ITEM_WUXING = "KOMUTECH_L_FZ_五行祖炁";
const KOMUTECH_L_ZJ_ZJHC_ITEM_XXZZ = "KOMUTECH_L_XX_ZZ";
const KOMUTECH_L_ZJ_ZJHC_ITEM_TIANXIANG = "KOMUTECH_L_FZ_天象祖炁";
const KOMUTECH_L_ZJ_ZJHC_ITEM_ZAOHUA = "KOMUTECH_L_FZ_造化祖炁";
const KOMUTECH_L_ZJ_ZJHC_ITEM_WU = "KOMUTECH_L_ZJ_無";
const KOMUTECH_L_ZJ_ZJHC_ITEM_WANXIANG = "KOMUTECH_L_ZJ_萬象匱";
const KOMUTECH_L_ZJ_ZJHC_ITEM_WANYANYI = "KOMUTECH_L_ZJ_萬衍儀";
const KOMUTECH_L_ZJ_ZJHC_ENDER_CHEST = Material.ENDER_CHEST;
const KOMUTECH_L_ZJ_ZJHC_STRUCTURE = [
{x:-5,y:0,z:-1,m:"black_concrete"},{x:-5,y:0,z:-2,m:"black_concrete"},
{x:-4,y:0,z:-2,m:"black_concrete"},{x:-4,y:0,z:-3,m:"black_concrete"},{x:-4,y:0,z:-4,m:"black_concrete"},
{x:-3,y:0,z:-3,m:"black_concrete"},{x:-3,y:0,z:-4,m:"black_concrete"},
{x:-2,y:0,z:-3,m:"black_concrete"},{x:-2,y:0,z:-4,m:"black_concrete"},{x:-2,y:0,z:-5,m:"black_concrete"},
{x:-1,y:0,z:-2,m:"black_concrete"},{x:-1,y:0,z:-3,m:"black_concrete"},{x:-1,y:0,z:-4,m:"black_concrete"},{x:-1,y:0,z:-5,m:"black_concrete"},
{x:0,y:0,z:-1,m:"black_concrete"},{x:0,y:0,z:-2,m:"black_concrete"},{x:0,y:0,z:-3,m:"black_concrete"},{x:0,y:0,z:-4,m:"black_concrete"},{x:0,y:0,z:-5,m:"black_concrete"},
{x:1,y:0,z:1,m:"black_concrete"},{x:1,y:0,z:0,m:"black_concrete"},{x:1,y:0,z:-1,m:"black_concrete"},{x:1,y:0,z:-2,m:"black_concrete"},{x:1,y:0,z:-3,m:"black_concrete"},{x:1,y:0,z:-4,m:"black_concrete"},{x:1,y:0,z:-5,m:"black_concrete"},
{x:2,y:0,z:2,m:"black_concrete"},{x:2,y:0,z:1,m:"black_concrete"},{x:2,y:0,z:0,m:"black_concrete"},{x:2,y:0,z:-1,m:"black_concrete"},{x:2,y:0,z:-3,m:"black_concrete"},{x:2,y:0,z:-4,m:"black_concrete"},{x:2,y:0,z:-5,m:"black_concrete"},
{x:3,y:0,z:2,m:"black_concrete"},{x:3,y:0,z:1,m:"black_concrete"},{x:3,y:0,z:0,m:"black_concrete"},{x:3,y:0,z:-1,m:"black_concrete"},{x:3,y:0,z:-2,m:"black_concrete"},{x:3,y:0,z:-3,m:"black_concrete"},{x:3,y:0,z:-4,m:"black_concrete"},
{x:4,y:0,z:1,m:"black_concrete"},{x:4,y:0,z:0,m:"black_concrete"},{x:4,y:0,z:-1,m:"black_concrete"},{x:4,y:0,z:-2,m:"black_concrete"},{x:4,y:0,z:-3,m:"black_concrete"},{x:4,y:0,z:-4,m:"black_concrete"},
{x:5,y:0,z:0,m:"black_concrete"},{x:5,y:0,z:-1,m:"black_concrete"},{x:5,y:0,z:-2,m:"black_concrete"},
{x:-5,y:0,z:0,m:"white_concrete"},{x:-5,y:0,z:1,m:"white_concrete"},{x:-5,y:0,z:2,m:"white_concrete"},
{x:-4,y:0,z:-1,m:"white_concrete"},{x:-4,y:0,z:0,m:"white_concrete"},{x:-4,y:0,z:1,m:"white_concrete"},{x:-4,y:0,z:2,m:"white_concrete"},{x:-4,y:0,z:3,m:"white_concrete"},{x:-4,y:0,z:4,m:"white_concrete"},
{x:-3,y:0,z:-2,m:"white_concrete"},{x:-3,y:0,z:-1,m:"white_concrete"},{x:-3,y:0,z:0,m:"white_concrete"},{x:-3,y:0,z:1,m:"white_concrete"},{x:-3,y:0,z:2,m:"white_concrete"},{x:-3,y:0,z:3,m:"white_concrete"},{x:-3,y:0,z:4,m:"white_concrete"},
{x:-2,y:0,z:-2,m:"white_concrete"},{x:-2,y:0,z:-1,m:"white_concrete"},{x:-2,y:0,z:0,m:"white_concrete"},{x:-2,y:0,z:1,m:"white_concrete"},{x:-2,y:0,z:3,m:"white_concrete"},{x:-2,y:0,z:4,m:"white_concrete"},{x:-2,y:0,z:5,m:"white_concrete"},
{x:-1,y:0,z:-1,m:"white_concrete"},{x:-1,y:0,z:0,m:"white_concrete"},{x:-1,y:0,z:1,m:"white_concrete"},{x:-1,y:0,z:2,m:"white_concrete"},{x:-1,y:0,z:3,m:"white_concrete"},{x:-1,y:0,z:4,m:"white_concrete"},{x:-1,y:0,z:5,m:"white_concrete"},
{x:0,y:0,z:1,m:"white_concrete"},{x:0,y:0,z:2,m:"white_concrete"},{x:0,y:0,z:3,m:"white_concrete"},{x:0,y:0,z:4,m:"white_concrete"},{x:0,y:0,z:5,m:"white_concrete"},
{x:1,y:0,z:2,m:"white_concrete"},{x:1,y:0,z:3,m:"white_concrete"},{x:1,y:0,z:4,m:"white_concrete"},{x:1,y:0,z:5,m:"white_concrete"},
{x:2,y:0,z:3,m:"white_concrete"},{x:2,y:0,z:4,m:"white_concrete"},{x:2,y:0,z:5,m:"white_concrete"},
{x:3,y:0,z:3,m:"white_concrete"},{x:3,y:0,z:4,m:"white_concrete"},
{x:4,y:0,z:2,m:"white_concrete"},{x:4,y:0,z:3,m:"white_concrete"},{x:4,y:0,z:4,m:"white_concrete"},
{x:5,y:0,z:1,m:"white_concrete"},{x:5,y:0,z:2,m:"white_concrete"},
{x:-2,y:0,z:2,m:"black_concrete"},{x:2,y:0,z:-2,m:"white_concrete"},
{x:-5,y:5,z:-5,m:"beacon"},{x:5,y:5,z:-5,m:"beacon"},{x:-5,y:5,z:5,m:"beacon"},{x:5,y:5,z:5,m:"beacon"},
{x:-5,y:5,z:-6,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-5,y:5,z:-4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:-6,y:5,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-4,y:5,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-5,y:6,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:5,y:5,z:-6,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:5,y:5,z:-4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:6,y:5,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:4,y:5,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:5,y:6,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:-5,y:5,z:6,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-5,y:5,z:4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:-6,y:5,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-4,y:5,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-5,y:6,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:5,y:5,z:6,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:5,y:5,z:4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:6,y:5,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:4,y:5,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:5,y:6,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:-5,y:1,z:-2,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-4,y:1,z:-4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-2,y:1,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:5,y:1,z:-2,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:4,y:1,z:-4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:2,y:1,z:-5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:-5,y:1,z:2,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-4,y:1,z:4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:-2,y:1,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},
{x:5,y:1,z:2,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:4,y:1,z:4,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"},{x:2,y:1,z:5,m:"amethyst_cluster",sfid:"KOMUTECH_L_DJ_JPLJ"}
];
const KOMUTECH_L_ZJ_ZJHC_TRAIL_COLORS = [
    ["#fc6076","#fd7a5f","#ff9a44","#fd7a5f","#fc6076"],
    ["#fbc2eb","#d1c2ed","#a6c1ee","#d1c2ed","#fbc2eb"],
    ["#43e97b","#3ef1a9","#38f9d7","#3ef1a9","#43e97b"]
];
const KOMUTECH_L_ZJ_ZJHC_TRAIL_COLORS_RGB = KOMUTECH_L_ZJ_ZJHC_TRAIL_COLORS.map(arr => arr.map(hex => {
    let r = parseInt(hex.substring(1,3),16);
    let g = parseInt(hex.substring(3,5),16);
    let b = parseInt(hex.substring(5,7),16);
    return Color.fromRGB(r,g,b);
}));
function KOMUTECH_L_ZJ_ZJHC_getTrailColor(trailId, idx) {
    let colors = KOMUTECH_L_ZJ_ZJHC_TRAIL_COLORS_RGB[trailId % KOMUTECH_L_ZJ_ZJHC_TRAIL_COLORS_RGB.length];
    return colors[idx % colors.length];
}
function KOMUTECH_L_ZJ_ZJHC_rot(x, z, dir) {
    switch(dir) {
        case 0: return {x, z};
        case 1: return {x:-z, z:x};
        case 2: return {x:-x, z:-z};
        case 3: return {x:z, z:-x};
        default: return {x, z};
    }
}
function KOMUTECH_L_ZJ_ZJHC_getTrailPos(center, trailId, time) {
    let baseAngle = time * 0.5 + trailId * 2.0;
    let radius = 6.0 + Math.sin(time * 0.3 + trailId) * 1.0;
    let height = Math.sin(time * 0.8 + trailId) * 2.0;
    let x = center.getX() + radius * Math.cos(baseAngle);
    let z = center.getZ() + radius * Math.sin(baseAngle);
    let y = center.getY() + 2.0 + height;
    return new Location(center.getWorld(), x, y, z);
}
function KOMUTECH_L_ZJ_ZJHC_getTargetProcessor(p) {
    let b = p.getTargetBlockExact(5);
    if (!b) return null;
    let sf = StorageCacheUtils.getSfItem(b.getLocation());
    return sf && sf.getId() === KOMUTECH_L_ZJ_ZJHC_PROCESSOR_ID ? b.getLocation() : null;
}
function KOMUTECH_L_ZJ_ZJHC_isSlimefunItem(item, id) {
    if (!item) return false;
    let sf = SlimefunItem.getByItem(item);
    return sf && sf.getId() === id;
}
function KOMUTECH_L_ZJ_ZJHC_getItemStack(id) {
    let sf = SlimefunItem.getById(id);
    return sf ? sf.getItem() : null;
}
function KOMUTECH_L_ZJ_ZJHC_slotsEmpty(menu, slots) {
    for (let s of slots) if (menu.getItemInSlot(s) != null) return false;
    return true;
}
function KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, slots, isSlimefun, expected) {
    for (let s of slots) {
        let item = menu.getItemInSlot(s);
        if (!item) return false;
        if (isSlimefun ? !KOMUTECH_L_ZJ_ZJHC_isSlimefunItem(item, expected) : item.getType() !== expected) return false;
    }
    return true;
}
function KOMUTECH_L_ZJ_ZJHC_preCheck(p, procLoc, menu) {
    let coreLoc = procLoc.clone().add(0,-1,0);
    let coreSf = StorageCacheUtils.getSfItem(coreLoc);
    if (!coreSf || coreSf.getId() !== KOMUTECH_L_ZJ_ZJHC_CORE_ID) { p.sendMessage("§c核心机器无效！"); return false; }
    if (parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_zt")||"0") !== 1) { p.sendMessage("§c核心未激活！"); return false; }
    for (let s of KOMUTECH_L_ZJ_ZJHC_OUTPUT_SLOTS) if (menu.getItemInSlot(s) == null) break; else return p.sendMessage("§c输出槽已满！"), false;
    let emptySlots = [0,2,9,11,19];
    let otherSlots = [0,1,2,9,11,18,19,20];
    if (KOMUTECH_L_ZJ_ZJHC_slotsEmpty(menu, emptySlots) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [1], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WUXING) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_XXZZ) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [18], true, KOMUTECH_L_ZJ_ZJHC_ITEM_TIANXIANG) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [20], true, KOMUTECH_L_ZJ_ZJHC_ITEM_ZAOHUA)) return true;
    if (KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WU) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, otherSlots, false, KOMUTECH_L_ZJ_ZJHC_ENDER_CHEST)) return true;
    if (KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WU) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, otherSlots, true, KOMUTECH_L_ZJ_ZJHC_ITEM_XXZZ)) return true;
    p.sendMessage("§c没有匹配的配方！"); return false;
}
function KOMUTECH_L_ZJ_ZJHC_checkStructure(coreLoc) {
    let world = coreLoc.getWorld();
    let dir = parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_fx")||"0");
    let errors = [];
    for (let b of KOMUTECH_L_ZJ_ZJHC_STRUCTURE) {
        let r = KOMUTECH_L_ZJ_ZJHC_rot(b.x, b.z, dir);
        let ax = coreLoc.getX() + r.x;
        let ay = coreLoc.getY() + b.y;
        let az = coreLoc.getZ() + r.z;
        let block = world.getBlockAt(ax, ay, az);
        if (block.getType().name().toLowerCase() !== b.m) {
            errors.push(`位置 (${ax-coreLoc.getX()},${ay-coreLoc.getY()},${az-coreLoc.getZ()}) 需要 ${b.m}`);
            continue;
        }
        if (b.sfid) {
            let sf = StorageCacheUtils.getSfItem(block.getLocation());
            if (!sf || sf.getId() !== b.sfid) {
                errors.push(`位置 (${ax-coreLoc.getX()},${ay-coreLoc.getY()},${az-coreLoc.getZ()}) 需要粘液物品 ${b.sfid}`);
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
function KOMUTECH_L_ZJ_ZJHC_finalCraft(p, procLoc, menu) {
    let coreLoc = procLoc.clone().add(0,-1,0);
    let check = KOMUTECH_L_ZJ_ZJHC_checkStructure(coreLoc);
    if (!check.valid) {
        p.sendMessage("§c合成失败：合成期间结构被破坏！");
        return;
    }
    let coreSf = StorageCacheUtils.getSfItem(coreLoc);
    if (!coreSf || coreSf.getId() !== KOMUTECH_L_ZJ_ZJHC_CORE_ID) { p.sendMessage("§c核心机器已变更，合成失败！"); return; }
    if (parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_zt")||"0") !== 1) { p.sendMessage("§c核心已关闭，合成失败！"); return; }
    let emptySlots = [0,2,9,11,19];
    let otherSlots = [0,1,2,9,11,18,19,20];
    let outputItem = null, consumeMap = null;
    if (KOMUTECH_L_ZJ_ZJHC_slotsEmpty(menu, emptySlots) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [1], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WUXING) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_XXZZ) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [18], true, KOMUTECH_L_ZJ_ZJHC_ITEM_TIANXIANG) &&
        KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [20], true, KOMUTECH_L_ZJ_ZJHC_ITEM_ZAOHUA)) {
        outputItem = KOMUTECH_L_ZJ_ZJHC_getItemStack(KOMUTECH_L_ZJ_ZJHC_ITEM_WU);
        consumeMap = [1,10,18,20];
    } else if (KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WU) &&
               KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, otherSlots, false, KOMUTECH_L_ZJ_ZJHC_ENDER_CHEST)) {
        outputItem = KOMUTECH_L_ZJ_ZJHC_getItemStack(KOMUTECH_L_ZJ_ZJHC_ITEM_WANXIANG);
        consumeMap = otherSlots;
    } else if (KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, [10], true, KOMUTECH_L_ZJ_ZJHC_ITEM_WU) &&
               KOMUTECH_L_ZJ_ZJHC_slotsMatch(menu, otherSlots, true, KOMUTECH_L_ZJ_ZJHC_ITEM_XXZZ)) {
        outputItem = KOMUTECH_L_ZJ_ZJHC_getItemStack(KOMUTECH_L_ZJ_ZJHC_ITEM_WANYANYI);
        consumeMap = otherSlots;
    } else {
        p.sendMessage("§c合成失败：配方不匹配！"); return;
    }
    for (let s of consumeMap) {
        let item = menu.getItemInSlot(s);
        if (item.getAmount() > 1) { item.setAmount(item.getAmount() - 1); menu.replaceExistingItem(s, item); }
        else menu.replaceExistingItem(s, null);
    }
    for (let s of KOMUTECH_L_ZJ_ZJHC_OUTPUT_SLOTS) {
        if (menu.getItemInSlot(s) == null) {
            menu.replaceExistingItem(s, outputItem.clone());
            break;
        }
    }
    let world = coreLoc.getWorld();
    if (!world) return;
    let dir = parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_fx")||"0");
    let lingLocations = [];
    for (let b of KOMUTECH_L_ZJ_ZJHC_STRUCTURE) {
        if (b.sfid === "KOMUTECH_L_DJ_JPLJ") {
            let r = KOMUTECH_L_ZJ_ZJHC_rot(b.x, b.z, dir);
            lingLocations.push(coreLoc.clone().add(r.x, b.y, r.z));
        }
    }
    let totalLing = lingLocations.length;
    if (totalLing === 0) return;
    let consumeCount = Math.min(Math.floor(Math.random() * 17) + 8, totalLing);
    let selected = new java.util.HashSet();
    while (selected.size() < consumeCount) selected.add(Math.floor(Math.random() * totalLing));
    let idxArr = Array.from(selected);
    for (let i = 0; i < idxArr.length; i++) {
        let blockLoc = lingLocations[idxArr[i]];
        let block = world.getBlockAt(blockLoc);
        if (block.getType() === Material.AMETHYST_CLUSTER) {
            let event = new BlockBreakEvent(block, p);
            event.setDropItems(false);
            Bukkit.getPluginManager().callEvent(event);
            block.setType(Material.AIR);
        }
    }
    StorageCacheUtils.setData(coreLoc, "KOMUTECH_L_ZJ_ZJHC_zt", "0");
    p.sendMessage("§a合成成功！消耗了 " + selected.size() + " 个灵晶，核心已关闭。");
}
let KOMUTECH_L_ZJ_ZJHC_synthesizing = new java.util.HashSet();
function KOMUTECH_L_ZJ_ZJHC_startEffect(p, coreLoc, procLoc) {
    let key = procLoc.getWorld().getName() + "," + procLoc.getX() + "," + procLoc.getY() + "," + procLoc.getZ();
    if (KOMUTECH_L_ZJ_ZJHC_synthesizing.contains(key)) {
        p.sendMessage("§c机器正在合成中，请稍后再试！");
        return;
    }
    KOMUTECH_L_ZJ_ZJHC_synthesizing.add(key);
    let world = coreLoc.getWorld();
    let originalTime = world.getTime();
    let originalStorm = world.hasStorm();
    let originalThunder = world.isThundering();
    world.setTime(18000);
    world.setStorm(true);
    world.setThundering(true);
    let procCenter = procLoc.clone().add(0.5, 0.5, 0.5);
    let dir = parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_fx")||"0");
    let lingLocations = [];
    let beaconLocations = [];
    for (let b of KOMUTECH_L_ZJ_ZJHC_STRUCTURE) {
        let r = KOMUTECH_L_ZJ_ZJHC_rot(b.x, b.z, dir);
        let absX = coreLoc.getX() + r.x;
        let absY = coreLoc.getY() + b.y;
        let absZ = coreLoc.getZ() + r.z;
        if (b.m === "beacon") {
            beaconLocations.push(new Location(world, absX, absY, absZ));
        }
        if (b.sfid === "KOMUTECH_L_DJ_JPLJ") {
            lingLocations.push(new Location(world, absX, absY, absZ));
        }
    }
    for (let t = 0; t < 340; t += 5) {
        runLater(() => {
            lingLocations.forEach(lingLoc => {
                let dirVec = procCenter.clone().subtract(lingLoc).toVector().normalize();
                let randCount = Math.floor(Math.random() * 3) + 1;
                for (let k = 0; k < randCount; k++) {
                    world.spawnParticle(Particle.END_ROD, lingLoc, 0, dirVec.getX(), dirVec.getY(), dirVec.getZ(), 0.6);
                }
            });
        }, t);
    }
    for (let t = 0; t < 340; t++) {
        runLater(() => {
            let time = t / 20.0;
            for (let trail = 0; trail < 3; trail++) {
                for (let pt = 0; pt < 16; pt++) {
                    let offset = pt * 0.05;
                    let pos = KOMUTECH_L_ZJ_ZJHC_getTrailPos(procCenter, trail, time + offset);
                    let color = KOMUTECH_L_ZJ_ZJHC_getTrailColor(trail, pt);
                    world.spawnParticle(Particle.DUST, pos, 1, 0, 0, 0, 0, new DustOptions(color, 2.4));
                }
            }
        }, t);
    }
    for (let j = 0; j < 9; j++) {
        let delay = Math.floor(Math.random() * 340);
        runLater(() => {
            if (beaconLocations.length === 0) return;
            let beaconLoc = beaconLocations[Math.floor(Math.random() * beaconLocations.length)];
            world.strikeLightningEffect(beaconLoc);
            world.playSound(beaconLoc, "entity.lightning_bolt.thunder", 1, 1);
        }, delay);
    }
    for (let step = 0; step < 10; step++) {
        runLater(() => {
            let progress = step / 10;
            let currentRadius = 6.0 * (1 - progress);
            let time = (340 + step) / 20.0;
            for (let trail = 0; trail < 3; trail++) {
                for (let pt = 0; pt < 16; pt++) {
                    let t = time + pt * 0.05;
                    let baseAngle = t * 0.5 + trail * 2.0;
                    let height = Math.sin(t * 0.8 + trail) * 2.0 * (1 - progress);
                    let x = procCenter.getX() + currentRadius * Math.cos(baseAngle);
                    let z = procCenter.getZ() + currentRadius * Math.sin(baseAngle);
                    let y = procCenter.getY() + 2.0 + height;
                    let loc = new Location(world, x, y, z);
                    let color = KOMUTECH_L_ZJ_ZJHC_getTrailColor(trail, pt);
                    world.spawnParticle(Particle.DUST, loc, 1, 0, 0, 0, 0, new DustOptions(color, 2.4));
                }
            }
        }, 340 + step * 2);
    }
    runLater(() => {
        for (let i = 0; i < 50; i++) {
            let offX = (Math.random() - 0.5) * 2;
            let offY = Math.random() * 4;
            let offZ = (Math.random() - 0.5) * 2;
            let loc = coreLoc.clone().add(offX, offY + 2.5, offZ);
            let color = KOMUTECH_L_ZJ_ZJHC_getTrailColor(Math.floor(Math.random() * 3), i);
            world.spawnParticle(Particle.DUST, loc, 1, 0, 0, 0, 0, new DustOptions(color, 2.4));
        }
        world.playSound(coreLoc, "entity.firework_rocket.blast", 2, 1);
        let finalLoc = coreLoc.clone().add(0, 9, 0);
        world.strikeLightningEffect(finalLoc);
        world.playSound(finalLoc, "entity.lightning_bolt.thunder", 2, 1);
        world.setTime(originalTime);
        world.setStorm(originalStorm);
        world.setThundering(originalThunder);
        if (p.isOnline()) {
            KOMUTECH_L_ZJ_ZJHC_finalCraft(p, procLoc, StorageCacheUtils.getMenu(procLoc));
        }
        KOMUTECH_L_ZJ_ZJHC_synthesizing.remove(key);
    }, 340 + 20);
}
function KOMUTECH_L_ZJ_ZJHC_onOpen(p,i,l) {}
function KOMUTECH_L_ZJ_ZJHC_onClick(p,s,i,a) {
    if (s !== KOMUTECH_L_ZJ_ZJHC_WORK_SLOT || a.isRightClicked() || a.isShiftClicked()) return false;
    let procLoc = KOMUTECH_L_ZJ_ZJHC_getTargetProcessor(p);
    if (!procLoc) { p.sendMessage("§c请正对处理器机器！"); return true; }
    let coreLoc = procLoc.clone().add(0,-1,0);
    let coreSf = StorageCacheUtils.getSfItem(coreLoc);
    if (!coreSf || coreSf.getId() !== KOMUTECH_L_ZJ_ZJHC_CORE_ID) { p.sendMessage("§c核心机器无效！"); return true; }
    if (parseInt(StorageCacheUtils.getData(coreLoc,"KOMUTECH_L_ZJ_ZJHC_zt")||"0") !== 1) { p.sendMessage("§c核心未激活！"); return true; }
    let check = KOMUTECH_L_ZJ_ZJHC_checkStructure(coreLoc);
    if (!check.valid) {
        StorageCacheUtils.setData(coreLoc, "KOMUTECH_L_ZJ_ZJHC_zt", "0");
        p.sendMessage("§c结构损坏，核心已关闭！");
        check.errors.slice(0,5).forEach(e => p.sendMessage("§7 - " + e));
        return true;
    }
    let menu = StorageCacheUtils.getMenu(procLoc);
    if (!KOMUTECH_L_ZJ_ZJHC_preCheck(p, procLoc, menu)) return true;
    let key = procLoc.getWorld().getName() + "," + procLoc.getX() + "," + procLoc.getY() + "," + procLoc.getZ();
    if (KOMUTECH_L_ZJ_ZJHC_synthesizing.contains(key)) {
        p.sendMessage("§c机器正在合成中，请稍后再试！");
        return true;
    }
    p.closeInventory();
    KOMUTECH_L_ZJ_ZJHC_startEffect(p, coreLoc, procLoc);
    return true;
}
function KOMUTECH_L_ZJ_ZJHC_onClose(p,i,l) {}
function onOpen(p,i,l){ KOMUTECH_L_ZJ_ZJHC_onOpen(p,i,l); }
function onClick(p,s,i,a){ return KOMUTECH_L_ZJ_ZJHC_onClick(p,s,i,a); }
function onClose(p,i,l){ KOMUTECH_L_ZJ_ZJHC_onClose(p,i,l); }