"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WebButton, WebCard, WebListRow, WebInput } from "@hiro/ui-primitives/web";
import { signOut } from "../../../lib/authService";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import {
  getMyHousehold,
  getHouseholdMembers,
  createHousehold,
} from "../../../lib/householdService";
import { tokens } from "@hiro/ui-tokens";
import type { Household, HouseholdMemberWithProfile } from "@hiro/domain";

export default function MorePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [householdLoaded, setHouseholdLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) setEmail(data.user.email);
      });

    loadHousehold();
  }, []);

  async function loadHousehold() {
    const { household: h } = await getMyHousehold();
    setHousehold(h);
    if (h) {
      const { members: m } = await getHouseholdMembers(h.id);
      setMembers(m);
    }
    setHouseholdLoaded(true);
  }

  async function handleCreateHousehold() {
    if (!newName.trim()) return;
    setCreateError(null);
    setCreating(true);
    const { error } = await createHousehold(newName.trim());
    setCreating(false);
    if (error) {
      setCreateError(error);
      return;
    }
    setNewName("");
    await loadHousehold();
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
  }

  return (
    <div style={{ padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.md }}>
      {householdLoaded && !household && (
        <WebCard title="Create your household">
          <div style={{ display: "grid", gap: tokens.spacing.md }}>
            <WebInput
              label="Household name"
              placeholder="e.g. The Smiths"
              value={newName}
              onChangeText={setNewName}
              state={createError ? "error" : "default"}
              helperText={createError ?? undefined}
            />
            <WebButton
              label="Create household"
              variant="primary"
              loading={creating}
              loadingLabel="Creating…"
              onPress={() => void handleCreateHousehold()}
            />
          </div>
        </WebCard>
      )}

      {household && (
        <WebCard title={household.name}>
          <div style={{ display: "grid", gap: tokens.spacing.sm }}>
            {members.map((m) => (
              <WebListRow
                key={m.id}
                title={m.profile.displayName ?? "Member"}
                meta={m.role}
              />
            ))}
          </div>
        </WebCard>
      )}

      <WebCard title="Account" description={email ?? "Loading…"}>
        <WebButton
          label="Sign out"
          variant="danger"
          onPress={() => void handleSignOut()}
        />
      </WebCard>
    </div>
  );
}
