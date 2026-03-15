const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const CFG = {
    name: '§d§l游龙惊鸿诀',
    defaultLore: "§7未录取卷轴",
    unlockLore: "§a已录取卷轴：§d§l游龙惊鸿诀",
    baseEnergyCost: 5000,               // 基础灵力消耗
    maxEnergyCost: 50000,                // 最大消耗（3倍）
    costTargetIncrease: 2.5,            // 目标功德时消耗增加50%
    baseDamage: 18,
    profAddRange: [1, 10],
    cooldown: 3000,
    cooldownReduction: { per100: 3, max: 90 },
    levelMultiplier: { "黄":1, "玄":1.2, "地":1.5, "天":1.8 },
    profDamagePer100: 0.05,
    meritEffects: { penalty:0.01, range:[1,18] },
    damageInterval: 8,
    damageRanges: { trail:4.0, projectile:6.0 },
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    sounds: {
        cast: "entity.evoker.cast_spell",
        dragonFlap: "entity.ender_dragon.flap",
        dragonAmbient: "entity.ender_dragon.ambient",
        portal: "block.portal.ambient",
        firework: { blast:"entity.firework_rocket.blast", launch:"entity.firework_rocket.launch" }
    },
    particles: {
        colors: [{r:240,g:230,b:140}, {r:255,g:215,b:0}, {r:255,g:180,b:0}, {r:255,g:140,b:0}],
        trail: { duration:120, size:16, count:5, minRadius:1, maxRadius:4, minHeight:-3, maxHeight:3, rotationSpeed:0.1, heightSpeed:0.5 },
        launch: { duration:12, size:12, count:6, distance:24 },
        follow: { duration:200, size:12, count:2, distance:24 }
    },
    baseMaxMultiplier: 1314,             // 黄级基础最大倍率
    targetMerit: 5201314,                // 目标功德值
    targetMultiplier: 520                 // 目标功德对应的倍率
};

CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1; // 2.0
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const cooldowns = new java.util.HashMap();
const activeTasks = new java.util.HashMap();
const skillCache = new java.util.HashMap();
const clearTasks = new java.util.HashMap();
const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');

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
        if (line.includes("天")) info.level="天";
        else if (line.includes("地")) info.level="地";
        else if (line.includes("玄")) info.level="玄";
        if (line.includes("卷轴")) info.bindState=line;
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;
        const num = parseInt(nums[0].replace('§6','')) || 0;
        if (line.includes("灵力剩余")) {
            info.energy = num;
            if (nums[1]) info.energyMax = parseInt(nums[1].replace('§6','')) || 2000;
        } else if (line.includes("德值")) {
            info.merit = line.includes("缺德值") ? -num : num;
        } else if (line.includes("熟练度")) {
            info.prof = num;
            if (nums[1]) info.profMax = parseInt(nums[1].replace('§6','')) || 0;
        }
    });
    return info;
};

const getPotionType = name => PotionEffectType.getByName(name);

const prepareDamage = (player, staff, book) => {
    const uuid = player.getUniqueId().toString();
    const staffInfo = getItemInfo(staff);
    const bookInfo = getItemInfo(book);
    const profBonus = 1 + Math.floor(bookInfo.prof/100) * CFG.profDamagePer100;
    const levelBase = CFG.levelMultiplier[bookInfo.level] || 1.0;
    const maxMulti = CFG.baseMaxMultiplier * levelBase * levelBase;
    let meritMult;
    if (staffInfo.merit >= 0) {
        const gain = (maxMulti-1) * (staffInfo.merit / (staffInfo.merit + CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(staffInfo.merit)/100) * CFG.meritEffects.penalty);
    }
    const finalDamage = CFG.baseDamage * meritMult * profBonus;
    skillCache.put(uuid, { staff, staffInfo, finalDamage, white:0, nonWhite:0 });
    return finalDamage;
};

