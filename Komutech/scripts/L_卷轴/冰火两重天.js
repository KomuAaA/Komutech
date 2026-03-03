const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

// ========== 配置 ==========
const CFG = {
    name: '§c§l冰§b§l火§f§l两§6§l重§e§l天',
    namePlain: '冰火两重天',
    defaultLore: "§7未录取卷轴",
    rayEnergyCost: 500,
    baseDamage: 30,
    profAddRange: [1, 10],
    cooldown: 600,
    cooldownReduction: { per100: 3, max: 90 },
    maxDistance: 32,
    particleInterval: 0.1,
    spiralRadius: 1.5,
    fireParticle: { startColor: {r:1,g:0.2,b:0}, endColor: {r:1,g:0.8,b:0}, size:5 },
    snowParticle: { startColor: {r:0.8,g:0.9,b:1}, endColor: {r:0.5,g:0.7,b:1}, size:5 },
    soundName: "entity.evoker.cast_spell",
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    meritEffects: { bonus:0.01, penalty:0.01, range:[1,10] },
    levelMultiplier: { "黄":1, "玄":1.2, "地":1.5, "天":1.8 },
    profDamagePer100: 0.05,
    damageDetectRange: 2,
    maxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520,
    fireDuration: 100,       // 着火刻数
    slowDuration: 100,       // 缓慢刻数
    slowAmplifier: 0         // 缓慢等级 (0=I)
};
CFG.unlockLore = `§a已录取卷轴：${CFG.name}`;
CFG.meritCurveK = CFG.targetMerit * ((CFG.maxMultiplier-1)/(CFG.targetMultiplier-1)-1);

// ========== Java类型导入 ==========
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustTransition = Java.type('org.bukkit.Particle$DustTransition');
const Vector = Java.type('org.bukkit.util.Vector');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');

// ========== 全局管理 ==========
const cooldowns = new java.util.HashMap();
const skillCache = new java.util.HashMap();

// ========== 工具函数 ==========
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

const createColor = rgb => Color.fromRGB(Math.floor(rgb.r*255), Math.floor(rgb.g*255), Math.floor(rgb.b*255));
const createParticleData = c => new DustTransition(createColor(c.startColor), createColor(c.endColor), c.size);

// ========== 螺旋粒子 ==========
const generateSpiralBeam = (world, start, dir) => {
    const fireData = createParticleData(CFG.fireParticle);
    const snowData = createParticleData(CFG.snowParticle);

    let up = new Vector(0,1,0);
    let right = dir.clone().crossProduct(up).normalize();
    if (right.lengthSquared() < 0.01) {
        up = new Vector(1,0,0);
        right = dir.clone().crossProduct(up).normalize();
    }
    let upLocal = right.clone().crossProduct(dir).normalize();

    for (let d = 0; d <= CFG.maxDistance; d += CFG.particleInterval*0.8) {
        const loc = start.clone().add(dir.clone().multiply(d));
        const t = d / CFG.maxDistance;
        const radius = CFG.spiralRadius * (0.5 + t * 1.5);
        const angle1 = d * 0.8;
        const angle2 = d * 1.5;

        // 火焰主螺旋
        const offset1 = right.clone().multiply(Math.sin(angle1)*radius).add(upLocal.clone().multiply(Math.cos(angle1)*radius));
        world.spawnParticle(Particle.DUST_COLOR_TRANSITION, loc.clone().add(offset1), 2, 0.1,0.1,0.1,0, fireData);

        // 雪花主螺旋
        const offset2 = right.clone().multiply(Math.sin(angle1+Math.PI/2)*radius*0.8).add(upLocal.clone().multiply(Math.cos(angle1+Math.PI/2)*radius*0.8));
        world.spawnParticle(Particle.DUST_COLOR_TRANSITION, loc.clone().add(offset2), 2, 0.1,0.1,0.1,0, snowData);

        // 小半径火焰/雪花点缀
        const offset3 = right.clone().multiply(Math.sin(angle2)*radius*0.5).add(upLocal.clone().multiply(Math.cos(angle2)*radius*0.5));
        world.spawnParticle(Particle.FLAME, loc.clone().add(offset3), 1, 0.1,0.1,0.1, 0.1, null);
        const offset3s = right.clone().multiply(Math.sin(angle2+0.3)*radius*0.5).add(upLocal.clone().multiply(Math.cos(angle2+0.3)*radius*0.5));
        world.spawnParticle(Particle.SNOWFLAKE, loc.clone().add(offset3s), 1, 0.1,0.1,0.1, 0.1, null);

        // 中心暴击粒子
        if (d % 2 === 0) world.spawnParticle(Particle.CRIT, loc, 3, 0.2,0.2,0.2, 0.1, null);
    }
};

