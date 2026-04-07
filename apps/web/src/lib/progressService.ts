"use client";

import type { DailyPoints, PersonalStats, TaskStats } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";
import { getStreak } from "./taskService";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function mondayOfWeek(date: Date, weekOffset = 0): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + weekOffset * 7);
  return d;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ─── getPersonalStats ──────────────────────────────────────────────────── */

export async function getPersonalStats(
  profileId: string,
  householdId: string
): Promise<{ stats: PersonalStats | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const thisWeekStart = mondayOfWeek(now);
  const lastWeekStart = mondayOfWeek(now, -1);

  // Fetch all completions from last 2 weeks + all-time for this user in household
  const { data, error } = await supabase
    .from("task_completions")
    .select("points_earned, completed_at")
    .eq("completed_by_profile_id", profileId)
    .eq("household_id", householdId)
    .order("completed_at", { ascending: false });

  if (error) return { stats: null, error: error.message };

  const thisWeekIso = thisWeekStart.getTime();
  const lastWeekIso = lastWeekStart.getTime();

  let pointsThisWeek = 0;
  let pointsLastWeek = 0;
  let completionsThisWeek = 0;
  let completionsLastWeek = 0;
  let totalPointsAllTime = 0;

  for (const row of data ?? []) {
    const pts = row.points_earned as number;
    const ts = new Date(row.completed_at as string).getTime();
    totalPointsAllTime += pts;
    if (ts >= thisWeekIso) {
      pointsThisWeek += pts;
      completionsThisWeek++;
    } else if (ts >= lastWeekIso) {
      pointsLastWeek += pts;
      completionsLastWeek++;
    }
  }

  const { streak } = await getStreak(profileId);

  return {
    stats: {
      pointsThisWeek,
      pointsLastWeek,
      completionsThisWeek,
      completionsLastWeek,
      streak,
      totalPointsAllTime,
    },
    error: null,
  };
}

/* ─── getWeeklyPointsTrend ──────────────────────────────────────────────── */

export async function getWeeklyPointsTrend(
  householdId: string,
  profileId: string
): Promise<{ trend: DailyPoints[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const weekStart = mondayOfWeek(now);
  const weekStartIso = weekStart.toISOString();

  const { data, error } = await supabase
    .from("task_completions")
    .select("points_earned, completed_at")
    .eq("household_id", householdId)
    .eq("completed_by_profile_id", profileId)
    .gte("completed_at", weekStartIso);

  if (error) return { trend: [], error: error.message };

  // Group by date
  const byDate = new Map<string, { points: number; completions: number }>();
  for (const row of data ?? []) {
    const d = new Date(row.completed_at as string);
    const key = formatDate(d);
    const existing = byDate.get(key);
    if (existing) {
      existing.points += row.points_earned as number;
      existing.completions++;
    } else {
      byDate.set(key, { points: row.points_earned as number, completions: 1 });
    }
  }

  // Fill in all 7 days Mon-Sun
  const trend: DailyPoints[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = formatDate(d);
    const entry = byDate.get(key);
    trend.push({
      date: key,
      points: entry?.points ?? 0,
      completions: entry?.completions ?? 0,
    });
  }

  return { trend, error: null };
}

/* ─── getTaskStats ──────────────────────────────────────────────────────── */

export async function getTaskStats(
  householdId: string
): Promise<{ taskStats: TaskStats[]; error: string | null }> {
  const supabase = getSupabaseBrowserClient();

  const now = new Date();
  const weekStart = mondayOfWeek(now);
  const weekStartIso = weekStart.toISOString();

  // Fetch active tasks + this week's completions in parallel
  const [tasksRes, completionsRes] = await Promise.all([
    supabase
      .from("recurring_tasks")
      .select("id, name, points")
      .eq("household_id", householdId)
      .eq("is_archived", false),
    supabase
      .from("task_completions")
      .select("task_id")
      .eq("household_id", householdId)
      .gte("completed_at", weekStartIso),
  ]);

  if (tasksRes.error) return { taskStats: [], error: tasksRes.error.message };
  if (completionsRes.error) return { taskStats: [], error: completionsRes.error.message };

  // Count completions per task
  const countMap = new Map<string, number>();
  for (const row of completionsRes.data ?? []) {
    const tid = row.task_id as string;
    countMap.set(tid, (countMap.get(tid) ?? 0) + 1);
  }

  const taskStats: TaskStats[] = (tasksRes.data ?? [])
    .map((t) => ({
      taskId: t.id as string,
      taskName: t.name as string,
      points: t.points as number,
      completionsThisWeek: countMap.get(t.id as string) ?? 0,
    }))
    .sort((a, b) => b.completionsThisWeek - a.completionsThisWeek);

  return { taskStats, error: null };
}
