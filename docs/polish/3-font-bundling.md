# Polish Item 3 — Font bundling (themed display fonts)

> ✅ **DONE — merged to `main` 2026-06-25 (commit `43d2faa`).** Shipped **both** Phase A (web) and Phase B (mobile); founder QA passed on web. Self-hosted Inter (variable) / Rajdhani / Press Start 2P / IBM Plex Mono on web; expo-font + reactive RN resolver on mobile; `neon` stack reordered to lead with Rajdhani so it renders the geometric face. Bundled only each theme's leading family (skipped pure-fallback Manrope/Exo 2/JetBrains Mono).

> You are the dedicated agent for this item. Implement **only** this scope. Work in an isolated git worktree. Do **not** merge until the founder signs off.

## Protocol (every polish item)
1. Create a worktree off the latest `main`:
   `git worktree add ../hiro-fonts -b chore/font-bundling main`
2. Implement only this item. Match surrounding code style. Respect THE THEMING RULE (themed color/elevation/radius/typography.fontFamily must be reactive — web `cssColor/...`/`cssFontFamily`, mobile `useTheme()`; enforced by `scripts/lint.mjs` in `npm run check`).
3. Run `npm run check` from repo root until green **before** reporting done. Smoke-run `npm run dev:web`.
4. Report done with the Founder QA Quick Cycle below filled in. **Do not merge until the founder signs off.**
5. On founder go: rebase on current `main`, re-run `npm run check`, merge to `main`, then `git worktree remove ../hiro-fonts`.

## Goal
Actually load the fonts the themes declare so superchore renders as retro pixel and neon as geometric, instead of silently falling back to system fonts. **Recommended scope: web first (Phase A).** Mobile (Phase B) is heavier and optional — do it only if the founder asks.

## Current state
- Per-theme `typography.fontFamily` in `packages/ui-tokens/src/themes.ts`: aurora/daylight = `'Inter','Manrope','Avenir Next',sans-serif`; superchore = `'Press Start 2P',ui-monospace,monospace`; neon = `'Inter','Rajdhani','Exo 2',sans-serif`.
- These flow to web as the `--hiro-font-family` CSS var (`packages/ui-tokens/src/css.ts`, emitted by `apps/web/src/theme/ThemeCssVars.tsx`; consumed via `cssFontFamily` in `packages/ui-primitives/src/web/utils.ts:87` and `globals.css`).
- **No font is loaded anywhere** — no `@font-face`, no `next/font`, no `expo-font`, zero font files in the repo. The only Google Fonts `@import` lives in the gitignored design-sync artifact `packages/ui-tokens/.design-sync-theme-vars.css` (not imported by the app).

## Phase A — Web (recommended, self-hosted)
1. Add the families under their **canonical names** so the existing token stacks resolve with **no token changes**: Inter, Manrope, Rajdhani, Exo 2, Press Start 2P (the names already in `themes.ts`).
2. Preferred: self-host. Download the needed `woff2` weights into `apps/web/public/fonts/` and declare `@font-face` (canonical `font-family` names) in `apps/web/src/app/globals.css`, with `font-display: swap`. Weights: Inter 400/600/700, Manrope 400/700, Rajdhani 500/700, Exo 2 500/700, Press Start 2P 400 (single weight). (Alternative if self-hosting is fiddly: `next/font/google` in `apps/web/src/app/layout.tsx` — but it generates hashed family names, so you'd then have to thread its CSS vars into the token stacks; the `@font-face` route avoids touching tokens.)
3. Verify `--hiro-font-family` now resolves to a loaded face on each theme (no system fallback).

## Phase B — Mobile (optional, defer unless requested)
- RN cannot consume CSS font stacks. Bundle `.ttf` via `expo-font` `useFonts` in `apps/mobile/src/index.tsx`, place files in `apps/mobile/assets/fonts/`, and add a `themeId → loaded RN font-family name` resolver (the theme's `fontFamily` string is unusable directly on RN). Gate first paint on `useFonts` ready. Materially more work + QA than Phase A — keep as a separate follow-up if not in scope now.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green), `npm run dev:web`.
- **Route:** any screen; then More → switch through all 4 themes.
- **Look for:** superchore renders in the blocky **Press Start 2P** pixel face; neon in the **Rajdhani/Exo 2** geometric face; aurora/daylight in Inter/Manrope. No flash of obviously-wrong system font beyond a brief swap. DevTools → Network shows fonts loaded from same origin (`/fonts/...`).
- **Pass/fail:** Pass = each theme's declared display font is visibly applied. Fail = any theme still shows the default system serif/sans.