const settleMerit = (player) => {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.get(uuid);
    if (!cache) return;
    const [min,max] = CFG.meritEffects.range;
    let change = 0;
    if (cache.white > 0) change -= cache.white * (Math.floor(Math.random()*(max-min+1))+min);
    if (cache.nonWhite > 0) change += cache.nonWhite * (Math.floor(Math.random()*(max-min+1))+min);
    if (change !== 0) {
        const newMerit = cache.staffInfo.merit + change;
        updateLore(cache.staff, "德值", newMerit>=0 ? `§b功德值：§6${newMerit}` : `§c缺德值：§6${-newMerit}`);
        player.sendMessage(change>0 ? `§2✦ §a『§2游龙惊鸿诀§a』§2✦ §a积德行善！§6+${change}功德`
                                   : `§4✧ §c『§4游龙惊鸿诀§c』§4✧ §c损德败行！§6${change}功德`);
    }
    skillCache.remove(uuid);
    ["RESISTANCE","STRENGTH","REGENERATION","ABSORPTION"].forEach(name => {
        const type = getPotionType(name);
        if (type) player.removePotionEffect(type);
    });
    const clearTaskId = clearTasks.remove(uuid);
    if (clearTaskId) Bukkit.getScheduler().cancelTask(clearTaskId);
};

const applyDamage = (player, center, multiplier, range, world) => {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.get(uuid);
    if (!cache) return;
    const entities = world.getNearbyEntities(center, range, range, range);
    for (let i = 0; i < entities.size(); i++) {
        const e = entities.get(i);
        if (e === player || e.getType().name()==="ARMOR_STAND" || e.isDead() || !(e instanceof LivingEntity)) continue;
        const white = CFG.whiteList.includes(e.getType().name());
        e.damage(cache.finalDamage * multiplier, player);
        const weakness = getPotionType("WEAKNESS");
        const slowness = getPotionType("SLOWNESS");
        if (weakness) e.addPotionEffect(new PotionEffect(weakness, 100, 4));
        if (slowness) e.addPotionEffect(new PotionEffect(slowness, 100, 4));
        if (white) cache.white++; else cache.nonWhite++;
    }
};

const getParticleColor = index => {
    const c = CFG.particles.colors[Math.min(index, CFG.particles.colors.length-1)];
    return Color.fromRGB(c.r, c.g, c.b);
};

const getTrailPos = (progress, time, center) => {
    const base = progress * Math.PI*8 + time * CFG.particles.trail.rotationSpeed;
    const rVar = Math.sin(time*0.7+progress*3)*0.4 + Math.sin(time*1.3+progress*5)*0.2;
    const r = CFG.particles.trail.minRadius + (CFG.particles.trail.maxRadius-CFG.particles.trail.minRadius) * (0.5 + rVar*0.5);
    const hVar = Math.sin(time*CFG.particles.trail.heightSpeed + progress*4)*1.2 + Math.sin(time*CFG.particles.trail.heightSpeed*1.7+progress*7)*0.6;
    const h = (CFG.particles.trail.minHeight+CFG.particles.trail.maxHeight)/2 + hVar + 1;
    const offX = Math.sin(time*0.9+progress*6)*0.2;
    return center.clone().add(Math.cos(base)*r+offX, h, Math.sin(base)*r+offX);
};

const getViewPos = (player, dist) => {
    const eye = player.getEyeLocation();
    const dir = eye.getDirection().normalize();
    return eye.clone().add(dir.clone().multiply(dist));
};

