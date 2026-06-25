# Session handoff — 2026-06-25 (v0.1 ship push)

## Branch
`hir-design/themes` (off `hir-64/google-oauth`, which is off `main`). NOT merged to main yet. Nothing pushed.

## What shipped this session (all committed on hir-design/themes)
1. **4-theme design system** — Aurora (default dark), Daylight (light), Super Chore (retro), Neon Grid (cyberpunk). Per-person, persisted (cookie on web, SecureStore on mobile; **DB sync via `profiles.theme` still TODO**). Switcher in More → Appearance on both platforms. Token contract in `@hiro/ui-tokens` (`themes`, `resolveTheme`, `cssVariablesFor`, `tokens`=aurora back-compat), split into types/structural/themes/css modules.
2. **Mobile is now feature-complete** — Home+Tasks, Progress, Budget, Rewards all built natively (ported from web), theme-aware, wired in `AppTabs`. Placeholders deleted.
3. **Web PWA** — installable (manifest + service worker, prod-only; SVG icon — needs a raster PNG for iOS in polish).
4. **Dogfood fixes**: web primitives theme-reactive; **tab-switch lag fixed (HIR-65)** via `HouseholdProvider` (profile/household fetched once in persistent layout) + `loading.tsx`; **display-name gate** for social-login users (web + mobile).
5. **Theming durability (the "fix it forever")** — IN PROGRESS at handoff: web + mobile sweeps committed; `scripts/lint.mjs` hardened to forbid color literals (hex/rgb/rgba/hsl) AND static themed-token access (`tokens.color/elevation/radius/typography.fontFamily`) in app/primitive code, with a small allowlist. A final fixer agent is making the remaining offenders green (auth forms, residual primitive rgba bgs, Google-brand-blue→`brand` token, black scrim→overlay token). **Verify `npm run check` is green and commit it as the last step if not already done.**

## THE THEMING RULE (enforced by `scripts/lint.mjs`, runs in `npm run check`)
- **Themed values** (color, elevation, radius, typography.fontFamily) MUST be reactive: web → `cssColor/cssShadow/cssRadius/cssFontFamily` (from `@hiro/ui-primitives/web`, emit `var(--hiro-*)`); mobile → `const t = useTheme()` (from `@hiro/ui-primitives/mobile`).
- **Structural** (spacing, size, motion, typography sizes) → static `tokens.*` is fine.
- New design token → add to the `Theme`/`ColorScale` interface; TypeScript forces all 4 themes to define it (compiler-enforced coverage — no manual element list needed).
- The lint output is the live "coverage report". Tiny allowlist for theming infra, pre-theme/crash surfaces, and DS gallery showcases.

## What's next (priority order)
1. **Confirm/commit** the theming-durability fixer result → `npm run check` green.
2. **Founder QA** the themes on web + a mobile dev build (`npm run dev:web`, `npm run dev:mobile`) — switch all 4 themes, confirm every surface re-skins.
3. **Phase 1**: merge `hir-64` → main; deploy web to Vercel (needs founder Vercel account) → share PWA link.
4. **Polish**: branded app icon/splash + iOS raster PWA icon, real tab icons (HIR-61/62), `profiles.theme` DB sync, font bundling (retro pixel / neon geometric faces).
5. **Phase 4 distribution** (EAS → TestFlight + Play internal) — BLOCKED on founder accounts: Apple Developer (~24-48h long pole), Google Play, Expo. Founder is creating these via a separate account-setup guide.

## Founder requests captured at end of session (do these next session)
1. **Push/PR done:** `hir-design/themes` is pushed to origin. Open PR (no governance template needed): https://github.com/iustinelu/hiro/pull/new/hir-design/themes — or `gh pr create` after fixing gh auth (`gh auth login`; gh currently 401s on keyring).
2. **Scrap PR governance** — founder explicitly de-prioritized it ("not actual value, I just care that it works"). Do NOT enforce the PR governance template anymore. Use plain `gh pr create` / the GitHub web PR. Optionally delete `scripts/check-pr-governance.mjs` + the `pr:validate`/`pr:create` governance wiring in root `package.json`, and drop the "PR Governance (MANDATORY)" expectation. (Memory updated to reflect this.)
3. **Better navigation perf (preload everything)** — current state: tabs are instant for profile/household (cached in `HouseholdProvider`), but each dashboard still fetches its OWN data on first mount → first visit shows "Loading expenses" + skeleton, then content; revisits are smooth only because of Next's short-lived router cache. **Goal:** warm all tab data up front so first visit is instant too. Recommended approach: add a lightweight client data cache (SWR or React Query, or a simple shared context cache with dedupe), and in `HouseholdProvider` — once household resolves — kick off background prefetches for each tab's primary query (tasks/today-completions/leaderboard, month expenses, rewards+balance, progress stats); dashboards read cache-first then revalidate. Also enable `<Link prefetch>` (default in prod). This makes navigation instant from the first visit and keeps it smooth.

## Notes
- Supabase project `pfokfopwjrahclmseper` (consider Pro to avoid free-tier auto-pause for the live test).
- Worktree gotcha: agent worktrees branch from `main` (not the current branch) — for theme-dependent work, integrate by copying files into the main tree, not git-merging stale worktree branches.
- SDD ledger: `.superpowers/sdd/progress.md` (gitignored).
- Plan: `~/.claude/plans/yo-claude-hope-precious-gray.md`.
