"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { signIn } from "../../../lib/authService";
import { tokens } from "@hiro/ui-tokens";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    router.push(redirect && redirect.startsWith("/") ? redirect : "/home");
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
        Sign in
      </h1>

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
          fontFamily: tokens.typography.fontFamily,
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
