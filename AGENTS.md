# AGENTS.md — hhh-map-maker

Guide for coding agents working in this repo. It covers how the app works, where things live, and what breaks easily.

## What this is

A single-page Vue 3 app that renders the **"Next Run" flyer for Bali Hash House Harriers 2** as a virtual A4 sheet (21cm × 29.7cm). It reads the club's hareline from a Google Sheet, picks this week's run, and lays out the run details, a Google Map with a pin, the committee ("mismanagement"), and the upcoming hareline. The page is meant to be printed or saved as a PDF.

- Live site: `https://map.balihash2.com/`, served by **Cloudflare Pages**.
- Repo: `github.com/Bali-HHH2/hhh-map-maker`.
- There is no backend. The browser calls the Google Sheets and Google Maps APIs directly.

## Stack and commands

| Thing | Version / note |
|---|---|
| Vue | 3 (`<script setup>`, Composition API) |
| Build | Vite **2.9** + `@vitejs/plugin-vue` 2 |
| Language | TypeScript 4.9, SCSS (`sass`) |
| Libraries | `@googlemaps/js-api-loader`, `fabric` **v6**, `html2canvas`, `date-fns` v2, `geo-coordinates-parser` |
| Node | `.node-version` → 19 |
| Package manager | `bun.lock` is the only lockfile, so use **bun**. The README still says pnpm, which is out of date. |

```bash
bun install
bun run dev        # vite --port 3005  → http://localhost:3005 (proxies /api to :8788)
bun run api        # wrangler pages dev on :8788: Pages Functions + local KV (serves dist/, so build once first)
bun run build      # vite build → dist/  (no type check)
bun run build-ts   # vue-tsc --noEmit && vite build  (currently FAILS, see Gotchas)
bun run test       # bun test test/  (Pages Function checks)
bun run preview
bun run lint       # prettier src --write  (rewrites files)
```

The only tests cover `functions/api/edits.js`. To verify UI changes, run `bun run build` and look at the page in a browser. Without `bun run api`, `/api/edits` fails and the page renders unedited.

### Environment

`.env` (gitignored) holds one client variable:

```
VITE_GOOGLEMAPS_API_KEY=...
```

**This one key is used for both the Google Maps JS API and the Google Sheets v4 API** (`src/utils/getHareLine.ts`). It ships in the client bundle, so it must be restricted by HTTP referrer in Google Cloud. The Cloudflare Pages project also needs it set as a build-time env var, because Vite inlines `import.meta.env.*` during the build.

`.dev.vars` (gitignored) holds `PASSWORD=...` for `bun run api`. In production, `PASSWORD` is a Pages secret. It is the same password hash-bot uses.

## Directory map

```
index.html                  Vite entry; title, favicons, (unused) mapbox css link
functions/api/edits.js      Pages Function: GET/PUT/DELETE saved edits in KV
test/edits.test.js          bun tests for the function (outside functions/ so Pages doesn't route it)
src/main.ts                 createApp(App).mount('#app')
src/App.vue                 Root: fetches sheet, derives current run, top-level buttons, edit-mode bootstrap
src/components/
  Page.vue                  The A4 flyer itself + print/rasterise logic
  Title.vue                 Logo, "Bali Hash House Harriers 2 / Next Run", fee table (hardcoded prices)
  GoogleMap.vue             Google Map + custom pin + compass overlay; placeholder when no coords
  HareLine.vue              Upcoming runs list (in-page) and the "Previous Runs" full-page list
  ImageEditor.vue           fabric.js canvas over the A4 page: places images (edit mode) and shows saved ones
  EditPanel.vue             Edit-mode panel: password, map coordinates, image buttons, Save
  BlankPage.vue             Unused blank A4 template (commented out in App.vue)
src/utils/
  getHareLine.ts            Google Sheets fetch
  edits.ts                  fetchEdits / saveEdits client for /api/edits
  currentRun.ts             Sheet row → ICurrentRun; picks this week's run; sets document.title
  isInCurrentWeek.ts        Monday-to-Sunday week check
  create-copy-text.ts       "Copy Run Info" clipboard text
  delay.ts                  Promise-based sleep
  cf-worker.js              LEGACY standalone Cloudflare Worker (not imported; see below)
src/composables/useWindowDimensions.ts   useIsMobile(): window width <= $mobile_width (via the SCSS :export)
src/style/Global.module.scss             $mobile_width: 800px + `@include mobile { }` mixin
src/assets/                 logo, compass, pin2 (map marker), map placeholder, gmail icon;
                            arrow.png, pin.png, fb/insta/twitter .ico are unused or only in commented-out markup
public/                     favicons + site.webmanifest (copied verbatim to dist/)
dist/                       Build output (gitignored)
```

