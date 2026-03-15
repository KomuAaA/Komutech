const Bukkit=Java.type('org.bukkit.Bukkit');
const Location=Java.type('org.bukkit.Location');
const Material=Java.type('org.bukkit.Material');
const ItemStack=Java.type('org.bukkit.inventory.ItemStack');
const InventoryClickEvent=Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InventoryCloseEvent=Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const PlayerQuitEvent=Java.type('org.bukkit.event.player.PlayerQuitEvent');
const EventPriority=Java.type('org.bukkit.event.EventPriority');
const plugin=Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const ItemDisplay=Java.type('org.bukkit.entity.ItemDisplay');
const TextDisplay=Java.type('org.bukkit.entity.TextDisplay');
const Display=Java.type('org.bukkit.entity.Display');
const Transformation=Java.type('org.bukkit.util.Transformation');
const Vector3f=Java.type('org.joml.Vector3f');
const AxisAngle4f=Java.type('org.joml.AxisAngle4f');
const Color=Java.type('org.bukkit.Color');
const StorageCacheUtils=Java.type('com.xzavier0722.mc.plugin.slimefun4.storage.util.StorageCacheUtils');
const NamespacedKey=Java.type('org.bukkit.NamespacedKey');
const PersistentDataType=Java.type('org.bukkit.persistence.PersistentDataType');
const CORE_ID="KOMUTECH_L_ZJ_終極合成台核心";
const PROCESSOR_ID="KOMUTECH_L_ZJ_終極合成台";
const CORE_PROJ_KEY=new NamespacedKey("komutech_l_zj_zjhc", "tysj");
const STRUCTURE=[
{x:0,y:0,z:0,m:"shroomlight",sfid:CORE_ID},{x:0,y:1,z:0,m:"player_head",sfid:PROCESSOR_ID},
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
{x:-6,y:0,z:2,m:"crying_obsidian"},{x:-6,y:0,z:1,m:"crying_obsidian"},{x:-6,y:0,z:0,m:"crying_obsidian"},{x:-6,y:0,z:-1,m:"crying_obsidian"},{x:-6,y:0,z:-2,m:"crying_obsidian"},
{x:-5,y:0,z:4,m:"crying_obsidian"},{x:-5,y:0,z:3,m:"crying_obsidian"},{x:-5,y:0,z:-4,m:"crying_obsidian"},{x:-5,y:0,z:-3,m:"crying_obsidian"},
{x:-4,y:0,z:5,m:"crying_obsidian"},{x:-4,y:0,z:-5,m:"crying_obsidian"},
{x:-3,y:0,z:5,m:"crying_obsidian"},{x:-3,y:0,z:-5,m:"crying_obsidian"},
{x:-2,y:0,z:6,m:"crying_obsidian"},{x:-2,y:0,z:-6,m:"crying_obsidian"},
{x:-1,y:0,z:6,m:"crying_obsidian"},{x:-1,y:0,z:-6,m:"crying_obsidian"},
{x:0,y:0,z:6,m:"crying_obsidian"},{x:0,y:0,z:-6,m:"crying_obsidian"},
{x:1,y:0,z:6,m:"crying_obsidian"},{x:1,y:0,z:-6,m:"crying_obsidian"},
{x:2,y:0,z:6,m:"crying_obsidian"},{x:2,y:0,z:-6,m:"crying_obsidian"},
{x:3,y:0,z:5,m:"crying_obsidian"},{x:3,y:0,z:-5,m:"crying_obsidian"},
{x:4,y:0,z:5,m:"crying_obsidian"},{x:4,y:0,z:-5,m:"crying_obsidian"},
{x:5,y:0,z:4,m:"crying_obsidian"},{x:5,y:0,z:3,m:"crying_obsidian"},{x:5,y:0,z:-4,m:"crying_obsidian"},{x:5,y:0,z:-3,m:"crying_obsidian"},
{x:6,y:0,z:2,m:"crying_obsidian"},{x:6,y:0,z:1,m:"crying_obsidian"},{x:6,y:0,z:0,m:"crying_obsidian"},{x:6,y:0,z:-1,m:"crying_obsidian"},{x:6,y:0,z:-2,m:"crying_obsidian"},
{x:-5,y:3,z:-5,m:"end_rod"},{x:-5,y:4,z:-5,m:"lantern"},{x:-5,y:5,z:-5,m:"beacon"},
{x:5,y:3,z:-5,m:"end_rod"},{x:5,y:4,z:-5,m:"lantern"},{x:5,y:5,z:-5,m:"beacon"},
{x:-5,y:3,z:5,m:"end_rod"},{x:-5,y:4,z:5,m:"lantern"},{x:-5,y:5,z:5,m:"beacon"},
{x:5,y:3,z:5,m:"end_rod"},{x:5,y:4,z:5,m:"lantern"},{x:5,y:5,z:5,m:"beacon"},
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
const STATE={INACTIVE:0,ACTIVE:1};
const DIRS=["§f北","§f东","§f南","§f西"];
let proj=new java.util.HashMap(),absCoords=new java.util.HashMap();
let openPlayers=new java.util.HashSet(),coreMap=new java.util.HashMap();
let registered=false,listener=null;
function getLocationKey(block){
 return block.getWorld().getName()+","+block.getX()+","+block.getY()+","+block.getZ();
}
function rot(x,z,d){
 switch(d){
  case 0:return{x,z};
  case 1:return{x:-z,z:x};
  case 2:return{x:-x,z:-z};
  case 3:return{x:z,z:-x};
  default:return{x,z};
 }
}
function cacheAbs(core,dir){
 let cx=core.getX(),cy=core.getY(),cz=core.getZ(),list=[];
 STRUCTURE.forEach(b=>{
  if(b.x===0&&b.y===0&&b.z===0)return;
  let r=rot(b.x,b.z,dir);
  list.push({x:cx+r.x,y:cy+b.y,z:cz+r.z,m:b.m,sfid:b.sfid});
 });
 absCoords.put(core.getWorld().getName()+"_"+core.getBlockX()+"_"+core.getBlockY()+"_"+core.getBlockZ(),list);
 return list;
}
function getAbs(core,dir){
 let key=core.getWorld().getName()+"_"+core.getBlockX()+"_"+core.getBlockY()+"_"+core.getBlockZ();
 return absCoords.get(key)||cacheAbs(core,dir);
}
function spawnProj(core,p,dir){
 remProj(p);
 let w=core.getWorld(),entities=[];
 let coreKey=getLocationKey(core);
 getAbs(core,dir).forEach(b=>{
  let item=null,displayName=null;
  if(b.sfid){
   let sf=getSfItemById(b.sfid);
   if(sf){
    item=sf.getItem().clone();
    let meta=item.getItemMeta();
    if(meta.hasDisplayName())displayName=meta.getDisplayName();
    else displayName=item.getType().name().toLowerCase().replace('_',' ');
   }
  }
  if(!item){
   let mat=Material.getMaterial(b.m.toUpperCase());
   if(!mat||!mat.isItem())return;
   item=new ItemStack(mat);
  }
  let loc=new Location(w,b.x+0.5,b.y+0.5,b.z+0.5);
  let d=w.spawn(loc,ItemDisplay.class);
  d.setItemStack(item);
  d.setTransformation(new Transformation(new Vector3f(0,0,0),new AxisAngle4f(0,0,1,0),new Vector3f(0.6,0.6,0.6),new AxisAngle4f(0,0,1,0)));
  d.setGlowing(true);d.setGlowColorOverride(Color.fromARGB(128,255,255,255));
  d.setBrightness(new Display.Brightness(15,15));d.setViewRange(100);d.setGravity(false);d.setInvulnerable(true);
  d.getPersistentDataContainer().set(CORE_PROJ_KEY,PersistentDataType.STRING,coreKey);
  entities.push(d);
  if(displayName){
   let textLoc=loc.clone().add(0,0.8,0);
   let text=w.spawn(textLoc,TextDisplay.class);
   text.setText(displayName);
   text.setAlignment(Java.type('org.bukkit.entity.TextDisplay$TextAlignment').CENTER);
   text.setBackgroundColor(Color.fromARGB(0,0,0,0));
   text.setSeeThrough(true);
   text.setDefaultBackground(false);
   text.setBillboard(Java.type('org.bukkit.entity.Display$Billboard').CENTER);
   text.setViewRange(50);
   text.setGravity(false);
   text.setInvulnerable(true);
   text.getPersistentDataContainer().set(CORE_PROJ_KEY,PersistentDataType.STRING,coreKey);
   entities.push(text);
  }
 });
 proj.put(p,{coreKey:coreKey,entities:entities});
}
function remProj(p){
 let obj=proj.get(p);
 if(obj){
  obj.entities.forEach(e=>{try{e.remove()}catch(ex){}});
  proj.remove(p);
 }
}
function fullCheck(core,dir){
 let w=core.getWorld(),errors=[];
 getAbs(core,dir).forEach(b=>{
  let block=w.getBlockAt(b.x,b.y,b.z);
  let actual=block.getType().name().toLowerCase();
  if(actual!==b.m){
   errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要 ${b.m}`);
   return;
  }
  if(b.sfid){
   let sf=StorageCacheUtils.getSfItem(block.getLocation());
   let actualSf=sf?sf.getId():null;
   if(!sf)errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要粘液物品 ${b.sfid}`);
   else if(actualSf!==b.sfid)errors.push(`位置 (${b.x-core.getX()},${b.y-core.getY()},${b.z-core.getZ()}) 需要粘液物品 ${b.sfid}，找到 ${actualSf}`);
  }
 });
 return{valid:errors.length===0,errors};
}
function item(mat,name,lore){
 let m=Material[mat]||Material.getMaterial(mat)||Material.STONE,i=new ItemStack(m),me=i.getItemMeta();
 me.setDisplayName(name);if(lore)me.setLore(Array.isArray(lore)?lore:[lore]);i.setItemMeta(me);return i;
}
function buildCoreMenu(state,dir){
 let inv=Bukkit.createInventory(null,9,"§6太极合成核心");
 let sn,sl;
 if(state===STATE.ACTIVE){sn="§a● 已激活";sl=["§7运行中"];}
 else{sn="§c○ 未激活";sl=["§7点击启动检测激活"];}
 inv.setItem(4,item("PAINTING",sn,sl));
 inv.setItem(0,item("ENDER_PEARL","§b投影",["§7开启/关闭"]));
 inv.setItem(1,item("EMERALD_BLOCK","§a启动",["§7验证并激活"]));
 inv.setItem(3,item("COMPASS","§b方向: "+DIRS[dir],["§7点击切换"]));
 if(state===STATE.ACTIVE)inv.setItem(2,item("REDSTONE_BLOCK","§c停止",["§7停止机器"]));
 inv.setItem(8,item("BARRIER","§c关闭",[]));
 return inv;
}
function unregister(){
 if(listener){
  InventoryClickEvent.getHandlerList().unregister(listener);
  InventoryCloseEvent.getHandlerList().unregister(listener);
  PlayerQuitEvent.getHandlerList().unregister(listener);
  listener=null;registered=false;
 }
}
function ensureListener(){
 if(registered)return;
 const Listener=Java.type('org.bukkit.event.Listener'),Impl=Java.extend(Listener,{});listener=new Impl();
 Bukkit.getPluginManager().registerEvent(InventoryClickEvent,listener,EventPriority.NORMAL,(l,e)=>{
  try{
   let p=e.getWhoClicked();
   if(!openPlayers.contains(p)||e.getInventory().getTitle()!=="§6太极合成核心")return;
   e.setCancelled(true);
   let slot=e.getSlot(),it=e.getCurrentItem();
   if(!it||it.getType()===Material.AIR)return;
   let loc=coreMap.get(p);if(!loc)return;
   let state=parseInt(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_zt")||"0"),dir=parseInt(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_fx")||"0");
   if(slot===8)p.closeInventory();
   else if(slot===0){
    let hasValid=false;
    if(proj.containsKey(p)){
     let obj=proj.get(p);
     if(obj.entities&&obj.entities.length>0){
      try{if(!obj.entities[0].isDead())hasValid=true;}catch(ex){}
     }
     if(!hasValid)proj.remove(p);
    }
    if(hasValid){
     remProj(p);
     e.getInventory().setItem(0,item("ENDER_PEARL","§b投影",["§7开启/关闭"]));
    }else{
     spawnProj(loc,p,dir);
     e.getInventory().setItem(0,item("ENDER_PEARL","§a投影已开启",["§7点击关闭"]));
    }
   }else if(slot===1){
    if(proj.containsKey(p)){remProj(p);e.getInventory().setItem(0,item("ENDER_PEARL","§b投影",["§7开启/关闭"]));}
    let check=fullCheck(loc,dir);
    if(check.valid){StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_zt","1");cacheAbs(loc,dir);p.sendMessage("§a激活成功！");}
    else{StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_zt","0");p.sendMessage("§c结构错误");check.errors.slice(0,5).forEach(e=>p.sendMessage("§7 - "+e));if(check.errors.length>5)p.sendMessage("§7... 等"+(check.errors.length-5)+"处错误");}
    p.closeInventory();
   }else if(slot===2&&state===STATE.ACTIVE){
    StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_zt","0");remProj(p);absCoords.remove(loc.getWorld().getName()+"_"+loc.getBlockX()+"_"+loc.getBlockY()+"_"+loc.getBlockZ());p.sendMessage("§c已停止");p.closeInventory();
   }else if(slot===3){
    let nd=(dir+1)%4;
    StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_fx",nd.toString());
    cacheAbs(loc,nd);
    e.getInventory().setItem(3,item("COMPASS","§b方向: "+DIRS[nd],["§7点击切换"]));
    if(proj.containsKey(p)){remProj(p);spawnProj(loc,p,nd);}
   }
  }catch(ex){}
 },plugin);
 Bukkit.getPluginManager().registerEvent(InventoryCloseEvent,listener,EventPriority.NORMAL,(l,e)=>{let p=e.getPlayer();if(openPlayers.remove(p))coreMap.remove(p);if(openPlayers.isEmpty())unregister();},plugin);
 Bukkit.getPluginManager().registerEvent(PlayerQuitEvent,listener,EventPriority.NORMAL,(l,e)=>{let p=e.getPlayer();remProj(p);if(openPlayers.remove(p))coreMap.remove(p);if(openPlayers.isEmpty())unregister();},plugin);
 registered=true;
}
function onUse(e){
 try{
  let p=e.getPlayer(),opt=e.getClickedBlock();
  if(!opt||!opt.isPresent())return;
  let loc=opt.get().getLocation();
  let sfid=StorageCacheUtils.getSfItem(loc)?.getId();
  if(!sfid)return;
  if(sfid===CORE_ID){
   if(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_fx")===null)StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_fx","0");
   if(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_zt")===null)StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_zt","0");
   let state=parseInt(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_zt")||"0"),dir=parseInt(StorageCacheUtils.getData(loc,"komutech_l_zj_zjhc_fx")||"0");
   coreMap.put(p,loc);openPlayers.add(p);ensureListener();p.openInventory(buildCoreMenu(state,dir));
  }
 }catch(ex){}
}
function onBreak(e,it,drops){
 try{
  let loc=e.getBlock().getLocation(),sfid=StorageCacheUtils.getSfItem(loc)?.getId();
  if(sfid===CORE_ID){
   StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_zt",null);StorageCacheUtils.setData(loc,"komutech_l_zj_zjhc_fx",null);
   absCoords.remove(loc.getWorld().getName()+"_"+loc.getBlockX()+"_"+loc.getBlockY()+"_"+loc.getBlockZ());
   let world=loc.getWorld(),coreKey=getLocationKey(e.getBlock());
   world.getEntities().forEach(entity=>{
    if(entity instanceof ItemDisplay||entity instanceof TextDisplay){
     let pdc=entity.getPersistentDataContainer();
     if(pdc.has(CORE_PROJ_KEY,PersistentDataType.STRING)&&pdc.get(CORE_PROJ_KEY,PersistentDataType.STRING)===coreKey)entity.remove();
    }
   });
   let iter=proj.entrySet().iterator();
   while(iter.hasNext()){
    let entry=iter.next();
    if(entry.getValue().coreKey===coreKey){
     entry.getValue().entities.forEach(e=>{try{e.remove()}catch(ex){}});
     iter.remove();
    }
   }
  }else if(sfid===PROCESSOR_ID){
   let core=loc.clone().add(0,-1,0);
   StorageCacheUtils.setData(core,"komutech_l_zj_zjhc_zt","0");
   absCoords.remove(core.getWorld().getName()+"_"+core.getBlockX()+"_"+core.getBlockY()+"_"+core.getBlockZ());
  }
 }catch(ex){}
}