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
import { createInvite, getHouseholdInvites } from "../../../lib/inviteService";
import { tokens } from "@hiro/ui-tokens";
import type { Household, HouseholdMemberWithProfile, HouseholdInvite } from "@hiro/domain";
import { RewardsSection } from "./RewardsSection";

export default function MorePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);
  const [householdLoaded, setHouseholdLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    supabase.rpc("current_profile_id").then(({ data }) => {
      if (data) setProfileId(data as string);
    });

    loadHousehold();
  }, []);

  async function loadHousehold() {
    const { household: h } = await getMyHousehold();
    setHousehold(h);
    if (h) {
      const { members: m } = await getHouseholdMembers(h.id);
      setMembers(m);
      const { invites: inv } = await getHouseholdInvites(h.id);
      setInvites(inv);
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
      // Refresh invite list
      const { invites: inv } = await getHouseholdInvites(household.id);
      setInvites(inv);
    }
  }

  async function handleCopyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/sign-in");
  }

  const isOwner = household && profileId && household.ownerProfileId === profileId;

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
                  background: tokens.color.surfaceMuted,
                  borderRadius: tokens.radius.md,
                  fontFamily: tokens.typography.fontFamilyMono,
                  fontSize: tokens.typography.bodySmallSize,
                  wordBreak: "break-all",
                }}
              >
                <span style={{ color: tokens.color.ink }}>{inviteLink}</span>
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

      {household && profileId && (
        <RewardsSection householdId={household.id} profileId={profileId} />
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
