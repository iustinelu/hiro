"use client";

import type { HouseholdInvite, InviteDetails } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";

export async function createInvite(
  householdId: string,
  email: string
): Promise<{ token: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_invite", {
    p_household_id: householdId,
    p_email: email,
  });
  if (error) {
    if (error.message.includes("NOT_HOUSEHOLD_OWNER")) {
      return { token: null, error: "Only the household owner can invite members." };
    }
    if (error.message.includes("CANNOT_INVITE_SELF")) {
      return { token: null, error: "You cannot invite yourself." };
    }
    if (error.message.includes("INVITE_ALREADY_PENDING")) {
      return { token: null, error: "An invite is already pending for this email." };
    }
    return { token: null, error: error.message };
  }
  return { token: data as string, error: null };
}

export async function getInviteDetails(
  token: string
): Promise<{ invite: InviteDetails | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_invite_by_token", {
    p_token: token,
  });
  if (error) return { invite: null, error: error.message };
  if (!data || (Array.isArray(data) && data.length === 0))
    return { invite: null, error: null };

  const row = Array.isArray(data) ? data[0] : data;
  return {
    invite: {
      householdName: row.household_name,
      inviterName: row.inviter_name,
      status: row.status,
      expiresAt: row.expires_at,
    },
    error: null,
  };
}

export async function acceptInvite(
  token: string
): Promise<{ householdId: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("accept_invite", {
    p_token: token,
  });
  if (error) {
    if (error.message.includes("INVITE_NOT_FOUND")) {
      return { householdId: null, error: "Invite not found." };
    }
    if (error.message.includes("INVITE_EXPIRED")) {
      return { householdId: null, error: "This invite has expired." };
    }
    return { householdId: null, error: error.message };
  }
  return { householdId: data as string, error: null };
}

export async function getHouseholdInvites(
  householdId: string
): Promise<{ invites: HouseholdInvite[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("household_invites")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { invites: [], error: error.message };

  const invites: HouseholdInvite[] = (data ?? []).map((row) => ({
    id: row.id,
    householdId: row.household_id,
    invitedEmail: row.invited_email,
    invitedByProfileId: row.invited_by_profile_id,
    token: row.token,
    status: row.status as "pending" | "accepted" | "expired",
    expiresAt: row.expires_at,
    acceptedByProfileId: row.accepted_by_profile_id,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { invites, error: null };
}
