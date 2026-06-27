import React, { useEffect, useState } from "react";
import { ScrollView, View, Share, Alert, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { MobileButton, MobileCard, MobileListRow, MobileInput, MobileSwitchRow, MobileModalSheet, useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, THEME_LABELS } from "@hiro/ui-tokens";
import { useThemeControl } from "../theme/ThemeProvider";
import { signOut } from "../lib/authService";
import { deleteAccount } from "../lib/accountService";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { getActiveJoinLink, getOrCreateJoinLink, rotateJoinLink, setJoinLinkActive } from "../lib/joinLinkService";
import { getDisplayName, updateDisplayName, updateTheme } from "../lib/profileService";
import { JoinHouseholdForm } from "../components/JoinHouseholdForm";
import type { ThemeId } from "@hiro/ui-tokens";
import type { Household, HouseholdMemberWithProfile } from "@hiro/domain";

const WEB_ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000";

export function MoreScreen() {
  const t = useTheme();
  const { themeId, setThemeId } = useThemeControl();
  const [email, setEmail] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);

  // Join-link state. `linkCode` is the active code (null = link is OFF).
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Display name state
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  // Delete-account state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      // Read the current active link (without creating one) to seed the toggle.
      const { code } = await getActiveJoinLink(h.id);
      setLinkCode(code);
    }
  }

  // Toggle ON → ensure an active link exists and show it. Toggle OFF → revoke.
  async function handleToggleLink(next: boolean) {
    if (!household) return;
    setLinkError(null);
    setLinkBusy(true);
    if (next) {
      const { code, error } = await getOrCreateJoinLink(household.id);
      setLinkBusy(false);
      if (error) {
        setLinkError(error);
        return;
      }
      setLinkCode(code);
    } else {
      const { error } = await setJoinLinkActive(household.id, false);
      setLinkBusy(false);
      if (error) {
        setLinkError(error);
        return;
      }
      setLinkCode(null);
    }
  }

  function joinUrl(code: string) {
    return `${WEB_ORIGIN}/join/${code}`;
  }

  async function handleCopyLink() {
    if (!linkCode) return;
    await Clipboard.setStringAsync(joinUrl(linkCode));
    Alert.alert("Copied", "Invite link copied to clipboard.");
  }

  async function handleShareLink() {
    if (!linkCode || !household) return;
    const message = `Join my household "${household.name}" on Hiro!\n${joinUrl(linkCode)}`;
    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Invite link", joinUrl(linkCode));
    }
  }

  function handleResetLink() {
    if (!household) return;
    Alert.alert(
      "Reset invite link?",
      "The current link will stop working.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => void doResetLink(),
        },
      ]
    );
  }

  async function doResetLink() {
    if (!household) return;
    setLinkError(null);
    setLinkBusy(true);
    const { code, error } = await rotateJoinLink(household.id);
    setLinkBusy(false);
    if (error) {
      setLinkError(error);
      return;
    }
    setLinkCode(code);
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

  async function handleSignOut() {
    await signOut();
    // Session change triggers RootNavigator to switch to AuthScreen
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

      {isOwner && (
        <MobileCard
          title="Invite people"
          description="Share one link. Anyone who taps it can join this household."
        >
          <View style={{ gap: t.spacing.md }}>
            <MobileSwitchRow
              label="Anyone with the link can join"
              value={linkCode !== null}
              onToggle={(next) => void handleToggleLink(next)}
            />
            {linkError && (
              <Text
                style={{
                  color: t.color.error,
                  fontFamily: t.typography.fontFamily,
                  fontSize: t.typography.bodySmallSize,
                  lineHeight: t.typography.lineHeightBody,
                }}
              >
                {linkError}
              </Text>
            )}
            {linkCode !== null && (
              <View style={{ gap: t.spacing.sm }}>
                <Text
                  selectable
                  style={{
                    color: t.color.ink,
                    fontFamily: t.typography.fontFamilyMono,
                    fontSize: t.typography.bodySmallSize,
                    lineHeight: t.typography.lineHeightBody,
                  }}
                >
                  {joinUrl(linkCode)}
                </Text>
                <MobileButton
                  label="Copy link"
                  variant="secondary"
                  disabled={linkBusy}
                  onPress={() => void handleCopyLink()}
                />
                <MobileButton
                  label="Share"
                  variant="primary"
                  disabled={linkBusy}
                  onPress={() => void handleShareLink()}
                />
                <MobileButton
                  label="Reset link"
                  variant="danger"
                  loading={linkBusy}
                  loadingLabel="Working…"
                  onPress={handleResetLink}
                />
              </View>
            )}
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
