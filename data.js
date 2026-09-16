// ============================================================
// BREAD DIARY DATA
// This file is the source of truth. The agent updates it each time
// you report a bake. You can also edit it by hand.
// Each bake is one object in the BAKES array.
// ============================================================

window.BAKES = [
  {
    id: "b1",
    number: 1,
    date: "2026-09-15",
    dateNote: "approx. (undated)",
    title: "Seeded Sandwich Loaf",
    leavening: "Instant yeast",
    status: "Baked",
    rating: 4,
    recipe: {
      breadFlour: 220,
      wholemealFlour: 105,
      plainFlour: 0,
      otherFlour: 0,
      otherFlourNote: "",
      water: 245,
      salt: 6,
      yeast: 2,
      levain: 0,
      oil: 10,
      honey: 10,
      chia: 8,
      flax: 0,
      pumpkinSeed: 0,
      sunflowerSeed: 0,
      otherSeeds: 22,
      otherSeedsNote: "pumpkin + flax + sunflower (mixed)"
    },
    environment: { temp: "33 °C", humidity: "—" },
    process: {
      levainBuild: "—",
      mixing: "Mixed everything at 1:00 PM, rested 30 min (autolyse).",
      folds: "Stretch & fold (×3) + 1 coil fold, 30 min apart. Rested another 30 min.",
      bulk: "Room temp until 3:00 PM.",
      retard: "Fridge 3:00 PM – 7:30 PM (4.5 hrs).",
      shaping: "Shaped and put into loaf tin at 8:00 PM.",
      proof: "Final proof 8:30–9:30 PM (~1 hr) at room temp.",
      bake: "210 °C for 15 min with steam (hot-water tray), then 190 °C for 40 min.",
      cooling: "Cooled on a rack."
    },
    notes: "Well-proofed, domed nicely, good oven bloom. Crumb open and even — great for a soft seeded sandwich loaf. Slightly uneven browning (paler on one side); the bloom split a little unevenly (unscored).",
    verdict: "Solid, reliable everyday loaf. Crumb exactly right for a sandwich style.",
    improvements: "Rotate the loaf for even browning; score deliberately for a cleaner bloom; tighter / more even shaping; longer cold retard for more flavour.",
    photos: []
  },
  {
    id: "b2",
    number: 2,
    date: "2026-09-16",
    dateNote: "",
    title: "Seeded Sourdough (first sourdough!)",
    leavening: "Sourdough",
    status: "In progress",
    rating: null,
    recipe: {
      breadFlour: 180,
      wholemealFlour: 105,
      plainFlour: 0,
      otherFlour: 0,
      otherFlourNote: "",
      water: 195,
      salt: 6.5,
      yeast: 0,
      levain: 100,
      oil: 10,
      honey: 10,
      chia: 8,
      flax: 15,
      pumpkinSeed: 15,
      sunflowerSeed: 0,
      otherSeeds: 0,
      otherSeedsNote: ""
    },
    environment: { temp: "29 °C", humidity: "89 %" },
    process: {
      levainBuild: "Bakery starter, kept 2 days in fridge. Built levain 12:00 PM: 40 g starter + 40 g bread flour + 40 g water (1:1:1). Doubled & domed by ~3:00 PM.",
      mixing: "Split: 100 g levain → dough; 20 g → re-fed (20:20:20) as keeper. Mixed flours + water + levain (autolyse 30 min), then added salt, oil, honey, seeds + soaked chia.",
      folds: "3 sets of folds (stretch & coil), 30 min apart. Dough smooth, domed and glossy after fold #3.",
      bulk: "Room temp until puffy & domed (~40–50% rise) — reached by 7:00 PM.",
      retard: "Fridge from 7:00 PM (overnight retard, ~12 hrs).",
      shaping: "Planned: shape cold from the fridge, taut roll into the tin.",
      proof: "Planned: 40–50 min at room temp (hot kitchen — watch closely).",
      bake: "Planned: 210 °C / 15 min with steam, then 190 °C / ~40 min.",
      cooling: "Cool fully on a rack."
    },
    notes: "First sourdough attempt. Levain from a bakery. Warm, humid conditions (29 °C / 89 %) so fermentation is fast. Went with pure sourdough (no instant yeast). Dough came together well after the first stretch & fold — pale, well-hydrated, chia gel visible. Seeds (flax + pumpkin) were too coarse and sat proud on the surface at first, but 3 sets of folds distributed them well. Keeper (20 g) fed 1:1:1 and refrigerated after ~2 hrs. Bulk dough went into the fridge at 7:00 PM — puffy, domed and glossy (~40–50% rise).",
    verdict: "Pending — baking tomorrow morning.",
    improvements: "Watch the final proof carefully to avoid over-proofing in the heat. CRACK/CHOP the flax and pumpkin seeds (or soak the flax) so they distribute evenly instead of sitting whole on the surface.",
    photos: []
  }
];
