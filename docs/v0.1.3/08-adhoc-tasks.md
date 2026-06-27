# 08 - Ad-hoc tasks + contest/settle + activity board (HIR-70, reconciles HIR-67)

**Ticket:** HIR-70 (+ HIR-67)  **Branch:** `hir-70/adhoc-tasks`  **Worktree:** `../hiro-adhoc-tasks`
**Platforms:** web + mobile + Supabase  **Size:** XL (largest net-new)  **Group:** 3
**GATED:** do NOT start until the founder has signed off `docs/v0.1.3/ia-decision.md` (8 open questions there decide rules below).

## Goal
One-off / ad-hoc tasks alongside recurring chores: self-assigned points, a contest/settle flow (claim -> dispute -> resolve), and a household **activity board + history**. This is the fairness/transparency layer.

## IA decision (from E-B - confirm against signed-off doc)
- **Ad-hoc tasks live in the Tasks tab.** Extend the segmented control from `Today | All` to `Today | Backlog | All` (Backlog = HIR-67 claimable one-offs). Add a **one-off mode** to the existing create modal (`TaskCreateModal.tsx` mobile / web equivalent): self-assigned points, **no cadence**.
- **Activity board lives in the Progress tab** as a new `Trends | Activity` segment. Contest/dispute controls render inline on feed rows.
- **Home** gets a light "Up for grabs" strip of claimable backlog items deep-linking into Tasks > Backlog; optional banner for pending disputes.

## CRITICAL data caveat (from E-B)
- **Do NOT reuse the `activity_events` table** for the household feed. Its RLS is own-rows-only private diagnostics; widening it leaks everyone's `tab_viewed` events.
- Create a **new household-scoped feed/ledger table** with proper RLS via `current_household_ids()` / `current_profile_id()`. Mandatory **denial test** (`set local role anon`) on every new policy.

## Do
- **Schema:** new migration(s) for ad-hoc/one-off tasks (or extend recurring_tasks with a one-off/cadence-null path - decide and justify), the contest/settle state, and the household activity feed table. RPCs for claim/complete/contest/resolve with server-side points + validation. RLS helpers only. Pass `npm run check:migrations`.
- **Domain types:** add to `packages/@hiro/domain/src/index.ts` (this file also touched by brief 12 - **merge this brief first**, then 12 rebases).
- **Services:** mirror new functions in `apps/web/src/lib/*` and `apps/mobile/src/lib/*` 1:1.
- **UI:** Tasks-tab Backlog + one-off create; Progress-tab Activity feed with inline contest/settle; Home "Up for grabs" strip. Reuse existing primitives + theming.
- Implement the contest-resolution rule + any points caps **per the founder's answers** in the signed-off IA doc.

## Acceptance
- A member can post a one-off task, self-assign points, complete it; another can claim a backlog item; a member can contest and the flow resolves per the agreed rule.
- Activity board shows household events (not private diagnostics); RLS denial test passes.
- Web + mobile parity; all themes correct.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green, incl. migrations); `npm run dev:web` (+ mobile via E-A harness).
- **Route:** Tasks -> Backlog -> create one-off (self-assign points) -> complete; second account claims a backlog item; contest a completion -> resolve; open Progress -> Activity.
- **Look for:** points apply correctly server-side, contest/settle works, activity feed is household-scoped and accurate, no leak of other users' diagnostics.
- **Pass/fail:** Pass = full claim/contest/settle loop + correct feed + denial test green + parity. Fail = wrong points, broken contest flow, feed leak, or off-theme.
