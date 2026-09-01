import { describe, expect, it } from "vitest";
import type { RecurringTask } from "./index";
import { cadenceLabel, isDueToday } from "./cadence";

function task(overrides: Partial<RecurringTask>): RecurringTask {
  return {
    id: "t1",
    householdId: "h1",
    name: "Task",
    description: null,
    points: 5,
    cadence: "daily",
    cadenceMeta: {},
    createdByProfileId: "p1",
    isArchived: false,
    createdAt: "2026-07-06T00:00:00Z",
    updatedAt: "2026-07-06T00:00:00Z",
    ...overrides,
  };
}

// A Wednesday, so weekday-bound cases are deterministic.
const WEDNESDAY = new Date(2026, 6, 8);

describe("isDueToday", () => {
  it("daily is always due", () => {
    expect(isDueToday(task({ cadence: "daily" }), WEDNESDAY)).toBe(true);
  });

  it("weekly is due only on its configured day", () => {
    expect(isDueToday(task({ cadence: "weekly", cadenceMeta: { day: "wednesday" } }), WEDNESDAY)).toBe(true);
    expect(isDueToday(task({ cadence: "weekly", cadenceMeta: { day: "monday" } }), WEDNESDAY)).toBe(false);
  });

  it("custom is due on any listed weekday", () => {
    expect(isDueToday(task({ cadence: "custom", cadenceMeta: { days: ["wed", "fri"] } }), WEDNESDAY)).toBe(true);
    expect(isDueToday(task({ cadence: "custom", cadenceMeta: { days: ["mon"] } }), WEDNESDAY)).toBe(false);
  });

  it("anytime is never due (repeatable pool)", () => {
    // Assert across every weekday so it can never surface in a Today list.
    for (let d = 0; d < 7; d++) {
      const day = new Date(2026, 6, 5 + d);
      expect(isDueToday(task({ cadence: "anytime", cadenceMeta: {} }), day)).toBe(false);
    }
  });

  it("is safe as a filter callback (index passed as second arg is ignored)", () => {
    const tasks = [
      task({ id: "a", cadence: "daily" }),
      task({ id: "b", cadence: "anytime" }),
      task({ id: "c", cadence: "daily" }),
    ];
    // Array.prototype.filter passes (element, index, array); the numeric index
    // must not be treated as the `today` date.
    const due = tasks.filter(isDueToday);
    expect(due.map((t) => t.id)).toEqual(["a", "c"]);
  });
});

describe("cadenceLabel", () => {
  it("labels each cadence", () => {
    expect(cadenceLabel("daily", {})).toBe("Every day");
    expect(cadenceLabel("weekly", { day: "monday" })).toBe("Every Monday");
    expect(cadenceLabel("custom", { days: ["mon", "wed"] })).toBe("Mon, Wed");
    expect(cadenceLabel("anytime", {})).toBe("Anytime");
  });
});
