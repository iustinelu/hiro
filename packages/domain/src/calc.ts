// Pure, deterministic helpers for the critical money/points/streak paths.
//
// Several of these mirror logic that runs server-side in SQL (the source of truth at runtime). Keeping
// a tested TS twin both documents the intended algorithm and lets the client reuse it (streak, undo
// gating, affordability). Where a helper mirrors SQL, the SQL location is noted so the two stay in sync.

const MS_PER_DAY = 86_400_000;

/**
 * Split `amount` into `n` equal shares, two-decimal rounded, with any rounding remainder added to the
 * first share so the parts always sum back to exactly `amount`.
 *
 * Mirrors `public.create_expense` in
 * `supabase/migrations/20260407000000_expenses_and_participants.sql` (the `round(amount/n, 2)` +
 * first-participant-absorbs-remainder logic). If you change one, change both.
 */
export function splitEvenly(amount: number, n: number): number[] {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("splitEvenly: participant count must be a positive integer");
  }
  const base = round2(amount / n);
  const remainder = round2(amount - base * n);
  const shares = new Array<number>(n).fill(base);
  shares[0] = round2(base + remainder);
  return shares;
}

// Round to 2 decimals the way Postgres `numeric(10,2)` does (half-away-from-zero), avoiding the
// float artefacts of a naive `Math.round(x * 100) / 100`.
function round2(value: number): number {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100;
}

/**
 * Count the current daily-completion streak ending today.
 *
 * Pure core extracted from `getStreak` in the task services. Days are compared at local-midnight
 * granularity; multiple completions on the same day count once. A one-day grace period applies: if
 * there is nothing today but there was yesterday, the streak is still considered alive and counts
 * back from yesterday.
 *
 * @param completionDates completion timestamps (any order, duplicates fine)
 * @param today reference "now" (injected so the function stays pure/testable)
 */
export function computeStreak(completionDates: Date[], today: Date): number {
  if (completionDates.length === 0) return 0;

  // Collapse to the set of distinct local days that have at least one completion.
  const dayKeys = new Set<number>();
  for (const d of completionDates) {
    dayKeys.add(atMidnight(d).getTime());
  }

  const sortedDays = [...dayKeys].sort((a, b) => b - a);

  const todayMs = atMidnight(today).getTime();
  const yesterdayMs = todayMs - MS_PER_DAY;

  // Grace period: if the most recent completion day is before today, start counting from yesterday.
  let expected = sortedDays[0] < todayMs ? yesterdayMs : todayMs;

  let streak = 0;
  for (const day of sortedDays) {
    if (day === expected) {
      streak++;
      expected -= MS_PER_DAY;
    } else if (day < expected) {
      break;
    }
    // day > expected (e.g. a future-dated completion before the grace anchor) is skipped.
  }
  return streak;
}

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * How many points short a balance is of a cost. `0` when the balance can afford it.
 *
 * Mirrors the guard in `public.redeem_reward`
 * (`supabase/migrations/20260411100000_rewards.sql`): `v_balance < v_reward.point_cost`.
 */
export function pointsShortfall(balance: number, cost: number): number {
  return Math.max(0, cost - balance);
}

/** Whether `balance` covers `cost`. Exact balance is sufficient (matches the SQL `<` guard). */
export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost;
}

/**
 * Whether a completion is still inside the undo window relative to `now`.
 *
 * Mirrors the RLS policy `task_completions_delete_own_recent` in
 * `supabase/migrations/20260406000000_allow_undo_completion.sql`
 * (`completed_at > now() - interval '5 minutes'`): strictly greater-than, so the exact boundary is
 * already expired.
 */
export function isWithinUndoWindow(
  completedAt: Date,
  now: Date,
  windowMs: number = 5 * 60 * 1000
): boolean {
  return now.getTime() - completedAt.getTime() < windowMs;
}

// ─── Missed recurring tasks ──────────────────────────────────────────────────
//
// Client twin of the overdue sweep `detect_overdue_recurring_tasks()` in
// `supabase/migrations/20260706100000_overdue_reminders.sql` (HIR-86). The sweep
// only ever looks one day back (yesterday); this helper generalises the same
// due-date rule to a lookback window so the Missed section on the Tasks board
// can list every uncompleted past due date, not just yesterday.
//
// Cadence semantics MUST match the sweep and the mobile `isDueToday`
// (apps/mobile/src/lib/taskService.ts), INCLUDING their full-name-vs-abbreviation
// inconsistency:
//   daily  -> due every day
//   weekly -> cadenceMeta.day is a FULL lowercase day name ('monday')
//   custom -> cadenceMeta.days is 3-letter lowercase abbreviations ('mon')
//   anything else (e.g. the 'anytime' cadence from HIR-84) -> never due.

const DAY_ABBREVS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const FULL_DAY_TO_ABBR: Record<string, string> = {
  sunday: "sun",
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
};

/** Minimal task shape the missed-derivation needs; platform-agnostic on purpose. */
export interface MissedTaskInput {
  cadence: string;
  cadenceMeta: { day?: string; days?: string[] };
}

/**
 * Whether `task` is due on the local calendar day of `date`, per its cadence.
 * Days are read from `date` in local time (matching the client convention in
 * `isDueToday`). Any cadence other than daily/weekly/custom is never due.
 */
export function isDueOnDate(task: MissedTaskInput, date: Date): boolean {
  const abbr = DAY_ABBREVS[date.getDay()];
  if (task.cadence === "daily") return true;
  if (task.cadence === "weekly") {
    return FULL_DAY_TO_ABBR[task.cadenceMeta.day ?? ""] === abbr;
  }
  if (task.cadence === "custom") {
    return (task.cadenceMeta.days ?? []).includes(abbr);
  }
  return false;
}

/**
 * The past due dates (most recent first) on which `task` was due but has no
 * completion, within a `lookbackDays`-day window ending yesterday. `today` is
 * excluded: an uncompleted task due today is still open (nudge territory), not
 * missed. Days are compared at local-midnight granularity, so multiple
 * completions on the same day count once and a completion anywhere in the day
 * clears that date.
 *
 * @param task cadence + meta (see MissedTaskInput)
 * @param completionDates completion timestamps for this task (any order, dupes fine)
 * @param today reference "now" (injected so the function stays pure/testable)
 * @param lookbackDays how many days before today to scan (default 7)
 */
export function computeMissedDueDates(
  task: MissedTaskInput,
  completionDates: Date[],
  today: Date,
  lookbackDays: number = 7
): Date[] {
  if (lookbackDays <= 0) return [];

  const completedDayMs = new Set<number>();
  for (const d of completionDates) {
    completedDayMs.add(atMidnight(d).getTime());
  }

  const anchor = atMidnight(today);
  const missed: Date[] = [];

  // i = 1 is yesterday, growing back to lookbackDays ago — so the result is
  // ordered most-recent-first.
  for (let i = 1; i <= lookbackDays; i++) {
    const day = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - i);
    if (!isDueOnDate(task, day)) continue;
    if (completedDayMs.has(day.getTime())) continue;
    missed.push(day);
  }

  return missed;
}
