// 核心配置
const CFG = {
    name: '§6§l五行必杀',
    namePlain: '五行必杀',
    defaultLore: "§7未录取卷轴",
    unlockLore: "§a已录取卷轴：§e勾豆灰",
    
    // 技能配置
    rayEnergyCost: 20,
    cooldown: 60,
    cooldownReduction: { per100: 3, max: 90 },
    
    // 五行文字配置
    elements: {
        金: { offset: 0, particleType: "WAX_OFF", fadeDelay: 0, size: 4.0, particleCount: 4, startColor: { r:245, g:240, b:220 }, endColor: { r:255, g:215, b:0 }, dustSize: 2.0 },
        木: { offset: 3, particleType: "SCRAPE", fadeDelay: 10, size: 4.0, particleCount: 4, startColor: { r:50, g:205, b:50 }, endColor: { r:34, g:139, b:34 }, dustSize: 2.0 },
        水: { offset: 6, particleType: "SOUL_FIRE_FLAME", fadeDelay: 20, size: 4.0, particleCount: 4, startColor: { r:30, g:144, b:255 }, endColor: { r:0, g:0, b:255 }, dustSize: 2.0 },
        火: { offset: 9, particleType: "SMALL_FLAME", fadeDelay: 30, size: 4.0, particleCount: 4, startColor: { r:255, g:69, b:0 }, endColor: { r:255, g:0, b:0 }, dustSize: 2.0 },
        土: { offset: 12, particleType: "WAX_ON", fadeDelay: 40, size: 4.0, particleCount: 4, startColor: { r:210, g:180, b:140 }, endColor: { r:139, g:69, b:19 }, dustSize: 2.0 }
    },
    earthSpawnFadeDelay: 60,
    particleDuration: 80,
    fontSize: 4.0,
    yOffset: 0.5,
    spawnDistance: 3.5,
    
    // 音效
    soundName: "entity.evoker.cast_spell"
};

// 全局管理
const cooldowns = new java.util.HashMap();
const Bukkit = Java.type('org.bukkit.Bukkit');

