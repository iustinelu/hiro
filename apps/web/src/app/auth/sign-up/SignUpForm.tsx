"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { signUp, signInWithGoogle } from "../../../lib/authService";
import { tokens } from "@hiro/ui-tokens";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="rgb(66,133,244)"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="rgb(52,168,83)"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="rgb(251,188,5)"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="rgb(234,67,53)"/>
  </svg>
);

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
    const { error: authError } = await signInWithGoogle(redirect ?? undefined);
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
        iconLeft={<GoogleIcon />}
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
