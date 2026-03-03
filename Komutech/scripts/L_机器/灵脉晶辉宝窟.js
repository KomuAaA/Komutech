const CHANCE = 5;
const OUTPUT_IDS = ["KOMUTECH_L_KW_PP","KOMUTECH_L_KW_JYY","KOMUTECH_L_KW_ZMY","KOMUTECH_L_KW_LSY","KOMUTECH_L_KW_YHY","KOMUTECH_L_KW_YTY"];
const DURABILITY_PER = 1;
const PICKAXE_DURABILITY = 2040;
const STACK_LIMIT = 64;
const COOLDOWN = 500;
const COOLDOWN_MSG = "§c操作太频繁，请稍后再试";

const Material = Java.type("org.bukkit.Material");
const ItemStack = Java.type("org.bukkit.inventory.ItemStack");
const SlimefunItem = Java.type("io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem");
const ThreadLocalRandom = Java.type("java.util.concurrent.ThreadLocalRandom");
const HashMap = Java.type("java.util.HashMap");

const WORK = 40;
const PICKAXE_SLOT = 53;
const OUTPUT_SLOTS = [46,47,48,49,50,51,52];
const STONE_SLOTS = [];
for (let i = 0; i <= 35; i++) STONE_SLOTS.push(i);

const cooldowns = new HashMap();
const rewardCache = {};
for (const id of OUTPUT_IDS) {
    const sf = SlimefunItem.getById(id);
    if (sf) rewardCache[id] = sf;
}

function onOpen(p){}
function onClose(p){ cooldowns.remove(p.getUniqueId()); }

function onClick(p,s,si,ca){
    if (!checkCooldown(p)) return;
    if (s === WORK) {
        if (ca.isRightClicked() && !ca.isShiftClicked()) { autoMine(p); return; }
        if (ca.isShiftClicked() && !ca.isRightClicked()) { refill(p); return; }
    }
    if (STONE_SLOTS.includes(s)) mine(p,s);
}

function checkCooldown(p){
    const now = Date.now(), last = cooldowns.get(p.getUniqueId());
    if (last && now - last < COOLDOWN) { p.sendMessage(COOLDOWN_MSG); return false; }
    cooldowns.put(p.getUniqueId(), now);
    return true;
}

function stoneItem(){ const s=new ItemStack(Material.STONE,1), m=s.getItemMeta(); m.setDisplayName("§f点击挖掘"); s.setItemMeta(m); return s; }
function glassItem(){ const g=new ItemStack(Material.LIGHT_GRAY_STAINED_GLASS_PANE,1), m=g.getItemMeta(); m.setDisplayName(" "); g.setItemMeta(m); return g; }
function isGlass(it){ return it && it.getType()===Material.LIGHT_GRAY_STAINED_GLASS_PANE && it.getItemMeta()?.getDisplayName().trim()===""; }

function getReward(){
    const id = OUTPUT_IDS[Math.floor(Math.random()*OUTPUT_IDS.length)];
    const sf = rewardCache[id];
    return sf ? sf.getItem().clone() : null;
}

function getSfId(item){ const sf=SlimefunItem.getByItem(item); return sf?sf.getId():null; }

function placeReward(inv, rwd){
    const rid = getSfId(rwd);
    for (const slot of OUTPUT_SLOTS) {
        const ex = inv.getItem(slot);
        if (!ex) { inv.setItem(slot, rwd); return true; }
        if (ex.getType() === rwd.getType()) {
            const eid = getSfId(ex);
            if ((eid && rid && eid===rid) || (!eid && !rid)) {
                if (ex.getAmount() < STACK_LIMIT) { ex.setAmount(ex.getAmount()+1); return true; }
            }
        }
    }
    return false;
}

function refill(p){
    const inv = p.getOpenInventory().getTopInventory();
    for (const slot of STONE_SLOTS) {
        const it = inv.getItem(slot);
        if (!it || isGlass(it)) inv.setItem(slot, stoneItem());
    }
}

function autoMine(p){
    try {
        const inv = p.getOpenInventory().getTopInventory();
        const pick = inv.getItem(PICKAXE_SLOT);
        if (!pick || pick.getType() !== Material.NETHERITE_PICKAXE) { p.sendMessage("§c需要下界合金镐！"); return; }
        const meta = pick.getItemMeta();
        const curDmg = meta.hasDamage() ? meta.getDamage() : 0;
        const remain = PICKAXE_DURABILITY - curDmg;
        if (remain < DURABILITY_PER) { inv.setItem(PICKAXE_SLOT, null); p.sendMessage("§c工具耐久已耗尽！"); return; }

        let mined = 0, full = false;
        for (const slot of STONE_SLOTS) {
            if (full) break;
            const stack = inv.getItem(slot);
            if (!stack || stack.getType() !== Material.STONE) continue;
            let amt = stack.getAmount(), minedHere = 0;
            while (amt > 0) {
                if ((mined + minedHere) * DURABILITY_PER >= remain) break;
                minedHere++; amt--;
                if (ThreadLocalRandom.current().nextInt(100) < CHANCE) {
                    const rwd = getReward();
                    if (rwd && !placeReward(inv, rwd)) { full = true; minedHere--; amt++; break; }
                }
                if (full) break;
            }
            if (amt > 0) stack.setAmount(amt); else inv.setItem(slot, glassItem());
            mined += minedHere;
        }

        if (mined > 0) {
            const newDmg = curDmg + mined * DURABILITY_PER;
            if (newDmg >= PICKAXE_DURABILITY) inv.setItem(PICKAXE_SLOT, null);
            else { meta.setDamage(newDmg); pick.setItemMeta(meta); }
        }
        if (full) p.sendMessage("§c输出槽位已满");
    } catch (e) { p.sendMessage("§c自动挖掘出错！"); }
}

function mine(p, s){
    const inv = p.getOpenInventory().getTopInventory();
    const stack = inv.getItem(s);
    if (!stack || stack.getType() !== Material.STONE) return;
    if (stack.getAmount() > 1) stack.setAmount(stack.getAmount()-1);
    else inv.setItem(s, glassItem());
    if (ThreadLocalRandom.current().nextInt(100) < CHANCE) {
        const rwd = getReward();
        if (rwd && !placeReward(inv, rwd)) p.sendMessage("§c输出槽位已满");
    }
}