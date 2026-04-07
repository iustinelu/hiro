"use client";

import { useEffect, useState } from "react";
import type { PersonalStats, DailyPoints, LeaderboardEntry, TaskStats } from "@hiro/domain";
import { getPersonalStats, getWeeklyPointsTrend, getTaskStats } from "../../../lib/progressService";
import { getWeeklyLeaderboard } from "../../../lib/taskService";
import { HomeLeaderboard } from "../home/HomeLeaderboard";
import { StatsGrid } from "./StatsGrid";
import { WeeklyChart } from "./WeeklyChart";
import { TaskBreakdown } from "./TaskBreakdown";
import styles from "./progress.module.css";

interface Props {
  householdId: string;
  profileId: string;
}

export function ProgressDashboard({ householdId, profileId }: Props) {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [trend, setTrend] = useState<DailyPoints[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      const [statsRes, trendRes, leaderboardRes, taskStatsRes] = await Promise.all([
        getPersonalStats(profileId, householdId),
        getWeeklyPointsTrend(householdId, profileId),
        getWeeklyLeaderboard(householdId),
        getTaskStats(householdId),
      ]);

      if (cancelled) return;

      setStats(statsRes.stats);
      setTrend(trendRes.trend);
      setLeaderboard(leaderboardRes.entries);
      setTaskStats(taskStatsRes.taskStats);
      setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [householdId, profileId]);

  if (loading) {
    return <p className={styles.loading}>Loading your progress...</p>;
  }

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
