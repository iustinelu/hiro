"use client";

import { useHousehold } from "../HouseholdProvider";
import { ProgressDashboard } from "./ProgressDashboard";

export default function ProgressPage() {
  const { householdId, profileId, loading } = useHousehold();

  if (loading || !householdId || !profileId) return null;

  return <ProgressDashboard householdId={householdId} profileId={profileId} />;
}
