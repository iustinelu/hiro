import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { AppShellScreen } from "../screens/AppShell";
import { HouseholdOnboardingScreen } from "../screens/HouseholdOnboardingScreen";

type AuthState = "loading" | "unauthed" | "authed-no-household" | "authed";

async function checkHousehold(): Promise<boolean> {
  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) return false;
  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export function RootNavigator() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      const hasHousehold = await checkHousehold();
      setAuthState(hasHousehold ? "authed" : "authed-no-household");
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthState("unauthed");
        return;
      }
      setAuthState("loading");
      checkHousehold().then((hasHousehold) => {
        setAuthState(hasHousehold ? "authed" : "authed-no-household");
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
          backgroundColor: tokens.color.bg,
        }}
      >
        <ActivityIndicator color={tokens.color.accent} />
      </View>
    );
  }

  if (authState === "unauthed") {
    return <AuthScreen />;
  }

  if (authState === "authed-no-household") {
    return (
      <HouseholdOnboardingScreen onCreated={() => setAuthState("authed")} />
    );
  }

  return <AppShellScreen />;
}
