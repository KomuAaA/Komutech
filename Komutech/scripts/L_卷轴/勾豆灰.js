const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const CFG = {
    defaultLore: "§7未录取卷轴",
    unlockLore: "§a已录取卷轴：§e勾豆灰",
    baseEnergyCost: 100,
    maxEnergyCost: 1000,
    costTargetIncrease: 2.5,
    baseDamage: 10,
    profAddMin: 1,
    profAddMax: 10,
    cooldown: 60,
    coolDownReducePer100Prof: 3,
    maxCoolDownReduce: 90,
    maxDistance: 24,
    particleInterval: 0.1,
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    queDePenalty: 0.01,
    meritRange: { min:1, max:10 },
    levelMultiplier: { "黄":1, "玄":1.2, "地":1.5, "天":1.8 },
    profDamagePercentPer100: 0.05,
    particle: { startColor:{r:0,g:255,b:255}, endColor:{r:0,g:255,b:77}, size:5.0 },
    baseMaxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520
};

CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1;
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const cooldownMap = new java.util.HashMap();

const findAndUpdateLore = (item, keyword, newText) => {
    const meta = item.getItemMeta();
    if (!meta) return false;
    const lore = meta.getLore() || [];
    for (let i = 0; i < lore.length; i++) {
        if (lore[i]?.includes(keyword)) {
            lore[i] = newText;
            meta.setLore(lore);
            item.setItemMeta(meta);
            return true;
        }
    }
    return false;
};

const getLoreInfo = item => {
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const res = { level:"黄", energy:0, energyMax:2000, merit:0, bindState:"", prof:0, profMax:0 };
    lore.forEach((line,i) => {
        if (!line) return;
        if (i===0) {
            if (line.includes("天")) res.level="天";
            else if (line.includes("地")) res.level="地";
            else if (line.includes("玄")) res.level="玄";
        }
        if (line.includes("卷轴")) res.bindState=line;
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;
        if (line.includes("灵力剩余")) {
            res.energy = parseInt(nums[0].replace('§6','')) || 0;
            res.energyMax = parseInt(nums[1]?.replace('§6','') || 2000);
        } else if (line.includes("德值")) {
            const num = parseInt(nums[0].replace('§6','')) || 0;
            res.merit = line.includes("缺德值") ? -num : num;
        } else if (line.includes("熟练度")) {
            res.prof = parseInt(nums[0].replace('§6','')) || 0;
            res.profMax = parseInt(nums[1]?.replace('§6','') || 0);
        }
    });
    return res;
};

