// ============================================================
// BREAD DIARY — CONFIG / SEED DATA
// Ingredient prices (editable in the app's Costing tab),
// app settings, and a starter-feeding log.
// Keys match the recipe fields used per bake.
// Prices are per kg, in VND (Vietnam).
// Source: "NO WASTE TO GO" zero-waste bulk refill shop, Da Nang — retail prices in VND per gram, x1000 to get per kg.
// ============================================================

window.INGREDIENTS = [
  { key: "breadFlour",    label: "Bread flour",     price: 30000 },   // 30đ/g
  { key: "wholemealFlour",label: "Wholemeal flour", price: 65000 },   // 65đ/g
  { key: "plainFlour",    label: "All-purpose flour",price: 28000 },  // 28đ/g
  { key: "otherFlour",    label: "Other flour",     price: 30000 },
  { key: "water",         label: "Water",           price: 200 },
  { key: "salt",          label: "Sea salt (coarse)",price: 27000 },   // 27đ/g
  { key: "yeast",         label: "Instant yeast",   price: 250000 },  // not on list — estimate
  { key: "levain",        label: "Levain (starter)",price: 15100 },   // ~ (bread flour + water) / 2
  { key: "oil",           label: "Olive oil",       price: 370000 },  // 370đ/g
  { key: "honey",         label: "Honey",           price: 150000 },  // 150đ/g
  { key: "chia",          label: "Chia seed",       price: 160000 },  // 160đ/g
  { key: "flax",          label: "Flaxseed (raw)",  price: 120000 },  // 120đ/g
  { key: "pumpkinSeed",   label: "Pumpkin seeds",   price: 260000 },  // 260đ/g
  { key: "sunflowerSeed", label: "Sunflower seeds", price: 150000 },  // 150đ/g
  { key: "otherSeeds",    label: "Other seeds",     price: 150000 }
];

window.SETTINGS = {
  currency: "\u20ab",    // Vietnamese dong symbol
  decimals: 0,           // VND has no decimals
  energyPerBake: 8000,   // oven energy, VND per bake
  packagingPerLoaf: 3000,
  laborRate: 50000,      // VND per hour
  laborHours: 0.5,       // active hands-on time per bake
  defaultMakes: 1
};

window.STARTER_LOG = [
  { id: "s1", date: "2026-09-16", time: "12:00", ratio: "1:1:1", starter: 40, flour: 40, water: 40, temp: "29 °C", rise: "doubled", peakTime: "3 h", notes: "Bakery starter woken from 2 days in fridge. Built levain; doubled & domed by ~3 PM." },
  { id: "s2", date: "2026-09-16", time: "15:00", ratio: "1:1:1", starter: 20, flour: 20, water: 20, temp: "29 °C", rise: "bubbly, partial rise", peakTime: "~2 h", notes: "Keeper split off after baking levain. Fed and left out ~2 h, then refrigerated at ~5 PM." },
  { id: "s3", date: "2026-09-21", time: "19:00", ratio: "1:1:1", starter: 30, flour: 40, water: 40, temp: "29 °C", rise: "almost doubled", peakTime: "~3 h", notes: "Levain for the combined bake (#4 large + #6 small). Slightly under-peaked at ~3 h (float test sank) but used anyway + 0.8 g instant yeast as insurance. Chia folded into the whole dough; went to a cold bulk at 11 PM." }
];
