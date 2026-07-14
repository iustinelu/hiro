import { describe, it, expect } from "vitest";
import {
  splitEvenly,
  computeStreak,
  pointsShortfall,
  canAfford,
  isWithinUndoWindow,
  isDueOnDate,
  computeMissedDueDates,
  type MissedTaskInput,
} from "./calc";

// Compare in integer cents so float artefacts can't mask a real rounding bug.
const cents = (n: number) => Math.round(n * 100);
const sumCents = (xs: number[]) => xs.reduce((a, b) => a + cents(b), 0);

describe("splitEvenly", () => {
  it("splits evenly when it divides cleanly (2/4-way)", () => {
    expect(splitEvenly(10, 2)).toEqual([5, 5]);
    expect(splitEvenly(10, 4)).toEqual([2.5, 2.5, 2.5, 2.5]);
  });

  it("puts the rounding remainder on the first share (3-way)", () => {
    // 100 / 3 = 33.33 each, 0.01 left over goes to the first participant.
    expect(splitEvenly(100, 3)).toEqual([33.34, 33.33, 33.33]);
  });

  it("always sums back to exactly the original amount", () => {
    const cases: Array<[number, number]> = [
      [100, 3],
      [10, 3],
      [0.01, 2],
      [99.99, 4],
      [20, 7],
      [1, 6],
      [1234.56, 5],
    ];
    for (const [amount, n] of cases) {
      const shares = splitEvenly(amount, n);
      expect(shares).toHaveLength(n);
      expect(sumCents(shares)).toBe(cents(amount));
    }
  });

  it("rejects a non-positive or non-integer participant count", () => {
    expect(() => splitEvenly(10, 0)).toThrow();
    expect(() => splitEvenly(10, -1)).toThrow();
    expect(() => splitEvenly(10, 2.5)).toThrow();
  });
});

describe("computeStreak", () => {
  const today = new Date(2026, 5, 27, 12, 0, 0); // Sat 27 Jun 2026, noon
  const daysAgo = (n: number, hour = 9) =>
    new Date(2026, 5, 27 - n, hour, 0, 0);

  it("is 0 with no completions", () => {
    expect(computeStreak([], today)).toBe(0);
  });

  it("counts a single completion today as 1", () => {
    expect(computeStreak([daysAgo(0)], today)).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)], today)).toBe(3);
  });

  it("collapses multiple completions on the same day", () => {
    expect(computeStreak([daysAgo(0, 8), daysAgo(0, 20), daysAgo(1)], today)).toBe(2);
  });

  it("breaks the streak on a missing day", () => {
    // today + 2-days-ago, but yesterday missing → only today counts.
    expect(computeStreak([daysAgo(0), daysAgo(2), daysAgo(3)], today)).toBe(1);
  });

  it("applies the one-day grace period (nothing today, but yesterday)", () => {
    expect(computeStreak([daysAgo(1), daysAgo(2)], today)).toBe(2);
  });

  it("is 0 once the grace period has lapsed (most recent is 2+ days ago)", () => {
    expect(computeStreak([daysAgo(2), daysAgo(3)], today)).toBe(0);
  });
});

describe("redemption guard", () => {
  it("reports the shortfall and affordability", () => {
    expect(pointsShortfall(100, 50)).toBe(0);
    expect(canAfford(100, 50)).toBe(true);
  });

  it("treats an exact balance as affordable (matches SQL `<` guard)", () => {
    expect(pointsShortfall(50, 50)).toBe(0);
    expect(canAfford(50, 50)).toBe(true);
  });

  it("reports how many points short an insufficient balance is", () => {
    expect(pointsShortfall(30, 50)).toBe(20);
    expect(canAfford(30, 50)).toBe(false);
  });
});

describe("isWithinUndoWindow", () => {
  const now = new Date(2026, 5, 27, 12, 0, 0);
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

  it("is true just inside the 5-minute window", () => {
    expect(isWithinUndoWindow(minutesAgo(4) /* 4:00 */, now)).toBe(true);
    expect(isWithinUndoWindow(new Date(now.getTime() - (5 * 60_000 - 1000)), now)).toBe(true); // 4:59
  });

  it("is false at and past the boundary (RLS uses strict >)", () => {
    expect(isWithinUndoWindow(minutesAgo(5), now)).toBe(false); // exactly 5:00
    expect(isWithinUndoWindow(new Date(now.getTime() - (5 * 60_000 + 1000)), now)).toBe(false); // 5:01
  });

  it("respects a custom window", () => {
    expect(isWithinUndoWindow(minutesAgo(9), now, 10 * 60_000)).toBe(true);
    expect(isWithinUndoWindow(minutesAgo(11), now, 10 * 60_000)).toBe(false);
  });
});

