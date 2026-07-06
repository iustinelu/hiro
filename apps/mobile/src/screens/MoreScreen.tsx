import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MobileButton, MobileCard, MobileListRow, MobileInput, MobileModalSheet, useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, THEME_LABELS } from "@hiro/ui-tokens";
import { useThemeControl } from "../theme/ThemeProvider";
import { signOut, getMyAccountMethods, updatePassword, getMyEmail } from "../lib/authService";
import { deleteAccount } from "../lib/accountService";
import { getCurrentProfileId } from "../lib/sessionService";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { getDisplayName, updateDisplayName, updateTheme } from "../lib/profileService";
import { JoinHouseholdForm } from "../components/JoinHouseholdForm";
import { NotificationsCard } from "../components/NotificationsCard";
import { InviteCard } from "./more/InviteCard";
import { useOnboardingTour } from "../onboarding/OnboardingTourProvider";
import type { ThemeId } from "@hiro/ui-tokens";
import type { Household, HouseholdMemberWithProfile, AuthMethod } from "@hiro/domain";

export function MoreScreen() {
  const t = useTheme();
  const navigation = useNavigation<{ navigate: (name: string, params?: Record<string, unknown>) => void }>();
  const { startTour } = useOnboardingTour();
  const { themeId, setThemeId } = useThemeControl();
  const [email, setEmail] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);

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

  // Delete-account state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getMyEmail().then((userEmail) => {
      if (userEmail) setEmail(userEmail);
    });
    getMyAccountMethods().then(setAccountMethods);
    getCurrentProfileId().then((id) => {
      if (id) {
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

  function handleReplayTour() {
    startTour();
    navigation.navigate("home");
  }

  function openDelete() {
    setDeleteConfirm("");
    setDeleteError(null);
    setShowDelete(true);
  }

  function closeDelete() {
    if (deleting) return;
    setShowDelete(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAccount();
    if (error) {
      // Keep the sheet open and stay signed in so the user can retry.
      setDeleteError(error);
      setDeleting(false);
      return;
    }
    // Account is gone server-side; sign out clears the local session and
    // RootNavigator returns to the signed-out (AuthScreen) state.
    await signOut();
  }

  const isOwner = household && profileId && household.ownerProfileId === profileId;
  // Show "Set a password" only for Google-only accounts (no password yet).
  const isGoogleOnly =
    accountMethods !== null && accountMethods.includes("google") && !accountMethods.includes("email");
  const isSoleMember = !!household && members.length <= 1;
  const deleteWarning = !household
    ? "Your account and all your personal data will be permanently deleted. This cannot be undone."
    : isSoleMember
      ? `Your household "${household.name}" and all of its tasks, expenses, and rewards will be permanently deleted, along with your account. This cannot be undone.`
      : isOwner
        ? `You own "${household.name}". Ownership will transfer to another member, and your account and personal data will be permanently deleted. This cannot be undone.`
        : `You'll be removed from "${household.name}", and your account and personal data will be permanently deleted. This cannot be undone.`;
  const deleteConfirmed = deleteConfirm.trim().toUpperCase() === "DELETE";

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

      {isOwner && household && <InviteCard household={household} />}

      <MobileCard
        title="Join a household"
        description="Got an invite code? Enter it to join (or switch) households."
      >
        <JoinHouseholdForm onJoined={loadHousehold} />
      </MobileCard>

      <MobileCard title="Getting started" description="New to Hiro?">
        <MobileListRow
          title="Replay tour"
          subtitle="Walk through the basics again"
          onPress={handleReplayTour}
        />
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

      <NotificationsCard />

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
          <MobileButton
            label="Delete account"
            variant="ghost"
            onPress={openDelete}
          />
        </View>
      </MobileCard>

      <MobileModalSheet
        open={showDelete}
        title="Delete account?"
        description={deleteWarning}
        primaryActionLabel={deleting ? "Deleting…" : "Delete my account"}
        primaryActionVariant="danger"
        primaryActionDisabled={!deleteConfirmed || deleting}
        secondaryActionLabel="Cancel"
        onPrimaryAction={() => void handleDeleteAccount()}
        onSecondaryAction={closeDelete}
        onClose={closeDelete}
      >
        <MobileInput
          label='Type "DELETE" to confirm'
          placeholder="DELETE"
          value={deleteConfirm}
          onChangeText={(text) => { setDeleteConfirm(text); setDeleteError(null); }}
          state={deleteError ? "error" : "default"}
          helperText={deleteError ?? undefined}
        />
      </MobileModalSheet>
    </ScrollView>
  );
}
