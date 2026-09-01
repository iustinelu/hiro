// Pure cadence helpers shared by the Home + Tasks screens (mobile) and mirrored
// on web. Kept in the domain layer so they are unit-testable and single-sourced.
//
// `isDueToday` mirrors the "what is due" logic the UI runs to build the Today
// list. It is intentionally day-bound only: 'anytime' pool chores (HIR-84) are
// never due and never overdue, so they fall through to `false`.

import type { RecurringTask, TaskCadence, CadenceMeta } from "./index";

const DAY_MAP: Record<string, string> = {
  sunday: "sun", monday: "mon", tuesday: "tue", wednesday: "wed",
  thursday: "thu", friday: "fri", saturday: "sat",
};

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/**
 * Whether a recurring task is due on `today`.
 *
 * - daily: always due
 * - weekly: due on its single configured weekday
 * - custom: due on any of its configured weekdays
 * - anytime: never due (repeatable pool, HIR-84)
 *
 * `today` is injected for testability and defaults to now. It is guarded with an
 * `instanceof Date` check so the function is safe to pass directly to
 * `Array.prototype.filter`, which would otherwise supply the element index as
 * the second argument.
 */
export function isDueToday(task: RecurringTask, today: Date = new Date()): boolean {
  const ref = today instanceof Date ? today : new Date();
  const dayShort = WEEKDAYS[ref.getDay()];
  if (task.cadence === "daily") return true;
  if (task.cadence === "weekly") return DAY_MAP[task.cadenceMeta.day ?? ""] === dayShort;
  if (task.cadence === "custom") return (task.cadenceMeta.days ?? []).includes(dayShort);
  return false;
}

/** Human-readable cadence label for task rows and cadence chips. */
export function cadenceLabel(cadence: TaskCadence, meta: CadenceMeta): string {
  if (cadence === "daily") return "Every day";
  if (cadence === "weekly") {
    const d = meta.day ?? "";
    return `Every ${d.charAt(0).toUpperCase()}${d.slice(1)}`;
  }
  if (cadence === "custom") {
    return (meta.days ?? []).map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");
  }
  if (cadence === "anytime") return "Anytime";
  return "";
}
