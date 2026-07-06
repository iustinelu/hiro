import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "./__tests__/supabaseMock";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("./supabase", () => ({ supabase: supabaseMock }));

import { getCurrentProfileId, getSessionContext, isFullyOnboarded } from "./sessionService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentProfileId", () => {
  it("returns the profile id from the RPC", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    expect(await getCurrentProfileId()).toBe("p1");
  });

  it("returns null when signed out", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: null });
    expect(await getCurrentProfileId()).toBeNull();
  });
});

describe("getSessionContext", () => {
  it("returns nulls when there is no profile (no household lookup)", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: null });
    expect(await getSessionContext()).toEqual({ profileId: null, householdId: null });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("returns profile + household when the user is a member", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    supabaseMock.from.mockReturnValue(queryResult({ data: { household_id: "h1" } }));
    expect(await getSessionContext()).toEqual({ profileId: "p1", householdId: "h1" });
  });

  it("returns a null household when the profile has joined none", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    supabaseMock.from.mockReturnValue(queryResult({ data: null }));
    expect(await getSessionContext()).toEqual({ profileId: "p1", householdId: null });
  });
});

describe("isFullyOnboarded", () => {
  const withTables = (membership: unknown, displayName: string | null) => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "household_members"
        ? queryResult({ data: membership })
        : queryResult({ data: displayName === undefined ? null : { display_name: displayName } })
    );
  };

  it("is false with no profile", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: null });
    expect(await isFullyOnboarded()).toBe(false);
  });

  it("is true only with BOTH a household and a non-blank name", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    withTables({ household_id: "h1" }, "Alex");
    expect(await isFullyOnboarded()).toBe(true);
  });

  it("is false with a household but a blank name", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    withTables({ household_id: "h1" }, "   ");
    expect(await isFullyOnboarded()).toBe(false);
  });

  it("is false with a name but no household", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "p1", error: null });
    withTables(null, "Alex");
    expect(await isFullyOnboarded()).toBe(false);
  });
});
