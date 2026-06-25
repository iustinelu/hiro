# design-sync notes — @hiro/ui-primitives (web)

Repo-specific gotchas for future syncs. Append a bullet whenever something costs a debugging cycle.

## Shape & scope
- **Package shape, web-only.** The DS is `@hiro/ui-primitives` (raw TS, no `dist/`, no build script).
- The bundle entry is the **web subpath** `packages/ui-primitives/src/web.ts` (`cfg.entry`) — NOT `src/index.ts` (which only exports shared types). This keeps the React Native `Mobile*` family out of the esbuild bundle (RN can't render in a web design tool).
- `exportedNames` finds nothing (no `.d.ts`, no `types` field), so the 20 web components are enumerated explicitly in `cfg.componentSrcMap`. That map is also the scope gate — anything not listed is excluded. `WebStates.tsx` exports 3 components (`WebLoadingState`/`WebEmptyState`/`WebErrorState`).
- `--node-modules ./node_modules` (repo root) — `react` is hoisted there; `@hiro/ui-tokens` and `@hiro/ui-primitives` are workspace symlinks under it.
- `cfg.tsconfig: "../../tsconfig.base.json"` (package-relative) — esbuild reads `compilerOptions.paths` to resolve `@hiro/ui-tokens`.

## Theming / CSS (the important one)
- Web components style via **inline styles referencing `var(--hiro-*)`** (see `src/web/utils.ts`: `cssColor`/`cssRadius`/`cssShadow`/`cssFontFamily`). Nothing defines those vars by default → without a stylesheet every preview renders unstyled.
- `.design-sync/gen-css.mjs` (committed, reproducible) generates `packages/ui-tokens/.design-sync-theme-vars.css` from `@hiro/ui-tokens`'s `cssVariablesFor()` for all 4 themes: `:root` = Aurora (default dark) + `[data-theme="daylight|superchore|neon"]` blocks + a Google-Fonts `@import`.
- That file is pulled in via `cfg.tokensPkg: "@hiro/ui-tokens"` + `cfg.tokensGlob: ".design-sync-theme-vars.css"` (NOT `cssEntry` — `cssEntry` is bounded to the DS package dir; tokensGlob resolves inside the tokens package via its node_modules symlink).
- It lives under `packages/ui-tokens/` deliberately: that path is **lint-exempt** (`isTokenSource` in `scripts/lint.mjs`), so its hex literals don't trip `npm run check`. It is **gitignored** and regenerated from the committed `gen-css.mjs`.
- `[CSS_RUNTIME]` on validate is expected — there's no static component CSS (inline styles), so `_ds_bundle.css` is the runtime stub. The vars come from the tokens CSS in the `styles.css` @import closure.

## Fonts
- `[FONT_REMOTE]` is expected and intended: the Google-Fonts `@import` in the generated CSS serves Inter / Manrope / Press Start 2P / Rajdhani / Exo 2 / IBM Plex Mono / JetBrains Mono at runtime. The app itself has NOT bundled these yet (font bundling is a tracked TODO), so remote loading is the faithful representation for now.

## Setup quirks
- Converter deps live in `.ds-sync/` (isolated). `.design-sync/node_modules` is a symlink → `../.ds-sync/node_modules` (recreate per clone: `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`) so `gen-css.mjs` can resolve esbuild.
- Playwright: the machine has a cached `chromium-1208` build → install `playwright@1.58.2` into `.ds-sync` (matches that build; no browser download).

## Re-sync risks
- **Theme CSS can silently go stale**: if `@hiro/ui-tokens` themes change, re-run `node .design-sync/gen-css.mjs` before the converter, or the synced CSS vars drift from the real tokens. (Deterministic — safe to always re-run.)
- The Google-Fonts `@import` assumes the design environment allows the remote font host. If it's ever blocked, switch to `cfg.extraFonts` with bundled woff2s.
- Authored previews (`.design-sync/previews/*.tsx`) compose against the current props in `src/shared/types.ts` — a breaking prop rename upstream invalidates them; re-grade after any types change.

## Preview authoring notes (folded from wave learnings)
- All 20 components live under the `web` group (grouped by `src/web/` dir). Import is the named `/web` subpath: `import { WebX } from "@hiro/ui-primitives/web";`. Automatic JSX runtime — never `import React` in a preview.
- **Theme CSS vars are usable in raw markup** inside preview children: `var(--hiro-accent)`, `var(--hiro-ink)`, `var(--hiro-inkMuted)`, `var(--hiro-surfaceMuted)`, `var(--hiro-border)`, etc. — lets you build realistic chart/sparkline/stat children without importing tokens. (Note camelCase var names like `--hiro-inkMuted` — these match what `cssColor` emits.)
- Per-component gotchas worth remembering on re-sync:
  - `WebModalSheet` renders nothing unless `open` is set; it's `position:fixed` overlay anchored bottom. Wrapping in `position:relative; minHeight:460; maxWidth:420` keeps it inside the card — **no `cfg.overrides.cardMode` needed**.
  - `WebErrorState` always shows a retry button (falls back to a default "Retry" label even with only `onRetry`).
  - `WebEmptyStatePanel` requires `title`+`description`; `subtitle` defaults to a spec-y "SPEC 04.3" — pass domain copy. `icon` defaults to "empty".
  - The 3 feedback states (`WebEmptyState`/`WebErrorState`/`WebLoadingState`) share `WebStates.tsx` in componentSrcMap; capture splits them by export correctly. They render built-in default copy with no props.
  - `WebSpacingMatrix` / `WebIconographySpec` are self-rendering token showcases — a single cell with just `title` is correct; don't feed children.
  - Full-width components (Card/ChartContainer/ListRow/feedback states/SwitchRow/SegmentedControl/Nav) need a `maxWidth` wrapper (~360–520) or they stretch the whole card.
- **Known render warns**: none recorded — render check was clean (a warn line not in this list on a future sync is new, investigate it).
- **Theme showcase cells**: WebButton, WebCard, WebKpiTile, WebStatusBadge each have a `Themes` export rendering the component across all 4 themes. Pattern: map over `[["aurora","Aurora"],["daylight","Daylight"],["superchore","Super Chore"],["neon","Neon Grid"]]`, each panel a `<div data-theme={id} style={{background:"var(--hiro-color-bg)", …}}>` so the `[data-theme]` token overrides apply to that subtree (works because the design tool's preview cards render on a white body — the per-panel canvas is required for the theme to read). The 4-theme system itself is shipped for ALL components via `styles.css` + runtime `data-theme`; these cells are just the visible showcase.
- WebInput uses `cardMode: column`, WebModalSheet uses `cardMode: single` + `primaryStory: "ConfirmDelete"` (see cfg.overrides) — set to fix `[GRID_OVERFLOW]` on those two.
