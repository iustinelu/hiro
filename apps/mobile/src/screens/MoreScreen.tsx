import React, { useEffect, useState } from "react";
import { ScrollView, View, Share, Alert, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { MobileButton, MobileCard, MobileListRow, MobileInput, MobileSwitchRow, useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, THEME_LABELS } from "@hiro/ui-tokens";
import { useThemeControl } from "../theme/ThemeProvider";
import { signOut } from "../lib/authService";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import { getActiveJoinLink, getOrCreateJoinLink, rotateJoinLink, setJoinLinkActive } from "../lib/joinLinkService";
import { getDisplayName, updateDisplayName, updateTheme } from "../lib/profileService";
import {
  getNotificationStatus,
  isDeviceRegistered,
  registerForPushNotifications,
  unregisterDevice,
  openNotificationSettings,
  type NotificationStatus,
} from "../lib/notificationService";
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

  // Notifications state
  const [notifStatus, setNotifStatus] = useState<NotificationStatus>("undetermined");
  const [notifCanAskAgain, setNotifCanAskAgain] = useState(true);
  const [notifRegistered, setNotifRegistered] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

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
    void loadNotificationState();
  }, []);

  async function loadNotificationState() {
    const [perm, registered] = await Promise.all([
      getNotificationStatus(),
      isDeviceRegistered(),
    ]);
    setNotifStatus(perm.status);
    setNotifCanAskAgain(perm.canAskAgain);
    setNotifRegistered(registered);
  }

  async function handleEnableNotifications() {
    setNotifBusy(true);
    await registerForPushNotifications();
    await loadNotificationState();
    setNotifBusy(false);
  }

  async function handleDisableNotifications() {
    setNotifBusy(true);
    await unregisterDevice();
    await loadNotificationState();
    setNotifBusy(false);
  }

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

  const isOwner = household && profileId && household.ownerProfileId === profileId;

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

      <MobileCard title="Notifications" description="Get nudged when chores get done">
        <View style={{ gap: t.spacing.md }}>
          {notifStatus === "denied" && !notifCanAskAgain ? (
            <>
              <MobileListRow title="Push notifications" meta="Blocked" />
              <MobileButton
                label="Open settings"
                variant="secondary"
                onPress={() => void openNotificationSettings()}
              />
            </>
          ) : notifRegistered ? (
            <>
              <MobileListRow title="Push notifications" meta="On" />
              <MobileButton
                label="Turn off"
                variant="secondary"
                loading={notifBusy}
                loadingLabel="Updating…"
                onPress={() => void handleDisableNotifications()}
              />
            </>
          ) : (
            <>
              <MobileListRow title="Push notifications" meta="Off" />
              <MobileButton
                label="Turn on"
                variant="primary"
                loading={notifBusy}
                loadingLabel="Updating…"
                onPress={() => void handleEnableNotifications()}
              />
            </>
          )}
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
        </View>
      </MobileCard>
    </ScrollView>
  );
}