## Data source: the Google Sheet

`getHareLine()` requests:

```
https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/<CURRENT_YEAR>?alt=json&key=<VITE_GOOGLEMAPS_API_KEY>
```

- **The tab name is the current calendar year** (`new Date().getFullYear()`). Each new year the club needs a tab named `2027` and so on, or the app gets no data.
- The response's `values` is a `string[][]`: rows of cells as display strings.

### Column layout (0-indexed)

| Index | Sheet col | Meaning | Used as |
|---|---|---|---|
| 0 | A | Run number | `number`; must `parseInt` to a truthy value |
| 1 | B | Date | `date`; parsed with `new Date(str)`, so the format matters |
| 2 | C | Hares | `hares` |
| 3 | D | Occasion | `occasion` (shown as `<h2>` if present) |
| 4 | E | Run site name | `runSiteName` (default `"Waiting on hares..."`) |
| 5 | F | Coordinates (free text, any format `geo-coordinates-parser` accepts) | `coordinates`, `googleMapsLink` |
| 6 | G | Start time | `startTime`. Any value without `4:30` is shown big and red as "non-standard". |
| 7 | H | Remark | `remark` (underlined under the occasion) |

**Special cell:** row 0, col 5 (**F1**) holds the *mismanagement* (committee) text shown in the footer.

### How rows are filtered (`App.vue` `onBeforeMount`)

- `fullHairLine` (used for "View Past Maps") keeps rows where `parseInt(A)` is truthy **and** A, B, C, D, F are all non-empty. A run with no occasion (D) is left out of the past-runs list.
- `hairLine` (upcoming) keeps rows with run number `> 1500`, hares (C) present, and date `>= yesterday`.
- `currentRun(hairLine)` takes the **first** row whose date is in the current Monday–Sunday week (`isInCurrentWeek`) and passes it to `formRunObject`.
- `filteredHareLine = hairLine.slice(1)` is the "Receding Hareline" box. It assumes the current run is the first element of `hairLine`.

### `ICurrentRun` (`src/utils/currentRun.ts`)

```ts
{ number, date, hares, googleMapsLink, occasion, runSiteName,
  coordinates /* [lng, lat] as strings, or null */, filteredHareLine, startTime, remark }
```

**The coordinate order is `[longitude, latitude]`**: index 0 is lng and index 1 is lat. `GoogleMap.vue`, `Page.vue`, `create-copy-text.ts` and the edit box all depend on this order (git: "fix coords order"). Displayed text is `coordinates[1], coordinates[0]` (lat, lng).

`formRunObject` also sets `document.title = "BHHH2 Run #<n> - <site>"` as a side effect.

## Runtime flow

1. `App.vue` `onBeforeMount` fetches the sheet, filters it, sets `mismanagement`, then `showRun()` loads the run's saved images and sets `currentRunInfo`.
2. `<Page>` renders once `currentRunInfo` is set and the past-runs view is closed.
3. `Page.vue` renders `Title`, the main info grid (left: run/date/start/location; right: GPS link, occasion, remark), hares, `GoogleMap`, and the footer (mismanagement + `HareLine`).
4. `GoogleMap.vue` loads the Maps JS API through `Loader` (`version: "weekly"`), centres at zoom 15, adds a marker with `assets/pin2.png`, and stores the map on **`window.map`** so `Page.vue` can toggle `disableDefaultUI` around printing. Clicking the map opens Google Maps in a new tab. A `watch` on `mapCoords` pans the map and moves the marker.
5. Top-level buttons in `App.vue`, all `position: fixed` and hidden in `@media print`:
   - **Print Map**: calls `window.print()`, which `Page.vue` has overridden (see Printing).
   - **View Past Maps**: shows `HareLine` in full-page mode with `fullHairLine`. Clicking a row runs `formRunObject(row, fullHairLine)` and returns to the flyer. "Show Latest Run" reloads the page.
   - **Copy Run Info**: puts a plain-text summary on the clipboard and flashes the button green. It is hidden on mobile.
   - **Members login**: opens `https://members.balihash2.com/applogin.asp`.

`App.vue` exposes shared state with `provide('globalData', { isEditMode, edits })`. Components read it through `inject('globalData')`. It is untyped (`any`), so values are read as `globalData.isEditMode.value`.

## URL modes

Every mode is detected with **`window.location.href.includes(...)`**, a plain substring match on the whole URL. No router or query parser is involved, so any URL that contains the word triggers the mode.

