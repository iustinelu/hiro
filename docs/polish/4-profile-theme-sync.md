# Polish Item 4 — `profiles.theme` DB sync

> You are the dedicated agent for this item. Implement **only** this scope. Work in an isolated git worktree. Do **not** merge until the founder signs off.

## Protocol (every polish item)
1. Create a worktree off the latest `main`:
   `git worktree add ../hiro-theme-sync -b chore/profile-theme-sync main`
2. Implement only this item. Match surrounding code style. Respect THE THEMING RULE (themed color/elevation/radius/typography.fontFamily must be reactive — web `cssColor/...`/`cssFontFamily`, mobile `useTheme()`; enforced by `scripts/lint.mjs` in `npm run check`).
3. Run `npm run check` from repo root until green **before** reporting done. Smoke-run `npm run dev:web` and `npm run dev:mobile`.
4. Report done with the Founder QA Quick Cycle below filled in. **Do not merge until the founder signs off.**
5. On founder go: rebase on current `main`, re-run `npm run check`, merge to `main`, then `git worktree remove ../hiro-theme-sync`.

## Goal
Persist each user's chosen theme on their `profiles` row so it follows them across devices, while keeping the current client-side fast-path (cookie/localStorage/SecureStore) for instant first paint.

## Current state
- No `theme` column on `profiles` (baseline schema `supabase/migrations/20260228194000_baseline_households.sql:5`). RLS already has `profiles_update_self` (owner can update own row) and `profiles_select_self` — **no new policy needed**.
- `Profile` interface: `packages/domain/src/index.ts:15`.
- Web theme write: `applyTheme()` in `apps/web/src/app/(tabs)/more/ThemeSwitcher.tsx:39` (cookie + localStorage + `data-theme`). Web profile read seam: `apps/web/src/app/(tabs)/HouseholdProvider.tsx:45` (already does `.select("display_name")` after `rpc("current_profile_id")`).
- Mobile theme state/persist: `apps/mobile/src/theme/ThemeProvider.tsx` (SecureStore). Switch handler: `MoreScreen.tsx` `setThemeId`. Profile read: `apps/mobile/src/lib/profileService.ts` `getDisplayName`.

## Steps
1. **Migration** `supabase/migrations/<ts>_profile_theme.sql`: `alter table public.profiles add column if not exists theme text;` (nullable; null = use client default). Optionally `check (theme in ('aurora','daylight','superchore','neon'))`. **Before applying:** `get_project` on `pfokfopwjrahclmseper` — if paused, `restore_project` and wait ~30s for `ACTIVE_HEALTHY`. After applying, run the **mandatory anon denial test** (`set local role anon` update attempt must be rejected) to confirm RLS still holds.
2. **Domain:** add `theme: ThemeId | null` to `Profile` (`packages/domain/src/index.ts`); reuse `ThemeId` from `@hiro/ui-tokens`.
3. **Web read:** in `HouseholdProvider.tsx`, extend the profile select to `("display_name, theme")`; if `theme` is set and differs from active `data-theme`, apply it (reuse the same apply logic as `ThemeSwitcher.applyTheme`). Keep cookie/localStorage as the pre-hydration fast path; DB is the cross-device source of truth on load.
4. **Web write:** in `applyTheme()` (`ThemeSwitcher.tsx`), after the local writes, fire-and-forget `supabase.from("profiles").update({ theme: id }).eq("id", profileId)` (resolve `profileId` via `rpc("current_profile_id")` or context). Don't block the UI on the network call.
5. **Mobile read:** extend `profileService` with a theme getter (or add `theme` to the existing select) and have `ThemeProvider`/`MoreScreen` reconcile DB value over the SecureStore value on login.
6. **Mobile write:** in `setThemeId` (`MoreScreen.tsx`/`ThemeProvider.tsx`), after the SecureStore write, fire-and-forget the same Supabase update.
7. Precedence rule (document in a code comment): SecureStore/cookie for instant paint → DB value reconciles on login → user switch updates all three.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green), `npm run dev:web`, `npm run dev:mobile`.
- **Flow:** on web, switch to e.g. Neon. In a fresh private window (or after clearing the `hiro-theme` cookie/localStorage), reload while logged in as the same user → app comes up in Neon (read from DB). On mobile, sign in as the same user on a clean install/storage → theme matches.
- **Look for:** theme persists per-user across a storage wipe; no flash to default that then sticks; anon denial test passed in the migration step.
- **Pass/fail:** Pass = theme follows the user via DB across devices/storage-wipe, RLS denial confirmed. Fail = theme resets to default after cookie/SecureStore clear, or anon can update.
