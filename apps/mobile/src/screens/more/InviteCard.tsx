import React, { useEffect, useState } from "react";
import { View, Share, Alert, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { MobileButton, MobileCard, MobileSwitchRow, useTheme } from "@hiro/ui-primitives/mobile";
import { getActiveJoinLink, getOrCreateJoinLink, rotateJoinLink, setJoinLinkActive } from "../../lib/joinLinkService";
import type { Household } from "@hiro/domain";

// Mobile is invite-by-CODE: the invitee types the code into "Join a household"
// (or taps the hiro:// deep link). No hosted web /join page exists.
function joinDeepLink(code: string) {
  return `hiro://join/${code}`;
}

/**
 * Owner-only invite card: a single revocable join code. Toggling on creates (or
 * reuses) an active code; toggling off revokes it. The code is shared/copied as
 * plain text plus a hiro:// deep link the app handles - never a web URL.
 */
export function InviteCard({ household }: { household: Household }) {
  const t = useTheme();
  // `linkCode` is the active code (null = code is OFF).
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Read the current active code (without creating one) to seed the toggle.
    let active = true;
    void getActiveJoinLink(household.id).then(({ code }) => {
      if (active) setLinkCode(code);
    });
    return () => {
      active = false;
    };
  }, [household.id]);

  // Toggle ON → ensure an active code exists and show it. Toggle OFF → revoke.
  async function handleToggleLink(next: boolean) {
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

  async function handleCopyCode() {
    if (!linkCode) return;
    await Clipboard.setStringAsync(linkCode);
    Alert.alert("Copied", "Invite code copied to clipboard.");
  }

  async function handleShareCode() {
    if (!linkCode) return;
    const message =
      `Join my household "${household.name}" on Hiro!\n\n` +
      `Invite code: ${linkCode}\n` +
      `Already have the app? Open: ${joinDeepLink(linkCode)}\n\n` +
      `Get Hiro:\n` +
      `iPhone: https://apps.apple.com/app/id6784593514\n` +
      `Android: https://play.google.com/store/apps/details?id=com.behiro.app`;
    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Invite code", linkCode);
    }
  }

  function handleResetLink() {
    Alert.alert(
      "Reset invite code?",
      "The current code will stop working.",
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

  return (
    <MobileCard
      title="Invite people"
      description="Share a code. Anyone with it can join this household."
    >
      <View style={{ gap: t.spacing.md }}>
        <MobileSwitchRow
          label="Anyone with the code can join"
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
              style={{
                color: t.color.inkMuted,
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.labelSize,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Invite code
            </Text>
            <Text
              selectable
              style={{
                color: t.color.ink,
                fontFamily: t.typography.fontFamilyMono,
                fontSize: t.typography.titleSize,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            >
              {linkCode}
            </Text>
            <Text
              selectable
              style={{
                color: t.color.inkMuted,
                fontFamily: t.typography.fontFamilyMono,
                fontSize: t.typography.bodySmallSize,
                lineHeight: t.typography.lineHeightBody,
              }}
            >
              {joinDeepLink(linkCode)}
            </Text>
            <MobileButton
              label="Copy code"
              variant="secondary"
              disabled={linkBusy}
              onPress={() => void handleCopyCode()}
            />
            <MobileButton
              label="Share"
              variant="primary"
              disabled={linkBusy}
              onPress={() => void handleShareCode()}
            />
            <MobileButton
              label="Reset code"
              variant="danger"
              loading={linkBusy}
              loadingLabel="Working…"
              onPress={handleResetLink}
            />
          </View>
        )}
      </View>
    </MobileCard>
  );
}
