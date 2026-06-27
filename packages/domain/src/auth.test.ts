import { describe, it, expect } from "vitest";
import { resolveSignInFailure, resolveSignUpCollision, type AuthMethod } from "./auth";

describe("resolveSignInFailure", () => {
  it("guides a google-only account to Continue with Google and highlights it", () => {
    const r = resolveSignInFailure(["google"]);
    expect(r.highlightGoogle).toBe(true);
    expect(r.message).toContain("Google");
  });

  it("treats a password account as a wrong-password retry (no google highlight)", () => {
    const r = resolveSignInFailure(["email"]);
    expect(r.highlightGoogle).toBe(false);
    expect(r.message).toMatch(/incorrect email or password/i);
  });

  it("treats a dual-method account as wrong-password (password exists)", () => {
    const r = resolveSignInFailure(["email", "google"]);
    expect(r.highlightGoogle).toBe(false);
    expect(r.message).toMatch(/incorrect email or password/i);
  });

  it("tells an unknown email to create an account", () => {
    const r = resolveSignInFailure([]);
    expect(r.highlightGoogle).toBe(false);
    expect(r.message).toMatch(/no account found/i);
  });
});

describe("resolveSignUpCollision", () => {
  it("returns null when the email is free (no collision)", () => {
    expect(resolveSignUpCollision([])).toBeNull();
  });

  it("points a google-only collision at Continue with Google", () => {
    const r = resolveSignUpCollision(["google"]);
    expect(r).not.toBeNull();
    expect(r?.message).toContain("Google");
  });

  it("points a password collision at Sign in", () => {
    const r = resolveSignUpCollision(["email"]);
    expect(r?.message).toMatch(/already have an account/i);
  });

  it("points a dual-method collision at Sign in", () => {
    const r = resolveSignUpCollision(["email", "google"] as AuthMethod[]);
    expect(r?.message).toMatch(/already have an account/i);
  });
});
