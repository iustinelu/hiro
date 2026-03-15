import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { MobileButton, MobileCard, MobileListRow } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { signOut } from "../lib/authService";
import { supabase } from "../lib/supabase";
import { getMyHousehold, getHouseholdMembers } from "../lib/householdService";
import type { Household, HouseholdMemberWithProfile } from "@hiro/domain";

export function MoreScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });

    getMyHousehold().then(({ household: h }) => {
      setHousehold(h);
      if (h) {
        getHouseholdMembers(h.id).then(({ members: m }) => setMembers(m));
      }
    });
  }, []);

  async function handleSignOut() {
    await signOut();
    // Session change triggers RootNavigator to switch to AuthScreen
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}
    >
      {household && (
        <MobileCard title={household.name}>
          <View style={{ gap: tokens.spacing.sm }}>
            {members.map((m) => (
              <MobileListRow
                key={m.id}
                title={m.profile.displayName ?? "Member"}
                meta={m.role}
              />
            ))}
          </View>
        </MobileCard>
      )}

      <MobileCard title="Account" description={email ?? "Loading…"}>
        <MobileButton
          label="Sign out"
          variant="danger"
          onPress={() => void handleSignOut()}
        />
      </MobileCard>
    </ScrollView>
  );
}
