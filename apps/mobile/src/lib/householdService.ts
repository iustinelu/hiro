import type { Household, HouseholdMemberWithProfile } from "@hiro/domain";
import { supabase } from "./supabase";

export async function createHousehold(
  name: string
): Promise<{ householdId: string | null; error: string | null; alreadyExists: boolean }> {
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name,
  });
  if (error) {
    if (error.message.includes("HOUSEHOLD_ALREADY_EXISTS")) {
      return { householdId: null, error: null, alreadyExists: true };
    }
    return { householdId: null, error: error.message, alreadyExists: false };
  }
  return { householdId: data as string, error: null, alreadyExists: false };
}

export async function getMyHousehold(): Promise<{
  household: Household | null;
  error: string | null;
}> {
  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) return { household: null, error: null };

  const { data, error } = await supabase
    .from("household_members")
    .select("households(id, name, owner_profile_id, currency, created_at, updated_at)")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (error) return { household: null, error: error.message };
  if (!data?.households) return { household: null, error: null };

  const h = data.households as unknown as {
    id: string;
    name: string;
    owner_profile_id: string;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  return {
    household: {
      id: h.id,
      name: h.name,
      ownerProfileId: h.owner_profile_id,
      currency: (h.currency ?? "EUR") as import("@hiro/domain").CurrencyCode,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    },
    error: null,
  };
}

export async function getHouseholdMembers(householdId: string): Promise<{
  members: HouseholdMemberWithProfile[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("household_members")
    .select("id, household_id, profile_id, role, created_at, profiles(id, display_name)")
    .eq("household_id", householdId);

  if (error) return { members: [], error: error.message };

  const members: HouseholdMemberWithProfile[] = (data ?? []).map((row) => {
    const p = row.profiles as unknown as { id: string; display_name: string | null } | null;
    return {
      id: row.id,
      householdId: row.household_id,
      profileId: row.profile_id,
      role: row.role as "owner" | "member",
      createdAt: row.created_at,
      profile: { id: p?.id ?? "", displayName: p?.display_name ?? null },
    };
  });

  return { members, error: null };
}
