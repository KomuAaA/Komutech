const plugin = org.bukkit.Bukkit.getPluginManager().getPlugin("RykenSlimefunCustomizer");

const CFG = {
    name: '御龙护身决',
    namePlain: '御龙护身决',
    defaultLore: "§7未录取卷轴",
    unlockLore: "§a已录取卷轴：御龙护身决",
    baseDamage: 9,
    baseEnergyCost: 3000,
    maxEnergyCost: 30000,
    costTargetIncrease: 2.5,
    cooldown: 1200,
    cooldownReduction: { per100: 3, max: 90 },
    levelMultiplier: { "黄":1, "玄":1.2, "地":1.5, "天":1.8 },
    profDamagePer100: 0.05,
    meritEffects: { penalty:0.01, range:[1,12] },
    whiteList: ["VILLAGER","IRON_GOLEM","COW","PIG","SHEEP","CHICKEN","WOLF","CAT"],
    profAddRange: [1, 10],
    soundCast: "entity.evoker.cast_spell",
    duration: 240,
    damageInterval: 8,
    radius: 4.0,
    particles: {
        colors: [{r:240,g:230,b:140}, {r:255,g:215,b:0}, {r:255,g:180,b:0}, {r:255,g:140,b:0}],
        trail: { size:16, count:5, minRadius:1, maxRadius:4, minHeight:-3, maxHeight:3, rotationSpeed:0.1, heightSpeed:0.5 }
    },
    baseMaxMultiplier: 1314,
    targetMerit: 5201314,
    targetMultiplier: 520
};

CFG.unlockLore = `§a已录取卷轴：${CFG.name}`;
CFG.meritCurveK = CFG.targetMerit * ((CFG.baseMaxMultiplier-1)/(CFG.targetMultiplier-1)-1);
const costMaxIncrease = CFG.maxEnergyCost/CFG.baseEnergyCost - 1; // 9.0
CFG.costK = CFG.targetMerit * (costMaxIncrease/CFG.costTargetIncrease - 1);

const Bukkit = Java.type('org.bukkit.Bukkit');
const Particle = Java.type('org.bukkit.Particle');
const Color = Java.type('org.bukkit.Color');
const DustOptions = Java.type('org.bukkit.Particle$DustOptions');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const JavaRunnable = Java.extend(Java.type('java.lang.Runnable'));

const cooldowns = new java.util.HashMap();
const activeTasks = new java.util.HashMap();
const skillCache = new java.util.HashMap();

function updateLore(item, key, val) {
    const meta = item.getItemMeta();
    if (!meta) return false;
    const lore = meta.getLore() || [];
    for (let i = 0; i < lore.length; i++) {
        if (lore[i] && lore[i].includes(key)) {
            lore[i] = val;
            meta.setLore(lore);
            item.setItemMeta(meta);
            return true;
        }
    }
    return false;
}

function getItemInfo(item) {
    const meta = item.getItemMeta();
    const lore = meta?.getLore() || [];
    const info = { level:"黄", energy:0, energyMax:2000, merit:0, bindState:"", prof:0, profMax:0 };
    lore.forEach(line => {
        if (!line) return;
        if (line.includes("天")) info.level="天";
        else if (line.includes("地")) info.level="地";
        else if (line.includes("玄")) info.level="玄";
        if (line.includes("卷轴")) info.bindState = line;
        const nums = line.match(/§6(-?\d+)/g);
        if (!nums) return;
        if (line.includes("灵力剩余")) {
            info.energy = parseInt(nums[0].replace('§6','')) || 0;
            info.energyMax = parseInt(nums[1]?.replace('§6','') || 2000);
        } else if (line.includes("德值")) {
            const n = parseInt(nums[0].replace('§6','')) || 0;
            info.merit = line.includes("缺德值") ? -n : n;
        } else if (line.includes("熟练度")) {
            info.prof = parseInt(nums[0].replace('§6','')) || 0;
            info.profMax = parseInt(nums[1]?.replace('§6','') || 0);
        }
    });
    return info;
}

