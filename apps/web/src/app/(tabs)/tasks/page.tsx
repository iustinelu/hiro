"use client";

import { useHousehold } from "../HouseholdProvider";
import { TasksManager } from "./TasksManager";

export default function TasksPage() {
  const { householdId, profileId, loading } = useHousehold();

  if (loading || !householdId || !profileId) return null;

  return <TasksManager householdId={householdId} profileId={profileId} />;
}