const createProjectile = (player, initialWorld) => {
    const uuid = player.getUniqueId().toString();
    const world = initialWorld;
    const dir = player.getEyeLocation().getDirection().normalize();
    let tick = 0;
    const task = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, () => {
        if (!player.isOnline() || player.isDead() || player.getWorld() !== initialWorld) {
            Bukkit.getScheduler().cancelTask(task);
            activeTasks.remove(uuid);
            settleMerit(player);
            return;
        }
        if (tick < CFG.particles.launch.duration) {
            const prog = tick / CFG.particles.launch.duration;
            const dist = prog * CFG.particles.launch.distance;
            const pos = player.getEyeLocation().clone().add(dir.clone().multiply(dist));
            const color = getParticleColor(1);
            world.spawnParticle(Particle.DUST, pos, CFG.particles.launch.count, 0.3,0.3,0.3,0,
                new DustOptions(color, CFG.particles.launch.size));
            if (tick % 3 === 0) applyDamage(player, pos, 1.5, CFG.damageRanges.projectile, world);
            tick++;
            if (tick >= CFG.particles.launch.duration) {
                player.sendMessage("§6✦ §e『§6游龙惊鸿诀§e』§6✦ §e龙魂现世·破空而去");
                world.playSound(pos, CFG.sounds.firework.launch, 0.3, 1);
            }
        } else {
            const follow = tick - CFG.particles.launch.duration;
            if (follow >= CFG.particles.follow.duration) {
                Bukkit.getScheduler().cancelTask(task);
                activeTasks.remove(uuid);
                world.playSound(getViewPos(player, CFG.particles.follow.distance), CFG.sounds.firework.blast, 0.2, 1.2);
                settleMerit(player);
                player.sendMessage("§8✧ §7『§8游龙惊鸿诀§7』§8✧ §7龙魂归元·消散无踪");
                return;
            }
            const pos = getViewPos(player, CFG.particles.follow.distance);
            const color = getParticleColor(1);
            world.spawnParticle(Particle.DUST, pos, CFG.particles.follow.count, 0.5,0.5,0.5,0,
                new DustOptions(color, CFG.particles.follow.size));
            if (follow % 5 === 0) applyDamage(player, pos, 0.8, CFG.damageRanges.projectile, world);
            tick++;
        }
    }, 0, 1);
    activeTasks.put(uuid, task);
};

const createTrail = (player, staff, book) => {
    const uuid = player.getUniqueId().toString();
    const initialWorld = player.getWorld();
    const world = initialWorld;
    const startTime = Date.now()/1000;
    let tick = 0;
    const task = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, () => {
        if (!player.isOnline() || player.isDead() || player.getWorld() !== initialWorld) {
            Bukkit.getScheduler().cancelTask(task);
            activeTasks.remove(uuid);
            skillCache.remove(uuid);
            settleMerit(player);
            return;
        }
        if (tick >= CFG.particles.trail.duration) {
            Bukkit.getScheduler().cancelTask(task);
            activeTasks.remove(uuid);
            if (player.isOnline() && !player.isDead()) {
                player.sendMessage("§6◇ §e【游龙惊鸿诀】§6◇ §f龙魂凝毕·撼天一击！§e即刻发射！");
                createProjectile(player, initialWorld);
            } else skillCache.remove(uuid);
            return;
        }
        const time = (Date.now()/1000 - startTime);
        const prog = tick / CFG.particles.trail.duration;
        const center = player.getLocation().clone().add(0,1,0);
        for (let i = 0; i < CFG.particles.trail.count; i++) {
            const pProg = (tick + i*0.2) / CFG.particles.trail.duration;
            const pos = getTrailPos(pProg, time, center);
            const heightRatio = (pos.getY() - center.getY()) / 3;
            const idx = Math.min(Math.floor((heightRatio+1)*2), CFG.particles.colors.length-1);
            const color = getParticleColor(Math.max(0, idx));
            world.spawnParticle(Particle.DUST, pos, 1, 0,0,0,0,
                new DustOptions(color, CFG.particles.trail.size));
        }
        if (tick % CFG.damageInterval === 0) applyDamage(player, center, 1, CFG.damageRanges.trail, world);
        if (tick % 40 === 0) {
            const pitch = 0.8 + Math.sin(time*0.8)*0.3 + Math.cos(time*1.1)*0.2;
            world.playSound(center, CFG.sounds.dragonFlap, 0.1, Math.max(0.5, Math.min(1.5, pitch)));
        }
        if (tick % 20 === 0) {
            CFG.particles.trail.rotationSpeed = 0.25 + Math.random()*0.1;
            CFG.particles.trail.heightSpeed = 0.4 + Math.random()*0.2;
        }
        tick++;
    }, 0, 1);
    activeTasks.put(uuid, task);
    world.playSound(player.getLocation(), CFG.sounds.dragonAmbient, 0.15, 1);
    world.playSound(player.getLocation(), CFG.sounds.portal, 0.1, 1);
};

