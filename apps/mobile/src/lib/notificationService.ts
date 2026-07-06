import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, Linking } from "react-native";
import { supabase } from "./supabase";

// Push notifications: request OS permission, get the Expo push token, and store
// it server-side via the register_device_token RPC. "No token = no push" — opt-out
// simply deletes the device's token. Services are plain async functions returning
// { ..., error } objects, matching the rest of apps/mobile/src/lib.

export type NotificationStatus = "granted" | "denied" | "undetermined";

/**
 * Permission state. `canAskAgain` matters on Android 13+: a not-yet-requested
 * POST_NOTIFICATIONS permission reports `denied` (not `undetermined`) but is still
 * promptable, so "blocked" must mean `denied && !canAskAgain` — never just `denied`.
 */
export type NotificationPermission = { status: NotificationStatus; canAskAgain: boolean };

const ANDROID_CHANNEL_ID = "default";

/**
 * Foreground display behaviour. Called once at app startup (before any
 * notification can arrive). Without this, notifications received while the app is
 * open are silently swallowed.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function getProjectId(): string | undefined {
  return (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
    ?.projectId;
}

function devicePlatform(): "ios" | "android" | null {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return null; // web/other — push not supported here
}

async function getDeviceToken(): Promise<string | null> {
  const projectId = getProjectId();
  const resp = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return resp.data ?? null;
}

/** Current OS permission state (incl. whether we can still prompt), without prompting. */
export async function getNotificationStatus(): Promise<NotificationPermission> {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return { status: status as NotificationStatus, canAskAgain };
  } catch {
    // Permission API can throw on some OS/device combos; fall back to a safe
    // "not decided, can still ask" so the UI shows the enable path.
    return { status: "undetermined", canAskAgain: true };
  }
}

/** Whether THIS device's push token is currently stored for the signed-in user. */
export async function isDeviceRegistered(): Promise<boolean> {
  try {
    if (!devicePlatform()) return false;
    const token = await getDeviceToken();
    if (!token) return false;
    // device_tokens RLS scopes SELECT to the caller's own rows.
    const { data } = await supabase
      .from("device_tokens")
      .select("id")
      .eq("token", token)
      .maybeSingle();
    return !!data;
  } catch {
    // Never block the caller on a token/registration lookup failure; treat as
    // "not registered" so the UI can offer to enable notifications.
    return false;
  }
}

/**
 * Request permission (if needed), then store the device's push token. Never
 * throws and never blocks the caller's flow (used at the end of onboarding).
 * Returns the resulting permission status so the UI can react (e.g. show an
 * "Open settings" path when denied).
 */
export async function registerForPushNotifications(): Promise<{
  status: NotificationStatus;
  error: string | null;
}> {
  try {
    const platform = devicePlatform();
    if (!platform) return { status: "undetermined", error: null };

    if (platform === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      return { status: status as NotificationStatus, error: null };
    }

    const token = await getDeviceToken();
    if (!token) return { status: "granted", error: "Could not obtain a push token." };

    const { error } = await supabase.rpc("register_device_token", {
      p_token: token,
      p_platform: platform,
    });
    return { status: "granted", error: error?.message ?? null };
  } catch (e) {
    return { status: "undetermined", error: e instanceof Error ? e.message : String(e) };
  }
}

/** Opt this device out by deleting its stored token. */
export async function unregisterDevice(): Promise<{ error: string | null }> {
  try {
    if (!devicePlatform()) return { error: null };
    const token = await getDeviceToken();
    if (!token) return { error: null };
    const { error } = await supabase.rpc("unregister_device_token", { p_token: token });
    return { error: error?.message ?? null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Deep-link to the OS settings page so a blocked user can re-enable. */
export async function openNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}
