import React from "react";
import { AppTabs } from "../navigation/AppTabs";
import { OnboardingTourProvider } from "../onboarding/OnboardingTourProvider";

export function AppShellScreen() {
  return (
    <OnboardingTourProvider>
      <AppTabs />
    </OnboardingTourProvider>
  );
}
