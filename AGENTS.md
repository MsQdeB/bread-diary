# AGENTS.md — instructions for this directory (`~/ai-projects/bread-diary`)

This is **"Unapologetic Home Baker — Bake What I Like"**, a self-contained
bread-baking diary web app (no build step, vanilla HTML/CSS/JS) that also
publishes as a public site via GitHub Pages.

## What it is
- **Repo:** `github.com/MsQdeB/bread-diary` · **Live:** https://msqdeb.github.io/bread-diary/
- **Author/owner:** a home baker (in Vietnam; prices in **VND**, kitchen ~**30 °C**).
- The owner logs bakes; the agent maintains the data + app and pushes.

## Key files
| File | Purpose |
|---|---|
| `index.html` | App shell: tabs, modals, share view. |
| `app.js` | All logic (metrics, cost, checklists, share view, save-to-GitHub). |
| `styles.css` | Styling (light/dark, print). |
| `data.js` | **`window.BAKES`** — the bake records (SOURCE OF TRUTH). |
| `config.js` | `window.INGREDIENTS` (prices), `SETTINGS`, `STARTER_LOG`. |
| `checklist.html` | Standalone tickable/printable checklist for the current bake. |
| `sw.js`, `manifest.json`, `icon.svg` | PWA (offline, installable). |
| `images/` | Bake photos referenced by `data.js`. |

## How updates work
- **The agent** edits `data.js` / `config.js` and **pushes**; GitHub Pages rebuilds in ~1 min. (Preferred.)
- The owner can also **"⬆ Save to GitHub"** from the app (edit mode) — it commits `data.js` + `config.js` via a PAT stored in their browser.
- The hosted site is **view-only** for guests (`?edit=1` forces edit for the owner).

## View modes (URL)
- `…/` → full diary (homepage).
- `…/` on `github.io` → **view-only** (no add/edit/delete/import; costing visible).
- `…/?edit=1` → edit mode (owner).
- `…/?view=1` → force view-only.
- `…/?bake=ID` → **single-bake share view** — see rule below.

## RULE: customer share view
**Only build / use the individual baked-loaf share view (`?bake=ID`) when the
bake is for a CUSTOMER.** For the owner's own bakes, do NOT create or share a
per-bake link — the normal diary (or nothing) is fine.

The share view (`?bake=ID`) shows a **clean, customer-facing page**: title,
ingredients, method, photos — **no prices, no notes, no tabs, no edit buttons**.

When a bake is for a customer:
- Add it to `data.js` with `tags` including `"order"` and a clear `dateNote`
  (e.g. `"CUSTOMER ORDER — pickup Sun 11 Oct 11 AM"`).
- Give the customer the link: `https://msqdeb.github.io/bread-diary/?bake=<id>`.
- (Optional) set `sellPrice` on the bake for margin tracking.

## Conventions
- **Bake object** fields: `id` (`b<N>`), `number`, `date` (YYYY-MM-DD),
  `dateNote`, `title`, `leavening` (`Instant yeast`/`Sourdough`/`Hybrid`),
  `status` (`Planned`/`Baked`/`Cancelled`), `rating` (1–5), `score`
  `{crumb,spring,crust,sour,flavour}`, `tags`, `makes`, `bakedWeight`,
  `batch`, `sellPrice`, `recipe` (grams), `environment` `{temp,humidity}`,
  `process` (levainBuild→cooling), `notes`, `verdict`, `improvements`, `photos`.
- **Recipe keys** (grams): breadFlour, wholemealFlour, plainFlour, otherFlour,
  water, salt, yeast, levain, oil, honey, chia, flax, pumpkinSeed,
  sunflowerSeed, otherSeeds.
- **Metrics:** hydration includes levain water (assume 100%-hydration levain);
  baker's % relative to total flour. **Cost:** ingredient g × price/kg + energy
  + packaging/loaf + labour; bakes sharing a `batch` tag split energy/labour.
- **Seed-soak water** is taken **out of** the recipe water (never added on top).
- **Currency:** VND, 0 decimals.

## Working notes
- After editing `data.js`/`config.js`, **validate** with
  `node -e "global.window={}; require('./data.js'); require('./config.js')"` before pushing.
- Keep the `checklist.html` timed to the current bake when one is in progress.
- The service worker is **network-first**; after app changes, users may need one hard-refresh.
