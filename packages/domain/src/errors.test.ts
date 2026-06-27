import { describe, it, expect } from "vitest";
import { ServiceErrorCode, matchServiceError } from "./errors";

describe("matchServiceError", () => {
  it("round-trips every known code (bare string)", () => {
    // Iterating the enum is the guard: if a service references a code that isn't here it won't
    // compile, and any code we forget to make matchable fails this test rather than silently passing.
    for (const code of Object.values(ServiceErrorCode)) {
      expect(matchServiceError(code)).toBe(code);
    }
  });

  it("finds the code inside a realistic Postgres error string", () => {
    const raw =
      'new row violates ... ERROR: INSUFFICIENT_POINTS (SQLSTATE P0001) at ...';
    expect(matchServiceError(raw)).toBe(ServiceErrorCode.INSUFFICIENT_POINTS);
  });

  it("returns the most specific code when one code is a substring of another", () => {
    // `NOT_HOUSEHOLD_MEMBER` is a substring of both PAYER_/PARTICIPANT_ variants. The specific
    // code must win, otherwise the expense flow shows the wrong message.
    expect(matchServiceError("ERROR: PAYER_NOT_HOUSEHOLD_MEMBER")).toBe(
      ServiceErrorCode.PAYER_NOT_HOUSEHOLD_MEMBER
    );
    expect(matchServiceError("ERROR: PARTICIPANT_NOT_HOUSEHOLD_MEMBER")).toBe(
      ServiceErrorCode.PARTICIPANT_NOT_HOUSEHOLD_MEMBER
    );
    expect(matchServiceError("ERROR: NOT_HOUSEHOLD_MEMBER")).toBe(
      ServiceErrorCode.NOT_HOUSEHOLD_MEMBER
    );
  });

  it("returns null for unknown / empty input", () => {
    expect(matchServiceError("some unrelated database error")).toBeNull();
    expect(matchServiceError("")).toBeNull();
    expect(matchServiceError(null)).toBeNull();
    expect(matchServiceError(undefined)).toBeNull();
    // Internal-only precondition that the client never maps:
    expect(matchServiceError("NOT_AUTHENTICATED")).toBeNull();
  });
});