// 文字绘制函数（保持不变）
const drawLine = (add, x1, y1, x2, y2, points = 16) => {
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        add(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
};

const drawJin = (add) => {
    drawLine(add, 8, 1, 1, 8); drawLine(add, 8, 1, 15, 8); drawLine(add, 5, 6, 12, 6);
    drawLine(add, 2, 10, 14, 10); drawLine(add, 8, 7, 8, 14); drawLine(add, 1, 15, 15, 15);
    drawLine(add, 11, 12, 9, 14); drawLine(add, 6, 12, 7, 14);
};

const drawMu = (add) => {
    drawLine(add, 8, 1, 8, 15); drawLine(add, 1, 5, 15, 5);
    drawLine(add, 7, 6, 1, 12); drawLine(add, 9, 6, 15, 12);
};

const drawShui = (add) => {
    drawLine(add, 8, 1, 8, 15); drawLine(add, 8, 15, 5, 13);
    drawLine(add, 2, 5, 7, 5); drawLine(add, 7, 5, 2, 11);
    drawLine(add, 12, 2, 9, 5); drawLine(add, 9, 5, 14, 11);
};

const drawHuo = (add) => {
    drawLine(add, 3, 3, 6, 6); drawLine(add, 7, 1, 8, 7); drawLine(add, 8, 7, 1, 15);
    drawLine(add, 13, 3, 10, 6); drawLine(add, 9, 8, 15, 15);
};

const drawTu = (add) => {
    drawLine(add, 2, 7, 14, 7); drawLine(add, 1, 15, 15, 15); drawLine(add, 8, 1, 8, 15);
};

// 工具函数
const getGradientColor = (start, end, progress) => {
    const Color = Java.type('org.bukkit.Color');
    return Color.fromRGB(
        Math.round(start.r + (end.r - start.r) * progress),
        Math.round(start.g + (end.g - start.g) * progress),
        Math.round(start.b + (end.b - start.b) * progress)
    );
};

// 简化的物品信息提取
const getItemInfo = item => {
    const meta = item?.getItemMeta();
    if (!meta) return null;
    
    const lore = meta.getLore() || [];
    const info = { 
        energy: 0, 
        energyMax: 2000, 
        bindState: ""
    };
    
    lore.forEach(line => {
        if (!line) return;
        
        // 检测绑定状态
        if (line.includes("卷轴")) info.bindState = line.trim();
        
        // 提取灵力信息
        if (line.includes("灵力剩余")) {
            const match = line.match(/§6(\d+)/g);
            if (match) {
                info.energy = parseInt(match[0].replace('§6', '')) || 0;
                info.energyMax = parseInt(match[1]?.replace('§6', '') || 2000);
            }
        }
    });
    
    return info;
};

// 简化的更新Lore函数
const updateLore = (item, keyword, newText) => {
    const meta = item.getItemMeta();
    if (!meta) return false;
    
    const lore = meta.getLore() || [];
    let updated = false;
    
    for (let i = 0; i < lore.length; i++) {
        if (lore[i]?.includes(keyword)) {
            lore[i] = newText;
            meta.setLore(lore);
            item.setItemMeta(meta);
            updated = true;
            break;
        }
    }
    
    return updated;
};

// 简化的五行粒子效果生成（仅展示）
const spawnFiveElements = (player) => {
    if (!player || !player.isOnline()) return;
    
    const world = player.getWorld();
    const loc = player.getLocation();
    const dir = loc.getDirection().normalize();
    
    const yaw = -loc.getYaw() * Math.PI / 180;
    const pitch = loc.getPitch() * Math.PI / 180;
    
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);
    
    const gridSize = CFG.fontSize / 15;
    const taskIds = [];
    const plugin = Bukkit.getPluginManager().getPlugins()[0];
    const JavaRunnable = Java.extend(Java.type('java.lang.Runnable'));
    const Particle = Java.type('org.bukkit.Particle');
    const DustOptions = Java.type('org.bukkit.Particle.DustOptions');
    
    const rotatePoint = (x, y, z) => {
        const x1 = x;
        const y1 = y * cosPitch - z * sinPitch;
        const z1 = y * sinPitch + z * cosPitch;
        
        const x2 = x1 * cosYaw + z1 * sinYaw;
        const y2 = y1;
        const z2 = -x1 * sinYaw + z1 * cosYaw;
        
        return { x: x2, y: y2, z: z2 };
    };
    
    const drawers = { 金: drawJin, 木: drawMu, 水: drawShui, 火: drawHuo, 土: drawTu };
    
    // 生成所有五行粒子的效果
    Object.entries(CFG.elements).forEach(([name, cfg]) => {
        const drawer = drawers[name];
        if (!drawer) return;
        
        const distance = CFG.spawnDistance + cfg.offset;
        const center = loc.clone().add(
            dir.getX() * distance,
            dir.getY() * distance + CFG.yOffset,
            dir.getZ() * distance
        );
        
        const points = [];
        drawer((x, y) => {
            const px = (7.5 - x) * gridSize;
            const py = (15 - y) * gridSize;
            points.push([px, py, 0]);
        });
        
        if (points.length === 0) return;
        
        const sparkType = Particle.valueOf(cfg.particleType);
        const spawned = new Set();
        let taskId = -1;
        const startTick = Bukkit.getServer().getCurrentTick();
        
        const runnable = new JavaRunnable({
            run: function() {
                if (!player.isOnline()) {
                    safeCancelTask(taskId);
                    return;
                }
                
                const currentTick = Bukkit.getServer().getCurrentTick();
                const elapsed = currentTick - startTick;
                const fadeStart = startTick + CFG.earthSpawnFadeDelay + cfg.fadeDelay;
                const isFading = currentTick >= fadeStart;
                const fadeProgress = isFading ? Math.min(1, (currentTick - fadeStart) / 25) : 0;
                
                // 生成阶段
                if (!isFading && elapsed <= 25) {
                    const toSpawn = Math.floor((elapsed / 25) * points.length);
                    for (let i = spawned.size; i < toSpawn && i < points.length; i++) {
                        const [px, py, pz] = points[i];
                        const rot = rotatePoint(px, py, pz);
                        const pointLoc = center.clone().add(rot.x, rot.y, rot.z);
                        
                        // 生成粒子
                        for (let j = 0; j < cfg.particleCount; j++) {
                            const offsetX = (Math.random() - 0.5) * 0.1 * cfg.size;
                            const offsetY = (Math.random() - 0.5) * 0.1 * cfg.size;
                            const offsetZ = (Math.random() - 0.5) * 0.1 * cfg.size;
                            world.spawnParticle(sparkType, pointLoc.clone().add(offsetX, offsetY, offsetZ), 1, 0, 0, 0, 0);
                        }
                        
                        const color = getGradientColor(cfg.startColor, cfg.endColor, i / points.length);
                        world.spawnParticle(Particle.DUST, pointLoc, 1, 0, 0, 0, 0, new DustOptions(color, cfg.dustSize));
                        spawned.add(i);
                    }
                }
                
                // 消散阶段
                if (isFading && spawned.size > 0) {
                    const keep = Math.floor((1 - fadeProgress) * points.length);
                    const toRemove = [];
                    
                    spawned.forEach(i => {
                        if (i >= keep) {
                            toRemove.push(i);
                        } else {
                            const [px, py, pz] = points[i];
                            const rot = rotatePoint(px, py, pz);
                            const pointLoc = center.clone().add(rot.x, rot.y, rot.z);
                            
                            const sparkCount = Math.ceil(cfg.particleCount * (1 - fadeProgress * 0.5));
                            for (let j = 0; j < sparkCount; j++) {
                                const offsetX = (Math.random() - 0.5) * 0.05 * cfg.size * (1 - fadeProgress);
                                const offsetY = (Math.random() - 0.5) * 0.05 * cfg.size * (1 - fadeProgress);
                                const offsetZ = (Math.random() - 0.5) * 0.05 * cfg.size * (1 - fadeProgress);
                                world.spawnParticle(sparkType, pointLoc.clone().add(offsetX, offsetY, offsetZ), 1, 0, 0, 0, 0);
                            }
                            
                            const baseColor = getGradientColor(cfg.startColor, cfg.endColor, i / points.length);
                            const brightness = 1.0 - fadeProgress * 0.8;
                            const faded = getGradientColor(
                                {r: baseColor.getRed(), g: baseColor.getGreen(), b: baseColor.getBlue()},
                                {r: 0, g: 0, b: 0},
                                fadeProgress
                            );
                            const dustSize = cfg.dustSize * (1 - fadeProgress * 0.5);
                            world.spawnParticle(Particle.DUST, pointLoc, 1, 0, 0, 0, 0, new DustOptions(faded, dustSize));
                        }
                    });
                    
                    toRemove.forEach(i => spawned.delete(i));
                    if (spawned.size === 0) {
                        safeCancelTask(taskId);
                    }
                }
                
                // 超时清理
                if (elapsed >= CFG.particleDuration + CFG.earthSpawnFadeDelay + 50) {
                    safeCancelTask(taskId);
                }
            }
        });
        
        const task = Bukkit.getScheduler().runTaskTimer(plugin, runnable, 0, 1);
        taskId = task.getTaskId();
        taskIds.push(taskId);
    });
    
    // 清理任务
    Bukkit.getScheduler().runTaskLater(plugin, new JavaRunnable({
        run: function() { 
            taskIds.forEach(id => safeCancelTask(id)); 
        }
    }), CFG.particleDuration + CFG.earthSpawnFadeDelay + 60);
};

