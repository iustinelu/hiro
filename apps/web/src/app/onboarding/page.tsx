import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { CreateHouseholdForm } from "./CreateHouseholdForm";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();

  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) redirect("/auth/sign-in");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (membership) redirect("/home");

  return <CreateHouseholdForm />;
}