function calcDamage(staffInfo, bookInfo) {
    const base = CFG.levelMultiplier[bookInfo.level] || 1.0;
    const maxMulti = CFG.baseMaxMultiplier * base * base;
    let meritMult;
    if (staffInfo.merit >= 0) {
        const gain = (maxMulti-1) * (staffInfo.merit / (staffInfo.merit + CFG.meritCurveK));
        meritMult = 1 + gain;
    } else {
        meritMult = Math.max(0.1, 1 - (Math.abs(staffInfo.merit)/100) * CFG.meritEffects.penalty);
    }
    const profBonus = 1 + Math.floor(bookInfo.prof/100) * CFG.profDamagePer100;
    return CFG.baseDamage * meritMult * profBonus;
}

function settleMerit(player, staff, info) {
    const uuid = player.getUniqueId().toString();
    const cache = skillCache.remove(uuid);
    if (!cache) return;
    const [min,max] = CFG.meritEffects.range;
    let change = 0;
    if (cache.white) change -= cache.white * (Math.floor(Math.random()*(max-min+1))+min);
    if (cache.nonWhite) change += cache.nonWhite * (Math.floor(Math.random()*(max-min+1))+min);
    if (change) {
        const newMerit = info.merit + change;
        updateLore(staff, "德值", newMerit>=0 ? `§b功德值：§6${newMerit}` : `§c缺德值：§6${-newMerit}`);
        player.sendMessage(change>0 ? `§2✦ §a[${CFG.namePlain}] 积德行善！§6+${change}功德`
                                   : `§4✧ §c[${CFG.namePlain}] 损德败行！§6${change}功德`);
    }
}

function clearTask(uuid) {
    const tid = activeTasks.remove(uuid);
    if (tid) Bukkit.getScheduler().cancelTask(tid);
}

function getParticleColor(index) {
    const c = CFG.particles.colors[Math.min(index, CFG.particles.colors.length-1)];
    return Color.fromRGB(c.r, c.g, c.b);
}

function getTrailPos(progress, time, center) {
    const base = progress * Math.PI*8 + time * CFG.particles.trail.rotationSpeed;
    const rVar = Math.sin(time*0.7+progress*3)*0.4 + Math.sin(time*1.3+progress*5)*0.2;
    const r = CFG.particles.trail.minRadius + (CFG.particles.trail.maxRadius-CFG.particles.trail.minRadius) * (0.5 + rVar*0.5);
    const hVar = Math.sin(time*CFG.particles.trail.heightSpeed + progress*4)*1.2 + Math.sin(time*CFG.particles.trail.heightSpeed*1.7+progress*7)*0.6;
    const h = (CFG.particles.trail.minHeight+CFG.particles.trail.maxHeight)/2 + hVar + 1;
    const offX = Math.sin(time*0.9+progress*6)*0.2;
    return center.clone().add(Math.cos(base)*r+offX, h, Math.sin(base)*r+offX);
}

function startWinding(player, staff, info, damage) {
    const uuid = player.getUniqueId().toString();
    const world = player.getWorld();
    const startTime = Date.now()/1000;
    let tick = 0;
    skillCache.put(uuid, { white:0, nonWhite:0 });

    const task = Bukkit.getScheduler().runTaskTimer(plugin, new JavaRunnable({
        run: () => {
            if (!player.isOnline() || player.isDead() || player.getWorld() !== world) {
                clearTask(uuid);
                skillCache.remove(uuid);
                return;
            }
            if (tick >= CFG.duration) {
                settleMerit(player, staff, info);
                clearTask(uuid);
                player.sendMessage(`§7[${CFG.namePlain}] 龙魂消散`);
                return;
            }
            const center = player.getLocation().clone().add(0,1,0);
            const time = (Date.now()/1000 - startTime);
            for (let i = 0; i < CFG.particles.trail.count; i++) {
                const pProg = (tick + i*0.2) / CFG.duration;
                const pos = getTrailPos(pProg, time, center);
                const heightRatio = (pos.getY() - center.getY()) / 3;
                const idx = Math.min(Math.floor((heightRatio+1)*2), CFG.particles.colors.length-1);
                const color = getParticleColor(Math.max(0, idx));
                world.spawnParticle(Particle.DUST, pos, 1, 0,0,0,0,
                    new DustOptions(color, CFG.particles.trail.size));
            }
            if (tick % CFG.damageInterval === 0) {
                const entities = world.getNearbyLivingEntities(center, CFG.radius, CFG.radius, CFG.radius);
                const cache = skillCache.get(uuid);
                if (cache) {
                    for (let i = 0; i < entities.size(); i++) {
                        const e = entities.get(i);
                        if (e === player || e.getType().name()==="ARMOR_STAND" || e.isDead()) continue;
                        const white = CFG.whiteList.includes(e.getType().name());
                        e.damage(damage, player);
                        if (white) cache.white++; else cache.nonWhite++;
                    }
                }
            }
            tick++;
        }
    }), 0, 1);
    activeTasks.put(uuid, task.getTaskId());
}

