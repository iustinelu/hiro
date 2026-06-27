import { supabase } from "./supabase";

// A household has ONE reusable, revocable join link. These wrappers mirror the
// style of inviteService.ts: every call returns { ...payload, error } and maps
// the RPC's machine error codes to user-facing copy. The DB RPCs + migration
// are already live; this is purely the typed client surface.

/**
 * Read the household's CURRENT active join link WITHOUT creating one. Members
 * (per RLS) can read their own household's link. Returns code: null when no
 * active link exists yet (toggle is OFF) — not an error.
 */
export async function getActiveJoinLink(
  householdId: string
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("household_join_links")
    .select("code,is_active,expires_at")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) return { code: null, error: error.message };
  return { code: (data?.code as string | undefined) ?? null, error: null };
}

/**
 * Owner-only. Returns the active code, creating one if none exists (i.e.
 * turning the link ON).
 */
export async function getOrCreateJoinLink(
  householdId: string
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("get_or_create_join_link", {
    p_household_id: householdId,
  });
  if (error) {
    if (error.message.includes("NOT_HOUSEHOLD_OWNER")) {
      return { code: null, error: "Only the household owner can manage the invite link." };
    }
    return { code: null, error: error.message };
  }
  return { code: data as string, error: null };
}

/**
 * Owner-only. false = revoke the link, true = ensure an active link exists.
 */
export async function setJoinLinkActive(
  householdId: string,
  active: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("set_join_link_active", {
    p_household_id: householdId,
    p_active: active,
  });
  if (error) {
    if (error.message.includes("NOT_HOUSEHOLD_OWNER")) {
      return { error: "Only the household owner can manage the invite link." };
    }
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Owner-only. Deactivates the old link and returns a fresh code. The previous
 * link stops working.
 */
export async function rotateJoinLink(
  householdId: string
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("rotate_join_link", {
    p_household_id: householdId,
  });
  if (error) {
    if (error.message.includes("NOT_HOUSEHOLD_OWNER")) {
      return { code: null, error: "Only the household owner can manage the invite link." };
    }
    return { code: null, error: error.message };
  }
  return { code: data as string, error: null };
}

/**
 * Anon-callable preview of where a code leads. Returns null when the code is
 * unknown (the RPC returns []). Use it to name the target household before
 * joining/switching.
 */
export async function getHouseholdByCode(code: string): Promise<{
  household: { householdName: string; memberCount: number; isValid: boolean } | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("get_household_by_code", {
    p_code: code,
  });
  if (error) return { household: null, error: error.message };
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { household: null, error: null };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    household: {
      householdName: row.household_name,
      memberCount: row.member_count,
      isValid: row.is_valid,
    },
    error: null,
  };
}

/**
 * Join by code. Resolves both open join-link codes AND legacy single-use invite
 * tokens. The "another household" substring is preserved on ALREADY_IN_HOUSEHOLD
 * so callers can detect it and trigger the switch-with-confirm flow.
 */
export async function joinByCode(
  code: string
): Promise<{ householdId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("join_by_code", {
    p_code: code,
  });
  if (error) {
    if (error.message.includes("JOIN_LINK_DISABLED")) {
      return { householdId: null, error: "This invite link has been turned off by the household owner." };
    }
    if (error.message.includes("JOIN_LINK_EXPIRED")) {
      return { householdId: null, error: "This invite link has expired." };
    }
    if (error.message.includes("ALREADY_A_MEMBER")) {
      return { householdId: null, error: "You're already a member of this household." };
    }
    if (error.message.includes("ALREADY_IN_HOUSEHOLD")) {
      return { householdId: null, error: "You're already in another household. You need to leave it before joining a new one." };
    }
    if (error.message.includes("INVITE_NOT_FOUND")) {
      return { householdId: null, error: "Invite not found." };
    }
    if (error.message.includes("INVITE_ALREADY_ACCEPTED")) {
      return { householdId: null, error: "This invite has already been used." };
    }
    if (error.message.includes("INVITE_EXPIRED")) {
      return { householdId: null, error: "This invite has expired. Ask the household owner to send a new one." };
    }
    return { householdId: null, error: error.message };
  }
  return { householdId: data as string, error: null };
}

/**
 * Join by code, leaving the current household first. Mirrors
 * inviteService.acceptInviteAndLeave: the switch is the one place household data
 * can be destroyed, so the result reports whether the old household was
 * dissolved.
 */
export async function joinByCodeAndLeave(code: string): Promise<{
  householdId: string | null;
  oldHouseholdDeleted: boolean;
  oldHouseholdName: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("join_by_code_and_leave", {
    p_code: code,
  });
  if (error) {
    if (error.message.includes("JOIN_LINK_DISABLED")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "This invite link has been turned off by the household owner." };
    }
    if (error.message.includes("JOIN_LINK_EXPIRED")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "This invite link has expired." };
    }
    if (error.message.includes("ALREADY_A_MEMBER")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "You're already a member of this household." };
    }
    if (error.message.includes("INVITE_NOT_FOUND")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "Invite not found." };
    }
    if (error.message.includes("INVITE_ALREADY_ACCEPTED")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "This invite has already been used." };
    }
    if (error.message.includes("INVITE_EXPIRED")) {
      return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: "This invite has expired. Ask the household owner to send a new one." };
    }
    return { householdId: null, oldHouseholdDeleted: false, oldHouseholdName: null, error: error.message };
  }
  const result = data as { household_id: string; old_household_deleted: boolean; old_household_name: string | null };
  return {
    householdId: result.household_id,
    oldHouseholdDeleted: result.old_household_deleted,
    oldHouseholdName: result.old_household_name,
    error: null,
  };
}
