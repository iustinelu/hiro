import { describe, it, expect, vi, beforeEach } from "vitest";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("./supabase", () => ({ supabase: supabaseMock }));

import {
  joinByCode,
  joinByCodeAndLeave,
  getHouseholdByCode,
  getOrCreateJoinLink,
} from "./joinLinkService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("joinByCode error mapping", () => {
  const cases: Array<[string, string]> = [
    ["JOIN_LINK_DISABLED", "This invite link has been turned off by the household owner."],
    ["JOIN_LINK_EXPIRED", "This invite link has expired."],
    ["ALREADY_A_MEMBER", "You're already a member of this household."],
    [
      "ALREADY_IN_HOUSEHOLD",
      "You're already in another household. You need to leave it before joining a new one.",
    ],
    ["INVITE_NOT_FOUND", "Invite not found."],
    ["INVITE_ALREADY_ACCEPTED", "This invite has already been used."],
    ["INVITE_EXPIRED", "This invite has expired. Ask the household owner to send a new one."],
  ];

  for (const [code, message] of cases) {
    it(`maps ${code}`, async () => {
      supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: `PG: ${code} raised` } });
      expect(await joinByCode("CODE")).toEqual({ householdId: null, error: message });
    });
  }

  it("passes an unknown error straight through", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: "network glitch" } });
    expect((await joinByCode("CODE")).error).toBe("network glitch");
  });

  it("returns the household id on success", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "h1", error: null });
    expect(await joinByCode("CODE")).toEqual({ householdId: "h1", error: null });
  });
});

describe("joinByCodeAndLeave", () => {
  it("reports when the old household was dissolved by the switch", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: { household_id: "h2", old_household_deleted: true, old_household_name: "Old House" },
      error: null,
    });
    expect(await joinByCodeAndLeave("CODE")).toEqual({
      householdId: "h2",
      oldHouseholdDeleted: true,
      oldHouseholdName: "Old House",
      error: null,
    });
  });

  it("maps a link error and reports no destruction", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: "JOIN_LINK_EXPIRED" } });
    expect(await joinByCodeAndLeave("CODE")).toEqual({
      householdId: null,
      oldHouseholdDeleted: false,
      oldHouseholdName: null,
      error: "This invite link has expired.",
    });
  });
});

describe("getHouseholdByCode", () => {
  it("returns a null household (not an error) when the code is unknown", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: [], error: null });
    expect(await getHouseholdByCode("BAD")).toEqual({ household: null, error: null });
  });

  it("normalizes an array response to its first row", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: [{ household_name: "Casa", member_count: 3, is_valid: true }],
      error: null,
    });
    expect((await getHouseholdByCode("CODE")).household).toEqual({
      householdName: "Casa",
      memberCount: 3,
      isValid: true,
    });
  });

  it("accepts a bare object response too", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: { household_name: "Casa", member_count: 1, is_valid: false },
      error: null,
    });
    expect((await getHouseholdByCode("CODE")).household).toMatchObject({ isValid: false });
  });
});

describe("getOrCreateJoinLink", () => {
  it("maps NOT_HOUSEHOLD_OWNER to owner-only copy", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: { message: "NOT_HOUSEHOLD_OWNER" } });
    expect((await getOrCreateJoinLink("h1")).error).toBe(
      "Only the household owner can manage the invite link."
    );
  });

  it("returns the code on success", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: "ABC123", error: null });
    expect(await getOrCreateJoinLink("h1")).toEqual({ code: "ABC123", error: null });
  });
});
