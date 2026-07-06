import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, type ThemeId } from "@hiro/ui-tokens";
import { useThemeControl } from "../theme/ThemeProvider";
import { getTheme } from "../lib/profileService";
import { getCurrentProfileId, isFullyOnboarded } from "../lib/sessionService";
import { getCurrentSession, onAuthStateChange } from "../lib/authService";
import { useJoinDeepLink } from "../lib/useJoinDeepLink";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { AppShellScreen } from "../screens/AppShell";
import { HouseholdOnboardingScreen } from "../screens/HouseholdOnboardingScreen";

type AuthState = "loading" | "unauthed" | "needs-onboarding" | "authed";

export function RootNavigator() {
  const t = useTheme();
  const { setThemeId } = useThemeControl();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // Theme precedence: SecureStore paints instantly (ThemeProvider) → the DB value
    // reconciles on login here → a user switch (MoreScreen) writes both. Reconcile is
    // read-only over the DB: a valid persisted theme wins so it follows the user across
    // devices; null/invalid leaves the SecureStore value alone (no flash-to-default).
    async function reconcileTheme() {
      const profileId = await getCurrentProfileId();
      if (!profileId) return;
      const { theme } = await getTheme(profileId);
      if (theme && (ALL_THEME_IDS as string[]).includes(theme)) {
        setThemeId(theme as ThemeId);
      }
    }

    // Get initial session
    getCurrentSession().then(async (session) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      void reconcileTheme();
      const onboarded = await isFullyOnboarded();
      setAuthState(onboarded ? "authed" : "needs-onboarding");
    });

    // Subscribe to auth changes
    return onAuthStateChange((session) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      void reconcileTheme();
      setAuthState("loading");
      isFullyOnboarded().then((onboarded) => {
        setAuthState(onboarded ? "authed" : "needs-onboarding");
      });
    });
  }, [setThemeId]);

  // Handle incoming `/join/:code` invite links (universal link or hiro:// scheme).
  // Only act once the user is authed or in onboarding; a link that arrives earlier
  // is stashed and replayed after sign-in. Joining re-runs the onboarding check so
  // a brand-new user who joins via a link lands straight in the app.
  useJoinDeepLink({
    enabled: authState === "authed" || authState === "needs-onboarding",
    onJoined: () => {
      setAuthState("loading");
      isFullyOnboarded().then((onboarded) => {
        setAuthState(onboarded ? "authed" : "needs-onboarding");
      });
    },
  });

  if (authState === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.color.bg,
        }}
      >
        <ActivityIndicator color={t.color.accent} />
      </View>
    );
  }

  if (authState === "unauthed") {
    return <AuthScreen />;
  }

  if (authState === "needs-onboarding") {
    return (
      <HouseholdOnboardingScreen
        onCompleted={() => {
          setAuthState("loading");
          isFullyOnboarded().then((onboarded) => {
            setAuthState(onboarded ? "authed" : "needs-onboarding");
          });
        }}
      />
    );
  }

  return <AppShellScreen />;
}
