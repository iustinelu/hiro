/**
 * Requests OS notification permission. Invoked contextually at the end of the
 * interactive onboarding tour ("Want reminders when chores are due?"), never
 * cold on first launch - this maximizes opt-in by tying the prompt to a
 * demonstrated first win.
 *
 * HIR-69 only captures the permission. The granted permission is dormant until
 * HIR-66 (push) wires push-token registration + a notification handler on top
 * of this isolated entry point.
 *
 * Returns true if permission is granted. Already-granted permissions resolve
 * immediately without re-prompting the user.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Imported lazily so a build that lacks the native module (e.g. Expo Go, or
    // a not-yet-rebuilt dev client) can't crash the app at module load - the
    // import throws here and is caught, degrading to "not granted".
    const Notifications = await import("expo-notifications");
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    // Don't re-ask once the user has explicitly denied and the OS won't show the
    // dialog again; requesting is a no-op there but we still short-circuit.
    if (!existing.canAskAgain) return false;
    const result = await Notifications.requestPermissionsAsync();
    return result.granted;
  } catch {
    // Permission flow should never crash the tour; treat any failure as "not granted".
    return false;
  }
}
