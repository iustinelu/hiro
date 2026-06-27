# v0.1.3 Release-Readiness Addendum

Dogfooding + audit pass on 2026-06-27, ahead of the v0.1.3 release (onboarding, ad-hoc tasks, push, branded emails).
Scope: full end-to-end dogfood of the **web** app via headless browser (sign-up -> onboarding -> household -> chore -> complete -> points/progress -> reward create/redeem -> expense -> 4 themes -> invite), plus a code-level store-compliance audit and a UX/polish sweep across `apps/web`, `apps/mobile`, and `packages/`.

**Mobile device dogfooding is explicitly deferred** to the founder / emulator harness (no simulator on this Linux box; mobile findings below are code-read only, not run on device).

The core gameplay loop is solid: create chore -> mark Done -> points + streak flame + leaderboard + weekly chart + task breakdown all updated correctly; reward create/redeem with affordability gating and an activity feed works; budget expense with split + "who paid what" works; all 4 themes render and persist across navigation. The findings below are the gap between "works" and "ready to put in front of real friends."

Each item: **what / where / why it matters for real-home users / fix size (S/M/L)**.
Already-ticketed items (mobile invite localhost URL, `expire_stale_invites` scheduler, web `package.json` at 0.1.0, near-zero test coverage) are not re-listed except where this pass found something new about them.

---

## P0 - Ship-blockers

### P0-1. No in-app account-deletion path (BOTH stores will reject)
- **What:** There is no delete-account / close-account flow anywhere. Both "More"/settings screens expose only display-name edit + Sign out. No delete RPC in `supabase/migrations/`, no `supabase/functions/` directory at all (deleting an `auth.users` row needs the service-role key via an edge function or server route - none exists). FK `ON DELETE CASCADE` is in place on child tables, so data would clean up *if* the auth user were ever deleted - but nothing deletes it.
- **Where:** `apps/web/src/app/(tabs)/more/page.tsx` (Account card, ~line 162+); `apps/mobile/src/screens/MoreScreen.tsx` (Account card). Confirmed visually in dogfood: the web Account section has only Display name + Save name + Sign out.
- **Why it matters:** Apple Guideline 5.1.1(v) and Google Play's account-deletion policy both **require** an in-app deletion path for any app that supports account creation. One of the most common rejection reasons. Already flagged as an open item in `docs/launch/app-store-listing.md` (lines ~101-103); this pass confirms it still does not exist.
- **Stores affected:** Apple + Google Play.
- **Fix size: M** (UI in both More screens + a service-role-backed delete edge function/route; existing cascades handle the data).

### P0-2. No privacy-policy page or URL (blocks Play even for internal testing)
- **What:** No `/privacy`, `/terms`, `/support`, or `/legal` route exists in the web app, and no privacy link anywhere in web or mobile UI. Nothing is hosted to point a store listing at.
- **Where:** `apps/web/src/app/` route tree has only `auth/*`, `invite/[token]`, `onboarding`, `design-system`, `dev/error-test`, and the 6 `(tabs)` pages - none legal. Confirmed in dogfood: the More page has no legal/support links.
- **Why it matters:** Google Play requires a live privacy-policy URL **even for internal-track uploads** - the app cannot be submitted without one. Apple requires it in the App Privacy section. `docs/launch/app-store-listing.md` (~lines 76-78, 105-108) marks it "REQUIRED by both stores, must be live before submission" but no page was built.
- **Stores affected:** Apple + Google Play.
- **Fix size: S-M** (build `apps/web/src/app/privacy/page.tsx` + a `/support` page, link both from More; the listing doc already drafts the content).

### P0-3. PWA manifest is broken for every logged-out visitor
- **What:** `GET /manifest.webmanifest` returns a **307 redirect to `/auth/sign-in`** for unauthenticated users, so the browser receives HTML and logs `Manifest: Line: 1, column: 1, Syntax error`. Every first-time visitor (logged out) gets a broken manifest -> no installable PWA, no app name/icon/theme on "Add to Home Screen".
- **Where:** `apps/web/src/middleware.ts` matcher (lines 53-57) excludes `_next`, images, fonts, favicon - but **not** `/manifest.webmanifest`, so the unauthenticated redirect at line 39 swallows it. The manifest source (`apps/web/src/app/manifest.ts`) is itself fine. Reproduced: `curl /manifest.webmanifest` -> `307 -> /auth/sign-in`; console error on every page load.
- **Why it matters:** Web is the fastest distribution track (Vercel) and the PWA install is the "app-like" web experience. It is silently broken for the exact moment a new friend opens the link. Also a visible console error on every load.
- **Fix size: S** (add `manifest.webmanifest` + `icon.svg`/`icon-*.png` and `sw`/`robots` etc. to the middleware matcher exclusion, or allow it in the `!user` guard).

---

## P1 - Should-fix before real friends use it

