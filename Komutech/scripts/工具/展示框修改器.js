const MODES = {
  HIDE: {
    lore: "§6§l当前模式: §7隐形",
    action: false,
    message: "§a已隐形！"
  },
  SHOW: {
    lore: "§6§l当前模式: §b显形",
    action: true,
    message: "§a已显形！"
  }
};

const cooldowns = new java.util.HashMap();
const COOLDOWN_TIME = 10;

function getCurrentMode(lore) {
  if (!lore) return MODES.HIDE;
  return Object.values(MODES).find(mode => lore.some(line => line.includes(mode.lore.split(": ")[1]))) || MODES.HIDE;
}

function checkCooldown(player) {
  const now = org.bukkit.Bukkit.getServer().getCurrentTick();
  const uuid = player.getUniqueId().toString();
  
  if (cooldowns.containsKey(uuid) && now - cooldowns.get(uuid) < COOLDOWN_TIME) {
    return false;
  }
  cooldowns.put(uuid, now);
  return true;
}

function isCompressedVersion(item) {
  const meta = item.getItemMeta();
  if (!meta) return false;
  
  const displayName = meta.getDisplayName();
  return displayName && displayName.includes("压缩");
}

function processSingleFrame(player, item, frame, mode) {
  frame.setVisible(mode.action);
  player.sendMessage(mode.message);
}

function processCompressedFrames(player, item, centerFrame, mode) {
  const centerLoc = centerFrame.getLocation();
  const world = centerFrame.getWorld();
  const facing = centerFrame.getFacing();
  
  const affectedFrames = [centerFrame];
  
  const searchRadius = 1.5;
  const nearbyEntities = world.getNearbyEntities(centerLoc, searchRadius, searchRadius, searchRadius);
  
  const processedUUIDs = new Set();
  processedUUIDs.add(centerFrame.getUniqueId().toString());
  
  for (const entity of nearbyEntities) {
    if (entity instanceof org.bukkit.entity.ItemFrame) {
      const entityUUID = entity.getUniqueId().toString();
      
      if (processedUUIDs.has(entityUUID)) continue;
      processedUUIDs.add(entityUUID);
      
      if (entity.getFacing() === facing) {
        const entityLoc = entity.getLocation();
        const distance = Math.max(
          Math.abs(entityLoc.getX() - centerLoc.getX()),
          Math.abs(entityLoc.getY() - centerLoc.getY()),
          Math.abs(entityLoc.getZ() - centerLoc.getZ())
        );
        
        if (distance <= 1) {
          affectedFrames.push(entity);
        }
      }
    }
  }
  
  affectedFrames.forEach(frame => {
    frame.setVisible(mode.action);
  });
  
  player.sendMessage(`${mode.message} §7(影响了 ${affectedFrames.length} 个展示框)`);
}

function onUse(event) {
  const player = event.getPlayer();
  const item = event.getItem();
  if (!player || !item) return;

  if (!checkCooldown(player)) return;

  if (player.isSneaking()) {
    const meta = item.getItemMeta();
    let lore = meta.getLore() || [];
    const currentMode = getCurrentMode(lore);
    const newMode = currentMode === MODES.HIDE ? MODES.SHOW : MODES.HIDE;
    
    lore = lore.filter(line => !line.includes("§6§l当前模式"));
    lore.push(newMode.lore);
    
    meta.setLore(lore);
    item.setItemMeta(meta);
    player.sendMessage(`§a已切换至: ${newMode.lore.split(": ")[1]}`);
    return;
  }

  const rayTrace = player.getWorld().rayTrace(
    player.getEyeLocation(),
    player.getEyeLocation().getDirection(),
    5,
    org.bukkit.FluidCollisionMode.NEVER,
    true,
    0.1,
    e => e instanceof org.bukkit.entity.ItemFrame
  );

  if (rayTrace && rayTrace.getHitEntity()) {
    const frame = rayTrace.getHitEntity();
    const isCompressed = isCompressedVersion(item);
    const mode = getCurrentMode(item.getItemMeta().getLore());
    
    if (isCompressed) {
      processCompressedFrames(player, item, frame, mode);
    } else {
      processSingleFrame(player, item, frame, mode);
    }
  }
}