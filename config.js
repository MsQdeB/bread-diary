// ============================================================
// BREAD DIARY — CONFIG / SEED DATA
// Ingredient prices (editable in the app's Costing tab),
// app settings, and a starter-feeding log.
// Keys match the recipe fields used per bake.
// Prices are per kg, in VND (Vietnam).
// ============================================================

window.INGREDIENTS = [
  { key: "breadFlour",    label: "Bread flour",    price: 25000 },
  { key: "wholemealFlour",label: "Wholemeal flour",price: 40000 },
  { key: "plainFlour",    label: "Plain flour",    price: 22000 },
  { key: "otherFlour",    label: "Other flour",    price: 45000 },
  { key: "water",         label: "Water",          price: 200 },
  { key: "salt",          label: "Salt",           price: 12000 },
  { key: "yeast",         label: "Instant yeast",  price: 250000 },
  { key: "levain",        label: "Levain (starter)",price: 12600 },
  { key: "oil",           label: "Olive oil",      price: 150000 },
  { key: "honey",         label: "Honey",          price: 250000 },
  { key: "chia",          label: "Chia seed",      price: 250000 },
  { key: "flax",          label: "Flaxseed",       price: 80000 },
  { key: "pumpkinSeed",   label: "Pumpkin seeds",  price: 300000 },
  { key: "sunflowerSeed", label: "Sunflower seeds",price: 100000 },
  { key: "otherSeeds",    label: "Other seeds",    price: 150000 }
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
  { id: "s3", date: "2026-09-21", time: "19:00", ratio: "1:1:1", starter: 30, flour: 40, water: 40, temp: "29 °C", rise: "almost doubled", peakTime: "~3 h", notes: "Levain for the combined bake (#4 large + #6 small). Slightly under-peaked at ~3 h (float test sank) but used anyway + 1 g instant yeast as insurance. Chia folded into the whole dough; went to a cold bulk at 11 PM." }
];