### P1-1. Duplicate wordmark + floating page title on desktop web (every screen)
- **What:** On desktop (>=960px) the left rail shows "Hiro" AND the mobile header (`.mobileHeader`) is also rendered, showing a second "* HIRO" wordmark plus a large **centered** page title ("Home", "Budget", ...) that floats at the top, competing with the in-page greeting/heading (e.g. "Good afternoon"). Two `<h1>` elements per page (banner title + content title) - also an a11y/SEO issue.
- **Where:** `apps/web/src/app/(tabs)/layout.tsx` renders both the rail brand (line 35) and the `.mobileHeader` (lines 57-64). The desktop media query in `apps/web/src/app/(tabs)/tabs-layout.module.css` (lines 89-151) hides `.mobileTabs` (line 148-150) but only **restyles** `.mobileHeader` (lines 136-142) instead of hiding it. Visible in every desktop screenshot taken this pass.
- **Why it matters:** It is the single most-visible polish defect - present on 100% of authenticated desktop screens, makes the header look unfinished/misaligned.
- **Fix size: S** (`.mobileHeader { display: none }` inside the >=960px media query; the page content already provides its own title/greeting).

### P1-2. Service-layer errors silently become empty states (looks like data loss)
- **What:** Web services return empty data on failure (e.g. `getMonthExpenses` returns `{ expenses: [], error }`) and the dashboards do not check `.error` (zero `try/catch/.catch` in `HomeDashboard`, `TasksManager`, `RewardsDashboard`, `ProgressDashboard`, `BudgetDashboard`). If Supabase is down or the user is offline, the app shows "No tasks yet" / "No expenses this month" instead of an error - a real user assumes their data vanished. The `(tabs)/error.tsx` boundary never fires because nothing throws.
- **Where:** `apps/web/src/lib/expenseService.ts:62` (pattern) + the five dashboard components under `apps/web/src/app/(tabs)/`.
- **Why it matters:** "I added all our chores and they're gone" is the kind of trust-destroying first impression that loses a household.
- **Fix size: M** (surface `.error` as an inline error/retry state distinct from the empty state).

### P1-3. Write failures are silently swallowed (Budget add/delete)
- **What:** `BudgetDashboard.handleCreate` / `handleDelete` call `createExpense` / `deleteExpense` without checking the returned `.error`. A failed add/delete does nothing visible. (Inconsistent: `HomeDashboard.handleCreate` *does* throw on `result.error`.)
- **Where:** `apps/web/src/app/(tabs)/budget/BudgetDashboard.tsx` (~lines 65-80).
- **Why it matters:** User taps Save, nothing happens, no error - they retry, or give up.
- **Fix size: S-M.**

### P1-4. Mobile prod screens render a dev "EMPTY STATE / SPEC 04.3" panel
- **What:** `MobileEmptyStatePanel` always renders a literal header "EMPTY STATE" (top-left) and a mono subtitle defaulting to `"SPEC 04.3"` (top-right), and force-uppercases the description. Used in production by Rewards (`RewardCardGrid.tsx:35`, subtitle not overridden -> shows "SPEC 04.3"), Progress (`ProgressScreen.tsx:104`, shows "SPEC 04.3"), and Budget (`BudgetScreen.tsx:171`). A brand-new household on mobile sees "EMPTY STATE  SPEC 04.3" with shouty uppercase copy.
- **Where:** `packages/ui-primitives/src/mobile/MobileEmptyStatePanel.tsx` + the three screens above. **Note: not verified on device** (mobile dogfood deferred) - flagged from code read.
- **Why it matters:** Reads as an unfinished internal tool, not a shipped product, on the first screen a new mobile user sees.
- **Fix size: M** (give prod screens a clean empty-state component, or strip the dev header/subtitle/uppercase from the shared panel).

### P1-5. "Create invite link" with empty email gives zero feedback
- **What:** Clicking "Create invite link" without typing an email does nothing - no validation message, no link, no toast. `handleInvite` early-returns on empty input. Reproduced in dogfood.
- **Where:** `apps/web/src/app/(tabs)/more/page.tsx:90` (`if (!inviteEmail.trim() || !household) return;`). Same pattern likely on mobile.
- **Why it matters:** Inviting friends is the core growth/onboarding flow; a silent no-op on the primary action looks broken.
- **Fix size: S** (show a "Please enter an email" validation message).

### P1-6. New-with-invite user has no "Join a household" path in onboarding
- **What:** Onboarding offers only "Create your household". A friend who was invited but signs up fresh first (instead of clicking the invite link while logged in) lands on onboarding with no way to join - they'd be forced to create a throwaway household. (The invite-link flow at `/invite/[token]` does handle the logged-in/redirect case, but onboarding itself is create-only.)
- **Where:** `apps/web/src/app/onboarding/page.tsx` + `CreateHouseholdForm.tsx`.
- **Why it matters:** v0.1.3 is adding onboarding and the whole point of a household app is multi-person; the join path should be first-class. Relevant to the planned onboarding work.
- **Fix size: M.**

