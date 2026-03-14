import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MobileButton, MobileCard } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { signOut } from "../lib/authService";
import { supabase } from "../lib/supabase";

export function MoreScreen() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleSignOut() {
    await signOut();
    // Session change triggers RootNavigator to switch to AuthScreen
  }

  return (
    <View style={{ flex: 1, padding: tokens.spacing.lg }}>
      <MobileCard title="Account" description={email ?? "Loading…"}>
        <MobileButton
          label="Sign out"
          variant="danger"
          onPress={() => void handleSignOut()}
        />
      </MobileCard>
    </View>
  );
}
