import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentProfileId } from "../lib/sessionService";
import { getOnboardingCompleted, markOnboardingCompleted } from "../lib/profileService";

/**
 * Ordered steps of the guided first-run tour. The first three play out on Home
 * (the earn loop), the reward steps on the Rewards tab (the spend loop), then a
 * "what's next" card points at Budget before the notifications ask. Steps are
 * advanced by real user actions on each screen — nothing is simulated.
 */
export type TourStep =
  | "create"
  | "complete"
  | "celebrate"
  | "reward-create"
  | "reward-redeem"
  | "whats-next"
  | "notify";

interface OnboardingTourContextValue {
  /** Whether the interactive first-win tour is running. */
  tourActive: boolean;
  /** Current step. Shared across Home and Rewards so the tour can span tabs. */
  tourStep: TourStep;
  /** Move to a specific step (screens call this as the user completes actions). */
  setTourStep: (step: TourStep) => void;
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
  const [tourStep, setTourStep] = useState<TourStep>("create");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const pid = await getCurrentProfileId();
      if (!active || !pid) return;
      setProfileId(pid);
      const { onboardingCompleted } = await getOnboardingCompleted(pid);
      if (active && !onboardingCompleted) setTourActive(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const startTour = useCallback(() => {
    setTourStep("create");
    setTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
    if (profileId) void markOnboardingCompleted(profileId);
  }, [profileId]);

  return (
    <OnboardingTourContext.Provider value={{ tourActive, tourStep, setTourStep, startTour, endTour }}>
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
