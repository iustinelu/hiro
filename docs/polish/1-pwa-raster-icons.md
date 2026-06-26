# Polish Item 1 — PWA raster icons

> You are the dedicated agent for this item. Implement **only** this scope. Work in an isolated git worktree. Do **not** merge until the founder signs off.

## Protocol (every polish item)
1. Create a worktree off the latest `main`:
   `git worktree add ../hiro-pwa-icons -b chore/pwa-raster-icons main`
2. Implement only this item. Match surrounding code style. Respect THE THEMING RULE (themed color/elevation/radius/typography.fontFamily must be reactive — web `cssColor/...`/`cssFontFamily`, mobile `useTheme()`; enforced by `scripts/lint.mjs` in `npm run check`).
3. Run `npm run check` from repo root until green **before** reporting done. Smoke-run `npm run dev:web`.
4. Report done with the Founder QA Quick Cycle below filled in. **Do not merge until the founder signs off.**
5. On founder go: rebase on current `main`, re-run `npm run check`, merge to `main`, then `git worktree remove ../hiro-pwa-icons`.

## Goal
Give the installed web app / iOS home-screen a real raster icon instead of the SVG-only placeholder. **Reuse the existing brand mark** (orange H on dark) — rasterize it, no new design.

> ⚠️ **Dependency:** if the founder adopts a new logo from claude.ai/design, that SVG replaces `apps/web/public/icon.svg` **first**, then you rasterize from it. Confirm with the founder whether the new logo has landed before generating PNGs.

## Current state
- `apps/web/public/icon.svg` (512, orange `#ff7a59` H on `#15121f`) and `apple-touch-icon.svg` (identical). No raster PNGs.
- `apps/web/src/app/manifest.ts` references only `/icon.svg`. `apps/web/src/app/layout.tsx:11` sets `icons.apple: "/apple-touch-icon.svg"`. iOS PWA/home-screen does not reliably use SVG → needs PNG.
- ImageMagick is available on this machine (`identify` confirmed). Android native launcher/splash already have real assets — out of scope.

## Steps
1. Rasterize `apps/web/public/icon.svg` → `apps/web/public/icon-192.png` (192×192), `icon-512.png` (512×512), and `apple-touch-icon.png` (180×180). Use ImageMagick (`magick icon.svg -resize 192x192 icon-192.png`) or `@resvg/resvg-js`. Optionally add a maskable variant with ~10% safe-area padding (`icon-512-maskable.png`).
2. Update `manifest.ts` `icons` to list the PNGs with correct `sizes`/`type`/`purpose` (keep the SVG entry as `any`; add 192 + 512 PNGs; mark the padded one `maskable` if generated).
3. Update `layout.tsx` metadata `icons.apple` → `/apple-touch-icon.png`; add `icon` entries for the PNGs/favicon as appropriate.
4. Confirm the PNGs are committed (real source assets, not build artifacts — verify `.gitignore` doesn't exclude `apps/web/public/*.png`).

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green), `npm run dev:web`.
- **Route:** load the app; DevTools → Application → Manifest. On iOS Safari, "Add to Home Screen".
- **Look for:** manifest lists 192/512 PNG icons with no errors; installed/home-screen icon shows the branded mark (not blank/letterbox); apple-touch icon is the PNG.
- **Pass/fail:** Pass = raster icons present, manifest valid, home-screen icon branded. Fail = missing sizes, manifest warning, or placeholder icon on install.
