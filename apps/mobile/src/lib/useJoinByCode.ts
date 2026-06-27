import { useState } from "react";
import { Alert } from "react-native";
import { getMyHousehold, getHouseholdMembers } from "./householdService";
import { getHouseholdByCode, joinByCode, joinByCodeAndLeave } from "./joinLinkService";
import { supabase } from "./supabase";

// Join codes (open join links + legacy invite tokens) are UUIDs
// (gen_random_uuid()). Validate the shape client-side so a mistyped code yields
// a friendly message instead of a raw Postgres uuid-cast error.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface JoinOpts {
  /** Called once the user has successfully joined (or switched into) a household. */
  onJoined: () => void;
}

interface UseJoinByCode {
  join: (code: string, opts: JoinOpts) => Promise<void>;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Unified "join a household with a code" flow, reused by both the manual
 * JoinHouseholdForm and the deep-link handler. Validates the UUID shape, calls
 * joinByCode, and — when the user is already in another household — runs the
 * mandatory data-loss switch confirmation (per docs/v0.1.3/ia-decision.md)
 * before calling joinByCodeAndLeave. Switching is the one place household data
 * can be destroyed, so we name both households and spell out the exact
 * consequence (delete vs ownership transfer vs plain leave).
 */
export function useJoinByCode(): UseJoinByCode {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join(rawCode: string, opts: JoinOpts) {
    const code = rawCode.trim();
    if (!UUID_RE.test(code)) {
      setError("That doesn't look like a valid invite code. Paste the code your inviter shared.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: joinError } = await joinByCode(code);
    if (!joinError) {
      setLoading(false);
      opts.onJoined();
      return;
    }
    if (joinError.includes("another household")) {
      await confirmSwitch(code, opts);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError(joinError);
  }

  async function confirmSwitch(code: string, opts: JoinOpts) {
    const [{ household: current }, { household: target }] = await Promise.all([
      getMyHousehold(),
      getHouseholdByCode(code),
    ]);
    const oldName = current?.name ?? "your current household";
    const newName = target?.householdName ?? "the new household";

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
          onPress: () => void handleSwitch(code, opts),
        },
      ]
    );
  }

  async function handleSwitch(code: string, opts: JoinOpts) {
    setError(null);
    setLoading(true);
    const { oldHouseholdDeleted, oldHouseholdName, error: switchError } =
      await joinByCodeAndLeave(code);
    setLoading(false);
    if (switchError) {
      setError(switchError);
      return;
    }
    if (oldHouseholdDeleted && oldHouseholdName) {
      Alert.alert("Joined", `"${oldHouseholdName}" had no remaining members and was dissolved.`);
    }
    opts.onJoined();
  }

  return { join, loading, error, setError };
}
