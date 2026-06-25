import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { OnboardingFlow } from "./CreateHouseholdForm";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();

  const { data: profileId } = await supabase.rpc("current_profile_id");

  let needsName = true;
  let needsHousehold = true;

  if (profileId) {
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
    needsName = !displayName || !displayName.trim();
    needsHousehold = !membership;

    // Both requirements already satisfied — nothing to onboard.
    if (!needsName && !needsHousehold) redirect("/home");
  }

  return <OnboardingFlow needsName={needsName} needsHousehold={needsHousehold} />;
}
