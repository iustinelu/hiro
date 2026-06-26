import { describe, it, expect } from "vitest";
import { validateRuntimeEnv } from "./index";

const valid = {
  APP_ENV: "production",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
};

describe("validateRuntimeEnv", () => {
  it("returns a typed RuntimeEnv when all vars are present and valid", () => {
    expect(validateRuntimeEnv(valid)).toEqual({
      appEnv: "production",
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("accepts every allowed APP_ENV value", () => {
    for (const appEnv of ["development", "staging", "production"]) {
      expect(validateRuntimeEnv({ ...valid, APP_ENV: appEnv }).appEnv).toBe(appEnv);
    }
  });

  // This is the production-crash class: a release build without EXPO_PUBLIC_* baked in
  // hits these throws. The mobile entry now catches them (fail-soft), but the contract
  // that they THROW (rather than return junk) is what the fail-soft path depends on.
  it("throws when APP_ENV is missing", () => {
    expect(() => validateRuntimeEnv({ ...valid, APP_ENV: undefined })).toThrow("Missing APP_ENV");
  });

  it("throws when SUPABASE_URL is missing", () => {
    expect(() => validateRuntimeEnv({ ...valid, SUPABASE_URL: undefined })).toThrow(
      "Missing SUPABASE_URL"
    );
  });

  it("throws when SUPABASE_ANON_KEY is missing", () => {
    expect(() => validateRuntimeEnv({ ...valid, SUPABASE_ANON_KEY: undefined })).toThrow(
      "Missing SUPABASE_ANON_KEY"
    );
  });

  it("throws when given a completely empty environment", () => {
    expect(() => validateRuntimeEnv({})).toThrow("Missing APP_ENV");
  });

  it("rejects an invalid APP_ENV value", () => {
    expect(() => validateRuntimeEnv({ ...valid, APP_ENV: "prod" })).toThrow(
      "APP_ENV must be one of"
    );
  });
});
