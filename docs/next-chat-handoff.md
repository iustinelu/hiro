# Session handoff — 2026-06-25 (evening: v0.1 polish complete + EAS prep)

## Status
All on `main`, clean, `npm run check` green, `npm run dev:web` + native `dev:mobile` both verified working. **v0.1 polish queue is COMPLETE** — all 4 items merged.

## What shipped THIS session
1. **Tab icons (HIR-62 + HIR-61)** — PR #31, last polish item. Real production icons via the `IconName` primitive on both shells (web→lucide, mobile→Ionicons outline+filled), theme-reactive, active/inactive states. `IconName` extended with `tasks/progress/budget/rewards/more`; `WebIcon`/`MobileIcon`/`IconName` now exported from the platform barrels. HIR-61 = confirm+document the 6-section tab IA (no change to `appShellSections`).
   - **Web alignment fix:** rail/bottom-bar links are now flex (icon+label aligned).
   - **Mobile bug fix:** Progress + Rewards refetched only on mount, but tab screens stay mounted → stale on revisit. Now refetch on focus via `useFocusEffect`. See `project_mobile_tab_refetch` memory.
2. **Dropped Expo web** + **relocated EAS config** — PR #32. Removed `"web"` from `apps/mobile/app.json` platforms (the Expo app can't run in a browser — `expo-secure-store` is native-only; the web target is the Next.js app). Moved the EAS linkage (`owner: justins9269s-team`, `extra.eas.projectId: b732bece-946b-4fc7-8407-7088f6ef4873`) out of a stray **root** `app.json` into `apps/mobile/app.json`, clearing the `check:expo-root-artifacts` guard.
3. **Fixed RSC build error** — PR #33. `WebButton` (useState) + `WebStates` (useMemo) lacked `"use client"`; the web barrel re-exports them and Server Components (auth/onboarding/invite layouts) import the barrel's `css*` helpers → build error when those routes compile. Added the directive. **Latent-bug trap:** dev compiles routes on-demand and `npm run check` doesn't run a Next build, so this only shows when you hit an auth route. See `project_web_primitive_use_client` memory.

## What's next: native deploy to iOS + Android (founder's stated goal)
EAS is signed in and linked (projectId above), bundle IDs set (`com.hiro.app` both platforms). Still missing before `eas build` runs clean — **next session should audit then scaffold:**
1. **`eas.json`** — no build profiles exist yet. Need production + preview profiles.
2. **Production `EXPO_PUBLIC_*` env** baked into the build profile (native binary must point at prod Supabase, not local `.env`).
3. **Version/build numbers** in `app.json` (currently `0.1.0`).
4. **Store credentials** — Apple Developer team (long pole, may need ~24–48h enrollment) + Google Play service account; EAS can manage signing but the first build prompts.
   - Suggested kickoff: read-only audit of EAS state + `app.json`, then a plan, before changing anything.

## Worktree workflow gotchas (bit us twice this session — see `project_worktree_env_files` memory)
- Fresh `git worktree` checkouts lack the **gitignored `.env` files**. After `git worktree add`, copy both: `apps/web/.env.local` and `apps/mobile/.env` from the main checkout, or the apps crash (web 500; mobile `Missing APP_ENV` crash-on-boot that looks like a blank screen).
- Mobile: `EXPO_PUBLIC_*` are read when **Metro starts** — restart Metro (not just device reload) after adding `.env`.
- Integrate worktree work by **rebasing on current `main`** before merge (worktrees branch from main at creation; main moves). All 4 polish items did this cleanly.

## Process notes
- **Founder pre-authorizes autonomous commit/push/PR/merge** (gh logged in). Branch (not straight to `main` for code), run `npm run check`, then PR + merge. Handoff/docs commits go direct to `main`. (`feedback_autonomous_git.md`.)
- PR governance is scrapped (plain `gh pr create`).
- No emulator/simulator on this Linux box — can't render mobile here; native QA is founder-run on device.
- `dev:web` may pick port 3001/3002 if 3000 is busy — use the port the startup log prints.

## THE THEMING RULE (enforced by `scripts/lint.mjs` in `npm run check`)
- Themed values (color/elevation/radius/typography.fontFamily) MUST be reactive: web → `cssColor/cssShadow/cssRadius/cssFontFamily`; mobile → `useTheme()`. Structural tokens (spacing/size/motion/type sizes) may be static.
- New design token → add to the `Theme`/`ColorScale` interface; TS forces all 4 themes to define it.
- `packages/ui-tokens/` is lint-exempt for color literals (it's the token source).

## Reference
- 4 themes: aurora / daylight / superchore / neon (per-person).
- Supabase project `pfokfopwjrahclmseper` (eu-central-1) — can auto-pause on free tier; consider Pro for the live test.
- claude.ai/design mirror of `@hiro/ui-primitives` web: "Hiro Design System" — https://claude.ai/design/p/f5d7db8c-8502-46b9-b6d4-e01774d7179c (re-sync: read `.design-sync/NOTES.md` first).
