"use client";

import { useHousehold } from "../HouseholdProvider";
import { RewardsDashboard } from "./RewardsDashboard";

export default function RewardsPage() {
  const { householdId, profileId, loading } = useHousehold();

  if (loading || !householdId || !profileId) return null;

  return <RewardsDashboard householdId={householdId} profileId={profileId} />;
}
