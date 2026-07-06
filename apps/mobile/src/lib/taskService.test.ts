import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { RecurringTask, CadenceMeta } from "@hiro/domain";
import { queryResult } from "./__tests__/supabaseMock";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("./supabase", () => ({ supabase: supabaseMock }));

import { completeTask, uncompleteTask, isDueToday, cadenceLabel } from "./taskService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("completeTask error mapping", () => {
  const cases: Array<[string, string]> = [
    ["TASK_NOT_FOUND", "Task not found."],
    ["TASK_ARCHIVED", "Task is archived."],
    ["NOT_HOUSEHOLD_MEMBER", "You are not a member of this household."],
  ];

  for (const [code, message] of cases) {
    it(`maps ${code}`, async () => {
      supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: `raised: ${code}` } });
      const res = await completeTask("t1");
      expect(res).toEqual({ pointsEarned: 0, taskName: "", error: message });
    });
  }

  it("returns points + name on success", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: { points_earned: 15, task_name: "Dishes" },
      error: null,
    });
    expect(await completeTask("t1")).toEqual({ pointsEarned: 15, taskName: "Dishes", error: null });
  });
});

describe("uncompleteTask undo window", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("refuses when there is no completion to undo", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ data: null }));
    expect(await uncompleteTask("t1", "p1")).toEqual({ error: "No completion found to undo." });
  });

  it("refuses a completion older than the undo window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    // Completed 30 minutes ago — outside the 5-minute RLS delete window.
    supabaseMock.from.mockReturnValue(
      queryResult({ data: { id: "c1", completed_at: "2026-07-06T11:30:00Z" } })
    );
    expect(await uncompleteTask("t1", "p1")).toEqual({ error: "This task can no longer be undone." });
    // The delete is never attempted (only the lookup query ran).
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });

  it("deletes a recent completion within the window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    supabaseMock.from
      .mockReturnValueOnce(queryResult({ data: { id: "c1", completed_at: "2026-07-06T11:59:00Z" } }))
      .mockReturnValueOnce(queryResult({ error: null }));
    expect(await uncompleteTask("t1", "p1")).toEqual({ error: null });
    expect(supabaseMock.from).toHaveBeenCalledTimes(2);
  });
});

// ── Pure cadence helpers ─────────────────────────────────────────────────────

const makeTask = (cadence: RecurringTask["cadence"], cadenceMeta: CadenceMeta): RecurringTask => ({
  id: "t1",
  householdId: "h1",
  name: "Chore",
  description: null,
  points: 5,
  cadence,
  cadenceMeta,
  createdByProfileId: "p1",
  isArchived: false,
  createdAt: "t",
  updatedAt: "t",
});

describe("cadenceLabel", () => {
  it("labels a daily cadence", () => {
    expect(cadenceLabel("daily", {})).toBe("Every day");
  });
  it("capitalizes the weekly day", () => {
    expect(cadenceLabel("weekly", { day: "monday" })).toBe("Every Monday");
  });
  it("joins capitalized custom days", () => {
    expect(cadenceLabel("custom", { days: ["mon", "wed", "fri"] })).toBe("Mon, Wed, Fri");
  });
});

describe("isDueToday", () => {
  const SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const LONG_BY_SHORT: Record<string, string> = {
    sun: "sunday",
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it("a daily task is always due", () => {
    expect(isDueToday(makeTask("daily", {}))).toBe(true);
  });

  it("a weekly task is due only on its configured day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    const todayShort = SHORT[new Date().getDay()];
    const otherShort = SHORT[(new Date().getDay() + 1) % 7];
    expect(isDueToday(makeTask("weekly", { day: LONG_BY_SHORT[todayShort] }))).toBe(true);
    expect(isDueToday(makeTask("weekly", { day: LONG_BY_SHORT[otherShort] }))).toBe(false);
  });

  it("a custom task is due when today is in its day list", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T12:00:00Z"));
    const todayShort = SHORT[new Date().getDay()];
    expect(isDueToday(makeTask("custom", { days: [todayShort] }))).toBe(true);
    expect(isDueToday(makeTask("custom", { days: [] }))).toBe(false);
  });
});
