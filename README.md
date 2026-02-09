# Pulse & Pattern — AI in Medicine (Research)

A ship-ready, offline-first **news article** experience (vanilla HTML/CSS/JS) focused on **AI in medicine research**: validation, trials, monitoring, and where the evidence is still thin.

## Run

### Option A: open directly
- Double-click `index.html`.

### Option B: recommended (local server)
Some browser features (like the optional service worker) only work over `http://`.

```bash
cd ai-medicine-news
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Where the content lives (edit the article)

All stories and section lists live in:
- `js/data.js`

You can:
- edit titles, dates, tags, and bylines
- rewrite paragraphs / add headings
- add or change images (use local files under `assets/img/`)

## How to use the UI

- **Search**: use the header field, or press `/` to focus search (when not typing in an input).
- **Save for later**: use “Save” buttons on rows or on the article page.
- **On this page** (TOC): in the article sidebar, click a section to scroll (hash routing is preserved).
- **Theme**: toggle in the header.

Keyboard shortcuts are documented in-app:
- `#/help` (Help → Keyboard)

## Offline behavior

This app does not load any external fonts, scripts, or images.
- All UI assets are local (`assets/`).
- Source links in the article are external and will only open when you have internet access.

An optional `sw.js` service worker is included for caching when served over `http://`.

## Known limitations

- This is front-end only (no real accounts, no real email sending).
- Newsletter subscription is stored locally (LocalStorage) on this device.
- Tips saved on the About page are local only.
