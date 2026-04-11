import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { BudgetDashboard } from "./BudgetDashboard";

export default async function BudgetPage() {
  const supabase = await createSupabaseServerClient();
  const { data: profileId } = await supabase.rpc("current_profile_id");

  if (!profileId) {
    redirect("/onboarding");
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  return <BudgetDashboard householdId={membership.household_id} profileId={profileId} />;
}
