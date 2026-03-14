"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { updatePassword } from "../../../lib/authService";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import { tokens } from "@hiro/ui-tokens";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check existing session (handles PKCE code exchange that may have already occurred)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleUpdate() {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: authError } = await updatePassword(password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    router.push("/home");
  }

  if (!ready) {
    return (
      <p
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        Verifying reset link…
      </p>
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
        Set new password
      </h1>

      <WebInput
        label="New password"
        placeholder="Min. 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        state={error ? "error" : "default"}
      />

      <WebInput
        label="Confirm new password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Update password"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Updating…"
        onPress={() => void handleUpdate()}
      />
    </div>
  );
}
