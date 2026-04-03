# HIR-39: Recurring Tasks + Points Core — Design Spec

**Date:** 2026-04-03
**Ticket:** HIR-39 (blocks HIR-40, HIR-41)
**Branch:** `hir-39/recurring-tasks-points`

## Purpose

This is the core product loop of Hiro. Household members create recurring chores with point values, complete them daily, and accumulate points on a leaderboard. The goal is to make task completion so satisfying that people open the app every day.

## Design Principles

1. **Instant dopamine** — completing a task must feel like collecting coins in a game
2. **Streak pressure** — "don't break the chain" drives daily opens
3. **Social competition** — a visible leaderboard creates gentle household rivalry
4. **Home is for doing, Tasks is for managing** — most sessions start and end on Home

## Schema

### `recurring_tasks`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| household_id | uuid FK → households | on delete cascade |
| name | text not null | task name |
| description | text | optional details |
| points | integer not null | positive, min 1 |
| cadence | text not null | check: 'daily', 'weekly', 'custom' |
| cadence_meta | jsonb not null | weekly: `{"day":"monday"}`, custom: `{"days":["mon","wed","fri"]}`, daily: `{}` |
| created_by_profile_id | uuid FK → profiles | who created it |
| is_archived | boolean default false | soft delete, preserves ledger |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS:** All operations scoped to `current_household_ids()`. Any household member can CRUD. Archived tasks are visible but filtered out of "due today" in the client.

### `task_completions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| task_id | uuid FK → recurring_tasks | on delete restrict (preserve history) |
| completed_by_profile_id | uuid FK → profiles | who did it |
| household_id | uuid not null | denormalized for fast leaderboard queries |
| points_earned | integer not null | snapshot of task.points at completion time |
| completed_at | timestamptz | default now() |
| created_at | timestamptz | default now() |

**RLS:** Select scoped to `current_household_ids()`. Insert for any authenticated household member. No update or delete — immutable ledger.

**Indexes:** `(household_id, completed_at)` for leaderboard queries, `(task_id, completed_by_profile_id, completed_at)` for "done today" checks, `(completed_by_profile_id, completed_at)` for streak calculation.

### `complete_task(p_task_id)` RPC

SECURITY DEFINER. Atomic operation:
1. Validates task exists, is not archived, caller is a member of the task's household
2. Inserts into `task_completions` with current `points` value as `points_earned`
3. Returns `{ points_earned: integer, task_name: text }` so the UI can animate "+5 Take out trash!"

No duplicate-completion guard — a user can complete the same task multiple times per day (e.g. "take out trash" might happen twice). The UI shows it as "done" after the first completion but doesn't block re-completion.

## Cadence Model

Three options, determined client-side from `cadence` + `cadence_meta`:

- **daily** — always due. `cadence_meta: {}`
- **weekly** — due on one specific day. `cadence_meta: {"day": "monday"}`
- **custom** — due on specific weekdays. `cadence_meta: {"days": ["mon", "wed", "fri"]}`

Client filters tasks by comparing today's day-of-week (in user's local timezone) against the cadence rule. No server-side date logic needed — household task counts are small.

## Addiction Loop Mechanics

### Micro-Reward: Task Completion Animation

Choreography (sub-500ms total):

1. **0ms** — Button springs down (framer-motion/Reanimated spring press)
2. **50ms** — Button morphs to checkmark circle, background flashes `success` green
3. **100ms** — Points burst: "+5" text launches upward with spring overshoot, small particle sparks scatter outward in `accent` color
4. **150ms** — Haptic feedback (mobile only, expo-haptics medium impact)
5. **200ms** — Task row slides out of the list with exit animation
6. **300ms** — Remaining tasks close the gap with layout animation

**Combo counter:** If this is the 2nd+ task completed in the current session, show "x2!" / "x3!" next to the points burst. Combo is pure client state — not persisted, resets on page reload.

**Implementation:** `<PointsBurst points={5} combo={2} />` component. Use `/frontend-design` skill during implementation for the exact component design.

### Macro-Reward: Daily Streak

