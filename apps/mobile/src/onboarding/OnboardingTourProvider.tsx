import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getOnboardingCompleted, markOnboardingCompleted } from "../lib/profileService";

interface OnboardingTourContextValue {
  /** Whether the interactive first-win tour should be shown over Home. */
  tourActive: boolean;
  /** Re-run the tour on demand (e.g. "Replay tour" from More). */
  startTour: () => void;
  /** Finish or skip the tour; persists the per-profile completion flag. */
  endTour: () => void;
}

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(null);

/**
 * Owns the lifecycle of the gamified onboarding tour. Mounted above the tab
 * navigator so Home (which renders the tour) and More (which replays it) share
 * one source of truth.
 *
 * On mount it resolves the current profile and reads `onboarding_completed`;
 * a brand-new user (flag false) auto-launches the tour. The tour STEP itself is
 * derived from real Home state in HomeScreen, so abandoning mid-tour resumes
 * sensibly with no persisted step index.
 */
export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const [tourActive, setTourActive] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: pid } = await supabase.rpc("current_profile_id");
      if (!active || !pid) return;
      setProfileId(pid as string);
      const { onboardingCompleted } = await getOnboardingCompleted(pid as string);
      if (active && !onboardingCompleted) setTourActive(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const startTour = useCallback(() => setTourActive(true), []);

  const endTour = useCallback(() => {
    setTourActive(false);
    if (profileId) void markOnboardingCompleted(profileId);
  }, [profileId]);

  return (
    <OnboardingTourContext.Provider value={{ tourActive, startTour, endTour }}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour(): OnboardingTourContextValue {
  const ctx = useContext(OnboardingTourContext);
  if (!ctx) {
    throw new Error("useOnboardingTour must be used within an OnboardingTourProvider");
  }
  return ctx;
}