function onUse(event) {
    const p = event.getPlayer();
    const staff = p.getInventory().getItemInMainHand();
    const book = p.getInventory().getItemInOffHand();

    if (!staff?.getItemMeta() || !book?.getItemMeta()) {
        p.sendMessage("§4◆ §c『§6游龙惊鸿诀§c』§4◆ §c需主手法杖+副手卷轴！");
        return;
    }

    const staffInfo = getItemInfo(staff);
    const bookInfo = getItemInfo(book);

    if (!p.isSneaking()) {
        if (staffInfo.bindState !== CFG.unlockLore &&
            (staffInfo.bindState === CFG.defaultLore || staffInfo.bindState.startsWith("§a已录取卷轴"))) {
            updateLore(staff, "卷轴", CFG.unlockLore);
            p.sendMessage("§2✦ §a『§a游龙惊鸿诀§a』§2✦ §a卷轴绑定成功！");
        }
        return;
    }

    if (staffInfo.bindState !== CFG.unlockLore) {
        p.sendMessage("§4⚠ §c『§6游龙惊鸿诀§c』§4✖ §c法杖未绑定此卷轴！");
        return;
    }

    const uuid = p.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const last = cooldowns.get(uuid) || 0;
    const reduction = Math.min(Math.floor(bookInfo.prof/100)*CFG.cooldownReduction.per100, CFG.cooldownReduction.max);
    const cd = Math.max(Math.floor(CFG.cooldown * (1 - reduction/100)), 1);
    if (now < last) {
        const remain = Math.ceil((last - now)/20);
        p.sendMessage(`§4⚠ §c『§6游龙惊鸿诀§c』§4✖ §c技能冷却！§7剩余 §6${remain}秒`);
        return;
    }

    // 动态灵力消耗
    let dynamicCost = CFG.baseEnergyCost;
    if (staffInfo.merit > 0) {
        const increase = costMaxIncrease * (staffInfo.merit / (staffInfo.merit + CFG.costK));
        dynamicCost = Math.min(CFG.maxEnergyCost, Math.round(CFG.baseEnergyCost * (1 + increase)));
    }
    if (staffInfo.energy < dynamicCost) {
        p.sendMessage(`§4⚠ §c『§6游龙惊鸿诀§c』§4✖ §c灵力不足！需 §6${dynamicCost}`);
        return;
    }

    if (bookInfo.prof < bookInfo.profMax) {
        const [min,max] = CFG.profAddRange;
        const add = Math.floor(Math.random() * (max-min+1)) + min;
        const newProf = Math.min(bookInfo.prof + add, bookInfo.profMax);
        if (updateLore(book, "熟练度", `§b熟练度：§6${newProf} §7/ §6${bookInfo.profMax}`) && add>0)
            p.sendMessage(`§b熟练度+${add}`);
    }

    cooldowns.put(uuid, now + cd);
    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy-dynamicCost)} §7/ §6${staffInfo.energyMax}`);
    p.getWorld().playSound(p.getLocation(), CFG.sounds.cast, 1, 1);

    const addEffect = (name, duration, amplifier) => {
        const type = getPotionType(name);
        if (type) p.addPotionEffect(new PotionEffect(type, duration, amplifier));
    };
    addEffect("RESISTANCE", 3600, 4);
    addEffect("STRENGTH", 3600, 3);
    addEffect("REGENERATION", 3600, 4);
    addEffect("ABSORPTION", 3600, 4);

    const clearTaskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, () => {
        if (!p.isOnline() || p.isDead()) return;
        const negatives = ["SLOWNESS","MINING_FATIGUE","INSTANT_DAMAGE","NAUSEA","BLINDNESS",
            "HUNGER","WEAKNESS","POISON","WITHER","LEVITATION","UNLUCK","BAD_OMEN","DARKNESS"];
        negatives.forEach(name => {
            const type = getPotionType(name);
            if (type) p.removePotionEffect(type);
        });
    }, 0, 20);
    clearTasks.put(uuid, clearTaskId);

    prepareDamage(p, staff, book);
    createTrail(p, staff, book);
    p.sendMessage(`§6✦ §e龙吟撼九霄§6✦ §f唤龙魂破阵！ §7冷却: §b${(cd/20).toFixed(1)}秒`);
}