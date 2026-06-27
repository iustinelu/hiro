"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { WebButton, WebCard, WebListRow, WebInput } from "@hiro/ui-primitives/web";
import { signOut } from "../../../lib/authService";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import {
  getMyHousehold,
  getHouseholdMembers,
  createHousehold,
} from "../../../lib/householdService";
import { createInvite, getHouseholdInvites } from "../../../lib/inviteService";
import { getDisplayName, updateDisplayName } from "../../../lib/profileService";
import { cacheKeys } from "../../../lib/cacheKeys";
import { tokens } from "@hiro/ui-tokens";
import { cssColor, cssRadius, cssFontFamily } from "@hiro/ui-primitives/web";
import type { Household, HouseholdMemberWithProfile, HouseholdInvite } from "@hiro/domain";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface MoreData {
  email: string | null;
  profileId: string | null;
  displayName: string;
  household: Household | null;
  members: HouseholdMemberWithProfile[];
  invites: HouseholdInvite[];
}

async function fetchMoreData(): Promise<MoreData> {
  const supabase = getSupabaseBrowserClient();
  const [{ data: userData }, { data: pid }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("current_profile_id"),
  ]);
  const email = userData.user?.email ?? null;
  const profileId = (pid as string | null) ?? null;

  let displayName = "";
  if (profileId) {
    const { displayName: name } = await getDisplayName(profileId);
    if (name) displayName = name;
  }

  const { household } = await getMyHousehold();
  let members: HouseholdMemberWithProfile[] = [];
  let invites: HouseholdInvite[] = [];
  if (household) {
    const [{ members: m }, { invites: inv }] = await Promise.all([
      getHouseholdMembers(household.id),
      getHouseholdInvites(household.id),
    ]);
    members = m;
    invites = inv;
  }

  return { email, profileId, displayName, household, members, invites };
}

export default function MorePage() {
  const router = useRouter();

  const { data, isLoading, mutate } = useSWR(cacheKeys.more(), fetchMoreData);

  const email = data?.email ?? null;
  const profileId = data?.profileId ?? null;
  const household = data?.household ?? null;
  const members = data?.members ?? [];
  const invites = data?.invites ?? [];

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Display name state — seeded once from the cached profile, then user-editable.
  const [displayName, setDisplayName] = useState("");
  const [displaySeeded, setDisplaySeeded] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (!displaySeeded && data?.displayName) {
      setDisplayName(data.displayName);
      setDisplaySeeded(true);
    }
  }, [data?.displayName, displaySeeded]);

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
    await mutate();
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !household) return;
    setInviteError(null);
    setInviteLink(null);
    setCopied(false);
    setInviting(true);
    const { token, error } = await createInvite(household.id, inviteEmail.trim());
    setInviting(false);
    if (error) {
      setInviteError(error);
      return;
    }
    if (token) {
      setInviteLink(`${window.location.origin}/invite/${token}`);
      setInviteEmail("");
      await mutate();
    }
  }

  async function handleCopyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveName() {
    if (!profileId || !displayName.trim()) return;
    setNameError(null);
    setNameSaved(false);
    setSavingName(true);
    const { error } = await updateDisplayName(profileId, displayName);
    setSavingName(false);
    if (error) {
      setNameError(error);
    } else {
      setNameSaved(true);
      void mutate();
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
  }

  const isOwner = household && profileId && household.ownerProfileId === profileId;

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ padding: tokens.spacing.lg, display: "grid", gap: tokens.spacing.md }}>
      {!household && (
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

      {isOwner && (
        <WebCard title="Invite member">
          <div style={{ display: "grid", gap: tokens.spacing.md }}>
            <WebInput
              label="Email address"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              state={inviteError ? "error" : "default"}
              helperText={inviteError ?? undefined}
            />
            <WebButton
              label="Create invite link"
              variant="primary"
              loading={inviting}
              loadingLabel="Creating…"
              onPress={() => void handleInvite()}
            />
            {inviteLink && (
              <div
                style={{
                  display: "grid",
                  gap: tokens.spacing.sm,
                  padding: tokens.spacing.md,
                  background: cssColor("surfaceMuted"),
                  borderRadius: cssRadius.md,
                  fontFamily: cssFontFamily.mono,
                  fontSize: tokens.typography.bodySmallSize,
                  wordBreak: "break-all",
                }}
              >
                <span style={{ color: cssColor("ink") }}>{inviteLink}</span>
                <WebButton
                  label={copied ? "Copied!" : "Copy link"}
                  variant="secondary"
                  onPress={() => void handleCopyLink()}
                />
              </div>
            )}
          </div>
        </WebCard>
      )}

      {isOwner && invites.length > 0 && (
        <WebCard title="Pending invites">
          <div style={{ display: "grid", gap: tokens.spacing.sm }}>
            {invites.map((inv) => (
              <WebListRow
                key={inv.id}
                title={inv.invitedEmail}
                meta={`Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
              />
            ))}
          </div>
        </WebCard>
      )}

      <WebCard title="Appearance">
        <ThemeSwitcher />
      </WebCard>

      <WebCard title="Account" description={email ?? "Loading…"}>
        <div style={{ display: "grid", gap: tokens.spacing.md }}>
          <WebInput
            label="Display name"
            placeholder="Your name"
            value={displayName}
            onChangeText={(text) => { setDisplayName(text); setNameSaved(false); }}
            state={nameError ? "error" : nameSaved ? "success" : "default"}
            helperText={nameError ?? (nameSaved ? "Saved!" : undefined)}
          />
          <WebButton
            label="Save name"
            variant="secondary"
            loading={savingName}
            loadingLabel="Saving…"
            onPress={() => void handleSaveName()}
          />
          <WebButton
            label="Sign out"
            variant="danger"
            onPress={() => void handleSignOut()}
          />
        </div>
      </WebCard>
    </div>
  );
}
