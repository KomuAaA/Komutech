const Bukkit = Java.type('org.bukkit.Bukkit');
const Location = Java.type('org.bukkit.Location');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const InventoryClickEvent = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InventoryCloseEvent = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const ItemDisplay = Java.type('org.bukkit.entity.ItemDisplay');
const TextDisplay = Java.type('org.bukkit.entity.TextDisplay');
const Display = Java.type('org.bukkit.entity.Display');
const Transformation = Java.type('org.bukkit.util.Transformation');
const Vector3f = Java.type('org.joml.Vector3f');
const AxisAngle4f = Java.type('org.joml.AxisAngle4f');
const Color = Java.type('org.bukkit.Color');
const StorageCacheUtils = Java.type('com.xzavier0722.mc.plugin.slimefun4.storage.util.StorageCacheUtils');
const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');
const KOMUTECH_L_ZJ_ZJHC_CORE_ID = "KOMUTECH_L_ZJ_終極合成台核心";
const KOMUTECH_L_ZJ_ZJHC_PROCESSOR_ID = "KOMUTECH_L_ZJ_終極合成台";
const KOMUTECH_L_ZJ_ZJHC_CORE_PROJ_KEY = new NamespacedKey("komutech_l_zj_zjhc", "tysj");
const KOMUTECH_L_ZJ_ZJHC_STRUCTURE = [
{x:0,y:0,z:0,m:"shroomlight",sfid:KOMUTECH_L_ZJ_ZJHC_CORE_ID},{x:0,y:1,z:0,m:"player_head",sfid:KOMUTECH_L_ZJ_ZJHC_PROCESSOR_ID},
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
const KOMUTECH_L_ZJ_ZJHC_STATE = {INACTIVE:0,ACTIVE:1};
const KOMUTECH_L_ZJ_ZJHC_DIRS = ["§f北","§f东","§f南","§f西"];
let KOMUTECH_L_ZJ_ZJHC_proj = new java.util.HashMap();
let KOMUTECH_L_ZJ_ZJHC_openPlayers = new java.util.HashSet();
let KOMUTECH_L_ZJ_ZJHC_coreMap = new java.util.HashMap();
let KOMUTECH_L_ZJ_ZJHC_registered = false;
let KOMUTECH_L_ZJ_ZJHC_listener = null;
function KOMUTECH_L_ZJ_ZJHC_getLocationKey(block){
    return block.getWorld().getName()+","+block.getX()+","+block.getY()+","+block.getZ();
}
function KOMUTECH_L_ZJ_ZJHC_rot(x,z,d){
    switch(d){
        case 0:return{x,z};
        case 1:return{x:-z,z:x};
        case 2:return{x:-x,z:-z};
        case 3:return{x:z,z:-x};
        default:return{x,z};
    }
}
function KOMUTECH_L_ZJ_ZJHC_checkAndGetBlocks(core, dir){
    let world = core.getWorld();
    let errors = [];
    let blocks = [];
    KOMUTECH_L_ZJ_ZJHC_STRUCTURE.forEach(b => {
        let r = KOMUTECH_L_ZJ_ZJHC_rot(b.x, b.z, dir);
        let x = core.getX() + r.x;
        let y = core.getY() + b.y;
        let z = core.getZ() + r.z;
        blocks.push({x, y, z, m: b.m, sfid: b.sfid});
        let block = world.getBlockAt(x, y, z);
        if (block.getType().name().toLowerCase() !== b.m) {
            errors.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要 ${b.m}`);
            return;
        }
        if (b.sfid) {
            let sf = StorageCacheUtils.getSfItem(block.getLocation());
            let actualSf = sf ? sf.getId() : null;
            if (!sf) errors.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要粘液物品 ${b.sfid}`);
            else if (actualSf !== b.sfid) errors.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要粘液物品 ${b.sfid}，找到 ${actualSf}`);
        }
    });
    return { valid: errors.length === 0, errors, blocks };
}
function KOMUTECH_L_ZJ_ZJHC_fullCheck(core, dir){
    let { valid, errors } = KOMUTECH_L_ZJ_ZJHC_checkAndGetBlocks(core, dir);
    return { valid, errors };
}
function KOMUTECH_L_ZJ_ZJHC_spawnProj(core, player, dir){
    KOMUTECH_L_ZJ_ZJHC_remProj(player);
    let world = core.getWorld();
    let entities = [];
    let coreKey = KOMUTECH_L_ZJ_ZJHC_getLocationKey(core);
    let { blocks } = KOMUTECH_L_ZJ_ZJHC_checkAndGetBlocks(core, dir);
    for (let b of blocks) {
        let item = null, displayName = null;
        if (b.sfid) {
            let sf = getSfItemById(b.sfid);
            if (sf) {
                item = sf.getItem().clone();
                let meta = item.getItemMeta();
                if (meta.hasDisplayName()) displayName = meta.getDisplayName();
                else displayName = item.getType().name().toLowerCase().replace('_',' ');
            }
        }
        if (!item) {
            let mat = Material.getMaterial(b.m.toUpperCase());
            if (!mat || !mat.isItem()) continue;
            item = new ItemStack(mat);
        }
        let loc = new Location(world, b.x+0.5, b.y+0.5, b.z+0.5);
        let d = world.spawn(loc, ItemDisplay.class);
        d.setItemStack(item);
        d.setTransformation(new Transformation(new Vector3f(0,0,0), new AxisAngle4f(0,0,1,0), new Vector3f(0.6,0.6,0.6), new AxisAngle4f(0,0,1,0)));
        d.setGlowing(true);
        d.setGlowColorOverride(Color.fromARGB(128,255,255,255));
        d.setBrightness(new Display.Brightness(15,15));
        d.setViewRange(100);
        d.setGravity(false);
        d.setInvulnerable(true);
        d.getPersistentDataContainer().set(KOMUTECH_L_ZJ_ZJHC_CORE_PROJ_KEY, PersistentDataType.STRING, coreKey);
        entities.push(d);
        if (displayName) {
            let textLoc = loc.clone().add(0,0.8,0);
            let text = world.spawn(textLoc, TextDisplay.class);
            text.setText(displayName);
            text.setAlignment(Java.type('org.bukkit.entity.TextDisplay$TextAlignment').CENTER);
            text.setBackgroundColor(Color.fromARGB(0,0,0,0));
            text.setSeeThrough(true);
            text.setDefaultBackground(false);
            text.setBillboard(Java.type('org.bukkit.entity.Display$Billboard').CENTER);
            text.setViewRange(50);
            text.setGravity(false);
            text.setInvulnerable(true);
            text.getPersistentDataContainer().set(KOMUTECH_L_ZJ_ZJHC_CORE_PROJ_KEY, PersistentDataType.STRING, coreKey);
            entities.push(text);
        }
    }
    KOMUTECH_L_ZJ_ZJHC_proj.put(player, {coreKey:coreKey, entities:entities});
}
function KOMUTECH_L_ZJ_ZJHC_remProj(player){
    let obj = KOMUTECH_L_ZJ_ZJHC_proj.get(player);
    if(obj){
        obj.entities.forEach(e => {try{e.remove()}catch(ex){}});
        KOMUTECH_L_ZJ_ZJHC_proj.remove(player);
    }
}
function KOMUTECH_L_ZJ_ZJHC_item(mat,name,lore){
    let m = Material[mat] || Material.getMaterial(mat) || Material.STONE;
    let i = new ItemStack(m);
    let me = i.getItemMeta();
    me.setDisplayName(name);
    if(lore) me.setLore(Array.isArray(lore)?lore:[lore]);
    i.setItemMeta(me);
    return i;
}
function KOMUTECH_L_ZJ_ZJHC_buildCoreMenu(state,dir){
    let inv = Bukkit.createInventory(null,9,"§6太极合成核心");
    let sn,sl;
    if(state===KOMUTECH_L_ZJ_ZJHC_STATE.ACTIVE){sn="§a● 已激活"; sl=["§7运行中"];}
    else{sn="§c○ 未激活"; sl=["§7点击启动检测激活"];}
    inv.setItem(4,KOMUTECH_L_ZJ_ZJHC_item("PAINTING",sn,sl));
    inv.setItem(0,KOMUTECH_L_ZJ_ZJHC_item("ENDER_PEARL","§b投影",["§7开启/关闭"]));
    inv.setItem(1,KOMUTECH_L_ZJ_ZJHC_item("EMERALD_BLOCK","§a启动",["§7验证并激活"]));
    inv.setItem(3,KOMUTECH_L_ZJ_ZJHC_item("COMPASS","§b方向: "+KOMUTECH_L_ZJ_ZJHC_DIRS[dir],["§7点击切换"]));
    if(state===KOMUTECH_L_ZJ_ZJHC_STATE.ACTIVE) inv.setItem(2,KOMUTECH_L_ZJ_ZJHC_item("REDSTONE_BLOCK","§c停止",["§7停止机器"]));
    inv.setItem(8,KOMUTECH_L_ZJ_ZJHC_item("BARRIER","§c关闭",[]));
    return inv;
}
function KOMUTECH_L_ZJ_ZJHC_unregister(){
    if(KOMUTECH_L_ZJ_ZJHC_listener){
        try {
            InventoryClickEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_ZJHC_listener);
            InventoryCloseEvent.getHandlerList().unregister(KOMUTECH_L_ZJ_ZJHC_listener);
        } catch(e) {
            if (e.message && e.message.includes("Context is already closed")) return;
            print("取消监听器异常: " + e);
            if (e.printStackTrace) e.printStackTrace();
        }
        KOMUTECH_L_ZJ_ZJHC_listener = null;
        KOMUTECH_L_ZJ_ZJHC_registered = false;
    }
}
function KOMUTECH_L_ZJ_ZJHC_registerListener(){
    if(KOMUTECH_L_ZJ_ZJHC_registered) return;
    const Listener = Java.type('org.bukkit.event.Listener');
    const Impl = Java.extend(Listener, {});
    KOMUTECH_L_ZJ_ZJHC_listener = new Impl();
    Bukkit.getPluginManager().registerEvent(InventoryClickEvent, KOMUTECH_L_ZJ_ZJHC_listener, EventPriority.NORMAL, (l, e) => {
        try{
            let p = e.getWhoClicked();
            if(!KOMUTECH_L_ZJ_ZJHC_openPlayers.contains(p) || e.getInventory().getTitle()!=="§6太极合成核心") return;
            e.setCancelled(true);
            let slot = e.getSlot();
            let it = e.getCurrentItem();
            if(!it || it.getType()===Material.AIR) return;
            let loc = KOMUTECH_L_ZJ_ZJHC_coreMap.get(p);
            if(!loc) return;
            let state = parseInt(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_zt")||"0");
            let dir = parseInt(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_fx")||"0");
            if(slot===8){
                p.closeInventory();
            }else if(slot===0){
                let hasValid = false;
                if(KOMUTECH_L_ZJ_ZJHC_proj.containsKey(p)){
                    let obj = KOMUTECH_L_ZJ_ZJHC_proj.get(p);
                    if(obj.entities && obj.entities.length>0){
                        try{ if(!obj.entities[0].isDead()) hasValid = true; }catch(ex){}
                    }
                    if(!hasValid) KOMUTECH_L_ZJ_ZJHC_proj.remove(p);
                }
                if(hasValid){
                    KOMUTECH_L_ZJ_ZJHC_remProj(p);
                    e.getInventory().setItem(0,KOMUTECH_L_ZJ_ZJHC_item("ENDER_PEARL","§b投影",["§7开启/关闭"]));
                }else{
                    KOMUTECH_L_ZJ_ZJHC_spawnProj(loc,p,dir);
                    e.getInventory().setItem(0,KOMUTECH_L_ZJ_ZJHC_item("ENDER_PEARL","§a投影已开启",["§7点击关闭"]));
                }
            }else if(slot===1){
                if(KOMUTECH_L_ZJ_ZJHC_proj.containsKey(p)){ KOMUTECH_L_ZJ_ZJHC_remProj(p); e.getInventory().setItem(0,KOMUTECH_L_ZJ_ZJHC_item("ENDER_PEARL","§b投影",["§7开启/关闭"])); }
                let check = KOMUTECH_L_ZJ_ZJHC_fullCheck(loc,dir);
                if(check.valid){
                    StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_zt","1");
                    p.sendMessage("§a激活成功！");
                }else{
                    StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_zt","0");
                    p.sendMessage("§c结构错误");
                    check.errors.slice(0,5).forEach(e => p.sendMessage("§7 - "+e));
                    if(check.errors.length>5) p.sendMessage("§7... 等"+(check.errors.length-5)+"处错误");
                }
                p.closeInventory();
            }else if(slot===2 && state===KOMUTECH_L_ZJ_ZJHC_STATE.ACTIVE){
                StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_zt","0");
                KOMUTECH_L_ZJ_ZJHC_remProj(p);
                p.sendMessage("§c已停止");
                p.closeInventory();
            }else if(slot===3){
                let nd = (dir+1)%4;
                StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_fx",nd.toString());
                e.getInventory().setItem(3,KOMUTECH_L_ZJ_ZJHC_item("COMPASS","§b方向: "+KOMUTECH_L_ZJ_ZJHC_DIRS[nd],["§7点击切换"]));
                if(KOMUTECH_L_ZJ_ZJHC_proj.containsKey(p)){
                    KOMUTECH_L_ZJ_ZJHC_remProj(p);
                    KOMUTECH_L_ZJ_ZJHC_spawnProj(loc,p,nd);
                }
            }
        }catch(ex){}
    }, plugin);
    Bukkit.getPluginManager().registerEvent(InventoryCloseEvent, KOMUTECH_L_ZJ_ZJHC_listener, EventPriority.NORMAL, (l, e) => {
        let p = e.getPlayer();
        if(KOMUTECH_L_ZJ_ZJHC_openPlayers.remove(p)) KOMUTECH_L_ZJ_ZJHC_coreMap.remove(p);
        if(KOMUTECH_L_ZJ_ZJHC_openPlayers.isEmpty()) KOMUTECH_L_ZJ_ZJHC_unregister();
    }, plugin);
    KOMUTECH_L_ZJ_ZJHC_registered = true;
}
function KOMUTECH_L_ZJ_ZJHC_onUse(e){
    try{
        let p = e.getPlayer();
        let opt = e.getClickedBlock();
        if(!opt || !opt.isPresent()) return;
        let loc = opt.get().getLocation();
        let sfid = StorageCacheUtils.getSfItem(loc)?.getId();
        if(!sfid) return;
        if(sfid===KOMUTECH_L_ZJ_ZJHC_CORE_ID){
            if(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_fx")===null) StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_fx","0");
            if(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_zt")===null) StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_zt","0");
            let state = parseInt(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_zt")||"0");
            let dir = parseInt(StorageCacheUtils.getData(loc,"KOMUTECH_L_ZJ_ZJHC_fx")||"0");
            KOMUTECH_L_ZJ_ZJHC_coreMap.put(p,loc);
            KOMUTECH_L_ZJ_ZJHC_openPlayers.add(p);
            KOMUTECH_L_ZJ_ZJHC_unregister();
            KOMUTECH_L_ZJ_ZJHC_registerListener();
            p.openInventory(KOMUTECH_L_ZJ_ZJHC_buildCoreMenu(state,dir));
        }
    }catch(ex){
        print("核心onUse错误: " + ex);
        if(ex.printStackTrace) ex.printStackTrace();
    }
}
function KOMUTECH_L_ZJ_ZJHC_onBreak(e,it,drops){
    try{
        let loc = e.getBlock().getLocation();
        let sfid = StorageCacheUtils.getSfItem(loc)?.getId();
        if(sfid===KOMUTECH_L_ZJ_ZJHC_CORE_ID){
            StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_zt",null);
            StorageCacheUtils.setData(loc,"KOMUTECH_L_ZJ_ZJHC_fx",null);
            let coreKey = KOMUTECH_L_ZJ_ZJHC_getLocationKey(e.getBlock());
            let world = loc.getWorld();
            world.getEntities().forEach(entity => {
                if(entity instanceof ItemDisplay || entity instanceof TextDisplay){
                    let pdc = entity.getPersistentDataContainer();
                    if(pdc.has(KOMUTECH_L_ZJ_ZJHC_CORE_PROJ_KEY, PersistentDataType.STRING) && pdc.get(KOMUTECH_L_ZJ_ZJHC_CORE_PROJ_KEY, PersistentDataType.STRING)===coreKey) entity.remove();
                }
            });
            let iter = KOMUTECH_L_ZJ_ZJHC_proj.entrySet().iterator();
            while(iter.hasNext()){
                let entry = iter.next();
                if(entry.getValue().coreKey===coreKey){
                    entry.getValue().entities.forEach(e => {try{e.remove()}catch(ex){}});
                    iter.remove();
                }
            }
        }else if(sfid===KOMUTECH_L_ZJ_ZJHC_PROCESSOR_ID){
            let core = loc.clone().add(0,-1,0);
            StorageCacheUtils.setData(core,"KOMUTECH_L_ZJ_ZJHC_zt","0");
        }
    }catch(ex){
        print("核心onBreak错误: " + ex);
        if(ex.printStackTrace) ex.printStackTrace();
    }
}
function onUse(e){ try{ KOMUTECH_L_ZJ_ZJHC_onUse(e); }catch(ex){ if(ex.message && ex.message.includes("Context is already closed")) return; else print("核心onUse错误: "+ex); } }
function onBreak(e,it,drops){ try{ KOMUTECH_L_ZJ_ZJHC_onBreak(e,it,drops); }catch(ex){ if(ex.message && ex.message.includes("Context is already closed")) return; else print("核心onBreak错误: "+ex); } }