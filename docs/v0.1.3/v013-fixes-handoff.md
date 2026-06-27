# v0.1.3 Pixel-QA Fix Batch - Session Handoff

**For a fresh session.** Execute the five fixes below, build to the founder's Pixel 9, QA each, then merge + bump version. Mobile-only project (no web/Vercel). Read `docs/architecture-standards.md` + `supabase/README.md` first if unfamiliar.

## Current state (2026-06-27)
- v0.1.3 merged 15 parallel-agent PRs into `main`. `main` is green (`npm run check` passes).
- Integration was messy and already produced bugs: stale `node_modules` (fixed via `npm install`), dropped + duplicate migrations (fixed - migrations now match the live DB), and the four QA defects below.
- Live Supabase (`pfokfopwjrahclmseper`) is fully migrated; all new tables have RLS on.
- The Pixel currently runs a **debug build of `main`**. App version still `0.1.2` in `apps/mobile/app.json` (bump after QA).
- A leftover worktree may exist at `../hiro-account-linking` - safe to `git worktree remove` if so.

## Setup
Work on ONE branch; all fixes touch mostly disjoint files.
```
cd /home/iustin/dev/hiro
git worktree add ../hiro-v013-fixes -b fix/v013-pixel-qa main
# copy gitignored env into the worktree:
cp apps/mobile/.env ../hiro-v013-fixes/apps/mobile/.env
```

## Build / install / QA loop on the Pixel (non-obvious - use exactly this)
```
cd /home/iustin/dev/hiro && source scripts/android-env.sh   # sets JAVA_HOME/ANDROID_HOME/PATH (JDK is user-local)
adb devices                                                 # Pixel 9 Pro XL serial = 46221FDAS00412
adb -s 46221FDAS00412 uninstall com.behiro.app             # avoids INSTALL_FAILED_VERSION_DOWNGRADE
cd apps/mobile && npx expo run:android                      # single device: builds debug, installs, starts Metro (stays running)
```
Keep the phone on USB. Run `npm run check` green from repo root before each build. Founder will sign in again after uninstall (expected).

---

## Fix 1 - Bottom tab icons are blank (HIGH)
**Root cause:** `packages/ui-primitives/src/mobile/MobileIcon.tsx` renders `@expo/vector-icons` Ionicons (`<Ionicons .../>`). Code is correct + unchanged since PR #31 (`AppTabs.tsx` passes valid names + real `accent`/`inkMuted` tint colors). Glyphs are blank because the **Ionicons font isn't loaded** in the local prebuild (bare) build - managed/EAS builds auto-bundle vector-icon fonts; the prebuilt `apps/mobile/android/` does not, and there's no `Font.loadAsync`/`useFonts` for it.
**Fix (durable, all build types):** load the Ionicons font at startup in `apps/mobile/src/index.tsx` (app entry) - e.g. `useFonts({ ...Ionicons.font })` or `Font.loadAsync(Ionicons.font)` gating first paint - reusing the existing themed-font load if one exists (co-load them).
**Also:** `npx expo prebuild --platform android --clean` then rebuild to clear a stale prebuild; keep the explicit font load regardless (correct for the eventual EAS production build).
**Verify:** all 6 tab icons visible (home/tasks/progress/budget/rewards/more); active = accent color.

## Fix 2 - Invite shares a dead localhost:3000 link (HIGH)
**Root cause:** PR #51 (HIR-73 universal links, commit `33e047d`) re-introduced a web URL, undoing PR #41's mobile-only join-code design. `apps/mobile/src/screens/MoreScreen.tsx:18`: `const WEB_ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000"`; `joinUrl(code)` (~98-100) builds `${WEB_ORIGIN}/join/${code}`; shared/copied at ~104/110/114/263. No hosted `/join` page exists (web dropped) -> dead link.
**Fix:** remove `WEB_ORIGIN` + `joinUrl()`. Share/copy the **join code** + a `hiro://join/${code}` deep link (the `useJoinDeepLink` hook in `RootNavigator.tsx` already handles incoming `hiro://` links) + a `[TODO: store URL]` placeholder. Copy action copies the code only. `joinLinkService.ts` + `JoinHouseholdForm.tsx` already support code-based join - no DB change.
**Files:** `apps/mobile/src/screens/MoreScreen.tsx` (+ check `apps/mobile/src/lib/inviteService.ts` / `joinLinkService.ts`).
**Verify:** More -> create invite -> Share shows code + `hiro://join/...` + store TODO, NO localhost; a 2nd account joins by code.

