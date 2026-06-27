"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WebInput, WebButton, cssFontFamily, cssRadius } from "@hiro/ui-primitives/web";
import { signIn, signInWithGoogle, getAccountMethods } from "../../../lib/authService";
import { resolveSignInFailure } from "@hiro/domain";
import { tokens, brand } from "@hiro/ui-tokens";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill={brand.googleBlue}/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill={brand.googleGreen}/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill={brand.googleYellow}/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill={brand.googleRed}/>
  </svg>
);

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // HIR-71: friendly guidance when the account uses Google (points up to the button).
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      if (/rate.?limit|too many|exceeded/i.test(authError)) {
        setError("Too many sign-in attempts. Please wait a few minutes and try again.");
        setLoading(false);
        return;
      }
      // The email may belong to a Google-only account. Ask the backend which method it uses
      // and guide the user there instead of showing a generic failure. If the lookup itself
      // fails (null), fall back to a safe generic message rather than "no account found".
      const methods = await getAccountMethods(email);
      if (methods === null) {
        setError("Incorrect email or password. Try again, or reset your password.");
      } else {
        const guidance = resolveSignInFailure(methods);
        if (guidance.highlightGoogle) {
          setNotice(guidance.message);
        } else {
          setError(guidance.message);
        }
      }
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push(redirect && redirect.startsWith("/") ? redirect : "/home");
  }

  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle(redirect ?? undefined);
    setGoogleLoading(false);
    if (authError) setError(authError);
    // On success, Supabase triggers a browser redirect — no further action needed.
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.lg }}>
      <h1
        style={{
          margin: 0,
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.titleSize,
          fontWeight: 700,
          color: "var(--hiro-color-ink)",
        }}
      >
        Sign in
      </h1>

      {notice && (
        <div
          role="status"
          style={{
            fontFamily: cssFontFamily.default,
            fontSize: tokens.typography.bodySmallSize,
            color: "var(--hiro-color-ink)",
            background: "var(--hiro-color-surface)",
            border: "1px solid var(--hiro-color-accent)",
            borderRadius: cssRadius.md,
            padding: tokens.spacing.md,
          }}
        >
          {notice}
        </div>
      )}

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
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--hiro-color-border)" }} />
        <span>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--hiro-color-border)" }} />
      </div>

      <WebInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
      />

      <WebInput
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Sign in"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Signing in…"
        onPress={() => void handleSignIn()}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.xs,
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
          borderTop: "1px solid var(--hiro-color-border)",
          paddingTop: tokens.spacing.md,
        }}
      >
        <Link
          href="/auth/sign-up"
          style={{ color: "var(--hiro-color-accent)", display: "flex", alignItems: "center", gap: tokens.spacing.xs, cursor: "pointer" }}
        >
          Create an account <span>→</span>
        </Link>
        <Link
          href="/auth/forgot-password"
          style={{ color: "var(--hiro-color-accent)", display: "flex", alignItems: "center", gap: tokens.spacing.xs, cursor: "pointer" }}
        >
          Forgot password? <span>→</span>
        </Link>
      </div>
    </div>
  );
}
