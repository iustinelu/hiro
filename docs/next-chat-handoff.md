# Session handoff — 2026-06-25 (design-sync + v0.1 status)

## Status
All on `main`, clean, `npm run check` green. Two bodies of work now live:
1. **v0.1 4-theme design system** — merged earlier (PR #29).
2. **claude.ai/design sync** — merged this session (PR #30, merge commit `5007bf6`).

## What shipped THIS session: design-sync → claude.ai/design
The `@hiro/ui-primitives` **web** library is mirrored into a Claude Design project so the design agent builds on-brand UIs from our real components.
- **Project:** "Hiro Design System" — https://claude.ai/design/p/f5d7db8c-8502-46b9-b6d4-e01774d7179c
- **20 web components**, all preview cards authored + graded `good`; bundle validated 20/20 clean. RN `Mobile*` family excluded (can't render in a web design tool).
- **All 4 themes** shipped via `styles.css` + runtime `data-theme`; Button/Card/KpiTile/StatusBadge also have explicit all-4-theme showcase cells.
- **Sync inputs committed** (PR #30): `.design-sync/{config.json,gen-css.mjs,conventions.md,NOTES.md,previews/*.tsx}` + `.gitignore`. Build artifacts (`ds-bundle/`, `.ds-sync/`, caches, generated `packages/ui-tokens/.design-sync-theme-vars.css`) are gitignored.
- **Re-syncing:** read `.design-sync/NOTES.md` first (re-sync risks + per-component gotchas), re-run `node .design-sync/gen-css.mjs` if themes changed, then the design-sync skill's resync driver. The 16 non-signature components can get all-4-theme showcase cells in a future incremental re-sync if wanted.

## v0.1 — what's next (unchanged from PR #29 handoff; NOT done this session)
1. **Founder QA** the themes on web + a mobile dev build (`npm run dev:web`, `npm run dev:mobile`) — switch all 4 themes, confirm every surface re-skins.
2. **Phase 1 deploy:** merge `hir-64` if outstanding; deploy web to Vercel (needs founder Vercel account) → share PWA link.
3. **Polish:** branded app icon/splash + iOS raster PWA icon, real tab icons (HIR-61/62), `profiles.theme` DB sync, font bundling (retro pixel / neon geometric faces).
4. **Phase 4 distribution** (EAS → TestFlight + Play internal) — BLOCKED on founder accounts (Apple Developer ~24–48h long pole, Google Play, Expo).

## Process notes (new this session)
- **Founder pre-authorizes autonomous commit/push/PR/merge** (gh logged in) — no need to ask. Still branch (not straight to `main`) and run `npm run check` before the PR. (Recorded in memory: `feedback_autonomous_git.md`.)
- PR governance is scrapped (use plain `gh pr create`).

## THE THEMING RULE (still enforced by `scripts/lint.mjs` in `npm run check`)
- Themed values (color/elevation/radius/typography.fontFamily) MUST be reactive: web → `cssColor/cssShadow/cssRadius/cssFontFamily`; mobile → `useTheme()`. Structural tokens (spacing/size/motion/type sizes) may be static.
- New design token → add to the `Theme`/`ColorScale` interface; TS forces all 4 themes to define it.
- `packages/ui-tokens/` is lint-exempt for color literals (it's the token source).

## Notes
- Supabase project `pfokfopwjrahclmseper` (consider Pro to avoid free-tier auto-pause for the live test).
- Worktree gotcha: agent worktrees branch from `main`; integrate theme-dependent work by copying files into the main tree, not git-merging stale worktree branches.