- Streak flame icon + counter visible on Home tab header ("7 day streak")
- Streak = consecutive days (backwards from today) where the user completed at least 1 task
- Calculated client-side: `SELECT DISTINCT DATE(completed_at) FROM task_completions WHERE completed_by_profile_id = $1 ORDER BY 1 DESC`
- Count consecutive days from today backwards. If today has no completions yet, still count from yesterday (grace period — streak doesn't break until end of day)

### Macro-Reward: "All Done" Celebration

When all of today's tasks are completed:
- Full-width confetti/particle burst across the screen
- Summary card: "All tasks complete! +N points today"
- This is the "inbox zero" moment

### Social Layer: Mini Leaderboard

- Card on Home tab showing household members + points this week
- Query: `SUM(points_earned) ... WHERE completed_at >= start_of_week GROUP BY completed_by_profile_id`
- Shows profile display name (or "Member" fallback) + point total
- Current user highlighted

## UI Structure

### Home Tab (primary interaction surface)

```
┌─────────────────────────────┐
│ Good morning        🔥 7    │  ← streak
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Today's Tasks      3/5  │ │  ← progress count
│ │                         │ │
│ │ Take out trash    5pts ✓│ │  ← done button
│ │ Vacuum living rm 10pts ✓│ │
│ │ Cook dinner      15pts ✓│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Leaderboard (this week) │ │
│ │ You         45 pts      │ │
│ │ Partner     38 pts      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Tasks Tab (management view)

- Segmented control: "Today" / "All Tasks"
- "Today": same due-today list as Home (synced data)
- "All Tasks": every recurring task with cadence, points, edit/archive
- Header action: "+ New task" opens creation modal
- Bottom: "Completed today" collapsed section

### Task Creation Modal (ModalSheet)

- Task name input (required)
- Points input (number, required, min 1)
- Cadence picker: three `InteractiveChip`s — Daily / Weekly / Custom
  - Weekly: single day picker (Mon-Sun chips)
  - Custom: multi-select day picker (Mon-Sun chips)
- Save button

### Task Card (list row)

- Left: task name + cadence subtitle ("Every Mon, Wed, Fri")
- Right: points badge (accent color) + "Done" button (prominent, primary variant)
- In "All Tasks" view: tap row to edit, swipe/long-press for archive

## Animation Technology

- **Web:** `framer-motion` — spring animations, AnimatePresence for mount/unmount, layout animations for list reflow
- **Mobile:** `react-native-reanimated` — spring physics, shared element transitions, `expo-haptics` for tactile feedback
- **Points burst component:** Built in `ui-primitives` as a reusable component, platform-specific implementations

## Data Flow

- **Fetch all tasks:** `SELECT * FROM recurring_tasks WHERE household_id IN (current_household_ids()) AND NOT is_archived`
- **Filter due today:** Client-side, compare `cadence` + `cadence_meta` against current day-of-week in local timezone
- **Check done today:** `SELECT task_id FROM task_completions WHERE completed_by_profile_id = $1 AND completed_at >= $today_start_utc AND completed_at < $tomorrow_start_utc` — the client sends UTC boundaries based on the user's local midnight to avoid timezone issues with `CURRENT_DATE` (which uses the DB timezone)
- **Complete task:** Call `complete_task(p_task_id)` RPC → returns `{ points_earned, task_name }` → trigger animation → refetch completions
- **Leaderboard:** `SELECT completed_by_profile_id, SUM(points_earned) FROM task_completions WHERE household_id = $1 AND completed_at >= $week_start GROUP BY 1`
- **Streak:** `SELECT DISTINCT completed_at::date FROM task_completions WHERE completed_by_profile_id = $1 ORDER BY 1 DESC LIMIT 60`

No React Query or SWR. useState + useEffect + service functions, consistent with existing householdService pattern. Refetch after mutations.

## Service Layer

`apps/web/src/lib/taskService.ts` and `apps/mobile/src/lib/taskService.ts`:

- `createTask(householdId, name, points, cadence, cadenceMeta)` → `{ task, error }`
- `updateTask(taskId, updates)` → `{ task, error }`
- `archiveTask(taskId)` → `{ error }`
- `getHouseholdTasks(householdId)` → `{ tasks, error }`
- `completeTask(taskId)` → `{ pointsEarned, taskName, error }`
- `getTodayCompletions(profileId)` → `{ completedTaskIds, error }`
- `getWeeklyLeaderboard(householdId)` → `{ entries, error }`
- `getStreak(profileId)` → `{ streak, error }`

## Domain Types

Add to `packages/domain/src/index.ts`:

```typescript
type TaskCadence = "daily" | "weekly" | "custom";

interface CadenceMeta {
  day?: string;       // for weekly: "monday"
  days?: string[];    // for custom: ["mon", "wed", "fri"]
}

interface RecurringTask {
  id: Uuid;
  householdId: Uuid;
  name: string;
  description: string | null;
  points: number;
  cadence: TaskCadence;
  cadenceMeta: CadenceMeta;
  createdByProfileId: Uuid;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaskCompletion {
  id: Uuid;
  taskId: Uuid;
  completedByProfileId: Uuid;
  householdId: Uuid;
  pointsEarned: number;
  completedAt: string;
  createdAt: string;
}

interface LeaderboardEntry {
  profileId: Uuid;
  displayName: string | null;
  pointsThisWeek: number;
}
```

## New Dependencies

- `framer-motion` — add to `apps/web/package.json`
- `react-native-reanimated` — add to `apps/mobile/package.json`
- `expo-haptics` — add to `apps/mobile/package.json`

## Implementation Notes

- Use `/frontend-design` skill for the PointsBurst component, task card design, and "all done" celebration — these need to be distinctive and satisfying, not generic
- The Home tab currently shows a placeholder — replace with the daily dashboard (streak + today's tasks + leaderboard)
- The Tasks tab currently shows a placeholder — replace with management view
- All RLS policies must use `current_household_ids()` helper (never self-reference)
- `task_completions` is immutable — no UPDATE or DELETE policies

## Verification

1. `npm run check` passes
2. Create a recurring task (daily, 5 pts) → appears in Today's Tasks on Home
3. Tap Done → points burst animation fires, "+5" shows, task moves to completed section
4. Complete second task → combo counter shows "x2!"
5. Complete all today's tasks → "All done" celebration fires
6. Check leaderboard → points reflected
7. Check streak → increments correctly
8. Second household member sees the same tasks, separate completion state
9. Denial tests: anon can't read, cross-household can't see tasks
