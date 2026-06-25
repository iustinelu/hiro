"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { ReactNode } from "react";

type HouseholdContextValue = {
  profileId: string | null;
  householdId: string | null;
  loading: boolean;
};

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

/**
 * Resolves the current profile + household ONCE per session and shares it via
 * context. Mounted inside the persistent (tabs) layout, so this fetch runs only
 * on the first load — switching tabs reuses the cached values instead of doing a
 * per-navigation server round-trip (the cause of HIR-65's ~500ms block).
 */
export function HouseholdProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolve() {
      const supabase = getSupabaseBrowserClient();

      const { data: resolvedProfileId } = await supabase.rpc("current_profile_id");

      if (!resolvedProfileId) {
        // Middleware guarantees the user is authenticated, so a null profileId
        // means the profile row doesn't exist yet — treat same as no household.
        if (active) router.replace("/onboarding");
        return;
      }

      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("profile_id", resolvedProfileId)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        if (active) router.replace("/onboarding");
        return;
      }

      if (active) {
        setProfileId(resolvedProfileId as string);
        setHouseholdId(membership.household_id);
        setLoading(false);
      }
    }

    void resolve();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <HouseholdContext.Provider value={{ profileId, householdId, loading }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext);
  if (!ctx) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return ctx;
}