| Substring | Where | Effect |
|---|---|---|
| `edit` | `App.vue` `onMounted` | Edit mode (below) |
| `print` | `GoogleMap.vue`, on first `tilesloaded` | Calls `window.print()` automatically (skipped on Firefox) |
| `screenshot` | `GoogleMap.vue`, on first `tilesloaded` | Hides Google Map UI controls (for headless screenshots) |

## Edit mode (`?edit=true`) and saved images

Open `http://localhost:3005/?edit=true`. Editors use it to place images on a run's flyer. A save makes the images public. The page text always comes from the sheet and isn't editable.

### Storage
- One KV value per **run number** in the `EDITS` namespace: `{ images }` (`PageEdits` in `src/utils/edits.ts`). Next week's run has no key, so it starts clean. Entries saved by older versions may also hold `text` and `coordinates`. Those keys are ignored.
- `functions/api/edits.js`:
  - `GET /api/edits?run=N` is public and returns `{}` when nothing is saved.
  - `PUT /api/edits` takes `{ run, edits, password }`. It returns 401 unless `password === env.PASSWORD`, the same scheme as hash-bot's `bot/src/worker.js`.
  - `DELETE /api/edits` takes `{ run, password }` and removes the run's entry. It uses the same password check.
- `App.vue` `showRun()` loads the run's saved images **before** assigning `currentRunInfo`, so the first render already shows them. It is used for both the current run and Past Maps.
- `edits` reaches children through `provide('globalData')`.

### Images (`ImageEditor.vue`, fabric.js v6)
- Imported as `import * as fabric from "fabric"`. The v6 API is promise-based (`Image.fromURL`, `loadFromJSON`). The `@types/fabric` dependency is for v5 and isn't needed.
- The canvas fills `.A4`, which is a fixed 21cm × 29.7cm on desktop, so saved `left`/`top` values land in the same place for every desktop viewer.
- **Not mounted on mobile** (`useIsMobile()`), because the mobile layout would shift the images. It mounts on desktop when in edit mode or when the run has saved `images`.
- Props: `editable` and `images`, the saved `toJSON()`, loaded on mount.
- In edit mode, images can always be moved. A window `pointermove` listener runs `findTarget()` and gives the container `pointer-events` only while the pointer is over an image or the active image's handles. Everywhere else, clicks reach the page underneath (links, map). A `pointerdown` outside any image deselects. Touch can't hover, so this is desktop only.
- Every object gets a `remove` control: a red X drawn beside the rotation handle (`offsetX/offsetY` 28px). Clicking it deletes the image.
- Exposed for `EditPanel`: `addImages(files)` and `getCanvasData()`. `addImages` shrinks each image to at most 1200px webp (`MAX_IMAGE_SIDE`) and stores it inline as a data URL in the JSON. That keeps a KV value small.

### EditPanel
- Fixed to the left of the page, its right edge 1rem from the A4 (`right: calc(50% + 10.5cm + 1rem)`). On mobile it sits static above the page, and it is hidden in print.
- The password is kept in `localStorage` (`editPassword`).
- Images section: Add and Clear only. After a confirm, **Clear** sends `DELETE` for the run, which removes its saved images. It then reloads in edit mode.
- **Save** sends `{ images: getCanvasData() }`. Once the PUT succeeds, it reloads the page without the query string so the editor sees the public page.
- On mobile there is no image editor, so the Images section and Save are hidden and only the password field shows.

## Printing / PDF

- `@media print` and the `.print-layout` class pin the page to exactly 21cm × 29.7cm with no shadow or margin, and shrink the map to `15.5cm` high. All floating buttons, the edit box and `.loading` are hidden.
- `Page.vue` **monkey-patches `window.print`** when the component is created (and so does `BlankPage.vue` if it is ever mounted). The patched version:
  1. sets `usePrintCss = true` and hides Google Map controls through `window.map.setOptions({ disableDefaultUI: true })`,
  2. waits 500ms, runs `html2canvas(realPage, { useCORS: true })`, and appends the canvas into the hidden `.A4--canvas` div,
  3. calls the original print.
  `window.onafterprint` reverses these steps.
- **Current state of the raster path:** the comments describe printing a rasterised image, because Chrome vectorises the "Special Elite" webfont and produces ~10MB PDFs instead of ~700KB. However, `onBeforePrint` sets `isPrintMode.value = false`, not `true`, so the raster `.A4--canvas` (and its invisible link overlays `.A4__gps-link` / `.A4__website-link`) **is never shown**. The live DOM page is what gets printed. If you re-enable rasterising (`isPrintMode = true`), check that the overlay link positions still match the layout and that the Google Maps tiles render under `useCORS`.
- The keyboard shortcut (Cmd/Ctrl+P) does **not** call `window.print()`, so the patched steps are skipped. Only `@media print` CSS applies. The "Print Map" button and the `?print` URL mode go through the patched path.
- `App.vue`'s `print()` sets `isEditMode` false and then back to its previous value in the same synchronous tick. Vue batches the update, so this does nothing in practice. The `@media print` rules are what hide the edit box.

