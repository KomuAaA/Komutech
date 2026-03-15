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
const CORE_ID = "KOMUTECH_L_ZJ_終極合成台核心";
const PROCESSOR_ID = "KOMUTECH_L_ZJ_終極合成台";
const INPUT_SLOTS = [0,1,2,9,10,11,18,19,20];
const OUTPUT_SLOTS = [6,7,8,15,16,17,24,25,26];
const WORK_SLOT = 13;
const ITEM_WUXING = "KOMUTECH_L_FZ_五行祖炁";
const ITEM_XXZZ = "KOMUTECH_L_XX_ZZ";
const ITEM_TIANXIANG = "KOMUTECH_L_FZ_天象祖炁";
const ITEM_ZAOHUA = "KOMUTECH_L_FZ_造化祖炁";
const ITEM_WU = "KOMUTECH_L_ZJ_無";
const ITEM_WANXIANG = "KOMUTECH_L_ZJ_萬象匱";
const ITEM_WANYANYI = "KOMUTECH_L_ZJ_萬衍儀";
const ENDER_CHEST = Material.ENDER_CHEST;
const STRUCTURE = [
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
let BEACON_LOCS = [], LINGJING_LOCS = [];
STRUCTURE.forEach(b => {
 if (b.m === "beacon") BEACON_LOCS.push({x:b.x, y:b.y, z:b.z});
 if (b.sfid === "KOMUTECH_L_DJ_JPLJ") LINGJING_LOCS.push({x:b.x, y:b.y, z:b.z});
});
const TRAIL_COLORS = [
 ["#fc6076","#fd7a5f","#ff9a44","#fd7a5f","#fc6076"],
 ["#fbc2eb","#d1c2ed","#a6c1ee","#d1c2ed","#fbc2eb"],
 ["#43e97b","#3ef1a9","#38f9d7","#3ef1a9","#43e97b"]
];
const TRAIL_COLORS_RGB = TRAIL_COLORS.map(arr => arr.map(hex => {
 let r = parseInt(hex.substring(1,3),16);
 let g = parseInt(hex.substring(3,5),16);
 let b = parseInt(hex.substring(5,7),16);
 return Color.fromRGB(r,g,b);
}));
function getTrailColor(trailId, idx) {
 let colors = TRAIL_COLORS_RGB[trailId % TRAIL_COLORS_RGB.length];
 return colors[idx % colors.length];
}
function rot(x, z, dir) {
 switch(dir) {
  case 0: return {x, z};
  case 1: return {x:-z, z:x};
  case 2: return {x:-x, z:-z};
  case 3: return {x:z, z:-x};
  default: return {x, z};
 }
}
const structureCache = new java.util.HashMap();
function getStructureBlocks(coreLoc, dir) {
 let key = coreLoc.getWorld().getName() + "_" + coreLoc.getBlockX() + "_" + coreLoc.getBlockY() + "_" + coreLoc.getBlockZ() + "_" + dir;
 if (structureCache.containsKey(key)) return structureCache.get(key);
 let list = [];
 STRUCTURE.forEach(b => {
  let r = rot(b.x, b.z, dir);
  list.push({
   x: coreLoc.getX() + r.x,
   y: coreLoc.getY() + b.y,
   z: coreLoc.getZ() + r.z,
   m: b.m,
   sfid: b.sfid
  });
 });
 structureCache.put(key, list);
 return list;
}
function fullCheck(core, dir) {
 let world = core.getWorld();
 let errors = [];
 getStructureBlocks(core, dir).forEach(b => {
  let block = world.getBlockAt(b.x, b.y, b.z);
  if (block.getType().name().toLowerCase() !== b.m) {
   errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要 ${b.m}`);
   return;
  }
  if (b.sfid) {
   let sf = StorageCacheUtils.getSfItem(block.getLocation());
   let actualSf = sf ? sf.getId() : null;
   if (!sf) errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要粘液物品 ${b.sfid}`);
   else if (actualSf !== b.sfid) errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要粘液物品 ${b.sfid}，找到 ${actualSf}`);
  }
 });
 return {valid: errors.length === 0, errors};
}
function getTargetProcessor(p) {
 let b = p.getTargetBlockExact(5);
 if (!b) return null;
 let sf = StorageCacheUtils.getSfItem(b.getLocation());
 return sf && sf.getId() === PROCESSOR_ID ? b.getLocation() : null;
}
function isSlimefunItem(item, id) {
 if (!item) return false;
 let sf = SlimefunItem.getByItem(item);
 return sf && sf.getId() === id;
}
function getItemStack(id) {
 let sf = SlimefunItem.getById(id);
 return sf ? sf.getItem() : null;
}
function slotsEmpty(menu, slots) {
 for (let s of slots) if (menu.getItemInSlot(s) != null) return false;
 return true;
}
function slotsMatch(menu, slots, isSlimefun, expected) {
 for (let s of slots) {
  let item = menu.getItemInSlot(s);
  if (!item) return false;
  if (isSlimefun ? !isSlimefunItem(item, expected) : item.getType() !== expected) return false;
 }
 return true;
}
function preCheck(p, procLoc, menu) {
 let coreLoc = procLoc.clone().add(0,-1,0);
 let coreSf = StorageCacheUtils.getSfItem(coreLoc);
 if (!coreSf || coreSf.getId() !== CORE_ID) { p.sendMessage("§c核心机器无效！"); return false; }
 if (parseInt(StorageCacheUtils.getData(coreLoc,"komutech_l_zj_zjhc_zt")||"0") !== 1) { p.sendMessage("§c核心未激活！"); return false; }
 for (let s of OUTPUT_SLOTS) if (menu.getItemInSlot(s) == null) break; else return p.sendMessage("§c输出槽已满！"), false;
 let emptySlots = [0,2,9,11,19];
 let otherSlots = [0,1,2,9,11,18,19,20];
 if (slotsEmpty(menu, emptySlots) &&
     slotsMatch(menu, [1], true, ITEM_WUXING) &&
     slotsMatch(menu, [10], true, ITEM_XXZZ) &&
     slotsMatch(menu, [18], true, ITEM_TIANXIANG) &&
     slotsMatch(menu, [20], true, ITEM_ZAOHUA)) return true;
 if (slotsMatch(menu, [10], true, ITEM_WU) &&
     slotsMatch(menu, otherSlots, false, ENDER_CHEST)) return true;
 if (slotsMatch(menu, [10], true, ITEM_WU) &&
     slotsMatch(menu, otherSlots, true, ITEM_XXZZ)) return true;
 p.sendMessage("§c没有匹配的配方！"); return false;
}
function finalCraft(p, procLoc, menu) {
 let coreLoc = procLoc.clone().add(0,-1,0);
 let coreSf = StorageCacheUtils.getSfItem(coreLoc);
 if (!coreSf || coreSf.getId() !== CORE_ID) { p.sendMessage("§c核心机器已变更，合成失败！"); return; }
 if (parseInt(StorageCacheUtils.getData(coreLoc,"komutech_l_zj_zjhc_zt")||"0") !== 1) { p.sendMessage("§c核心已关闭，合成失败！"); return; }
 let emptySlots = [0,2,9,11,19];
 let otherSlots = [0,1,2,9,11,18,19,20];
 let outputItem = null, consumeMap = null;
 if (slotsEmpty(menu, emptySlots) &&
     slotsMatch(menu, [1], true, ITEM_WUXING) &&
     slotsMatch(menu, [10], true, ITEM_XXZZ) &&
     slotsMatch(menu, [18], true, ITEM_TIANXIANG) &&
     slotsMatch(menu, [20], true, ITEM_ZAOHUA)) {
  outputItem = getItemStack(ITEM_WU);
  consumeMap = [1,10,18,20];
 } else if (slotsMatch(menu, [10], true, ITEM_WU) &&
            slotsMatch(menu, otherSlots, false, ENDER_CHEST)) {
  outputItem = getItemStack(ITEM_WANXIANG);
  consumeMap = otherSlots;
 } else if (slotsMatch(menu, [10], true, ITEM_WU) &&
            slotsMatch(menu, otherSlots, true, ITEM_XXZZ)) {
  outputItem = getItemStack(ITEM_WANYANYI);
  consumeMap = otherSlots;
 } else {
  p.sendMessage("§c合成失败：配方不匹配！"); return;
 }
 for (let s of consumeMap) {
  let item = menu.getItemInSlot(s);
  if (item.getAmount() > 1) { item.setAmount(item.getAmount() - 1); menu.replaceExistingItem(s, item); }
  else menu.replaceExistingItem(s, null);
 }
 for (let s of OUTPUT_SLOTS) {
  if (menu.getItemInSlot(s) == null) {
   menu.replaceExistingItem(s, outputItem.clone());
   break;
  }
 }
 let world = coreLoc.getWorld();
 if (!world) return;
 let totalLing = LINGJING_LOCS.length;
 if (totalLing === 0) return;
 let consumeCount = Math.min(Math.floor(Math.random() * 17) + 8, totalLing);
 let selected = new java.util.HashSet();
 while (selected.size() < consumeCount) selected.add(Math.floor(Math.random() * totalLing));
 selected.forEach(idx => {
  let rel = LINGJING_LOCS[idx];
  let blockLoc = coreLoc.clone().add(rel.x, rel.y, rel.z);
  let block = world.getBlockAt(blockLoc);
  if (block.getType() === Material.AMETHYST_CLUSTER) {
   let event = new BlockBreakEvent(block, p);
   event.setDropItems(false);
   Bukkit.getPluginManager().callEvent(event);
   block.setType(Material.AIR);
  }
 });
 StorageCacheUtils.setData(coreLoc, "komutech_l_zj_zjhc_zt", "0");
 p.sendMessage("§a合成成功！消耗了 " + selected.size() + " 个灵晶，核心已关闭。");
}
function getTrailPos(center, trailId, time) {
 let baseAngle = time * 0.5 + trailId * 2.0;
 let radius = 6.0 + Math.sin(time * 0.3 + trailId) * 1.0;
 let height = Math.sin(time * 0.8 + trailId) * 2.0;
 let x = center.getX() + radius * Math.cos(baseAngle);
 let z = center.getZ() + radius * Math.sin(baseAngle);
 let y = center.getY() + 2.0 + height;
 return new Location(center.getWorld(), x, y, z);
}
function startEffect(p, coreLoc, procLoc) {
 let world = coreLoc.getWorld();
 let originalTime = world.getTime();
 let originalStorm = world.hasStorm();
 let originalThunder = world.isThundering();
 world.setTime(18000);
 world.setStorm(true);
 world.setThundering(true);
 let procCenter = procLoc.clone().add(0.5, 0.5, 0.5);
 for (let t = 0; t < 340; t += 5) {
  runLater(() => {
   if (LINGJING_LOCS.length === 0) return;
   LINGJING_LOCS.forEach(rel => {
    let lingLoc = coreLoc.clone().add(rel.x, rel.y, rel.z);
    let dir = procCenter.clone().subtract(lingLoc).toVector().normalize();
    let randCount = Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < randCount; k++) {
     world.spawnParticle(Particle.END_ROD, lingLoc, 0, dir.getX(), dir.getY(), dir.getZ(), 0.6);
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
     let pos = getTrailPos(procCenter, trail, time + offset);
     let color = getTrailColor(trail, pt);
     world.spawnParticle(Particle.DUST, pos, 1, 0, 0, 0, 0, new DustOptions(color, 2.4));
    }
   }
  }, t);
 }
 for (let j = 0; j < 9; j++) {
  let delay = Math.floor(Math.random() * 340);
  runLater(() => {
   if (BEACON_LOCS.length === 0) return;
   let rel = BEACON_LOCS[Math.floor(Math.random() * BEACON_LOCS.length)];
   let beaconLoc = coreLoc.clone().add(rel.x, rel.y, rel.z);
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
     let color = getTrailColor(trail, pt);
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
   let color = getTrailColor(Math.floor(Math.random() * 3), i);
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
   finalCraft(p, procLoc, StorageCacheUtils.getMenu(procLoc));
  }
 }, 340 + 20);
}
function onOpen(p,i,l) {}
function onClick(p,s,i,a) {
 if (s !== WORK_SLOT || a.isRightClicked() || a.isShiftClicked()) return false;
 let procLoc = getTargetProcessor(p);
 if (!procLoc) { p.sendMessage("§c请正对处理器机器！"); return true; }
 let coreLoc = procLoc.clone().add(0,-1,0);
 let coreSf = StorageCacheUtils.getSfItem(coreLoc);
 if (!coreSf || coreSf.getId() !== CORE_ID) { p.sendMessage("§c核心机器无效！"); return true; }
 if (parseInt(StorageCacheUtils.getData(coreLoc,"komutech_l_zj_zjhc_zt")||"0") !== 1) { p.sendMessage("§c核心未激活！"); return true; }
 let dir = parseInt(StorageCacheUtils.getData(coreLoc,"komutech_l_zj_zjhc_fx")||"0");
 let check = fullCheck(coreLoc, dir);
 if (!check.valid) {
  StorageCacheUtils.setData(coreLoc, "komutech_l_zj_zjhc_zt", "0");
  p.sendMessage("§c结构损坏，核心已关闭！");
  check.errors.slice(0,5).forEach(e => p.sendMessage("§7 - " + e));
  return true;
 }
 let menu = StorageCacheUtils.getMenu(procLoc);
 if (!preCheck(p, procLoc, menu)) return true;
 p.closeInventory();
 startEffect(p, coreLoc, procLoc);
 return true;
}
function onClose(p,i,l) {}