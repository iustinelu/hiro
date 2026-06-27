import React, { useState } from "react";
import { Alert, View } from "react-native";
import { MobileButton, MobileInput, useTheme } from "@hiro/ui-primitives/mobile";
import { acceptInvite, acceptInviteAndLeave, getInviteDetails } from "../lib/inviteService";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { supabase } from "../lib/supabase";

interface JoinHouseholdFormProps {
  /** Called once the user has successfully joined (or switched into) a household. */
  onJoined: () => void;
}

// Invite tokens are UUIDs (gen_random_uuid()). Validate the shape client-side so a
// mistyped code yields a friendly message instead of a raw Postgres uuid-cast error.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shared "join a household with an invite code" form. Used by onboarding (new
 * members) and the More screen (existing members switching households). The
 * invitee pastes the code the owner shared; acceptance is by code, so no web
 * link or deep link is involved.
 */
export function JoinHouseholdForm({ onJoined }: JoinHouseholdFormProps) {
  const t = useTheme();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    const token = code.trim();
    if (!UUID_RE.test(token)) {
      setError("That doesn't look like a valid invite code. Paste the code your inviter shared.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: joinError } = await acceptInvite(token);
    if (!joinError) {
      setLoading(false);
      onJoined();
      return;
    }
    // Already in another household → mandatory data-loss confirmation before
    // switching (per docs/v0.1.3/ia-decision.md). Switching is the one place
    // household data can be destroyed, so name both households and spell out the
    // exact consequence (delete vs ownership transfer vs plain leave).
    if (joinError.includes("another household")) {
      await confirmSwitch(token);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError(joinError);
  }

  async function confirmSwitch(token: string) {
    const [{ household: current }, { invite }] = await Promise.all([
      getMyHousehold(),
      getInviteDetails(token),
    ]);
    const oldName = current?.name ?? "your current household";
    const newName = invite?.householdName ?? "the new household";

    let consequence = "";
    if (current) {
      const { data: profileId } = await supabase.rpc("current_profile_id");
      const { members } = await getHouseholdMembers(current.id);
      const isSoleMember = members.length <= 1;
      const isOwner = profileId === current.ownerProfileId;
      if (isSoleMember) {
        consequence = `\n\n"${oldName}" and all its tasks, points, and history will be permanently deleted.`;
      } else if (isOwner) {
        consequence = `\n\nOwnership of "${oldName}" will transfer to another member.`;
      }
    }

    Alert.alert(
      "Switch households?",
      `You are about to leave "${oldName}" and join "${newName}".${consequence}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          style: "destructive",
          onPress: () => void handleSwitch(token),
        },
      ]
    );
  }

  async function handleSwitch(token: string) {
    setError(null);
    setLoading(true);
    const { oldHouseholdDeleted, oldHouseholdName, error: switchError } =
      await acceptInviteAndLeave(token);
    setLoading(false);
    if (switchError) {
      setError(switchError);
      return;
    }
    if (oldHouseholdDeleted && oldHouseholdName) {
      Alert.alert("Joined", `"${oldHouseholdName}" had no remaining members and was dissolved.`);
    }
    onJoined();
  }

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
        onPress={() => void handleJoin()}
      />
    </View>
  );
}
