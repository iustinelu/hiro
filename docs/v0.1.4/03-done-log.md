# 03 - Done log: what just happened (HIR-85)

**Ticket:** HIR-85  **Branch:** `hir-85/done-log`  **Worktree:** `../hiro-done-log`
**Platforms:** mobile only (client-only expected)  **Size:** M  **Depends on:** 01 (board, `MobileTaskRow`, detail sheet)

## Goal

Answer the founder's "log of tasks I just did?" note.
Make the household's recent activity visible where the work happens, and make settle/dispute states discoverable outside Progress > Activity.

## Do

### Done today section (expands brief 01's minimal version)

- Household-wide, newest first; row = member avatar, name, task title, relative time, points chip ("Maya fed the cat, 20m ago, +3").
- Data: `getHouseholdActivity(householdId, limit)` filtered to done-kinds (`task_completed`, `one_off_logged`, `one_off_completed`, `one_off_settled`) merged with today's `task_completions` rows.
- Client-side merge preferred; only add a small RPC/view if it proves genuinely awkward, and justify in the PR.

### Settle/dispute states on Done rows

- Pending settle -> countdown chip ("settles in 22h"); contested -> contested chip (`MobileStatusBadge` tones per brief 01's sheet).
- Tapping opens the brief-01 detail sheet with Contest / Withdraw where applicable.
- Progress > Activity stays as the full-history archive; do not remove anything there.

### Home dispute banner (designed in `docs/v0.1.3/ia-decision.md`, never built)

- When a completion involving me is pending settle or contested, Home shows one quiet banner ("1 completion awaiting settle") deep-linking to the board's Done section.
- One banner max; count aggregates.

### Your history

- Entry point from the board's Manage segment ("Your history").
- Simple grouped-by-day list of my own completions (reads `task_completions` for `current_profile_id`), task name + time + points, most recent 30 days.

## Non-goals

Contest/settle rule changes (HIR-70 semantics stay); replacing Progress > Activity; web.

## Acceptance

Per HIR-85: completions of every type appear in Done today within one focus refresh with correct actor/time/points; contest/withdraw work from the Done row sheet; Home banner appears and deep-links; Your history groups by day; 4 themes correct.

## Founder QA Quick Cycle

See HIR-85 for the full block.
Needs two accounts (`apple@test.com` + a second member).
Pass bar: answer "what just happened in this house?" from the Tasks tab in under 3 seconds.
