import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MobileButton, MobileCard, MobileListRow, useTheme } from "@hiro/ui-primitives/mobile";
import {
  getNotificationStatus,
  isDeviceRegistered,
  registerForPushNotifications,
  unregisterDevice,
  openNotificationSettings,
  type NotificationStatus,
} from "../lib/notificationService";

// Manage-notifications card for the More tab. Opt-in = token presence: "Turn on"
// requests permission + registers the device token, "Turn off" removes it. "Open
// settings" shows only when truly blocked (denied && !canAskAgain) — a not-yet-asked
// Android 13+ user reports `denied` but is still promptable, so they get "Turn on".
export function NotificationsCard() {
  const t = useTheme();
  const [status, setStatus] = useState<NotificationStatus>("undetermined");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [perm, reg] = await Promise.all([getNotificationStatus(), isDeviceRegistered()]);
    setStatus(perm.status);
    setCanAskAgain(perm.canAskAgain);
    setRegistered(reg);
  }

  async function enable() {
    setBusy(true);
    await registerForPushNotifications();
    await load();
    setBusy(false);
  }

  async function disable() {
    setBusy(true);
    await unregisterDevice();
    await load();
    setBusy(false);
  }

  return (
    <MobileCard title="Notifications" description="Get nudged when chores get done">
      <View style={{ gap: t.spacing.md }}>
        {status === "denied" && !canAskAgain ? (
          <>
            <MobileListRow title="Push notifications" meta="Blocked" />
            <MobileButton
              label="Open settings"
              variant="secondary"
              onPress={() => void openNotificationSettings()}
            />
          </>
        ) : registered ? (
          <>
            <MobileListRow title="Push notifications" meta="On" />
            <MobileButton
              label="Turn off"
              variant="secondary"
              loading={busy}
              loadingLabel="Updating…"
              onPress={() => void disable()}
            />
          </>
        ) : (
          <>
            <MobileListRow title="Push notifications" meta="Off" />
            <MobileButton
              label="Turn on"
              variant="primary"
              loading={busy}
              loadingLabel="Updating…"
              onPress={() => void enable()}
            />
          </>
        )}
      </View>
    </MobileCard>
  );
}
