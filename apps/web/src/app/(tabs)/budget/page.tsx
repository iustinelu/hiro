"use client";

import { useHousehold } from "../HouseholdProvider";
import { BudgetDashboard } from "./BudgetDashboard";

export default function BudgetPage() {
  const { householdId, profileId, loading } = useHousehold();

  if (loading || !householdId || !profileId) return null;

  return <BudgetDashboard householdId={householdId} profileId={profileId} />;
}
