import React, { useState } from "react";
import { Text, View } from "react-native";
import { MobileInput, MobileButton, useTheme } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { sendPasswordResetEmail } from "../../lib/authService";

export function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    setLoading(true);
    const { error: authError } = await sendPasswordResetEmail(email);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <View style={{ gap: tokens.spacing.md }}>
        <Text
          style={{
            fontFamily: t.typography.fontFamily,
            fontSize: tokens.typography.titleSize,
            fontWeight: "700",
            color: t.color.ink,
          }}
        >
          Check your email
        </Text>
        <Text
          style={{
            fontFamily: t.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
            color: t.color.inkMuted,
          }}
        >
          We sent a password reset link to {email}.
        </Text>
        <MobileButton
          label="Back to sign in"
          variant="ghost"
          size="sm"
          onPress={onBack}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: t.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Forgot password
      </Text>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: t.color.inkMuted,
        }}
      >
        Enter your email and we&apos;ll send you a reset link.
      </Text>

      <MobileInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Send reset link"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Sending…"
        onPress={() => void handleReset()}
      />

      <MobileButton
        label="Back to sign in"
        variant="ghost"
        size="sm"
        onPress={onBack}
      />
    </View>
  );
}
