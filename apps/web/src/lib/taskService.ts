"use client";

import type { RecurringTask, TaskCadence, CadenceMeta, LeaderboardEntry } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";

export async function createTask(
  householdId: string,
  name: string,
  points: number,
  cadence: TaskCadence,
  cadenceMeta: CadenceMeta
): Promise<{ task: RecurringTask | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data: profileId } = await supabase.rpc("current_profile_id");
  if (!profileId) return { task: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("recurring_tasks")
    .insert({
      household_id: householdId,
      name,
      points,
      cadence,
      cadence_meta: cadenceMeta,
      created_by_profile_id: profileId,
    })
    .select()
    .single();

  if (error) return { task: null, error: error.message };

  return {
    task: {
      id: data.id,
      householdId: data.household_id,
      name: data.name,
      description: data.description,
      points: data.points,
      cadence: data.cadence as TaskCadence,
      cadenceMeta: data.cadence_meta as CadenceMeta,
      createdByProfileId: data.created_by_profile_id,
      isArchived: data.is_archived,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    error: null,
  };
}

export async function updateTask(
  taskId: string,
  updates: { name?: string; points?: number; cadence?: TaskCadence; cadenceMeta?: CadenceMeta; description?: string | null }
): Promise<{ task: RecurringTask | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.points !== undefined) payload.points = updates.points;
  if (updates.cadence !== undefined) payload.cadence = updates.cadence;
  if (updates.cadenceMeta !== undefined) payload.cadence_meta = updates.cadenceMeta;
  if (updates.description !== undefined) payload.description = updates.description;

  const { data, error } = await supabase
    .from("recurring_tasks")
    .update(payload)
    .eq("id", taskId)
    .select()
    .single();

  if (error) return { task: null, error: error.message };

  return {
    task: {
      id: data.id,
      householdId: data.household_id,
      name: data.name,
      description: data.description,
      points: data.points,
      cadence: data.cadence as TaskCadence,
      cadenceMeta: data.cadence_meta as CadenceMeta,
      createdByProfileId: data.created_by_profile_id,
      isArchived: data.is_archived,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    error: null,
  };
}

export async function archiveTask(taskId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("recurring_tasks")
    .update({ is_archived: true })
    .eq("id", taskId);

  return { error: error?.message ?? null };
}

export async function getHouseholdTasks(
  householdId: string
): Promise<{ tasks: RecurringTask[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("recurring_tasks")
    .select("*")
    .eq("household_id", householdId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) return { tasks: [], error: error.message };

  const tasks: RecurringTask[] = (data ?? []).map((row) => ({
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    description: row.description,
    points: row.points,
    cadence: row.cadence as TaskCadence,
    cadenceMeta: row.cadence_meta as CadenceMeta,
    createdByProfileId: row.created_by_profile_id,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { tasks, error: null };
}

export async function completeTask(
  taskId: string
): Promise<{ pointsEarned: number; taskName: string; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("complete_task", { p_task_id: taskId });

  if (error) {
    if (error.message.includes("TASK_NOT_FOUND")) return { pointsEarned: 0, taskName: "", error: "Task not found." };
    if (error.message.includes("TASK_ARCHIVED")) return { pointsEarned: 0, taskName: "", error: "Task is archived." };
    if (error.message.includes("NOT_HOUSEHOLD_MEMBER")) return { pointsEarned: 0, taskName: "", error: "You are not a member of this household." };
    return { pointsEarned: 0, taskName: "", error: error.message };
  }

  const result = data as { points_earned: number; task_name: string };
  return { pointsEarned: result.points_earned, taskName: result.task_name, error: null };
}

export async function uncompleteTask(
  taskId: string,
  profileId: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  // Find the most recent completion of this task by this user today
  const { data, error: fetchError } = await supabase
    .from("task_completions")
    .select("id")
    .eq("task_id", taskId)
    .eq("completed_by_profile_id", profileId)
    .gte("completed_at", todayStart)
    .lt("completed_at", tomorrowStart)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!data) return { error: "No completion found to undo." };

  const { error: deleteError } = await supabase
    .from("task_completions")
    .delete()
    .eq("id", data.id);

  if (deleteError) return { error: deleteError.message };
  return { error: null };
}

export async function getTodayCompletions(
  profileId: string
): Promise<{ completedTaskIds: string[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { data, error } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("completed_by_profile_id", profileId)
    .gte("completed_at", todayStart)
    .lt("completed_at", tomorrowStart);

  if (error) return { completedTaskIds: [], error: error.message };

  const completedTaskIds = (data ?? []).map((row) => row.task_id as string);
  return { completedTaskIds, error: null };
}

export async function getWeeklyLeaderboard(
  householdId: string
): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const weekStartIso = weekStart.toISOString();

  const { data, error } = await supabase
    .from("task_completions")
    .select("completed_by_profile_id, points_earned, profiles(id, display_name)")
    .eq("household_id", householdId)
    .gte("completed_at", weekStartIso);

  if (error) return { entries: [], error: error.message };

  const map = new Map<string, { displayName: string | null; points: number }>();
  for (const row of data ?? []) {
    const pid = row.completed_by_profile_id as string;
    const existing = map.get(pid);
    const profile = row.profiles as unknown as { id: string; display_name: string | null } | null;
    if (existing) {
      existing.points += row.points_earned as number;
    } else {
      map.set(pid, { displayName: profile?.display_name ?? null, points: row.points_earned as number });
    }
  }

  const entries: LeaderboardEntry[] = Array.from(map.entries())
    .map(([profileId, { displayName, points }]) => ({ profileId, displayName, pointsThisWeek: points }))
    .sort((a, b) => b.pointsThisWeek - a.pointsThisWeek);

  return { entries, error: null };
}

export async function getStreak(
  profileId: string
): Promise<{ streak: number; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("task_completions")
    .select("completed_at")
    .eq("completed_by_profile_id", profileId)
    .order("completed_at", { ascending: false })
    .limit(365);

  if (error) return { streak: 0, error: error.message };
  if (!data || data.length === 0) return { streak: 0, error: null };

  const dates = new Set<string>();
  for (const row of data) {
    const d = new Date(row.completed_at as string);
    dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const sortedDates = Array.from(dates)
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayKey = new Date(todayKey.getTime() - 86400000);

  let streak = 0;
  let expected = todayKey;

  // Grace period: if today has no completions, start from yesterday
  if (sortedDates.length > 0 && sortedDates[0].getTime() < todayKey.getTime()) {
    expected = yesterdayKey;
  }

  for (const date of sortedDates) {
    if (date.getTime() === expected.getTime()) {
      streak++;
      expected = new Date(expected.getTime() - 86400000);
    } else if (date.getTime() < expected.getTime()) {
      break;
    }
  }

  return { streak, error: null };
}
