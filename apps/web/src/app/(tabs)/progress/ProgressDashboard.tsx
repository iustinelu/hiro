"use client";

import useSWR from "swr";
import type { PersonalStats, DailyPoints, LeaderboardEntry, TaskStats } from "@hiro/domain";
import { getPersonalStats, getWeeklyPointsTrend, getTaskStats } from "../../../lib/progressService";
import { getWeeklyLeaderboard } from "../../../lib/taskService";
import { cacheKeys } from "../../../lib/cacheKeys";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { HomeLeaderboard } from "../home/HomeLeaderboard";
import { StatsGrid } from "./StatsGrid";
import { WeeklyChart } from "./WeeklyChart";
import { TaskBreakdown } from "./TaskBreakdown";
import styles from "./progress.module.css";

interface Props {
  householdId: string;
  profileId: string;
}

interface ProgressData {
  stats: PersonalStats | null;
  trend: DailyPoints[];
  leaderboard: LeaderboardEntry[];
  taskStats: TaskStats[];
}

async function fetchProgressData(householdId: string, profileId: string): Promise<ProgressData> {
  const [statsRes, trendRes, leaderboardRes, taskStatsRes] = await Promise.all([
    getPersonalStats(profileId, householdId),
    getWeeklyPointsTrend(householdId, profileId),
    getWeeklyLeaderboard(householdId),
    getTaskStats(householdId),
  ]);
  return {
    stats: statsRes.stats,
    trend: trendRes.trend,
    leaderboard: leaderboardRes.entries,
    taskStats: taskStatsRes.taskStats,
  };
}

export function ProgressDashboard({ householdId, profileId }: Props) {
  const { data, isLoading } = useSWR(
    cacheKeys.progress(householdId, profileId),
    () => fetchProgressData(householdId, profileId),
  );

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats ?? null;
  const trend = data?.trend ?? [];
  const leaderboard = data?.leaderboard ?? [];
  const taskStats = data?.taskStats ?? [];

  const isEmpty =
    !stats ||
    (stats.pointsThisWeek === 0 &&
      stats.totalPointsAllTime === 0 &&
      stats.completionsThisWeek === 0 &&
      stats.streak === 0);

  if (isEmpty) {
    return <p className={styles.emptyState}>Complete your first task to see progress here.</p>;
  }

  return (
    <div className={styles.dashboard}>
      <StatsGrid stats={stats!} />
      <WeeklyChart trend={trend} />
      <HomeLeaderboard entries={leaderboard} profileId={profileId} />
      <TaskBreakdown taskStats={taskStats} />
    </div>
  );
}
