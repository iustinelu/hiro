import { supabase } from "./supabase";

/** Resolve the signed-in user's profile id via the SECURITY DEFINER RPC. */
export async function getCurrentProfileId(): Promise<string | null> {
  const { data } = await supabase.rpc("current_profile_id");
  return (data as string | null) ?? null;
}

/**
 * Resolve the signed-in user's profile id and (first) household id in one call.
 * householdId is null for users who have not joined a household yet.
 */
export async function getSessionContext(): Promise<{
  profileId: string | null;
  householdId: string | null;
}> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return { profileId: null, householdId: null };

  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  return {
    profileId,
    householdId: (data?.household_id as string | undefined) ?? null,
  };
}

/**
 * An authenticated user is fully onboarded only once they have BOTH a display
 * name (Google sign-ups arrive without one) AND a household. Either gap routes
 * them through onboarding.
 */
export async function isFullyOnboarded(): Promise<boolean> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return false;

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase
      .from("household_members")
      .select("household_id")
      .eq("profile_id", profileId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", profileId)
      .single(),
  ]);

  const displayName = (profile?.display_name as string | null) ?? null;
  const hasName = !!displayName && !!displayName.trim();
  return !!membership && hasName;
}
