# 04 - BudgetScreen refetch-on-focus (mobile polish)

**Ticket:** (no Linear #) - small polish
**Branch:** `chore/budget-focus-refetch`  **Worktree:** `../hiro-budget-focus-refetch`
**Platforms:** mobile  **Size:** S  **Group:** 1 (needs E-A harness for mobile QA)

## Problem
`apps/mobile/src/screens/BudgetScreen.tsx` fetches on mount only, so after navigating away and back it can show stale expenses. `RewardsScreen` and `ProgressScreen` already use `useFocusEffect` (PR #31) - Budget should match.

## Do
1. Add `useFocusEffect` to `BudgetScreen` to refetch the current month's expenses + breakdown on focus, mirroring the exact pattern in `ProgressScreen.tsx` / `RewardsScreen.tsx`.
2. (Optional, if quick) add pull-to-refresh parity where missing on Progress/Rewards so all three behave consistently. Budget already has `RefreshControl`.
3. Don't double-fetch (avoid mount + focus firing twice on first render - follow how the other two screens handle it).

## Acceptance
- Returning to the Budget tab after adding/deleting an expense elsewhere shows fresh data without a manual reload.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); mobile via E-A emulator harness.
- **Route:** Mobile -> Budget (note totals) -> add an expense -> go to another tab -> return to Budget.
- **Look for:** Budget reflects the new expense immediately on return.
- **Pass/fail:** Pass = data refreshes on focus, no duplicate flicker. Fail = stale data until manual refresh.