### P1-7. Email-confirmation sign-up would dead-end silently
- **What:** `SignUpForm.handleSignUp` pushes to `/home` immediately after `signUp`, assuming a session exists. In this Supabase project email confirmation is currently OFF (dogfood signup logged straight in), but if it is ever turned ON, sign-up returns no session, `/home` bounces back to sign-in via middleware, and the user sees no "check your email" message - a silent dead-end.
- **Where:** `apps/web/src/app/auth/sign-up/SignUpForm.tsx:54-66`.
- **Why it matters:** A real-launch hardening config change (enabling confirmation to stop spam signups) would silently break sign-up. v0.1.3 adds branded emails, which implies confirmation/verification emails may get enabled.
- **Fix size: S** (detect no-session response and show a "check your email" state).

---

## P2 - Nice-to-have polish

- **P2-1. Reachable dev routes in production.** `/design-system` (full component gallery with dev copy like "Critical error: Retry after checking auth node credentials") and `/dev/error-test` (deliberately throws "Controlled test error - HIR-35 QA") have no `NODE_ENV`/`notFound()` guard - any user who guesses the URL reaches them in prod. `apps/web/src/app/design-system/page.tsx`, `apps/web/src/app/dev/error-test/page.tsx`. **Fix: S** (gate behind env / `notFound()`). (Note: the error-test string uses an em dash, against project style.)
- **P2-2. Budget empty state is bare.** Just "No expenses this month." centered, with no call-to-action button in the body (Add Expense only top-right), unlike Home/Rewards which have a prominent "Create your first..." in the empty card. `apps/web/src/app/(tabs)/budget/BudgetDashboard.tsx:103`. **Fix: S.**
- **P2-3. Destructive actions lack confirmation.** Budget expense "Delete" deletes immediately, no confirm dialog (Reward redeem *does* have a Confirm/Cancel step - inconsistent). `apps/web/src/app/(tabs)/budget/ExpenseList.tsx`. **Fix: S.**
- **P2-4. Expense Date is a free-text `YYYY-MM-DD` box, not a date picker.** Error-prone for real users typing dates by hand. `apps/web/src/app/(tabs)/budget/ExpenseAddModal.tsx`. **Fix: S-M.**
- **P2-5. Auth/More forms aren't wrapped in `<form>`.** Browser logs "Password field is not contained in a form"; Enter-to-submit and password-manager autofill don't work on sign-in/sign-up. `apps/web/src/app/auth/*/`*Form.tsx`. **Fix: S.**
- **P2-6. Tasks "Today" view has no all-done affirmation.** When the only task is completed, the Today tab shows just a collapsed "Completed today (1)" and an otherwise empty screen (Home has `AllDoneCelebration`, Tasks does not). `apps/web/src/app/(tabs)/tasks/TasksManager.tsx`. **Fix: S.**
- **P2-7. Copy/capitalization inconsistency.** Mixed Title Case vs sentence case across the same screens ("+ New Task"/"Task Name" vs "+ Add task"/"Household name"); three different "no tasks" phrasings; ad-hoc loading strings vs the shared `defaultStateMessages.loading`. **Fix: S** (pick sentence case, unify).
- **P2-8. Version mismatch across the three manifests.** `apps/web/package.json` = 0.1.0, `apps/mobile/package.json` = 0.1.0, `apps/mobile/app.json` = 0.1.2. Reconcile to the v0.1.3 release. **Fix: S.** (Web 0.1.0 is the already-known item; this pass confirms mobile `package.json` is also stale at 0.1.0.)
- **P2-9. Dead code.** `apps/web/src/app/(tabs)/SectionPlaceholder.tsx` ("Placeholder shell content ... out of scope for HIR-32") is imported nowhere. Cleanup-only. **Fix: S.**
- **P2-10. Brief empty-`/home` flash for new users.** A user with no household briefly sees an empty `/home` before the server redirect to `/onboarding` resolves. Minor flicker. **Fix: S.**

---

## Verified working (no action needed)

- Core loop: chore create -> Done -> points + streak flame + leaderboard + weekly chart + task breakdown, all correct.
- Reward create -> redeem with Confirm/Cancel step, balance deduction, "Need X more" affordability gating, disabled Redeem when unaffordable, activity feed entry.
- Budget expense with payer + split + "who paid what" bar + total/count summary; currency follows household setting (EUR -> shown as EUR).
- All 4 themes (Aurora / Daylight / Super Chore / Neon Grid) render distinctly and persist across navigation; theme picker swatches preview each theme.
- Auth route guards (middleware redirects unauthenticated users to sign-in; authenticated users away from auth routes), redirect-param preservation.
- Empty states exist for Home, Tasks, Rewards (good copy + CTA).
- Error boundaries (`error.tsx`, `global-error.tsx`, `(tabs)/error.tsx`) use friendly copy + Retry.
- No camera/location/notification/contacts permissions declared in `apps/mobile/app.json` (no store permission-justification work needed); `ITSAppUsesNonExemptEncryption: false` correctly set.
- No analytics/ads/tracking SDKs in any `package.json` -> Data-safety / App-Privacy "used to track" is honestly "No".
