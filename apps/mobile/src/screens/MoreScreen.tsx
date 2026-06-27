import React, { useEffect, useState } from "react";
import { ScrollView, View, Share, Alert } from "react-native";
import { MobileButton, MobileCard, MobileListRow, MobileInput, useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, THEME_LABELS } from "@hiro/ui-tokens";
import { useThemeControl } from "../theme/ThemeProvider";
import { signOut, getMyAccountMethods, updatePassword } from "../lib/authService";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { createInvite, getHouseholdInvites } from "../lib/inviteService";
import { getDisplayName, updateDisplayName, updateTheme } from "../lib/profileService";
import { JoinHouseholdForm } from "../components/JoinHouseholdForm";
import type { ThemeId } from "@hiro/ui-tokens";
import type { Household, HouseholdMemberWithProfile, HouseholdInvite, AuthMethod } from "@hiro/domain";

export function MoreScreen() {
  const t = useTheme();
  const { themeId, setThemeId } = useThemeControl();
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

  // HIR-71: add-password for Google-only accounts
  const [accountMethods, setAccountMethods] = useState<AuthMethod[] | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSet, setPasswordSet] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    getMyAccountMethods().then(setAccountMethods);
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
      setInviteEmail("");
      // Refresh invite list
      const { invites: inv } = await getHouseholdInvites(household.id);
      setInvites(inv);
      // Mobile-only: share the invite *code*, not a web link (there is no web app).
      // The invitee installs Hiro and pastes this code into "Join a household".
      // TODO: drop in the public App Store / Google Play URLs once the apps are
      // out of TestFlight / Play-internal.
      const message =
        `Join my household "${household.name}" on Hiro!\n\n` +
        `1. Get Hiro from the App Store or Google Play\n` +
        `2. Sign up, then tap "Join a household" and enter this code:\n\n` +
        `${token}`;
      try {
        await Share.share({ message });
      } catch {
        Alert.alert("Invite code", token);
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

  function handleSelectTheme(id: ThemeId) {
    // Instant local apply (state + SecureStore) for zero-lag feedback, then
    // fire-and-forget the DB write so the choice follows the user across devices.
    setThemeId(id);
    if (profileId) void updateTheme(profileId, id);
  }

  async function handleSetPassword() {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSettingPassword(true);
    const { error } = await updatePassword(newPassword);
    setSettingPassword(false);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordSet(true);
    setNewPassword("");
    setConfirmNewPassword("");
    // Refresh methods so the section hides now that a password exists.
    setAccountMethods(await getMyAccountMethods());
  }

  async function handleSignOut() {
    await signOut();
    // Session change triggers RootNavigator to switch to AuthScreen
  }

  const isOwner = household && profileId && household.ownerProfileId === profileId;
  // Show "Set a password" only for Google-only accounts (no password yet).
  const isGoogleOnly =
    accountMethods !== null && accountMethods.includes("google") && !accountMethods.includes("email");

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
    >
      {household && (
        <MobileCard title={household.name}>
          <View style={{ gap: t.spacing.sm }}>
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
          <View style={{ gap: t.spacing.md }}>
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
          <View style={{ gap: t.spacing.sm }}>
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

      <MobileCard
        title="Join a household"
        description="Got an invite code? Enter it to join (or switch) households."
      >
        <JoinHouseholdForm onJoined={loadHousehold} />
      </MobileCard>

      <MobileCard title="Appearance" description="Pick your theme">
        <View style={{ gap: t.spacing.sm }}>
          {ALL_THEME_IDS.map((id) => (
            <MobileListRow
              key={id}
              title={THEME_LABELS[id]}
              meta={id === themeId ? "Selected" : undefined}
              onPress={() => handleSelectTheme(id)}
            />
          ))}
        </View>
      </MobileCard>

      <MobileCard title="Account" description={email ?? "Loading…"}>
        <View style={{ gap: t.spacing.md }}>
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
          {isGoogleOnly && (
            <>
              <MobileInput
                label="Set a password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChangeText={(text) => { setNewPassword(text); setPasswordError(null); }}
                secureTextEntry
                state={passwordError ? "error" : "default"}
                helperText={passwordError ?? "Add a password so you can also sign in with email."}
              />
              <MobileInput
                label="Confirm password"
                placeholder="Re-enter password"
                value={confirmNewPassword}
                onChangeText={(text) => { setConfirmNewPassword(text); setPasswordError(null); }}
                secureTextEntry
                state={passwordError ? "error" : "default"}
              />
              <MobileButton
                label="Set password"
                variant="secondary"
                loading={settingPassword}
                loadingLabel="Setting…"
                onPress={() => void handleSetPassword()}
              />
            </>
          )}
          {passwordSet && (
            <MobileListRow title="Password set" meta="You can now sign in with email too" />
          )}
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