// 主事件
function onUse(event) {
    const p = event.getPlayer();
    const staff = p.getInventory().getItemInMainHand();
    const book = p.getInventory().getItemInOffHand();
    
    // 检查物品
    if (!staff?.getItemMeta() || !book?.getItemMeta()) {
        p.sendMessage(`§c[${CFG.namePlain}] 主手法杖、副手卷轴！`);
        return;
    }
    
    const staffInfo = getItemInfo(staff);
    const bookInfo = getItemInfo(book);
    
    if (!staffInfo || !bookInfo) return;
    
    // 非潜行：绑定卷轴
    if (!p.isSneaking()) {
        if (staffInfo.bindState !== CFG.unlockLore && 
            (staffInfo.bindState === CFG.defaultLore || staffInfo.bindState.startsWith("§a已录取卷轴"))) {
            updateLore(staff, "卷轴", CFG.unlockLore);
            p.sendMessage(`§a[${CFG.namePlain}] 绑定成功！`);
        }
        return;
    }
    
    // 潜行：施放技能
    if (staffInfo.bindState !== CFG.unlockLore) {
        p.sendMessage(`§c[${CFG.namePlain}] 法杖未绑定该卷轴！`);
        return;
    }
    
    // 检查冷却
    const uuid = p.getUniqueId().toString();
    const now = Bukkit.getServer().getCurrentTick();
    const lastUse = cooldowns.get(uuid) || 0;
    const cd = CFG.cooldown; // 简化：固定冷却时间
    
    if (now - lastUse < cd) {
        p.sendMessage(`§c[${CFG.namePlain}] 冷却中！剩余${((cd - (now - lastUse)) / 20).toFixed(1)}秒`);
        return;
    }
    
    // 检查灵力
    if (staffInfo.energy < CFG.rayEnergyCost) {
        p.sendMessage(`§c[${CFG.namePlain}] 灵力不足！需要${CFG.rayEnergyCost}点`);
        return;
    }
    
    // 生成五行粒子效果
    spawnFiveElements(p);
    
    // 消耗灵力
    updateLore(staff, "灵力剩余", `§b灵力剩余：§6${Math.max(0, staffInfo.energy - CFG.rayEnergyCost)} §7/ §6${staffInfo.energyMax}`);
    
    // 设置冷却
    cooldowns.put(uuid, now);
    
    // 播放音效
    p.getWorld().playSound(p.getLocation(), CFG.soundName, 1.2, 1.0);
    
    // 提示信息
    p.sendMessage(`§a[${CFG.namePlain}] 五行之力，显现！`);
}

// 辅助函数
const safeCancelTask = (taskId) => {
    if (taskId && typeof taskId === 'number' && taskId > 0) {
        try { Bukkit.getScheduler().cancelTask(taskId); } catch (e) {}
    }
};