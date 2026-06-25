import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";
import { supabase } from "../lib/supabase";
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
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      const onboarded = await checkOnboarded();
      setAuthState(onboarded ? "authed" : "needs-onboarding");
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      setAuthState("loading");
      checkOnboarded().then((onboarded) => {
        setAuthState(onboarded ? "authed" : "needs-onboarding");
      });
    });

    return () => listener.subscription.unsubscribe();
  }, []);

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
