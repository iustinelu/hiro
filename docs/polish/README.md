# v0.1 Polish — agent dispatch index

Four independent polish items, one agent per item, each in its own git worktree off `main`. Hand an agent its number ("you are the agent for `docs/polish/2-tab-icons.md`"); it has the full self-contained brief, branch name, worktree command, and Founder QA Quick Cycle. Agent reports done → founder tests → founder says merge.

| # | Item | Status | Branch | Touches |
|---|------|--------|--------|---------|
| 1 | [PWA raster icons](1-pwa-raster-icons.md) | ✅ Merged | `chore/pwa-raster-icons` | `apps/web/public`, manifest, layout metadata |
| 2 | [Tab icons (HIR-61/62)](2-tab-icons.md) | ✅ Merged (PR #31) | `hir-62/tab-icons` | `ui-tokens`/`ui-primitives` icon set, both shells |
| 3 | [Font bundling](3-font-bundling.md) | ✅ Merged (`43d2faa`) | `chore/font-bundling` | `apps/web` + `apps/mobile` fonts, `globals.css`, RN resolver |
| 4 | [profiles.theme DB sync](4-profile-theme-sync.md) | ✅ Merged (`e683612`) | `chore/profile-theme-sync` | Supabase migration, `domain`, theme handlers |

**Status (2026-06-25):** ✅ **All 4 merged to `main`** — v0.1 polish queue complete. Item 2 (tab icons) also fixed a mobile bug: Progress/Rewards now refetch on tab focus (`useFocusEffect`). Item 3 shipped web **and** mobile (mobile was optional in the brief; founder opted in) and includes a `neon` stack reorder so it renders the geometric face.

**Suggested merge order:** 1 → 2 → 3 → 4 (cheapest/most isolated first). Any order works with a rebase on `main` before merge.

**Logo dependency:** if a new logo lands from claude.ai/design, its SVG replaces `apps/web/public/icon.svg` **before** Item 1 rasterizes. Recommended palette = Aurora (`#15121f` bg, `#ff7a59`/`#e8633f` house, `#57e0c0`/`#ffcf5c` cape, `#f7f3ff` highlights).

**Out of scope (founder-blocked):** Founder QA, Vercel deploy, native TestFlight/Play distribution.
