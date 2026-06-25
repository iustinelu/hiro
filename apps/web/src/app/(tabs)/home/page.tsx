"use client";

import { useHousehold } from "../HouseholdProvider";
import HomeDashboard from "./HomeDashboard";

export default function HomePage() {
  const { householdId, profileId, loading } = useHousehold();

  if (loading || !householdId || !profileId) return null;

  return <HomeDashboard householdId={householdId} profileId={profileId} />;
}
