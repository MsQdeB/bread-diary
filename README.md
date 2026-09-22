# 🍞 Unapologetic Home Baker — Bread Diary

> “Bake What I Like.”

A self-contained local web app for logging, comparing and costing bread bakes.
No build step, no dependencies — everything runs in the browser.

## Files
| File | Purpose |
|---|---|
| `index.html` | The app shell (tabs, modals). Open this. |
| `styles.css` | Styling (light + dark themes, print styles). |
| `app.js` | All app logic. |
| `data.js` | **Bake data** (`window.BAKES`) — the source of truth I update. |
| `config.js` | Ingredient prices, settings, starter log seed. |
| `checklist.html` | Standalone tickable checklist for a specific bake. |
| `BAKING-CHECKLIST.md` | Markdown bake plan/checklist. |

## How to open
**Double-click `index.html`** — works offline.

For reliable saving (localStorage is restricted on `file://` in some browsers),
run a tiny server:
```bash
cd ~/bread-diary
python3 -m http.server 8080
```
then open http://localhost:8080

## Tabs / features
- **Bakes** — table of every bake with auto metrics (total flour, hydration %,
  whole-grain %, levain %, salt %, room temp, **cost/loaf**, status, rating).
  Search, filter by type, sort by date / rating / hydration / cost. Click a row
  for full detail (recipe, process, scorecard, cost, notes, photos). **Print** a
  recipe card from the detail view.
- **Compare** — tick any bakes for a side-by-side table.
- **Insights** — KPIs + charts: rating by bake, hydration vs rating, cost/loaf,
  and scorecard averages.
- **Calculator** — Baker's % calculator + recipe scaler (scale to a target dough
  weight or to N loaves).
- **Schedule** — bake timeline generator. Enter start time + kitchen temp and it
  computes every step's clock time (durations auto-adjust for warmth); edit any
  step and the timeline re-flows.
- **Starter** — log feedings (ratio, temp, grams, rise, time-to-peak).
- **Costing** — set ingredient prices (per kg) + energy/packaging/labour
  settings, currency; see a per-bake cost breakdown and margins.
- **Checklists** — reusable checklists (tickable, saved): **Starter maintenance**,
  **Bake-day prep**, and **Order/shop list**. Plus, **every bake gets its own
auto-generated checklist** (open a bake → **Checklist**) built from that
  recipe's steps — tick it off, reset, or print.
- **Guide** — hydration science: what hydration % means, the low-vs-high trade-off
  table, what changes the "real" feel, plus **your own bakes charted** by hydration.
- **Troubleshoot** — searchable library of common bread problems → causes & fixes.

## Data & storage
- Everything is saved in your browser's `localStorage` (key `breadDiary.v2`).
- **Export JSON** — full data (bakes + prices + settings + starter).
- **Export data.js** — just the bakes, to replace `data.js`.
- **CSV** — spreadsheet export of bakes.
- **Import** — load a JSON or `data.js`.
- **Reload files** — discard browser edits and re-read `data.js` / `config.js`.

## How updates work
Tell me about a bake in chat (recipe + process + outcome/photos) and I'll update
`data.js`. Then click **Reload files** in the app (or reopen it).

## Metrics notes
- Hydration counts the levain's water (assumes a 100 % hydration levain):
  `total flour = flours + levain/2`, `total water = water + levain/2`.
- Baker's % are relative to total flour (incl. levain flour).
- Cost = ingredient grams × price/kg + energy/bake + packaging/loaf × makes +
  labour (rate × hours). Editable in **Costing**.
