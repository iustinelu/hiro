import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { SectionPlaceholder } from "../SectionPlaceholder";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: profileId } = await supabase.rpc("current_profile_id");

  if (!profileId) {
    // Middleware guarantees the user is authenticated, so profileId being null
    // means the profile row doesn't exist yet — treat same as no household.
    redirect("/onboarding");
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  return <SectionPlaceholder id="home" />;
}