## Fix 3 - Onboarding tour never triggers (HIGH) - recover lost code
**Root cause:** PR #47 (onboarding, HIR-69) merged with **base `feat/mobile-only-invites`** at 14:06, but that branch had already merged to `main` (PR #41) at 12:44 - so the onboarding **client code never reached `main`**. Only the DB migration `20260627115953_profile_onboarding_flag.sql` landed (already on main). `RootNavigator.checkOnboarded()` only checks display-name + household, never the tour.
**Recover from commit `38a80f6`** ("feat(mobile): interactive first-win onboarding tour (HIR-69)"). Try `git cherry-pick 38a80f6`; resolve conflicts (it was built on the invite branch). If messy, extract files with `git show 38a80f6:<path>`:
- `apps/mobile/src/onboarding/OnboardingTourProvider.tsx` (reads `onboarding_completed`, auto-launches for new users, `useOnboardingTour()`)
- `apps/mobile/src/onboarding/OnboardingTourCard.tsx`
- `apps/mobile/src/lib/profileService.ts` additions: `getOnboardingCompleted()`, `markOnboardingCompleted()`
- `apps/mobile/src/screens/AppShell.tsx` - wrap `<AppTabs/>` in `<OnboardingTourProvider>`
- `apps/mobile/src/screens/HomeScreen.tsx` - render `OnboardingTourCard` when tour active
Verify reads/writes match the migration already on main.
**Verify:** brand-new signup auto-launches the tour (create->complete->celebrate); completes once; never re-triggers; Replay works.

## Fix 4 - Keyboard covers the New Task input (MEDIUM)
**Root cause:** `packages/ui-primitives/src/mobile/MobileModalSheet.tsx` is a bottom-anchored `Modal` with no `KeyboardAvoidingView`/`ScrollView`; on Android (`adjustResize`) the sheet sits behind the keyboard.
**Fix:** wrap sheet content in `KeyboardAvoidingView` (`behavior={Platform.OS === "ios" ? "padding" : "height"}`) + `ScrollView` (`keyboardShouldPersistTaps="handled"`), `maxHeight: "80%"`, action buttons kept OUTSIDE the ScrollView. Reuse the pattern in `apps/mobile/src/screens/auth/AuthScreen.tsx`. One change fixes Task, Reward, and Expense modals (all use this primitive).
**Verify:** New Task modal - tapping TASK NAME keeps the field visible above the keyboard (also check Reward + Expense add modals).

## Fix 5 - Integration-completeness audit (HIGH - prevents repeat of Fix 3)
PR #47's code silently missed `main`; verify no other PR did the same. For each of the 15 merged PRs, confirm its key client files exist on `main` and its `gh pr view <n> --json baseRefName` base == `main`. Spot-check: push (`notificationService.ts` + `supabase/functions/send-push`), ad-hoc (`one_off_tasks` screens/services), account-deletion UI, account-linking UI, empty/error-state changes. Recover anything missing (same `git show <commit>:<path>` technique).

---

## After QA passes
- Bump `apps/mobile/app.json` version `0.1.2` -> `0.1.3`.
- RLS denial tests on new tables (household_activity, one_off_tasks, device_tokens, household_join_links, account deletion) via Supabase `execute_sql` with `set local role anon` - confirm anon is rejected.
- Merge `fix/v013-pixel-qa` -> `main`; `git worktree remove ../hiro-v013-fixes`; update `docs/next-chat-handoff.md`.
- Then EAS preview build -> on-device verify -> production build + submit (Play internal + TestFlight) per `docs/launch/README.md`.

## Lesson (log to dev-process-improvements)
Parallel agents based PRs on each other's feature branches; when an early branch merged to main, later PRs stacked on it never reached main (onboarding) and one reverted a prior decision (invite web link). Add a guard: PR base must be `main`, and an integration check that each merged PR's files are present on main.
