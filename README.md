# 🍞 Bread Diary

A little local web app to log and compare your bakes.

## Files
- `index.html`  — the app (open this in your browser)
- `data.js`     — the bake data (the source of truth the agent updates)
- `images/`     — photos (optional; you can also add photos inside the app)

## How to open it

**Easiest (double-click):**
Open `index.html` in Chrome/Safari/Firefox. Everything works offline.

**Most reliable (recommended) — tiny local server:**
In-browser edits are saved to localStorage, which some browsers restrict on
`file://`. To guarantee saving works, run a one-line server:

```bash
cd ~/bread-diary
python3 -m http.server 8080
```

Then open: http://localhost:8080

## What it does
- **Table view** — every bake with auto-computed metrics:
  total flour, hydration %, whole-grain %, levain %, instant-yeast %,
  salt %, room temp, status, rating.
- **Click any row** → full detail: recipe (grams), process timeline,
  notes/verdict, and photos.
- **+ Add bake** → log a new loaf (or edit an existing one).
- **Checkboxes + Compare selected** → side-by-side comparison of any bakes.
- **Photos** → attach images in the edit form; they're auto-resized and stored.
- **Export JSON / data.js / Copy** → get your data out.
- **Import** → load a JSON (or a `data.js`) back in.
- **Reload data.js** → discard browser edits and re-read the file.

## How updates work
Tell me about a bake in chat (recipe + process + outcome/photos) and I'll
update `data.js` directly. Then either:
- click **Reload data.js** in the app, or
- just reopen the page.

Your own in-app edits live in the browser (localStorage) and take precedence
until you reload from the file.

## Notes on metrics
- Hydration includes the levain contribution (assumes a 100% hydration levain,
  i.e. equal flour & water). So `total flour = flours + levain/2`,
  `total water = water + levain/2`.
- Baker's % are relative to the total flour (including levain flour).
