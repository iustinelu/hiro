import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "./__tests__/supabaseMock";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock("./supabase", () => ({ supabase: supabaseMock }));

import {
  redeemReward,
  getHouseholdRewards,
  getPointBalance,
  createReward,
} from "./rewardService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("redeemReward error mapping", () => {
  it("surfaces INSUFFICIENT_POINTS as the raw code (UI renders dynamic copy)", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: null,
      error: { message: 'new row violates ... "INSUFFICIENT_POINTS"' },
    });
    const res = await redeemReward("r1");
    expect(res.error).toBe("INSUFFICIENT_POINTS");
    expect(res.pointsSpent).toBe(0);
    expect(res.remainingBalance).toBe(0);
  });

  it("maps REWARD_NOT_FOUND / REWARD_ARCHIVED / NOT_HOUSEHOLD_MEMBER to sentences", async () => {
    const cases: Array<[string, string]> = [
      ["REWARD_NOT_FOUND", "Reward not found."],
      ["REWARD_ARCHIVED", "Reward is no longer available."],
      ["NOT_HOUSEHOLD_MEMBER", "You are not a member of this household."],
    ];
    for (const [code, message] of cases) {
      supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: `err ${code} err` } });
      expect((await redeemReward("r1")).error).toBe(message);
    }
  });

  it("passes an unknown error message straight through", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: "connection reset" } });
    expect((await redeemReward("r1")).error).toBe("connection reset");
  });

  it("maps a successful redemption from snake_case to camelCase", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: { points_spent: 30, reward_title: "Movie night", remaining_balance: 70 },
      error: null,
    });
    expect(await redeemReward("r1")).toEqual({
      pointsSpent: 30,
      rewardTitle: "Movie night",
      remainingBalance: 70,
      error: null,
    });
  });
});

describe("getPointBalance", () => {
  it("computes balance as earned minus spent", async () => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "task_completions"
        ? queryResult({ data: [{ points_earned: 10 }, { points_earned: 5 }] })
        : queryResult({ data: [{ points_spent: 4 }] })
    );
    expect(await getPointBalance("p1", "h1")).toEqual({ balance: 11, error: null });
  });

  it("returns 0 balance and propagates an error from the earned query", async () => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "task_completions"
        ? queryResult({ error: { message: "db down" } })
        : queryResult({ data: [] })
    );
    expect(await getPointBalance("p1", "h1")).toEqual({ balance: 0, error: "db down" });
  });

  it("treats empty ledgers as a zero balance", async () => {
    supabaseMock.from.mockImplementation(() => queryResult({ data: [] }));
    expect(await getPointBalance("p1", "h1")).toEqual({ balance: 0, error: null });
  });
});

describe("getHouseholdRewards", () => {
  it("returns an empty list (not an error) when there are no rewards", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ data: [] }));
    expect(await getHouseholdRewards("h1")).toEqual({ rewards: [], error: null });
  });

  it("maps reward rows from snake_case", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult({
        data: [
          {
            id: "r1",
            household_id: "h1",
            title: "Ice cream",
            point_cost: 5,
            is_archived: false,
            created_by_profile_id: "p1",
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
          },
        ],
      })
    );
    const { rewards } = await getHouseholdRewards("h1");
    expect(rewards[0]).toEqual({
      id: "r1",
      householdId: "h1",
      title: "Ice cream",
      pointCost: 5,
      isArchived: false,
      createdByProfileId: "p1",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
  });
});

describe("createReward", () => {
  it("short-circuits with 'Not authenticated' when there is no profile", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: null });
    const res = await createReward("h1", "Prize", 10);
    expect(res).toEqual({ reward: null, error: "Not authenticated" });
    // Never reaches the insert.
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("inserts and maps the created reward when authenticated", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    supabaseMock.from.mockReturnValue(
      queryResult({
        data: {
          id: "r9",
          household_id: "h1",
          title: "Prize",
          point_cost: 10,
          is_archived: false,
          created_by_profile_id: "p1",
          created_at: "t",
          updated_at: "t",
        },
      })
    );
    const res = await createReward("h1", "Prize", 10);
    expect(res.error).toBeNull();
    expect(res.reward).toMatchObject({ id: "r9", pointCost: 10, createdByProfileId: "p1" });
  });
});