describe("isDueOnDate", () => {
  const daily: MissedTaskInput = { cadence: "daily", cadenceMeta: {} };
  const weeklySun: MissedTaskInput = { cadence: "weekly", cadenceMeta: { day: "sunday" } };
  const customMonWed: MissedTaskInput = { cadence: "custom", cadenceMeta: { days: ["mon", "wed"] } };

  const sun = new Date(2026, 6, 5); // Sun 5 Jul 2026
  const mon = new Date(2026, 6, 6); // Mon 6 Jul 2026
  const wed = new Date(2026, 6, 1); // Wed 1 Jul 2026

  it("daily is due every day", () => {
    expect(isDueOnDate(daily, sun)).toBe(true);
    expect(isDueOnDate(daily, mon)).toBe(true);
    expect(isDueOnDate(daily, wed)).toBe(true);
  });

  it("weekly matches the full-name day only", () => {
    expect(isDueOnDate(weeklySun, sun)).toBe(true);
    expect(isDueOnDate(weeklySun, mon)).toBe(false);
  });

  it("custom matches any of the 3-letter abbreviations", () => {
    expect(isDueOnDate(customMonWed, mon)).toBe(true);
    expect(isDueOnDate(customMonWed, wed)).toBe(true);
    expect(isDueOnDate(customMonWed, sun)).toBe(false);
  });

  it("treats an unknown cadence (e.g. 'anytime') as never due", () => {
    const anytime: MissedTaskInput = { cadence: "anytime", cadenceMeta: {} };
    expect(isDueOnDate(anytime, sun)).toBe(false);
    expect(isDueOnDate(anytime, mon)).toBe(false);
  });

  it("is safe when meta is missing/empty", () => {
    expect(isDueOnDate({ cadence: "weekly", cadenceMeta: {} }, sun)).toBe(false);
    expect(isDueOnDate({ cadence: "custom", cadenceMeta: {} }, mon)).toBe(false);
  });
});

describe("computeMissedDueDates", () => {
  // Anchor: Mon 6 Jul 2026, noon. Prior 7 days:
  //   -1 Sun 5 Jul, -2 Sat 4, -3 Fri 3, -4 Thu 2, -5 Wed 1 Jul,
  //   -6 Tue 30 Jun, -7 Mon 29 Jun.
  const today = new Date(2026, 6, 6, 12, 0, 0);
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const keys = (ds: Date[]) => ds.map(key);
  const day = (y: number, m: number, d: number, hour = 9) => new Date(y, m - 1, d, hour, 0, 0);

  const daily: MissedTaskInput = { cadence: "daily", cadenceMeta: {} };
  const weeklySun: MissedTaskInput = { cadence: "weekly", cadenceMeta: { day: "sunday" } };
  const customMonWed: MissedTaskInput = { cadence: "custom", cadenceMeta: { days: ["mon", "wed"] } };

  it("lists every past due date, most recent first, and excludes today", () => {
    const missed = computeMissedDueDates(daily, [], today, 7);
    expect(keys(missed)).toEqual([
      "2026-7-5", "2026-7-4", "2026-7-3", "2026-7-2", "2026-7-1", "2026-6-30", "2026-6-29",
    ]);
    // today (Mon 6 Jul), though due for a daily task, is never in the list.
    expect(keys(missed)).not.toContain("2026-7-6");
  });

  it("clears a due date that has a completion that day (any time)", () => {
    const missed = computeMissedDueDates(daily, [day(2026, 7, 5, 23)], today, 7);
    expect(keys(missed)).not.toContain("2026-7-5");
    expect(missed).toHaveLength(6);
  });

  it("collapses multiple completions on the same day", () => {
    const missed = computeMissedDueDates(
      daily,
      [day(2026, 7, 4, 8), day(2026, 7, 4, 20)],
      today,
      7
    );
    expect(keys(missed)).not.toContain("2026-7-4");
    expect(missed).toHaveLength(6);
  });

  it("weekly returns only the matching weekday in the window", () => {
    const missed = computeMissedDueDates(weeklySun, [], today, 7);
    expect(keys(missed)).toEqual(["2026-7-5"]);
  });

  it("weekly is empty once that day is completed", () => {
    const missed = computeMissedDueDates(weeklySun, [day(2026, 7, 5)], today, 7);
    expect(missed).toHaveLength(0);
  });

  it("custom returns each matching weekday, most recent first", () => {
    const missed = computeMissedDueDates(customMonWed, [], today, 7);
    // Wed 1 Jul then Mon 29 Jun within the 7-day window.
    expect(keys(missed)).toEqual(["2026-7-1", "2026-6-29"]);
  });

  it("honours a shorter lookback window (week boundary)", () => {
    // 3-day lookback ends at Fri 3 Jul; the only Sunday (5 Jul) is inside it.
    expect(keys(computeMissedDueDates(weeklySun, [], today, 3))).toEqual(["2026-7-5"]);
    // 2-day lookback (Sun 5, Sat 4) still includes the Sunday.
    expect(keys(computeMissedDueDates(weeklySun, [], today, 2))).toEqual(["2026-7-5"]);
    // A weekly-Monday task: the only past Monday (29 Jun) is outside a 6-day window.
    const weeklyMon: MissedTaskInput = { cadence: "weekly", cadenceMeta: { day: "monday" } };
    expect(computeMissedDueDates(weeklyMon, [], today, 6)).toHaveLength(0);
    expect(keys(computeMissedDueDates(weeklyMon, [], today, 7))).toEqual(["2026-6-29"]);
  });

  it("returns empty for an 'anytime' / unknown cadence", () => {
    const anytime: MissedTaskInput = { cadence: "anytime", cadenceMeta: {} };
    expect(computeMissedDueDates(anytime, [], today, 7)).toHaveLength(0);
  });

  it("returns empty for a non-positive lookback", () => {
    expect(computeMissedDueDates(daily, [], today, 0)).toHaveLength(0);
    expect(computeMissedDueDates(daily, [], today, -3)).toHaveLength(0);
  });
});
