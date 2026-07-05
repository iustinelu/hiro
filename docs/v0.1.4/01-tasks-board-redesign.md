# 01 - Tasks board redesign (HIR-83)

**Ticket:** HIR-83  **Branch:** `hir-83/tasks-board`  **Worktree:** `../hiro-tasks-board`
**Platforms:** mobile only  **Size:** L  **Depends on:** nothing (this unblocks 02/03/04)

## Goal

Turn the Tasks tab from a dead admin list into the household chore board.
This is the flagship UX/UI ticket: the founder judges "10x better" on this screen.
Client-only; no schema or RPC changes.

## Why the current tab fails (from founder screenshots + code audit)

- Inverted hierarchy: a full-width orange "+ New Task" banner is the loudest element; tasks are dim rows above a void.
- Rows carry no meaning: no cadence, no state, no owner, no tap affordance; points render as flat grey text.
- The Backlog claim card lumps items into one surface with floating "Claim" pills, no poster/claimer info, no value signaling.
- Today is read-only (completing lives only on Home), so the tab teaches users it is useless.
- Completions hide behind a "Completed today (n)" disclosure; zero momentum.
- Contest/settle is only reachable via Progress > Activity.

**IA change (founder-approved 2026-07-05):** Tasks becomes actionable - complete, claim, and log directly on the board.
This supersedes `docs/v0.1.3/ia-decision.md` section 1; an addendum line has been added there.

## Design spec

### Header

- Date eyebrow (e.g. "Saturday, Jul 5"), then progress: "3 of 5 done today" with a small progress ring or bar, plus points earned today.
- Create moves to a FAB (bottom-right, min 44pt target, above the tab bar) opening the existing `TaskCreateModal`.
- The full-width banner button is deleted.

### Board (default segment)

One scrolling list with intention-based sections, each with an eyebrow-style section header and count:

1. **Today** - recurring tasks due today (`isDueToday`), inline-completable.
2. **Anytime** - placeholder slot; ships with brief 02 (render nothing until then).
3. **Up for grabs** - open backlog one-offs, plus items claimed by anyone (claimed state visible).
4. **Done today** - minimal v1: my completions plus household completions from `getTodayCompletions` / feed data, row shows who + when + points. Brief 03 expands this section; build it as its own component so 03 can extend rather than rewrite.

Second segment **Manage** replaces "All Tasks": every non-archived recurring task with cadence chip, Edit, Archive.
Segments: `MobileSegmentedControl` with `Board | Manage`.
Honor `route.params.focusBacklog` by scrolling to Up for grabs (Home deep-link still works).

### MobileTaskRow primitive

New primitive in `packages/ui-primitives/src/mobile/` (export alongside `MobileListRow`; add to `DesignSystemGallery.tsx`).

- Leading: state affordance - tappable complete-circle (Today/Anytime), member avatar (claimed/done rows), or cadence glyph (Manage).
- Middle: title (single line, ellipsize) + one meta line (cadence chip, "posted by Maya", "claimed by Alex, 2h ago", or "was due Sunday").
- Trailing: tinted points chip (accent-tinted container + readable text, not flat grey); let weight/size scale subtly with point value.
- Min height 56, touch targets >= 44pt, pressed state, disabled state.
- Must honor theme flags: `borderWidth`, `textTransform`, `cardAccentBar`; verify superchore (3px borders, uppercase, hard shadows) and neon (glow) in the gallery.
- Replace bespoke row markup in `TasksScreen.tsx` AND `HomeScreen.tsx` (Today's Tasks + Up for grabs cards); keep onboarding tour anchors working (`OnboardingTourProvider` targets live on Home).

### Task detail sheet

Tapping any row (except the inline complete-circle) opens a `MobileModalSheet` with: title, description, points chip, poster/claimer line, and the single primary action for the current state:

- open backlog -> Claim
- claimed by me -> Mark done
- claimed by other -> read-only ("Alex is on it")
- completed pending settle -> countdown ("settles in 22h") + Contest (if not mine) or nothing (if mine)
- contested by me -> Withdraw

Wire to existing handlers: `complete_task`, `claim_one_off_task`, `complete_one_off_task`, `contest_one_off_task`, `withdraw_contest_one_off_task` via `taskService.ts` / `oneOffService.ts`.
Keep lazy `settleDueOneOffTasks(householdId)` on focus.

### Motion + feeling

- Completing: `PointsBurst` (existing, `screens/celebrations.tsx`) + haptics (`expo-haptics`, add to `apps/mobile/package.json` if absent - native module rule: app package.json, not root) + row animates out of Today into Done today.
- Respect reduced motion (`AccessibilityInfo.isReduceMotionEnabled`): swap animations for instant state changes.
- Empty states per section via `MobileEmptyStatePanel`, invitation copy (e.g. Today empty: "Nothing due today. Grab something from Anytime or Up for grabs.").

## Do

1. Build `MobileTaskRow` + gallery entry first; screenshot all 4 themes in the gallery before wiring screens.
2. Rebuild `TasksScreen.tsx` as Board/Manage; absorb and delete `tasks/BacklogView.tsx`.
3. Build the detail sheet component (`apps/mobile/src/screens/tasks/TaskDetailSheet.tsx`).
4. Adopt `MobileTaskRow` on Home; verify the onboarding tour end to end.
5. Pixel QA: emulator harness, all 4 themes, every board state (full, partial, all-empty, claimed, pending-settle, contested).

## Non-goals

Other tabs' visuals; any backend change; Anytime pool (02); Done-log expansion + dispute banner (03); overdue (04).

## Acceptance

Per HIR-83: all actions work from the board; `MobileTaskRow` everywhere (zero bespoke task rows); 4 themes pixel-QAd; empty states + celebration + reduced-motion; tour intact.

## Founder QA Quick Cycle

See HIR-83 for the full block.
Pass bar: "you would screenshot this tab to show someone the app."
