import { mutate } from "swr";

/**
 * Central SWR cache keys for the (tabs) dashboards. Defining them in one place lets
 * one tab invalidate another's cached data after a mutation - e.g. completing a task
 * on Home must also refresh the Tasks list, Progress stats and reward balances.
 *
 * Convention: element [0] namespaces the query and element [1] is always the
 * household id, so `revalidateHousehold` can match every household-scoped query.
 */
export const cacheKeys = {
  home: (householdId: string, profileId: string) => ["home", householdId, profileId] as const,
  tasks: (householdId: string, profileId: string) => ["tasks", householdId, profileId] as const,
  progress: (householdId: string, profileId: string) => ["progress", householdId, profileId] as const,
  budget: (householdId: string, year: number, month: number) =>
    ["budget", householdId, year, month] as const,
  rewards: (householdId: string, profileId: string) => ["rewards", householdId, profileId] as const,
  // More resolves the current user itself, so its key needs no household/profile arg.
  more: () => ["more"] as const,
};

/**
 * Revalidate every dashboard query scoped to a household. Call after a mutation that
 * can affect more than one tab (completing/creating tasks, redeeming rewards, adding
 * expenses) so sibling tabs don't paint stale cached data on the next visit. Mounted
 * tabs refetch immediately; cached-but-unmounted tabs are marked stale and refetch on
 * their next mount.
 */
export function revalidateHousehold(householdId: string) {
  return mutate(
    (key) => Array.isArray(key) && key[1] === householdId,
    undefined,
    { revalidate: true },
  );
}