function onUse(event) {
    const p = event.getPlayer();
    const staff = p.getInventory().getItemInMainHand();
    const book = p.getInventory().getItemInOffHand();

    if (!staff?.getItemMeta() || !book?.getItemMeta()) {
        p.sendMessage("§4◆ §c[勾豆灰] §4◆ §c需主手法杖+副手卷轴！");
        return;
    }

    const staffInfo = getLoreInfo(staff);
    const bookInfo = getLoreInfo(book);

    if (!p.isSneaking()) {
        if (staffInfo.bindState !== CFG.unlockLore && 
            (staffInfo.bindState === CFG.defaultLore || staffInfo.bindState.startsWith("§a已录取卷轴"))) {
            findAndUpdateLore(staff, "卷轴", CFG.unlockLore);
            p.sendMessage("§2✦ §a[勾豆灰] §2✦ §a卷轴嵌杖成功！");
        }
        return;
    }

    if (staffInfo.bindState !== CFG.unlockLore) {
        p.sendMessage("§4✖ §c[勾豆灰] §4✖ §c法杖未绑定此卷轴！");
        return;
    }

    const uuid = p.getUniqueId().toString();
    const now = org.bukkit.Bukkit.getServer().getCurrentTick();
    const last = cooldownMap.get(uuid) || 0;
    const reduction = Math.min(Math.floor(bookInfo.prof/100)*CFG.coolDownReducePer100Prof, CFG.maxCoolDownReduce);
    const cd = Math.max(Math.floor(CFG.cooldown * (1 - reduction/100)), 1);
    if (now - last < cd) {
        p.sendMessage(`§c⚠ §4[勾豆灰] 冷却中！剩余 §6${((cd-(now-last))/20).toFixed(1)}秒`);
        return;
    }

    let dynamicCost = CFG.baseEnergyCost;
    if (staffInfo.merit > 0) {
        const increase = costMaxIncrease * (staffInfo.merit / (staffInfo.merit + CFG.costK));
        dynamicCost = Math.min(CFG.maxEnergyCost, Math.round(CFG.baseEnergyCost * (1 + increase)));
    }
    if (staffInfo.energy < dynamicCost) {
        p.sendMessage(`§c⚠ §4[勾豆灰] 灵力不足！需 §6${dynamicCost}`);
        return;
    }

    const levelBase = CFG.levelMultiplier[bookInfo.level] || 1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    let meritMult;
    if (staffInfo.merit >= 0) {
        const gain = (maxMulti-1) * (staffInfo.merit / (staffInfo.merit + CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(staffInfo.merit)/100) * CFG.queDePenalty);
    }
    const profBonus = 1 + Math.floor(bookInfo.prof/100) * CFG.profDamagePercentPer100;
    const damage = CFG.baseDamage * meritMult * profBonus;

    const world = p.getWorld();
    const eye = p.getEyeLocation();
    const dir = eye.getDirection();
    const start = eye.clone().add(dir);
    const Particle = Java.type('org.bukkit.Particle');
    const Color = Java.type('org.bukkit.Color');
    const startColor = Color.fromRGB(CFG.particle.startColor.r, CFG.particle.startColor.g, CFG.particle.startColor.b);
    const endColor = Color.fromRGB(CFG.particle.endColor.r, CFG.particle.endColor.g, CFG.particle.endColor.b);
    for (let d = 0; d <= CFG.maxDistance; d += 0.3) {
        const prog = d / CFG.maxDistance;
        const r = Math.round(startColor.getRed() + (endColor.getRed()-startColor.getRed())*prog);
        const g = Math.round(startColor.getGreen() + (endColor.getGreen()-startColor.getGreen())*prog);
        const b = Math.round(startColor.getBlue() + (endColor.getBlue()-startColor.getBlue())*prog);
        const pos = start.clone().add(dir.clone().multiply(d));
        world.spawnParticle(Particle.DUST, pos.getX(), pos.getY(), pos.getZ(), 1,0,0,0,0,
            new (Java.type('org.bukkit.Particle$DustOptions'))(Color.fromRGB(r,g,b), CFG.particle.size));
    }

    const ray = world.rayTrace(start, dir, CFG.maxDistance,
        Java.type('org.bukkit.FluidCollisionMode').NEVER, false, 0.1,
        e => e!==p && e instanceof org.bukkit.entity.LivingEntity && e.getType().name()!=="ARMOR_STAND");

    findAndUpdateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy-dynamicCost)} §7/ §6${staffInfo.energyMax}`);
    cooldownMap.put(uuid, now);
    world.playSound(p.getLocation(), CFG.soundName, 1,1);

    if (!ray?.getHitEntity()) return;

    const entity = ray.getHitEntity();
    const type = entity.getType().name();
    const white = CFG.whiteList.includes(type);
    entity.damage(damage, p);

    const change = Math.floor(Math.random() * (CFG.meritRange.max - CFG.meritRange.min + 1)) + CFG.meritRange.min;
    const newMerit = white ? staffInfo.merit - change : staffInfo.merit + change;
    findAndUpdateLore(staff, "德值", newMerit>=0 ? `§b功德值：§6${newMerit}` : `§c缺德值：§6${-newMerit}`);

    if (bookInfo.prof < bookInfo.profMax) {
        const add = Math.floor(Math.random() * (CFG.profAddMax - CFG.profAddMin + 1)) + CFG.profAddMin;
        const final = Math.min(bookInfo.prof + add, bookInfo.profMax);
        if (findAndUpdateLore(book, "熟练度", `§b熟练度：§6${final} §7/ §6${bookInfo.profMax}`) && add>0)
            p.sendMessage(`§b熟练度+${add}`);
    }

    p.sendMessage(white ? `§2✦ §a[勾豆灰] 击中${type}！-${change}功德` : `§4✧ §c[勾豆灰] 击中${type}！+${change}功德`);
}