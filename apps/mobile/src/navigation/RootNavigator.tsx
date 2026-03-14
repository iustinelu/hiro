import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { AppShellScreen } from "../screens/AppShell";

type AuthState = "loading" | "authed" | "unauthed";

export function RootNavigator() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? "authed" : "unauthed");
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? "authed" : "unauthed");
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

  return <AppShellScreen />;
}
