const SlimefunItem = Java.type('io.github.thebusybiscuit.slimefun4.api.items.SlimefunItem');
let cache = new java.util.HashMap();

function tick(info) {}

function onPlace(e) {
    cache.put(e.getBlock().getLocation(), e.getBlock().getType().name());
}

function onBreak(e) {
    let loc = e.getBlock().getLocation();
    if (cache.containsKey(loc) && cache.get(loc) !== e.getBlock().getType().name()) {
        e.setDropItems(false);
        e.setExpToDrop(0);
    }
    cache.remove(loc);
}