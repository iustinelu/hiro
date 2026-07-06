import type {
  OneOffTask,
  OneOffTaskKind,
  HouseholdActivity,
  HouseholdActivityKind,
} from "@hiro/domain";
import { supabase } from "./supabase";

/* ─── Mapping + error helpers ─────────────────────────────────────────────── */

function mapOneOff(row: Record<string, unknown>): OneOffTask {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    points: row.points as number,
    createdByProfileId: row.created_by_profile_id as string,
    kind: row.kind as OneOffTaskKind,
    status: row.status as OneOffTask["status"],
    claimedByProfileId: (row.claimed_by_profile_id as string | null) ?? null,
    claimedAt: (row.claimed_at as string | null) ?? null,
    completedByProfileId: (row.completed_by_profile_id as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    settleAt: (row.settle_at as string | null) ?? null,
    contestedByProfileId: (row.contested_by_profile_id as string | null) ?? null,
    contestedAt: (row.contested_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function friendlyError(msg: string): string {
  if (msg.includes("NOT_AUTHENTICATED")) return "You are not signed in.";
  if (msg.includes("NOT_HOUSEHOLD_MEMBER")) return "You are not a member of this household.";
  if (msg.includes("NOT_CLAIMABLE")) return "This task can no longer be claimed.";
  if (msg.includes("NOT_COMPLETABLE")) return "This task can no longer be completed.";
  if (msg.includes("NOT_CLAIMER")) return "Only the person who claimed it can complete it.";
  if (msg.includes("NOT_CONTESTABLE")) return "This can no longer be contested.";
  if (msg.includes("CONTEST_WINDOW_CLOSED")) return "The contest window has closed.";
  if (msg.includes("CANNOT_CONTEST_OWN")) return "You can't contest your own completion.";
  if (msg.includes("NOT_CONTESTED")) return "This task isn't being contested.";
  if (msg.includes("NOT_CONTESTER")) return "Only the person who contested can withdraw it.";
  if (msg.includes("INVALID_POINTS")) return "Points must be at least 1.";
  if (msg.includes("INVALID_KIND")) return "Invalid task type.";
  if (msg.includes("TASK_NOT_FOUND")) return "Task not found.";
  return msg;
}

/* ─── Create ──────────────────────────────────────────────────────────────── */

// kind 'backlog' = post a claimable chore; 'log' = "I just did this" (self-logged done).
export async function createOneOffTask(
  householdId: string,
  name: string,
  points: number,
  kind: OneOffTaskKind,
  description: string | null = null
): Promise<{ id: string | null; status: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("create_one_off_task", {
    p_household_id: householdId,
    p_name: name,
    p_points: points,
    p_description: description,
    p_kind: kind,
  });

  if (error) return { id: null, status: null, error: friendlyError(error.message) };

  const result = data as { id: string; status: string };
  return { id: result.id, status: result.status, error: null };
}

/* ─── Backlog (open + claimed one-off tasks) ──────────────────────────────── */

export interface BacklogTask extends OneOffTask {
  claimedByDisplayName: string | null;
  postedByDisplayName: string | null;
}

export async function getBacklogTasks(
  householdId: string
): Promise<{ tasks: BacklogTask[]; error: string | null }> {
  const { data, error } = await supabase
    .from("one_off_tasks")
    .select(
      "*, claimer:profiles!one_off_tasks_claimed_by_profile_id_fkey(display_name), poster:profiles!one_off_tasks_created_by_profile_id_fkey(display_name)"
    )
    .eq("household_id", householdId)
    .in("status", ["open", "claimed"])
    .order("created_at", { ascending: false });

  if (error) return { tasks: [], error: error.message };

  const tasks: BacklogTask[] = (data ?? []).map((row) => {
    const claimer = row.claimer as unknown as { display_name: string | null } | null;
    const poster = row.poster as unknown as { display_name: string | null } | null;
    return {
      ...mapOneOff(row),
      claimedByDisplayName: claimer?.display_name ?? null,
      postedByDisplayName: poster?.display_name ?? null
    };
  });

  return { tasks, error: null };
}

/* ─── Lifecycle transitions ───────────────────────────────────────────────── */

export async function claimOneOffTask(taskId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("claim_one_off_task", { p_task_id: taskId });
  return { error: error ? friendlyError(error.message) : null };
}

export async function completeOneOffTask(
  taskId: string
): Promise<{ pointsEarned: number; taskName: string; error: string | null }> {
  const { data, error } = await supabase.rpc("complete_one_off_task", { p_task_id: taskId });
  if (error) return { pointsEarned: 0, taskName: "", error: friendlyError(error.message) };
  const result = data as { points_earned: number; task_name: string };
  return { pointsEarned: result.points_earned, taskName: result.task_name, error: null };
}

export async function contestOneOffTask(taskId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("contest_one_off_task", { p_task_id: taskId });
  return { error: error ? friendlyError(error.message) : null };
}

export async function withdrawContestOneOffTask(taskId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("withdraw_contest_one_off_task", { p_task_id: taskId });
  return { error: error ? friendlyError(error.message) : null };
}

// Lazy settlement: settle uncontested completions past their window and revert
// contested ones. Idempotent — safe to call on every screen load.
export async function settleDueOneOffTasks(
  householdId: string
): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase.rpc("settle_due_one_off_tasks", {
    p_household_id: householdId,
  });
  if (error) return { count: 0, error: friendlyError(error.message) };
  return { count: (data as number) ?? 0, error: null };
}

/* ─── Reads for the Activity screen ───────────────────────────────────────── */

// All one-off tasks in the household (used to annotate feed rows with the
// task's live status, so contest/withdraw controls reflect the current state).
export async function getHouseholdOneOffs(
  householdId: string
): Promise<{ tasks: OneOffTask[]; error: string | null }> {
  const { data, error } = await supabase
    .from("one_off_tasks")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) return { tasks: [], error: error.message };
  return { tasks: (data ?? []).map(mapOneOff), error: null };
}

export async function getHouseholdActivity(
  householdId: string,
  limit = 100
): Promise<{ events: HouseholdActivity[]; error: string | null }> {
  const { data, error } = await supabase
    .from("household_activity")
    .select(
      "*, actor:profiles!household_activity_actor_profile_id_fkey(display_name)"
    )
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { events: [], error: error.message };

  const events: HouseholdActivity[] = (data ?? []).map((row) => {
    const actor = row.actor as unknown as { display_name: string | null } | null;
    return {
      id: row.id as string,
      householdId: row.household_id as string,
      actorProfileId: row.actor_profile_id as string,
      actorDisplayName: actor?.display_name ?? null,
      kind: row.kind as HouseholdActivityKind,
      pointsDelta: (row.points_delta as number | null) ?? null,
      refId: (row.ref_id as string | null) ?? null,
      metadata: (row.metadata as Record<string, unknown> | null) ?? null,
      createdAt: row.created_at as string,
    };
  });

  return { events, error: null };
}
