// ============================================================
// BREAD DIARY — CONFIG / SEED DATA
// Ingredient prices (editable in the app's Costing tab),
// app settings, and a starter-feeding log.
// Keys match the recipe fields used per bake.
// ============================================================

window.INGREDIENTS = [
  { key: "breadFlour",    label: "Bread flour",    price: 3.00 },
  { key: "wholemealFlour",label: "Wholemeal flour",price: 3.50 },
  { key: "plainFlour",    label: "Plain flour",    price: 2.50 },
  { key: "otherFlour",    label: "Other flour",    price: 4.00 },
  { key: "water",         label: "Water",          price: 0.01 },
  { key: "salt",          label: "Salt",           price: 1.50 },
  { key: "yeast",         label: "Instant yeast",  price: 25.00 },
  { key: "levain",        label: "Levain (starter)",price: 3.00 },
  { key: "oil",           label: "Olive oil",      price: 10.00 },
  { key: "honey",         label: "Honey",          price: 15.00 },
  { key: "chia",          label: "Chia seed",      price: 18.00 },
  { key: "flax",          label: "Flaxseed",       price: 6.00 },
  { key: "pumpkinSeed",   label: "Pumpkin seeds",  price: 25.00 },
  { key: "sunflowerSeed", label: "Sunflower seeds",price: 8.00 },
  { key: "otherSeeds",    label: "Other seeds",    price: 12.00 }
];

window.SETTINGS = {
  currency: "RM",
  energyPerBake: 0.50,   // cost of oven energy, per bake
  packagingPerLoaf: 0.30,
  laborRate: 15.00,      // per hour
  laborHours: 0.50,      // active hands-on time per bake
  defaultMakes: 1        // loaves a recipe yields
};

window.STARTER_LOG = [
  // { id, date, time, ratio, starter, flour, water, temp, rise, peakTime, notes }
];