// ========== 伤害与状态附加 ==========
const spiralBeamDamage = (player, start, dir, damage) => {
    const world = player.getWorld();
    const uuid = player.getUniqueId().toString();
    const entities = new java.util.HashSet();

    for (let i = 0; i <= CFG.maxDistance; i += 0.5) {
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
        entity.setFireTicks(CFG.fireDuration);
        entity.addPotionEffect(new PotionEffect(PotionEffectType.SLOWNESS, CFG.slowDuration, CFG.slowAmplifier));

        if (white) cache.white++; else cache.nonWhite++;
    });

    return entities.size() > 0;
};

// ========== 功德结算 ==========
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

// ========== 主事件 ==========
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

    // 绑定卷轴（非潜行）
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

    // 冷却
    const uuid = p.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const last = cooldowns.get(uuid) || 0;
    const reduction = Math.min(Math.floor(bookInfo.prof/100)*CFG.cooldownReduction.per100, CFG.cooldownReduction.max);
    const cd = Math.max(Math.floor(CFG.cooldown * (1 - reduction/100)), 1);
    if (now - last < cd) {
        p.sendMessage(`§c⚠ §4[${CFG.namePlain}] 冷却中！剩余 §6${((cd-(now-last))/20).toFixed(1)}秒`);
        return;
    }

    // 灵力
    if (staffInfo.energy < CFG.rayEnergyCost) {
        p.sendMessage(`§c⚠ §4[${CFG.namePlain}] 灵力不足！需 §6${CFG.rayEnergyCost}`);
        return;
    }

    cleanupCache(uuid);

    // 熟练度（释放时增加）
    if (bookInfo.prof < bookInfo.profMax) {
        const add = Math.floor(Math.random() * (CFG.profAddRange[1]-CFG.profAddRange[0]+1)) + CFG.profAddRange[0];
        const newProf = Math.min(bookInfo.prof + add, bookInfo.profMax);
        if (updateLore(book, "熟练度", `§b熟练度：§6${newProf} §7/ §6${bookInfo.profMax}`) && add>0)
            p.sendMessage(`§b熟练度+${add}`);
    }

    // 伤害计算（功德软上限）
    const meritMult = staffInfo.merit >= 0 ?
        1 + (CFG.maxMultiplier-1) * (staffInfo.merit / (staffInfo.merit + CFG.meritCurveK)) :
        Math.max(0.1, 1 - (Math.abs(staffInfo.merit)/100) * CFG.meritEffects.penalty);
    const profBonus = 1 + Math.floor(bookInfo.prof/100) * CFG.profDamagePer100;
    const damage = CFG.baseDamage * CFG.levelMultiplier[bookInfo.level] * profBonus * meritMult;

    // 施法
    const world = p.getWorld();
    const eye = p.getEyeLocation();
    const dir = eye.getDirection();
    const start = eye.clone().add(dir);

    generateSpiralBeam(world, start, dir);
    const hasHit = spiralBeamDamage(p, start, dir, damage);

    // 消耗灵力、设置冷却、音效
    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy-CFG.rayEnergyCost)} §7/ §6${staffInfo.energyMax}`);
    cooldowns.put(uuid, now);
    world.playSound(p.getLocation(), CFG.soundName, 1,1);

    // 功德结算
    settleMerit(p, staff, staffInfo);

    p.sendMessage(hasHit ? `§a[${CFG.namePlain}] 冰火交融，螺旋激荡！` : `§7[${CFG.namePlain}] 未击中目标`);
}