"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_THEME_IDS } from "@hiro/ui-tokens";
import type { ThemeId } from "@hiro/ui-tokens";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { applyThemeLocal } from "../../theme/applyTheme";
import type { ReactNode } from "react";

type HouseholdContextValue = {
  profileId: string | null;
  householdId: string | null;
  displayName: string | null;
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
  const [displayName, setDisplayName] = useState<string | null>(null);
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

      const [{ data: membership }, { data: profile }] = await Promise.all([
        supabase
          .from("household_members")
          .select("household_id")
          .eq("profile_id", resolvedProfileId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("display_name, theme")
          .eq("id", resolvedProfileId)
          .single(),
      ]);

      const resolvedDisplayName = (profile?.display_name as string | null) ?? null;

      // Reconcile the DB theme over the client fast-path: cookie/localStorage paint
      // instantly on first load, then the user's persisted choice (if any) wins so the
      // theme follows them across devices/storage-wipes. A null DB value means "no
      // preference yet" — we leave the client value alone to avoid a flash-to-default.
      const dbTheme = (profile?.theme as string | null) ?? null;
      if (
        dbTheme &&
        (ALL_THEME_IDS as string[]).includes(dbTheme) &&
        document.documentElement.dataset.theme !== dbTheme
      ) {
        applyThemeLocal(dbTheme as ThemeId);
      }

      // Onboarding resolves BOTH requirements: a display name AND a household.
      // Either gap (missing name from a Google sign-up, or no household yet)
      // bounces the user back to /onboarding before any tab route renders.
      if (!membership || !resolvedDisplayName || !resolvedDisplayName.trim()) {
        if (active) router.replace("/onboarding");
        return;
      }

      if (active) {
        setProfileId(resolvedProfileId as string);
        setHouseholdId(membership.household_id);
        setDisplayName(resolvedDisplayName);
        setLoading(false);
      }
    }

    void resolve();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <HouseholdContext.Provider value={{ profileId, householdId, displayName, loading }}>
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
