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
    status: "Baked",
    rating: 4,
    score: { crumb: 4, spring: 4, crust: 4, sour: 4, flavour: 4 },
    makes: 1,
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
      shaping: "Shaped cold from the fridge at ~8:20 AM. Dough was soft, slack and a little sticky (acid-relaxed gluten at 73% hydration + wholemeal + chia gel). Light flour dust, taut roll into the oiled tin.",
      proof: "Final proof at room temp (29 °C / 87%). Dough went in slack and only rose ~2/3 up the tin. Poke test: spring-back slowed at ~45 min → baked. (Deliberately baked on the early side to keep it mild.)",
      bake: "210 °C / 15 min with steam (water tray), then 190 °C / 50 min — 65 min total. Good oven spring at 15 min; pulled away from tin; deep golden seed-flecked crust.",
      cooling: "Cooled fully on a rack before slicing."
    },
    notes: "First sourdough attempt. Levain from a bakery. Warm, humid conditions (29 °C / 89 %) so fermentation is fast. Went with pure sourdough (no instant yeast). Dough came together well after the first stretch & fold — pale, well-hydrated, chia gel visible. Seeds (flax + pumpkin) were too coarse and sat proud on the surface at first, but 3 sets of folds distributed them well. Keeper (20 g) fed 1:1:1 and refrigerated after ~2 hrs. Bulk dough went into the fridge at 7:00 PM — puffy, domed and glossy (~40–50% rise).",
    verdict: "First sourdough — success. Open, even, seed-studded crumb; good oven spring; deep golden crust; mild flavour (12 h retard + early bake worked). Slightly denser band near the bottom from uneven shaping.",
    improvements: "1) Dough was wet/sticky when shaping — normal for sourdough (acid-relaxed gluten); next time use WET hands + bench scraper and add little flour. 2) Shaping: couldn't flatten into an even rectangle (sticky) → uneven roll → lopsided top + dense band at the base. Flatten only ~2 cm roughly, use a scraper, pre-shape + 15 min rest. 3) Final proof went in slack and only ~2/3 up the tin — shape tighter. 4) Bake 65 min (target 55) — get a cheap instant-read thermometer and bake to 93–96 °C. 5) CRACK/CHOP + soak the seeds — worked well via folds, keep doing it.",
    photos: ["images/bake2-bulk.jpg", "images/bake2-crumb1.jpg", "images/bake2-crumb2.jpg"]
  }
];
