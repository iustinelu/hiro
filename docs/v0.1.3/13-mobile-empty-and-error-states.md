# 13 - Mobile empty-state + error-state cleanup

**Ticket:** (quality, from E-C readiness audit) - file a Linear #
**Branch:** `fix/mobile-empty-error-states`  **Worktree:** `../hiro-empty-error-states`
**Platforms:** mobile (primary) + web (if quick)  **Size:** M  **Group:** 1/4 (parallel-safe; needs E-A harness)

## Problems (from E-C dogfood audit)
1. **Dev placeholder leaking to prod:** Rewards/Progress/Budget empty states appear to render a developer panel ("EMPTY STATE / SPEC 04.3") instead of a real, friendly empty state. (Found via code-read - verify on the emulator first.)
2. **Errors masquerade as empty:** dashboard screens never check the `.error` returned by their service calls, so a Supabase outage / offline state shows "No tasks yet" (looks like the user lost their data) instead of an error with a retry. Budget add/delete also swallow write errors silently.

## Investigate first (reproduce before fixing)
- On the emulator, open Rewards/Progress/Budget with an empty household and confirm what actually renders. Find the placeholder component and where it's wired.
- Read the mobile screen + service code (`apps/mobile/src/screens/{RewardsScreen,ProgressScreen,BudgetScreen}.tsx`, `apps/mobile/src/lib/*Service.ts`) and trace how `.error` is (not) handled.

## Do
1. Replace any dev/spec placeholder with a real, branded, friendly empty state (reuse existing empty-state patterns from screens that do it well, e.g. Home "all done" / Progress "complete your first task"). Themed across all 4 themes.
2. Make dashboards distinguish **loading vs empty vs error**: when a service returns an error, show an error state with a retry action - never a fake empty state. Surface write errors (Budget add/delete, reward redeem) to the user.
3. Keep web parity only if quick (mobile-first; mobile is the must-fix).

## Acceptance
- No dev/spec placeholder anywhere in prod empty states.
- Error vs empty are visually distinct; a simulated failure (e.g. bad network) shows an error+retry, not "No tasks yet".

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); mobile via E-A emulator harness.
- **Route:** fresh empty household -> open Rewards/Progress/Budget (see friendly empty states); then simulate offline / kill connectivity -> reopen a dashboard.
- **Look for:** branded empty states (no "SPEC 04.3"); offline shows an error + retry, not a fake empty.
- **Pass/fail:** Pass = real empty states + distinct error states on all three screens. Fail = dev placeholder remains or errors still look like empties.
