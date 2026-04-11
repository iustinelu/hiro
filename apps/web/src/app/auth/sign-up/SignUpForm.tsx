"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { signUp, signInWithGoogle } from "../../../lib/authService";
import { tokens } from "@hiro/ui-tokens";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp() {
    setError(null);

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, displayName.trim());
    setLoading(false);

    if (authError) {
      if (/rate.?limit|too many|exceeded/i.test(authError)) {
        setError("Too many sign-up attempts. Please wait a few minutes and try again.");
      } else {
        setError(authError);
      }
      return;
    }
    router.push(redirect && redirect.startsWith("/") ? redirect : "/home");
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.lg }}>
      <h1
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: 700,
          color: "var(--hiro-color-ink)",
        }}
      >
        Create account
      </h1>

      <WebButton
        label="Continue with Google"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        loadingLabel="Redirecting…"
        onPress={() => void handleGoogleSignIn()}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.spacing.md,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--hiro-color-border)" }} />
        <span>or create account manually</span>
        <div style={{ flex: 1, height: 1, background: "var(--hiro-color-border)" }} />
      </div>

      <WebInput
        label="Your name"
        placeholder="e.g. Alex"
        value={displayName}
        onChangeText={setDisplayName}
        state={error && !displayName.trim() ? "error" : "default"}
      />

      <WebInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
      />

      <WebInput
        label="Password"
        placeholder="Min. 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        state={error ? "error" : "default"}
      />

      <WebInput
        label="Confirm password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Create account"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Creating account…"
        onPress={() => void handleSignUp()}
      />

      <div
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
          borderTop: "1px solid var(--hiro-color-border)",
          paddingTop: tokens.spacing.md,
        }}
      >
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          style={{ color: "var(--hiro-color-accent)", display: "inline-flex", alignItems: "center", gap: tokens.spacing.xs, cursor: "pointer" }}
        >
          Sign in <span>→</span>
        </Link>
      </div>
    </div>
  );
}
