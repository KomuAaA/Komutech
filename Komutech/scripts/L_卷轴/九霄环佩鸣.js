const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const CFG = {
    name: '§d§l九霄环佩鸣',
    namePlain: '九宵环佩鸣',
    defaultLore: "§7未录取卷轴",
    baseEnergyCost: 1000,
    maxEnergyCost: 10000,
    costTargetIncrease: 2.5,
    baseDamage: 12,
    profAddRange: [1, 10],
    cooldown: 300,
    cooldownReduction: { per100: 3, max: 90 },
    maxDistance: 32,
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    meritEffects: { penalty:0.01, range:[1,12] },
    levelMultiplier: { "黄":1, "玄":1.2, "地":1.5, "天":1.8 },
    profDamagePer100: 0.05,
    damageDetectRange: 2,
    baseMaxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520,
    effectDuration: 100,
    slowAmplifier: 1,
    nauseaAmplifier: 1
};
CFG.unlockLore = `§a已录取卷轴：${CFG.name}`;
CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1;
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');

const cooldowns = new java.util.HashMap();
const skillCache = new java.util.HashMap();

const updateLore = (item, keyword, newText) => {
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

const getItemInfo = item => {
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const info = { level:"黄", energy:0, energyMax:2000, merit:0, bindState:"", prof:0, profMax:0 };
    lore.forEach(line => {
        if (!line) return;
        if (line.includes("天")) info.level = "天";
        else if (line.includes("地")) info.level = "地";
        else if (line.includes("玄")) info.level = "玄";
        if (line.includes("卷轴")) info.bindState = line;
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;
        if (line.includes("灵力剩余")) {
            info.energy = parseInt(nums[0].replace('§6','')) || 0;
            info.energyMax = parseInt(nums[1]?.replace('§6','') || 2000);
        } else if (line.includes("德值")) {
            const num = parseInt(nums[0].replace('§6','')) || 0;
            info.merit = line.includes("缺德值") ? -num : num;
        } else if (line.includes("熟练度")) {
            info.prof = parseInt(nums[0].replace('§6','')) || 0;
            info.profMax = parseInt(nums[1]?.replace('§6','') || 0);
        }
    });
    return info;
};

const cleanupCache = uuid => skillCache.remove(uuid);

const spawnRayParticles = (world, start, dir) => {
    for (let i = 0; i <= CFG.maxDistance; i += 1) {
        const pos = start.clone().add(dir.clone().multiply(i));
        world.spawnParticle(Particle.SONIC_BOOM, pos, 1, 0, 0, 0, 0, null);
    }
};

const rayDamageDetection = (player, start, dir, damage) => {
    const world = player.getWorld();
    const uuid = player.getUniqueId().toString();
    const entities = new java.util.HashSet();

    for (let i = 0; i <= CFG.maxDistance; i += 1) {
        const pos = start.clone().add(dir.clone().multiply(i));
        const nearby = world.getNearbyLivingEntities(pos, CFG.damageDetectRange, CFG.damageDetectRange, CFG.damageDetectRange);
        for (let j = 0; j < nearby.size(); j++) entities.add(nearby.get(j));
    }

    if (!skillCache.containsKey(uuid)) skillCache.put(uuid, { white:0, nonWhite:0 });
    const cache = skillCache.get(uuid);

    entities.forEach(entity => {
        if (entity === player || entity.getType().name() === "ARMOR_STAND" || entity.isDead()) return;
        const white = CFG.whiteList.includes(entity.getType().name());

        entity.damage(damage, player);
        entity.addPotionEffect(new PotionEffect(PotionEffectType.SLOWNESS, CFG.effectDuration, CFG.slowAmplifier));
        entity.addPotionEffect(new PotionEffect(PotionEffectType.NAUSEA, CFG.effectDuration, CFG.nauseaAmplifier));

        if (white) cache.white++; else cache.nonWhite++;
    });

    return entities.size() > 0;
};

const settleMerit = (player, staff, staffInfo) => {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.get(uuid);
    if (!cache) return;
    const [min,max] = CFG.meritEffects.range;
    let change = 0;
    if (cache.white > 0) change -= cache.white * (Math.floor(Math.random()*(max-min+1))+min);
    if (cache.nonWhite > 0) change += cache.nonWhite * (Math.floor(Math.random()*(max-min+1))+min);
    if (change !== 0) {
        const newMerit = staffInfo.merit + change;
        updateLore(staff, "德值", newMerit>=0 ? `§b功德值：§6${newMerit}` : `§c缺德值：§6${-newMerit}`);
        player.sendMessage(change>0 ? `§2✦ §a[${CFG.namePlain}] §2✦ §a积德行善！§6+${change}功德`
                                   : `§4✧ §c[${CFG.namePlain}] §4✧ §c损德败行！§6${change}功德`);
    }
    skillCache.remove(uuid);
};

function onUse(event) {
    const p = event.getPlayer();
    const staff = p.getInventory().getItemInMainHand();
    const book = p.getInventory().getItemInOffHand();

    if (!staff?.getItemMeta() || !book?.getItemMeta()) {
        p.sendMessage(`§4◆ §c『${CFG.namePlain}』§4◆ §c需主手法杖+副手卷轴！`);
        return;
    }

    const staffInfo = getItemInfo(staff);
    const bookInfo = getItemInfo(book);

    if (!p.isSneaking()) {
        if (staffInfo.bindState !== CFG.unlockLore && 
            (staffInfo.bindState === CFG.defaultLore || staffInfo.bindState.startsWith("§a已录取卷轴"))) {
            updateLore(staff, "卷轴", CFG.unlockLore);
            p.sendMessage(`§2✦ §a『${CFG.namePlain}』§2✦ §a卷轴嵌杖成功！`);
        }
        return;
    }

    if (staffInfo.bindState !== CFG.unlockLore) {
        p.sendMessage(`§4✖ §c『${CFG.namePlain}』§4✖ §c法杖未绑定此卷轴！`);
        return;
    }

    const uuid = p.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const last = cooldowns.get(uuid) || 0;
    const reduction = Math.min(Math.floor(bookInfo.prof/100)*CFG.cooldownReduction.per100, CFG.cooldownReduction.max);
    const cd = Math.max(Math.floor(CFG.cooldown * (1 - reduction/100)), 1);
    if (now - last < cd) {
        p.sendMessage(`§c⚠ §4[${CFG.namePlain}] 冷却中！剩余 §6${((cd-(now-last))/20).toFixed(1)}秒`);
        return;
    }

    let dynamicCost = CFG.baseEnergyCost;
    if (staffInfo.merit > 0) {
        const increase = costMaxIncrease * (staffInfo.merit / (staffInfo.merit + CFG.costK));
        dynamicCost = Math.min(CFG.maxEnergyCost, Math.round(CFG.baseEnergyCost * (1 + increase)));
    }
    if (staffInfo.energy < dynamicCost) {
        p.sendMessage(`§c⚠ §4[${CFG.namePlain}] 灵力不足！需 §6${dynamicCost}`);
        return;
    }

    cleanupCache(uuid);

    if (bookInfo.prof < bookInfo.profMax) {
        const add = Math.floor(Math.random() * (CFG.profAddRange[1]-CFG.profAddRange[0]+1)) + CFG.profAddRange[0];
        const newProf = Math.min(bookInfo.prof + add, bookInfo.profMax);
        if (updateLore(book, "熟练度", `§b熟练度：§6${newProf} §7/ §6${bookInfo.profMax}`) && add>0)
            p.sendMessage(`§b熟练度+${add}`);
    }

    const levelBase = CFG.levelMultiplier[bookInfo.level] || 1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    let meritMult;
    if (staffInfo.merit >= 0) {
        const gain = (maxMulti-1) * (staffInfo.merit / (staffInfo.merit + CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(staffInfo.merit)/100) * CFG.meritEffects.penalty);
    }
    const profBonus = 1 + Math.floor(bookInfo.prof/100) * CFG.profDamagePer100;
    const damage = CFG.baseDamage * meritMult * profBonus;

    const world = p.getWorld();
    const eye = p.getEyeLocation();
    const dir = eye.getDirection();
    const start = eye.clone().add(dir);

    spawnRayParticles(world, start, dir);
    const hasHit = rayDamageDetection(p, start, dir, damage);

    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy-dynamicCost)} §7/ §6${staffInfo.energyMax}`);
    cooldowns.put(uuid, now);
    world.playSound(p.getLocation(), CFG.soundName, 1,1);

    settleMerit(p, staff, staffInfo);
    p.sendMessage(hasHit ? `§a[${CFG.namePlain}] 九霄环佩，音波激荡！` : `§7[${CFG.namePlain}] 音波穿透虚空，未击中目标`);
}