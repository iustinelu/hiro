import React, { useEffect, useState } from "react";
import { ScrollView, View, Share, Alert } from "react-native";
import { MobileButton, MobileCard, MobileListRow, MobileInput } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { signOut } from "../lib/authService";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { createInvite, getHouseholdInvites } from "../lib/inviteService";
import { getDisplayName, updateDisplayName } from "../lib/profileService";
import type { Household, HouseholdMemberWithProfile, HouseholdInvite } from "@hiro/domain";

// Web origin for invite links — update when deployed
const WEB_ORIGIN = "http://localhost:3000";

export function MoreScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Display name state
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    supabase.rpc("current_profile_id").then(({ data }) => {
      if (data) {
        const id = data as string;
        setProfileId(id);
        getDisplayName(id).then(({ displayName: name }) => {
          if (name) setDisplayName(name);
        });
      }
    });

    loadHousehold();
  }, []);

  async function loadHousehold() {
    const { household: h } = await getMyHousehold();
    setHousehold(h);
    if (h) {
      const { members: m } = await getHouseholdMembers(h.id);
      setMembers(m);
      const { invites: inv } = await getHouseholdInvites(h.id);
      setInvites(inv);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !household) return;
    setInviteError(null);
    setInviting(true);
    const { token, error } = await createInvite(household.id, inviteEmail.trim());
    setInviting(false);
    if (error) {
      setInviteError(error);
      return;
    }
    if (token) {
      const link = `${WEB_ORIGIN}/invite/${token}`;
      setInviteEmail("");
      // Refresh invite list
      const { invites: inv } = await getHouseholdInvites(household.id);
      setInvites(inv);
      // Show native share sheet
      try {
        await Share.share({
          message: `Join my household on Hiro: ${link}`,
          url: link,
        });
      } catch {
        Alert.alert("Invite link", link);
      }
    }
  }

  async function handleSaveName() {
    if (!profileId || !displayName.trim()) return;
    setNameError(null);
    setNameSaved(false);
    setSavingName(true);
    const { error } = await updateDisplayName(profileId, displayName);
    setSavingName(false);
    if (error) {
      setNameError(error);
    } else {
      setNameSaved(true);
    }
  }

  async function handleSignOut() {
    await signOut();
    // Session change triggers RootNavigator to switch to AuthScreen
  }

  const isOwner = household && profileId && household.ownerProfileId === profileId;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}
    >
      {household && (
        <MobileCard title={household.name}>
          <View style={{ gap: tokens.spacing.sm }}>
            {members.map((m) => (
              <MobileListRow
                key={m.id}
                title={m.profile.displayName ?? "Member"}
                meta={m.role}
              />
            ))}
          </View>
        </MobileCard>
      )}

      {isOwner && (
        <MobileCard title="Invite member">
          <View style={{ gap: tokens.spacing.md }}>
            <MobileInput
              label="Email address"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              state={inviteError ? "error" : "default"}
              helperText={inviteError ?? undefined}
            />
            <MobileButton
              label="Create invite link"
              variant="primary"
              loading={inviting}
              loadingLabel="Creating…"
              onPress={() => void handleInvite()}
            />
          </View>
        </MobileCard>
      )}

      {isOwner && invites.length > 0 && (
        <MobileCard title="Pending invites">
          <View style={{ gap: tokens.spacing.sm }}>
            {invites.map((inv) => (
              <MobileListRow
                key={inv.id}
                title={inv.invitedEmail}
                meta={`Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
              />
            ))}
          </View>
        </MobileCard>
      )}

      <MobileCard title="Account" description={email ?? "Loading…"}>
        <View style={{ gap: tokens.spacing.md }}>
          <MobileInput
            label="Display name"
            placeholder="Your name"
            value={displayName}
            onChangeText={(text) => { setDisplayName(text); setNameSaved(false); }}
            state={nameError ? "error" : nameSaved ? "success" : "default"}
            helperText={nameError ?? (nameSaved ? "Saved!" : undefined)}
          />
          <MobileButton
            label="Save name"
            variant="secondary"
            loading={savingName}
            loadingLabel="Saving…"
            onPress={() => void handleSaveName()}
          />
          <MobileButton
            label="Sign out"
            variant="danger"
            onPress={() => void handleSignOut()}
          />
        </View>
      </MobileCard>
    </ScrollView>
  );
}