## Styling conventions

- Brand: typewriter font **Special Elite** (Google Fonts `@import` in `App.vue`), green `#0ca501`, dark green `#226f1c`, white page with a drop shadow on a default background.
- Most components use **global (unscoped) SCSS**. Class names such as `.A4`, `.main-info`, `.map-container` and `hr` leak between components on purpose. `Title.vue`, `BlankPage.vue` and `ImageEditor.vue` are scoped.
- Responsive: `@include mobile { ... }` from `Global.module.scss` (≤800px). On mobile the A4 turns into a full-width page and the footer stacks.
- The Title layout uses absolute pixel positions tuned for 21cm width. The fee table (Members/Visitors/Non drinkers/Kids) is **hardcoded** in `Title.vue`. Prices change there.
- Prettier config (`.prettierrc.json`): no semicolons, single quotes, no trailing commas, 2 spaces. Newer files (`App.vue`, `GoogleMap.vue`, `ImageEditor.vue`) use double quotes and semicolons. Match the file you are editing, and don't run `bun run lint` across the repo unless you want a large diff.

## Deployment

- **Cloudflare Pages** project `hhh-map-maker`, Git-integrated, on the bhhh2 account (`a962990cde4f00e08985c3580b473986`). Domains: `hhh-map-maker.pages.dev` and `map.balihash2.com`.
- Build settings, env vars (`NODE_VERSION`, `VITE_GOOGLEMAPS_API_KEY`), the `PASSWORD` secret and the `EDITS` KV binding (namespace `hhh-map-maker-edits`, id `0a5a3a91a3044043a0b3264fcdcda3f1`, production and preview) all live on the Pages project in the dashboard. There is **deliberately no `wrangler.toml`**: once a Pages project has one, it becomes the source of truth and dashboard plaintext vars stop applying. Locally, `bun run api` passes `--kv EDITS` on the command line instead.
- Wrangler commands must target the bhhh2 profile and account:
  ```bash
  CLOUDFLARE_ACCOUNT_ID=a962990cde4f00e08985c3580b473986 wrangler --profile bhhh2 <command>
  ```
  The default login is a different account.
- KV is eventually consistent. A save can take up to about 60s to reach every edge.
- hash-bot screenshots `https://hhh-map-maker.pages.dev/?screenshot=true` at 1366px wide (desktop), so saved images appear in the emailed map.
- **`src/utils/cf-worker.js`** is an old standalone Worker that returns the current run as JSON. Nothing imports it. It hardcodes the sheet tab `2022` and uses a `GSHEETS_API_KEY` secret. Treat it as historical.

## Gotchas / known issues

- **`build-ts` fails** type checking: `vue-tsc` 0.29 errors inside fabric v6's types, `geo-coordinates-parser`'s types lack `verbatimLatitude`/`verbatimLongitude` (they exist at runtime), and `window.map` is undeclared. `bun run build` skips type checking and works.
- **No current-week run means a crash.** If no row in `hairLine` falls in this week, `currentRun` passes `undefined` to `formRunObject`, which then reads `currentRun[5]` and throws. The page stays blank (`.loading` is empty).
- **The Sunday week bug** in `isInCurrentWeek`: `getDay()` is `0` on Sunday, so "last Monday" is computed as *tomorrow*, and on Sundays the "current week" is actually next week.
- Dates come from `new Date(sheetString)`, so results depend on the sheet's date format and the browser's parser. Times use the local timezone.
- The sheet tab is chosen by the current year. In early January the new tab may not exist yet, and runs from late December sit in the previous year's tab.
- `window.print` and `window.onafterprint` are global monkey-patches made at component setup. Mounting `Page` twice (or mounting `BlankPage` as well) stacks the overrides.
- `GoogleMap.vue` creates the map lazily. If the run had no coordinates at mount, the first `mapCoords` change calls `setupMap()`.
- `index.html` loads Mapbox GL CSS, and there are `@types/mapbox-gl` and `pnpm` devDependencies. These are leftovers and no Mapbox code exists.
- The footer and print-overlay links display the text `http://balihash2.com/next-run-map`, but their href is `https://map.balihash2.com/`.
