import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, type ThemeId } from "@hiro/ui-tokens";
import { supabase } from "../lib/supabase";
import { useThemeControl } from "../theme/ThemeProvider";
import { getTheme } from "../lib/profileService";
import { useJoinDeepLink } from "../lib/useJoinDeepLink";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { AppShellScreen } from "../screens/AppShell";
import { HouseholdOnboardingScreen } from "../screens/HouseholdOnboardingScreen";

type AuthState = "loading" | "unauthed" | "needs-onboarding" | "authed";

/**
 * An authenticated user is fully onboarded only once they have BOTH a display
 * name (Google sign-ups arrive without one) AND a household. Either gap routes
 * them through the onboarding screen, which collects whatever is missing.
 */
async function checkOnboarded(): Promise<boolean> {
  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) return false;

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from("household_members")
      .select("household_id")
      .eq("profile_id", profileId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", profileId)
      .single(),
  ]);

  const displayName = (profile?.display_name as string | null) ?? null;
  const hasName = !!displayName && !!displayName.trim();
  return !!membership && hasName;
}

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
      const { data: profileId } = await supabase.rpc("current_profile_id");
      if (!profileId) return;
      const { theme } = await getTheme(profileId as string);
      if (theme && (ALL_THEME_IDS as string[]).includes(theme)) {
        setThemeId(theme as ThemeId);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      void reconcileTheme();
      const onboarded = await checkOnboarded();
      setAuthState(onboarded ? "authed" : "needs-onboarding");
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      void reconcileTheme();
      setAuthState("loading");
      checkOnboarded().then((onboarded) => {
        setAuthState(onboarded ? "authed" : "needs-onboarding");
      });
    });

    return () => listener.subscription.unsubscribe();
  }, [setThemeId]);

  // Handle incoming `/join/:code` invite links (universal link or hiro:// scheme).
  // Only act once the user is authed or in onboarding; a link that arrives earlier
  // is stashed and replayed after sign-in. Joining re-runs the onboarding check so
  // a brand-new user who joins via a link lands straight in the app.
  useJoinDeepLink({
    enabled: authState === "authed" || authState === "needs-onboarding",
    onJoined: () => {
      setAuthState("loading");
      checkOnboarded().then((onboarded) => {
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
          checkOnboarded().then((onboarded) => {
            setAuthState(onboarded ? "authed" : "needs-onboarding");
          });
        }}
      />
    );
  }

  return <AppShellScreen />;
}
