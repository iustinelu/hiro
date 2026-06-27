# 07 - Interactive new-user onboarding (HIR-69)

**Ticket:** HIR-69  **Branch:** `hir-69/onboarding`  **Worktree:** `../hiro-onboarding`
**Platforms:** web + mobile  **Size:** L  **Group:** 3 (after enablers; align with IA decision)
**Read first:** `docs/v0.1.3/ia-decision.md` (IA placement) - pending founder sign-off.

## Goal
A guided, gamified **first-win** so a cold friend instantly "gets it": land in a household, create their first chore, complete it, watch points + streak react. Delight, not a wall of text.

## IA decision (from E-B - confirm against the signed-off doc)
- Onboarding **auto-launches over the Home tab on first run** (Home is already the gamified first-win surface). Don't build a separate route tree if a coachmark/overlay flow over Home works.
- Add a **"Replay tour"** entry in the More tab.
- **Persist a per-profile completion flag** so it never re-triggers for returning users (idempotent). Add a `profiles` column (e.g. `onboarded_at` / `onboarding_completed`) via migration, or reuse an existing signal if one fits.
- At the **end of the tour**, contextually request OS notification permission (ties into brief 09) - do not prompt cold.

## Do
- Build the guided flow reusing existing services (`taskService` create/complete, points, `progressService`) and existing primitives - no new design language.
- Make every step **skippable** and safe to abandon; re-entry resumes sensibly.
- Cover the empty-state path: brand-new household with zero chores should feel inviting, not blank.
- **Invited-user path (from E-C audit):** a fresh signup who arrived via an invite link must get a "Join a household" path in onboarding, not be forced to create one. Make sure invite-accept + onboarding interplay works for a brand-new account (don't dead-end).
- Web (`apps/web/src/app/onboarding/` already exists - extend it / or overlay on Home per IA) + mobile (`HouseholdOnboardingScreen.tsx` + Home). Keep parity.
- Respect all 4 themes.

## Acceptance
- First-run user is guided to create + complete a first chore and sees points/streak update.
- Completion persists per profile; returning users never see the tour again (unless they tap Replay).
- Skippable; works on web + mobile; all themes look right.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); `npm run dev:web` (+ mobile via E-A harness).
- **Route:** sign up as a brand-new user -> observe onboarding -> complete first-win -> sign out/in (tour does not reappear) -> More -> Replay tour.
- **Look for:** clear guidance, real first-win, no re-trigger, skippable, themed.
- **Pass/fail:** Pass = delightful guided first-win + idempotent + parity. Fail = re-triggers, dead-ends, unskippable, or off-theme.
