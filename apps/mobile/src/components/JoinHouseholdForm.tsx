import React, { useState } from "react";
import { View } from "react-native";
import { MobileButton, MobileInput, useTheme } from "@hiro/ui-primitives/mobile";
import { useJoinByCode } from "../lib/useJoinByCode";

interface JoinHouseholdFormProps {
  /** Called once the user has successfully joined (or switched into) a household. */
  onJoined: () => void;
}

/**
 * Shared "join a household with a code" form. Used by onboarding (new members)
 * and the More screen (existing members switching households). The invitee
 * pastes the code the owner shared (an open join-link code or a legacy invite
 * token); both resolve through the unified useJoinByCode hook, which also powers
 * the `/join/:code` deep-link handler.
 */
export function JoinHouseholdForm({ onJoined }: JoinHouseholdFormProps) {
  const t = useTheme();
  const [code, setCode] = useState("");
  const { join, loading, error, setError } = useJoinByCode();

  return (
    <View style={{ gap: t.spacing.md }}>
      <MobileInput
        label="Invite code"
        placeholder="Paste your invite code"
        value={code}
        onChangeText={(text) => {
          setCode(text);
          if (error) setError(null);
        }}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />
      <MobileButton
        label="Join household"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Joining…"
        onPress={() => void join(code, { onJoined })}
      />
    </View>
  );
}
