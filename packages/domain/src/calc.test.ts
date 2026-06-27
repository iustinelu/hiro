import { describe, it, expect } from "vitest";
import {
  splitEvenly,
  computeStreak,
  pointsShortfall,
  canAfford,
  isWithinUndoWindow,
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
