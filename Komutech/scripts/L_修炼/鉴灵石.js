const Bukkit = Java.type('org.bukkit.Bukkit');
const Location = Java.type('org.bukkit.Location');
const Material = Java.type('org.bukkit.Material');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const InvClick = Java.type('org.bukkit.event.inventory.InventoryClickEvent');
const InvClose = Java.type('org.bukkit.event.inventory.InventoryCloseEvent');
const EventPriority = Java.type('org.bukkit.event.EventPriority');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const StorageCacheUtils = Java.type('com.xzavier0722.mc.plugin.slimefun4.storage.util.StorageCacheUtils');
const Files = Java.type('java.nio.file.Files');
const Paths = Java.type('java.nio.file.Paths');
const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
const plugin = Java.type('org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer').INSTANCE;
const TextDisplay = Java.type('org.bukkit.entity.TextDisplay');
const ItemDisplay = Java.type('org.bukkit.entity.ItemDisplay');
const Display = Java.type('org.bukkit.entity.Display');
const Transformation = Java.type('org.bukkit.util.Transformation');
const Vector3f = Java.type('org.joml.Vector3f');
const AxisAngle4f = Java.type('org.joml.AxisAngle4f');
const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const PersistentDataType = Java.type('org.bukkit.persistence.PersistentDataType');
const Runnable = Java.type('java.lang.Runnable');
const BlockBreakEvent = Java.type('org.bukkit.event.block.BlockBreakEvent');
const STORAGE_PREFIX = "KOMUTECH_L_X_JLS_";
const PROJ_NAMESPACE = "komutech_x_jls";
const PROJ_KEY_NAME = "jlsproj";
const GUI_TITLE = "§6鉴灵石核心";
const DATA_DIR_PATH = "plugins/RykenSlimefunCustomizer/addon_configs/Komutech/玩家属性";
const CORE_ID = "KOMUTECH_L_X_鉴灵石核心";
const TRIGGER_IDS = ["KOMUTECH_L_X_鉴灵石框架", "KOMUTECH_L_X_鉴灵石框架板"];
const ALLOWED_CLUSTERS = ["KOMUTECH_L_DJ_JPLJ", "KOMUTECH_L_DJ_XPLJ", "KOMUTECH_L_DJ_ZPLJ", "KOMUTECH_L_DJ_SPLJ"];
const COOLDOWN_MS = 10000;
const TOTAL_TICKS = 200;
const TRAIL_POINTS = 16;
const TRAIL_INIT_RADIUS = 3.0;
const TRAIL_RADIUS_AMP = 0.5;
const TRAIL_HEIGHT_AMP = 1.5;
const PROJ_KEY = new NamespacedKey(PROJ_NAMESPACE, PROJ_KEY_NAME);
const ROTATION_SPEED = 2.5;
const HEIGHT_OSCILLATION_SPEED = 0.8;
const RADIUS_OSCILLATION_SPEED = 0.3;
const HOLOGRAM_OFFSET = 3;
const HOLOGRAM_Y = 4;
const ANIMATION_INTERVAL = 3;
const MIN_QUALITY = 0.01;
const CENTER_Y_OFFSET = 4;
const SOUND_Y_OFFSET = 4;
const PARTICLE_BASE_SIZE = 1;
const PARTICLE_SIZE_MULTIPLIER = 3;
const PARTICLE_BASE_COUNT = 2;
const PARTICLE_COUNT_MULTIPLIER = 6;
const START_SOUND = "block.note_block.pling";
const END_SOUND = "block.beacon.activate";
const CLUSTER_POSITIONS = [{x:-3,y:2,z:-3},{x:-3,y:2,z:3},{x:3,y:2,z:-3},{x:3,y:2,z:3}];
const STRUCTURE = [
{x:0,y:0,z:0,m:"SHROOMLIGHT",sfid:CORE_ID},{x:-3,y:2,z:-3,d:1},{x:-3,y:2,z:3,d:1},{x:3,y:2,z:-3,d:1},{x:3,y:2,z:3,d:1},
{x:-1,y:3,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:-1,y:3,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:-1,y:3,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:0,y:3,z:-1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:0,y:3,z:1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},
{x:1,y:3,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:1,y:3,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:1,y:3,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:-1,y:4,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:-1,y:4,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:-1,y:4,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:0,y:4,z:-1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:0,y:4,z:1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},
{x:1,y:4,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:1,y:4,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:1,y:4,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:-1,y:5,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:-1,y:5,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:-1,y:5,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:0,y:5,z:-1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:0,y:5,z:1,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},
{x:1,y:5,z:-1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},{x:1,y:5,z:0,m:"LIGHT_BLUE_STAINED_GLASS",sfid:"KOMUTECH_L_X_鉴灵石框架"},{x:1,y:5,z:1,m:"LIGHT_BLUE_STAINED_GLASS_PANE",sfid:"KOMUTECH_L_X_鉴灵石框架板"},
{x:-3,y:0,z:-3,m:"ANDESITE_WALL"},{x:-3,y:0,z:-2,m:"POLISHED_ANDESITE_SLAB"},{x:-3,y:0,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:-3,y:0,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:-3,y:0,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:-3,y:0,z:2,m:"POLISHED_ANDESITE_SLAB"},{x:-3,y:0,z:3,m:"ANDESITE_WALL"},
{x:-2,y:0,z:-3,m:"POLISHED_ANDESITE_SLAB"},{x:-2,y:0,z:-2,m:"DIORITE"},{x:-2,y:0,z:-1,m:"ANDESITE"},{x:-2,y:0,z:0,m:"POLISHED_ANDESITE"},{x:-2,y:0,z:1,m:"ANDESITE"},{x:-2,y:0,z:2,m:"DIORITE"},{x:-2,y:0,z:3,m:"POLISHED_ANDESITE_SLAB"},
{x:-1,y:0,z:-3,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:0,z:-2,m:"ANDESITE"},{x:-1,y:0,z:-1,m:"ANDESITE_SLAB"},{x:-1,y:0,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:0,z:1,m:"ANDESITE_SLAB"},{x:-1,y:0,z:2,m:"ANDESITE"},{x:-1,y:0,z:3,m:"POLISHED_ANDESITE_STAIRS"},
{x:0,y:0,z:-3,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:0,z:-2,m:"POLISHED_ANDESITE"},{x:0,y:0,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:0,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:0,z:2,m:"POLISHED_ANDESITE"},{x:0,y:0,z:3,m:"POLISHED_ANDESITE_STAIRS"},
{x:1,y:0,z:-3,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:0,z:-2,m:"ANDESITE"},{x:1,y:0,z:-1,m:"ANDESITE_SLAB"},{x:1,y:0,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:0,z:1,m:"ANDESITE_SLAB"},{x:1,y:0,z:2,m:"ANDESITE"},{x:1,y:0,z:3,m:"POLISHED_ANDESITE_STAIRS"},
{x:2,y:0,z:-3,m:"POLISHED_ANDESITE_SLAB"},{x:2,y:0,z:-2,m:"DIORITE"},{x:2,y:0,z:-1,m:"ANDESITE"},{x:2,y:0,z:0,m:"POLISHED_ANDESITE"},{x:2,y:0,z:1,m:"ANDESITE"},{x:2,y:0,z:2,m:"DIORITE"},{x:2,y:0,z:3,m:"POLISHED_ANDESITE_SLAB"},
{x:3,y:0,z:-3,m:"ANDESITE_WALL"},{x:3,y:0,z:-2,m:"POLISHED_ANDESITE_SLAB"},{x:3,y:0,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:3,y:0,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:3,y:0,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:3,y:0,z:2,m:"POLISHED_ANDESITE_SLAB"},{x:3,y:0,z:3,m:"ANDESITE_WALL"},
{x:-3,y:1,z:-3,m:"CHISELED_TUFF"},{x:-3,y:1,z:3,m:"CHISELED_TUFF"},{x:3,y:1,z:-3,m:"CHISELED_TUFF"},{x:3,y:1,z:3,m:"CHISELED_TUFF"},
{x:-1,y:2,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:2,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:2,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:2,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:2,z:0,m:"SEA_LANTERN"},{x:0,y:2,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:2,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:2,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:2,z:-1,m:"POLISHED_ANDESITE_STAIRS"},
{x:0,y:3,z:0,m:"BLUE_STAINED_GLASS"},{x:0,y:4,z:0,m:"BLUE_STAINED_GLASS"},{x:0,y:5,z:0,m:"BLUE_STAINED_GLASS"},
{x:-1,y:6,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:6,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:-1,y:6,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:6,z:-1,m:"POLISHED_ANDESITE_STAIRS"},{x:0,y:6,z:0,m:"SEA_LANTERN"},{x:0,y:6,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:6,z:1,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:6,z:0,m:"POLISHED_ANDESITE_STAIRS"},{x:1,y:6,z:-1,m:"POLISHED_ANDESITE_STAIRS"},
{x:0,y:7,z:0,m:"GRINDSTONE"},{x:0,y:8,z:0,m:"END_ROD"}
];
const DIRS = ["§f北","§f东","§f南","§f西"];
function hexToColor(h) { let r=parseInt(h.substring(1,3),16),g=parseInt(h.substring(3,5),16),b=parseInt(h.substring(5,7),16); return Color.fromRGB(r,g,b); }
const BASE_COLORS = {"金":hexToColor("#ffd700"),"木":hexToColor("#00ff00"),"水":hexToColor("#0096ff"),"火":hexToColor("#ff0000"),"土":hexToColor("#8b4513")};
const MUTATED_COLORS = {"雷":hexToColor("#aa00ff"),"风":hexToColor("#00ffff"),"冰":hexToColor("#00bfff"),"光":hexToColor("#ffffff"),"暗":hexToColor("#000000")};
const MUTATION_MAP = {"雷":"金","风":"木","冰":"水","光":"火","暗":"土"};
const ALL_ELEMENTS = ["金","木","水","火","土"];
let cooldowns = new java.util.HashMap();
let projMap = new java.util.HashMap();
let openPlayers = new java.util.HashSet();
let coreMap = new java.util.HashMap();
let registered = false;
let listener = null;
let processing = false;
let processingCores = new java.util.HashMap();
function savePlayerData(playerName, data) {
    let path = Paths.get(DATA_DIR_PATH, '[' + playerName + '].json');
    try {
        let parent = path.getParent();
        if (!Files.exists(parent)) Files.createDirectories(parent);
        Files.writeString(path, JSON.stringify(data, null, 2), StandardCharsets.UTF_8);
        return true;
    } catch (e) { return false; }
}
function getLocationKey(b) { return b.getWorld().getName() + "," + b.getX() + "," + b.getY() + "," + b.getZ(); }
function rot(x, z, d) { switch(d) { case 0: return {x,z}; case 1: return {x:-z,z:x}; case 2: return {x:-x,z:-z}; case 3: return {x:z,z:-x}; default: return {x,z}; } }
function getState(loc) { return parseInt(StorageCacheUtils.getData(loc, STORAGE_PREFIX + "zt") || "0"); }
function getDir(loc) { return parseInt(StorageCacheUtils.getData(loc, STORAGE_PREFIX + "fx") || "0"); }
function checkAndGetBlocks(core, dir) {
    let w = core.getWorld(), err = [], blk = [];
    for (let b of STRUCTURE) {
        let r = rot(b.x, b.z, dir), x = core.getX() + r.x, y = core.getY() + b.y, z = core.getZ() + r.z, block = w.getBlockAt(x, y, z), entry = {x, y, z, m: b.m, sfid: b.sfid, dynamic: b.d};
        blk.push(entry);
        if (b.d) {
            let id = StorageCacheUtils.getSfItem(block.getLocation())?.getId();
            if (!id || !ALLOWED_CLUSTERS.includes(id)) { err.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要聚灵簇`); return {valid: false, errors: err, blocks: blk}; }
            entry.sfid = id;
        } else {
            if (block.getType().name().toLowerCase() !== b.m.toLowerCase()) { err.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要 ${b.m}`); return {valid: false, errors: err, blocks: blk}; }
            if (b.sfid) {
                let id = StorageCacheUtils.getSfItem(block.getLocation())?.getId();
                if (!id || id !== b.sfid) { err.push(`位置 (${x-core.getX()},${y-core.getY()},${z-core.getZ()}) 需要 ${b.sfid}`); return {valid: false, errors: err, blocks: blk}; }
            }
        }
    }
    return {valid: true, errors: err, blocks: blk};
}
function fullCheck(core, dir) { return checkAndGetBlocks(core, dir); }
function consumeClusters(coreLoc, player) {
    let w = coreLoc.getWorld();
    for (let p of CLUSTER_POSITIONS) {
        let b = w.getBlockAt(coreLoc.getX() + p.x, coreLoc.getY() + p.y, coreLoc.getZ() + p.z), id = StorageCacheUtils.getSfItem(b.getLocation())?.getId();
        if (!id || !ALLOWED_CLUSTERS.includes(id)) continue;
        let consume = false;
        if (id === "KOMUTECH_L_DJ_XPLJ") consume = true;
        else if (id === "KOMUTECH_L_DJ_ZPLJ") consume = Math.random() < 0.6;
        else if (id === "KOMUTECH_L_DJ_SPLJ") consume = Math.random() < 0.3;
        if (consume) {
            let ev = new BlockBreakEvent(b, player);
            ev.setDropItems(false);
            Bukkit.getPluginManager().callEvent(ev);
            b.setType(Material.AIR);
        }
    }
}
function interpolateColor(c1, c2, t) { return Color.fromRGB(Math.floor(c1.getRed()+(c2.getRed()-c1.getRed())*t), Math.floor(c1.getGreen()+(c2.getGreen()-c1.getGreen())*t), Math.floor(c1.getBlue()+(c2.getBlue()-c1.getBlue())*t)); }
function startEffect(coreLoc, activeElements, qualityValues, onComplete) {
    let w = coreLoc.getWorld(), center = coreLoc.clone().add(0.5, 0.5, 0.5), qualityMap = new java.util.HashMap();
    for (let i = 0; i < activeElements.length; i++) qualityMap.put(activeElements[i], qualityValues[i]);
    let trails = [];
    for (let idx = 0; idx < ALL_ELEMENTS.length; idx++) {
        let el = ALL_ELEMENTS[idx], mutatedEl = activeElements.find(e => MUTATION_MAP[e] === el), active = activeElements.includes(el);
        let quality = active ? qualityMap.get(el) : (mutatedEl ? qualityMap.get(mutatedEl) : 0);
        let sz = PARTICLE_BASE_SIZE + PARTICLE_SIZE_MULTIPLIER * quality, cnt = Math.max(1, Math.floor((PARTICLE_BASE_COUNT + PARTICLE_COUNT_MULTIPLIER * quality) + 0.5));
        let angleOffset = (idx * 2 * Math.PI / ALL_ELEMENTS.length);
        let baseColor = BASE_COLORS[el], mutatedColor = mutatedEl ? MUTATED_COLORS[mutatedEl] : null;
        trails.push({active: active || mutatedEl !== undefined, sz, cnt, angleOffset, baseColor, mutatedColor, effectiveQuality: quality});
    }
    let t = 0, taskId;
    let runnable = new (Java.extend(Runnable, {
        run: function() {
            if (t > TOTAL_TICKS) {
                Bukkit.getScheduler().cancelTask(taskId);
                w.playSound(coreLoc.clone().add(0, SOUND_Y_OFFSET, 0), END_SOUND, 1, 1);
                if (onComplete) onComplete();
                return;
            }
            let progress = t / TOTAL_TICKS, time = t / 20.0;
            for (let tr of trails) {
                let radius = TRAIL_INIT_RADIUS * (1 - progress), sz = tr.sz;
                if (tr.effectiveQuality === 0) radius *= (1 - progress);
                if (radius < 0.05) continue;
                let height = CENTER_Y_OFFSET + Math.sin(time * HEIGHT_OSCILLATION_SPEED + tr.angleOffset) * TRAIL_HEIGHT_AMP * (1 - progress);
                let color = tr.baseColor;
                if (tr.mutatedColor) {
                    let tColor = 0;
                    if (progress > 0.1) tColor = Math.min(1, (progress - 0.1) / 0.15);
                    color = interpolateColor(tr.baseColor, tr.mutatedColor, tColor);
                }
                for (let pt = 0; pt < TRAIL_POINTS; pt++) {
                    let off = pt * 0.05, tt = time + off;
                    let rCurr = radius + Math.sin(tt * RADIUS_OSCILLATION_SPEED) * TRAIL_RADIUS_AMP * (1 - progress);
                    let hCurr = height + Math.sin(tt * HEIGHT_OSCILLATION_SPEED) * TRAIL_HEIGHT_AMP * (1 - progress) * 0.5;
                    let angle = tt * ROTATION_SPEED + tr.angleOffset;
                    let x = center.getX() + rCurr * Math.cos(angle), z = center.getZ() + rCurr * Math.sin(angle), y = coreLoc.getY() + hCurr;
                    let loc = new Location(w, x, y, z), cnt = tr.cnt;
                    if (tr.effectiveQuality === 0) cnt = Math.max(1, Math.floor(cnt * (1 - progress)));
                    for (let i = 0; i < cnt; i++) w.spawnParticle(Particle.DUST, loc, 1, 0, 0, 0, 0, new DustOptions(color, sz));
                }
            }
            let cnt = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < cnt; i++) {
                let offX = (Math.random() - 0.5) * 8, offZ = (Math.random() - 0.5) * 8, yOff = Math.random() * 5, loc = center.clone().add(offX, yOff, offZ);
                w.spawnParticle(Particle.END_ROD, loc, 0, (Math.random() - 0.5) * 0.2, 0.1 + Math.random() * 0.4, (Math.random() - 0.5) * 0.2, 0.5);
            }
            t++;
        }
    }));
    taskId = Bukkit.getScheduler().runTaskTimer(plugin, runnable, 0, 1).getTaskId();
}
function showHologram(coreLoc, player, linggenStr, coreKey) {
    let w = coreLoc.getWorld(), pl = player.getLocation(), dx = pl.getX() - coreLoc.getX(), dz = pl.getZ() - coreLoc.getZ(), ox = 0, oz = 0;
    if (Math.abs(dx) >= Math.abs(dz)) ox = dx >= 0 ? HOLOGRAM_OFFSET : -HOLOGRAM_OFFSET;
    else oz = dz >= 0 ? HOLOGRAM_OFFSET : -HOLOGRAM_OFFSET;
    let pos = coreLoc.clone().add(ox, HOLOGRAM_Y, oz), td = w.spawn(pos, TextDisplay.class);
    td.setText(""); td.setBackgroundColor(Color.fromARGB(0,0,0,0)); td.setSeeThrough(true); td.setDefaultBackground(false);
    td.setBillboard(Display.Billboard.CENTER); td.setViewRange(20); td.setGravity(false); td.setInvulnerable(true);
    td.setTransformation(new Transformation(new Vector3f(0,0,0), new AxisAngle4f(0,0,1,0), new Vector3f(2,2,2), new AxisAngle4f(0,0,1,0)));
    td.getPersistentDataContainer().set(PROJ_KEY, PersistentDataType.STRING, coreKey);
    let prefix = "§f§l你的灵根为：", suffix = "§6§l" + linggenStr, chars = suffix.split("");
    td.setText(prefix);
    function typeWriter(idx) {
        if (idx >= chars.length) { runLater(() => { if (!td.isDead()) td.remove(); }, TOTAL_TICKS); return; }
        td.setText(prefix + suffix.substring(0, idx + 1));
        runLater(() => typeWriter(idx + 1), ANIMATION_INTERVAL);
    }
    typeWriter(0);
}
function isOnCooldown(p) { let n = Date.now(), u = p.getUniqueId().toString(), l = cooldowns.get(u); if (l && n - l < COOLDOWN_MS) return true; cooldowns.put(u, n); return false; }
function remProjForPlayer(p) { let o = projMap.get(p); if (o) { o.entities.forEach(e => { try { e.remove(); } catch (ex) {} }); projMap.remove(p); } }
function spawnProj(core, player, dir) {
    remProjForPlayer(player);
    let w = core.getWorld(), ents = [], ck = getLocationKey(core);
    for (let b of STRUCTURE) {
        let r = rot(b.x, b.z, dir), x = core.getX() + r.x, y = core.getY() + b.y, z = core.getZ() + r.z, item = null, dn = null;
        if (b.d) {
            let sf = getSfItemById("KOMUTECH_L_DJ_JPLJ");
            if (sf) { item = sf.getItem().clone(); let m = item.getItemMeta(); dn = m.hasDisplayName() ? m.getDisplayName() : item.getType().name().toLowerCase().replace('_', ' '); }
            else { item = new ItemStack(Material.AMETHYST_CLUSTER); dn = "紫水晶簇"; }
        } else if (b.sfid) {
            let sf = getSfItemById(b.sfid);
            if (sf) { item = sf.getItem().clone(); let m = item.getItemMeta(); dn = m.hasDisplayName() ? m.getDisplayName() : item.getType().name().toLowerCase().replace('_', ' '); }
        }
        if (!item) { let m = Material.getMaterial(b.m); if (m && m.isItem()) item = new ItemStack(m); else continue; }
        let loc = new Location(w, x + 0.5, y + 0.5, z + 0.5), d = w.spawn(loc, ItemDisplay.class);
        d.setItemStack(item); d.setTransformation(new Transformation(new Vector3f(0,0,0), new AxisAngle4f(0,0,1,0), new Vector3f(0.6,0.6,0.6), new AxisAngle4f(0,0,1,0)));
        d.setGlowing(true); d.setGlowColorOverride(Color.fromARGB(128,255,255,255)); d.setBrightness(new Display.Brightness(15,15));
        d.setViewRange(100); d.setGravity(false); d.setInvulnerable(true);
        d.getPersistentDataContainer().set(PROJ_KEY, PersistentDataType.STRING, ck);
        ents.push(d);
        if (dn) {
            let tl = loc.clone().add(0, 0.8, 0), t = w.spawn(tl, TextDisplay.class);
            t.setText(dn); t.setAlignment(Java.type('org.bukkit.entity.TextDisplay$TextAlignment').CENTER);
            t.setBackgroundColor(Color.fromARGB(0,0,0,0)); t.setSeeThrough(true); t.setDefaultBackground(false);
            t.setBillboard(Java.type('org.bukkit.entity.Display$Billboard').CENTER); t.setViewRange(50); t.setGravity(false); t.setInvulnerable(true);
            t.getPersistentDataContainer().set(PROJ_KEY, PersistentDataType.STRING, ck);
            ents.push(t);
        }
    }
    projMap.put(player, {coreKey: ck, entities: ents});
}
function item(m, n, l) { let mat = Material[m] || Material.getMaterial(m) || Material.STONE, i = new ItemStack(mat), me = i.getItemMeta(); me.setDisplayName(n); if (l) me.setLore(Array.isArray(l) ? l : [l]); i.setItemMeta(me); return i; }
function buildCoreMenu(s, dir) {
    let inv = Bukkit.createInventory(null, 9, GUI_TITLE), sn, sl;
    if (s === 1) { sn = "§a● 已激活"; sl = ["§7运行中"]; }
    else { sn = "§c○ 未激活"; sl = ["§7点击启动检测激活"]; }
    inv.setItem(4, item("PAINTING", sn, sl));
    inv.setItem(0, item("ENDER_PEARL", "§b投影", ["§7开启/关闭"]));
    inv.setItem(1, item("EMERALD_BLOCK", "§a启动", ["§7验证并激活"]));
    inv.setItem(3, item("COMPASS", "§b方向: " + DIRS[dir], ["§7点击切换"]));
    if (s === 1) inv.setItem(2, item("REDSTONE_BLOCK", "§c停止", ["§7停止机器"]));
    inv.setItem(8, item("BARRIER", "§c关闭", []));
    return inv;
}
function unregisterListener() { if (listener) { try { InvClick.getHandlerList().unregister(listener); } catch (e) {} try { InvClose.getHandlerList().unregister(listener); } catch (e) {} listener = null; registered = false; } }
function registerListener() {
    if (registered) return;
    let L = Java.extend(Java.type('org.bukkit.event.Listener'), {});
    listener = new L();
    Bukkit.getPluginManager().registerEvent(InvClick, listener, EventPriority.NORMAL, (l, e) => {
        try {
            let p = e.getWhoClicked();
            if (!openPlayers.contains(p) || e.getInventory().getTitle() !== GUI_TITLE) return;
            e.setCancelled(true);
            let slot = e.getSlot(), it = e.getCurrentItem();
            if (!it || it.getType() === Material.AIR) return;
            let loc = coreMap.get(p);
            if (!loc) return;
            let state = getState(loc), dir = getDir(loc);
            if (slot === 8) { p.closeInventory(); }
            else if (slot === 0) {
                let has = false;
                if (projMap.containsKey(p)) { let o = projMap.get(p); if (o.entities && o.entities.length > 0) { try { if (!o.entities[0].isDead()) has = true; } catch (ex) {} } if (!has) projMap.remove(p); }
                if (has) { remProjForPlayer(p); e.getInventory().setItem(0, item("ENDER_PEARL", "§b投影", ["§7开启/关闭"])); }
                else { spawnProj(loc, p, dir); e.getInventory().setItem(0, item("ENDER_PEARL", "§a投影已开启", ["§7点击关闭"])); }
            } else if (slot === 1) {
                if (projMap.containsKey(p)) { remProjForPlayer(p); e.getInventory().setItem(0, item("ENDER_PEARL", "§b投影", ["§7开启/关闭"])); }
                let chk = fullCheck(loc, dir);
                if (chk.valid) {
                    StorageCacheUtils.setData(loc, STORAGE_PREFIX + "zt", "1");
                    let ck = getLocationKey(loc), w = loc.getWorld(), {blocks} = checkAndGetBlocks(loc, dir);
                    for (let b of blocks) if (TRIGGER_IDS.includes(b.sfid)) StorageCacheUtils.setData(w.getBlockAt(b.x, b.y, b.z).getLocation(), STORAGE_PREFIX + "core", ck);
                    p.sendMessage("§a激活成功！");
                } else { StorageCacheUtils.setData(loc, STORAGE_PREFIX + "zt", "0"); p.sendMessage("§c结构错误: " + (chk.errors[0] || "未知错误")); }
                p.closeInventory();
            } else if (slot === 2 && state === 1) {
                StorageCacheUtils.setData(loc, STORAGE_PREFIX + "zt", "0");
                let w = loc.getWorld(), {blocks} = checkAndGetBlocks(loc, getDir(loc));
                for (let b of blocks) if (TRIGGER_IDS.includes(b.sfid)) StorageCacheUtils.setData(w.getBlockAt(b.x, b.y, b.z).getLocation(), STORAGE_PREFIX + "core", null);
                remProjForPlayer(p); p.sendMessage("§c已停止"); p.closeInventory();
            } else if (slot === 3) {
                let nd = (dir + 1) % 4;
                StorageCacheUtils.setData(loc, STORAGE_PREFIX + "fx", nd.toString());
                e.getInventory().setItem(3, item("COMPASS", "§b方向: " + DIRS[nd], ["§7点击切换"]));
                if (projMap.containsKey(p)) { remProjForPlayer(p); spawnProj(loc, p, nd); }
            }
        } catch (ex) { print("核心点击错误: " + ex); }
    }, plugin);
    Bukkit.getPluginManager().registerEvent(InvClose, listener, EventPriority.NORMAL, (l, e) => { let p = e.getPlayer(); if (openPlayers.remove(p)) coreMap.remove(p); if (openPlayers.isEmpty()) unregisterListener(); }, plugin);
    registered = true;
}
function genQuality(elements, total) { let min = MIN_QUALITY * elements.length; if (total < min) total = min; let rem = total - min, rands = [], sum = 0; for (let i = 0; i < elements.length; i++) { let r = Math.random(); rands.push(r); sum += r; } let q = []; for (let i = 0; i < elements.length; i++) q.push(MIN_QUALITY + (rands[i] / sum) * rem); for (let i = 0; i < q.length; i++) q[i] = Math.round(q[i] * 100) / 100; return q; }
function handleTriggerUse(e) {
    let p = e.getPlayer(), b = e.getClickedBlock();
    if (!b || !b.isPresent()) return;
    let bloc = b.get().getLocation(), sf = StorageCacheUtils.getSfItem(bloc);
    if (!sf || !TRIGGER_IDS.includes(sf.getId())) return;
    let path = Paths.get(DATA_DIR_PATH, '[' + p.getName() + '].json'), data = null;
    if (Files.exists(path)) { try { data = JSON.parse(Files.readString(path, StandardCharsets.UTF_8)); } catch (ex) {} }
    if (data && !data.定向) { p.sendMessage("§c你已经鉴别过了"); return; }
    if (isOnCooldown(p)) { p.sendActionBar("§c操作过快"); return; }
    let ck = StorageCacheUtils.getData(bloc, STORAGE_PREFIX + "core");
    if (!ck) { p.sendMessage("§c未找到核心标记"); return; }
    let parts = ck.split(",");
    if (parts.length !== 4) { p.sendMessage("§c核心坐标无效"); return; }
    let w = Bukkit.getWorld(parts[0]);
    if (!w) { p.sendMessage("§c世界不存在"); return; }
    let core = w.getBlockAt(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]));
    if (!core) { p.sendMessage("§c核心方块不存在"); return; }
    if (StorageCacheUtils.getData(core.getLocation(), STORAGE_PREFIX + "zt") !== "1") { p.sendMessage("§c核心未激活"); return; }
    let coreLoc = core.getLocation(), coreKey = getLocationKey(core);
    if (processingCores.get(coreKey)) { p.sendMessage("§c核心处理中"); return; }
    let chk = fullCheck(coreLoc, getDir(coreLoc));
    if (!chk.valid) { p.sendMessage("§c结构异常"); StorageCacheUtils.setData(coreLoc, STORAGE_PREFIX + "zt", "0"); return; }
    processingCores.put(coreKey, true);
    w.playSound(coreLoc.clone().add(0, SOUND_Y_OFFSET, 0), START_SOUND, 1, 1);
    let wuxing = 1 + Math.random() * 4, gengu = Math.floor(Math.random() * 10) + 1, elements, quality, total;
    if (data && data.定向) { elements = data.灵根.split("、"); total = data.总品质; quality = genQuality(elements, total); p.sendMessage("§d定向标记生效，灵根锁定为：" + elements.join("、")); }
    else {
        let cnt = Math.random(); cnt = cnt < 0.2 ? 1 : cnt < 0.4 ? 2 : cnt < 0.6 ? 3 : cnt < 0.8 ? 4 : 5;
        let idxs = []; while (idxs.length < cnt) { let r = Math.floor(Math.random() * 5); if (!idxs.includes(r)) idxs.push(r); }
        idxs.sort((a,b) => a - b); elements = idxs.map(i => ALL_ELEMENTS[i]);
        total = 0.1 + Math.random() * 0.9; quality = genQuality(elements, total); total = Math.round(total * 100) / 100;
    }
    let str = elements.join("、");
    showHologram(coreLoc, p, str, ck); p.sendMessage("§a开始检验");
    startEffect(coreLoc, elements, quality, () => {
        consumeClusters(coreLoc, p);
        let nd = {};
        nd.修为 = "『引气入体』"; nd.灵气 = "0/100"; nd.灵力 = "100/100"; nd.功德 = 0; nd.煞气 = 0;
        nd.悟性 = parseFloat(wuxing.toFixed(2)); nd.根骨 = gengu; nd.灵根 = elements.join("、");
        let attr = "";
        if (elements.length === 5) attr = "杂灵根";
        else if (elements.length === 4) attr = "四灵根";
        else if (elements.length === 3) attr = "三灵根";
        else if (elements.length === 2) attr = "双灵根";
        else if (elements.length === 1) { let isVariant = MUTATED_COLORS.hasOwnProperty(elements[0]); if (quality[0] > 0.9) { if (isVariant) attr = "变异灵根"; else attr = "天灵根"; } else attr = "单灵根"; }
        else attr = "单灵根";
        nd.灵根属性 = attr;
        let qm = {}; for (let i = 0; i < elements.length; i++) qm[elements[i]] = parseFloat(quality[i].toFixed(2));
        nd.灵根品质 = qm; nd.总品质 = parseFloat(total.toFixed(2));
        nd.血量 = Math.floor(Math.random() * 10) + 1; nd.攻击力 = Math.floor(Math.random() * 10) + 1;
        nd.防御力 = Math.floor(Math.random() * 10) + 1; nd.速度 = Math.floor(Math.random() * 10) + 1;
        nd.灵识 = 0; nd.属性点 = 5;
        savePlayerData(p.getName(), nd); p.sendMessage("§a完成");
        processingCores.remove(coreKey);
    });
}
function handleCoreUse(e) {
    if (processing) return;
    processing = true;
    try {
        let p = e.getPlayer(), opt = e.getClickedBlock();
        if (!opt || !opt.isPresent()) return;
        let loc = opt.get().getLocation(), sfid = StorageCacheUtils.getSfItem(loc)?.getId();
        if (!sfid) return;
        if (sfid === CORE_ID) {
            if (StorageCacheUtils.getData(loc, STORAGE_PREFIX + "fx") === null) StorageCacheUtils.setData(loc, STORAGE_PREFIX + "fx", "0");
            if (StorageCacheUtils.getData(loc, STORAGE_PREFIX + "zt") === null) StorageCacheUtils.setData(loc, STORAGE_PREFIX + "zt", "0");
            let state = getState(loc), dir = getDir(loc);
            coreMap.put(p, loc); openPlayers.add(p);
            unregisterListener(); registerListener();
            p.openInventory(buildCoreMenu(state, dir));
        }
    } catch (ex) { print("核心onUse错误: " + ex); } finally { processing = false; }
}
function onUse(e) { let opt = e.getClickedBlock(); if (opt && opt.isPresent()) { let sf = StorageCacheUtils.getSfItem(opt.get().getLocation()); if (sf) { let id = sf.getId(); if (id === CORE_ID) handleCoreUse(e); else if (TRIGGER_IDS.includes(id)) handleTriggerUse(e); } } }
function onBreak(e, it, drops) {
    let loc = e.getBlock().getLocation(), sfid = StorageCacheUtils.getSfItem(loc)?.getId();
    if (sfid === CORE_ID) {
        StorageCacheUtils.setData(loc, STORAGE_PREFIX + "zt", null); StorageCacheUtils.setData(loc, STORAGE_PREFIX + "fx", null);
        let ck = getLocationKey(e.getBlock()), w = loc.getWorld(), dir = getDir(loc), {blocks} = checkAndGetBlocks(loc, dir);
        for (let b of blocks) if (TRIGGER_IDS.includes(b.sfid)) StorageCacheUtils.setData(w.getBlockAt(b.x, b.y, b.z).getLocation(), STORAGE_PREFIX + "core", null);
        w.getEntities().forEach(e => { if ((e instanceof ItemDisplay || e instanceof TextDisplay) && e.getPersistentDataContainer().get(PROJ_KEY, PersistentDataType.STRING) === ck) e.remove(); });
        let iter = projMap.entrySet().iterator();
        while (iter.hasNext()) { let en = iter.next(); if (en.getValue().coreKey === ck) { en.getValue().entities.forEach(e => { try { e.remove(); } catch (ex) {} }); iter.remove(); } }
        processingCores.remove(ck);
    }
}