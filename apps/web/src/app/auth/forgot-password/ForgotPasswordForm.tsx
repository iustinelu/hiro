"use client";

import { useState } from "react";
import Link from "next/link";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { sendPasswordResetEmail } from "../../../lib/authService";
import { tokens } from "@hiro/ui-tokens";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: authError } = await sendPasswordResetEmail(
      email,
      `${origin}/auth/reset-password`
    );
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    setSent(true);
  }

  if (sent) {
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
          Check your email
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
            color: "var(--hiro-color-ink-muted)",
          }}
        >
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and
          follow the link to set a new password.
        </p>
        <div style={{ borderTop: "1px solid var(--hiro-color-border)", paddingTop: tokens.spacing.md }}>
          <Link
            href="/auth/sign-in"
            style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize,
              color: "var(--hiro-color-accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.spacing.xs,
              cursor: "pointer",
            }}
          >
            Back to sign in <span>→</span>
          </Link>
        </div>
      </div>
    );
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
        Forgot password
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <WebInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Send reset link"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Sending…"
        onPress={() => void handleReset()}
      />

      <div style={{ borderTop: "1px solid var(--hiro-color-border)", paddingTop: tokens.spacing.md }}>
        <Link
          href="/auth/sign-in"
          style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize,
            color: "var(--hiro-color-accent)",
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.spacing.xs,
            cursor: "pointer",
          }}
        >
          Back to sign in <span>→</span>
        </Link>
      </div>
    </div>
  );
}