function onUse(event) {
    const p = event.getPlayer();
    const staff = p.getInventory().getItemInMainHand();
    const book = p.getInventory().getItemInOffHand();

    if (!staff?.getItemMeta() || !book?.getItemMeta()) {
        p.sendMessage(`§4◆ §c『${CFG.namePlain}』需主手法杖+副手卷轴！`);
        return;
    }

    const staffInfo = getItemInfo(staff);
    const bookInfo = getItemInfo(book);

    if (!p.isSneaking()) {
        if (staffInfo.bindState !== CFG.unlockLore &&
            (staffInfo.bindState === CFG.defaultLore || staffInfo.bindState.startsWith("§a已录取卷轴"))) {
            updateLore(staff, "卷轴", CFG.unlockLore);
            p.sendMessage(`§2✦ §a『${CFG.namePlain}』卷轴嵌杖成功！`);
        }
        return;
    }

    if (staffInfo.bindState !== CFG.unlockLore) {
        p.sendMessage(`§4✖ §c『${CFG.namePlain}』法杖未绑定此卷轴！`);
        return;
    }

    const uuid = p.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const last = cooldowns.get(uuid) || 0;
    const reduc = Math.min(Math.floor(bookInfo.prof/100)*CFG.cooldownReduction.per100, CFG.cooldownReduction.max);
    const cd = Math.max(Math.floor(CFG.cooldown * (1 - reduc/100)), 1);
    if (now - last < cd) {
        p.sendMessage(`§c⚠ [${CFG.namePlain}] 冷却中！剩余 ${((cd-(now-last))/20).toFixed(1)}秒`);
        return;
    }

    let cost = CFG.baseEnergyCost;
    if (staffInfo.merit > 0) {
        const inc = costMaxIncrease * (staffInfo.merit / (staffInfo.merit + CFG.costK));
        cost = Math.min(CFG.maxEnergyCost, Math.round(CFG.baseEnergyCost * (1 + inc)));
    }
    if (staffInfo.energy < cost) {
        p.sendMessage(`§c⚠ [${CFG.namePlain}] 灵力不足！需 ${cost}`);
        return;
    }

    clearTask(uuid);

    if (bookInfo.prof < bookInfo.profMax) {
        const add = Math.floor(Math.random() * (CFG.profAddRange[1]-CFG.profAddRange[0]+1)) + CFG.profAddRange[0];
        const newProf = Math.min(bookInfo.prof + add, bookInfo.profMax);
        if (updateLore(book, "熟练度", `§b熟练度：§6${newProf} §7/ §6${bookInfo.profMax}`) && add>0)
            p.sendMessage(`§b熟练度+${add}`);
    }

    const damage = calcDamage(staffInfo, bookInfo);

    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy-cost)} §7/ §6${staffInfo.energyMax}`);
    cooldowns.put(uuid, now);
    p.getWorld().playSound(p.getLocation(), CFG.soundCast, 1, 1);

    p.sendMessage(`§6✦ §e龙魂护体·御敌无形！ 冷却: §b${(cd/20).toFixed(1)}秒`);

    startWinding(p, staff, staffInfo, damage);
}