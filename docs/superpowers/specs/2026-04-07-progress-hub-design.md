# HIR-42 + HIR-43: Progress Hub — Design Spec

**Date:** 2026-04-07
**Tickets:** HIR-42 (aggregation queries), HIR-43 (progress hub UI)
**Branch:** `hir-42/progress-hub`

## Purpose

The Progress tab answers "how am I doing over time?" while Home answers "what should I do now?" This is the reflection surface — weekly trends, personal stats, household competition, and task completion patterns.

## Design Principles

1. **Glanceable** — key stats visible without scrolling (KPI tiles)
2. **Comparative** — this week vs last week, me vs household
3. **Motivating** — highlight streaks, gains, and personal bests
4. **Lightweight** — no new charting library, CSS bar charts + existing primitives

## New Domain Types

Add to `packages/domain/src/index.ts`:

```typescript
interface DailyPoints {
  date: string;       // "2026-04-07"
  points: number;
  completions: number;
}

interface PersonalStats {
  pointsThisWeek: number;
  pointsLastWeek: number;
  completionsThisWeek: number;
  completionsLastWeek: number;
  streak: number;
  totalPointsAllTime: number;
}

interface TaskStats {
  taskId: Uuid;
  taskName: string;
  points: number;
  completionsThisWeek: number;
}
```

## New Service Functions

Add to `apps/web/src/lib/progressService.ts` (new file — taskService.ts is already 291 lines):

### `getPersonalStats(profileId, householdId)`
Returns `PersonalStats`. Fetches:
- Points + completions this week and last week from `task_completions`
- Streak (reuse `getStreak` logic or call it)
- All-time total points

### `getWeeklyPointsTrend(householdId, weeks = 2)`
Returns `DailyPoints[]` for the last N weeks. Query:
```sql
SELECT DATE(completed_at) as date, SUM(points_earned) as points, COUNT(*) as completions
FROM task_completions
WHERE household_id = $1 AND completed_at >= $startDate
GROUP BY DATE(completed_at)
ORDER BY date
```
Client groups by date, fills in zero-point days.

### `getTaskStats(householdId)`
Returns `TaskStats[]` — each active task with its completion count this week. Query:
- Fetch all active `recurring_tasks` for household
- Fetch `task_completions` for this week grouped by `task_id`
- Join client-side

### `getLeaderboard(householdId)`
Already exists as `getWeeklyLeaderboard` in taskService — reuse directly.

## UI Structure

### Progress Page

```
┌─────────────────────────────────┐
│ Your Stats                      │  ← section title
│ ┌──────────┐ ┌──────────┐      │
│ │ 45 pts   │ │ 🔥 7     │      │  ← KPI tiles (2x2 grid)
│ │ +12% ↑   │ │ streak   │      │
│ ├──────────┤ ├──────────┤      │
│ │ 12 done  │ │ 180 pts  │      │
│ │ +3 ↑     │ │ all time │      │
│ └──────────┘ └──────────┘      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ This Week          140 pts  │ │  ← points bar chart
│ │ ▁▃▅▇▅▃▁                    │ │     (7 days, Mon-Sun)
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Household Rankings          │ │  ← reuse HomeLeaderboard
│ │ 1. You         45 pts      │ │
│ │ 2. Partner     38 pts      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Task Breakdown              │ │  ← horizontal bars per task
│ │ Vacuum       ████░░  4/7   │ │
│ │ Cook dinner  ██████  6/7   │ │
│ │ Trash        ███████ 7/7   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Component Architecture

1. **`apps/web/src/app/(tabs)/progress/page.tsx`** — Server component (auth check, pass householdId + profileId)
2. **`apps/web/src/app/(tabs)/progress/ProgressDashboard.tsx`** — Client component, main orchestrator
3. **`apps/web/src/app/(tabs)/progress/StatsGrid.tsx`** — 2x2 KPI tile grid using `WebKpiTile`
4. **`apps/web/src/app/(tabs)/progress/WeeklyChart.tsx`** — CSS bar chart for daily points, 7 columns
5. **`apps/web/src/app/(tabs)/progress/TaskBreakdown.tsx`** — Horizontal bar chart showing completion rates per task
6. **`apps/web/src/app/(tabs)/progress/progress.module.css`** — CSS module

### KPI Tiles (StatsGrid)

| Tile | Value | Delta | Bars |
|------|-------|-------|------|
| Points This Week | `"45"` | `"+12%"` success or `"-8%"` error | Last 5 weeks normalized |
| Streak | `"🔥 7"` | — | — |
| Tasks Done | `"12"` | `"+3 vs last week"` | Last 5 weeks normalized |
| All-Time Points | `"180"` | — | — |

### Weekly Chart (WeeklyChart)

Pure CSS bar chart — 7 columns (Mon-Sun), accent colored, height proportional to max day. Show day label below each bar, points value above. Current day highlighted. No charting library.

### Task Breakdown (TaskBreakdown)

Horizontal progress bars per task. Width = `completionsThisWeek / 7 * 100%`. Show task name, bar, and "N/7" label. Sorted by completion rate descending.

### Reuse

- `HomeLeaderboard` component — import directly from `../home/HomeLeaderboard`
- `getWeeklyLeaderboard` — call from existing taskService
- `getStreak` — call from existing taskService
- `WebKpiTile`, `WebChartContainer` — from `@hiro/ui-primitives/web`

## Data Flow

- All fetching in `ProgressDashboard` via `useEffect` + parallel `Promise.all`
- Loading state: "Loading your progress..."
- Empty state (no completions at all): friendly message encouraging first task completion
- No mutations on this page — read-only

## No Migration Needed

All queries work against existing `task_completions` and `recurring_tasks` tables with existing indexes. Pure client-side aggregation.

## New Dependency

None — CSS bar charts only.

## Verification

1. `npm run check` passes
2. Progress tab shows KPI tiles with correct this-week vs last-week deltas
3. Weekly chart shows 7 bars for Mon-Sun with correct points
4. Leaderboard matches Home tab's leaderboard
5. Task breakdown shows completion rates per task
6. Empty state shows when no completions exist
7. Loading state shows while fetching
