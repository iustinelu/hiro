import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { DailyPoints, HouseholdActivity, LeaderboardEntry, OneOffTask, PersonalStats, TaskStats } from "@hiro/domain";
import { MobileEmptyState, MobileErrorState, MobileSegmentedControl, useTheme } from "@hiro/ui-primitives/mobile";
import { useSessionBootstrap } from "../lib/useSessionBootstrap";
import { getPersonalStats, getWeeklyPointsTrend, getTaskStats } from "../lib/progressService";
import { getWeeklyLeaderboard } from "../lib/taskService";
import {
  getHouseholdActivity,
  getHouseholdOneOffs,
  settleDueOneOffTasks,
  contestOneOffTask,
  withdrawContestOneOffTask,
} from "../lib/oneOffService";
import { StatsGrid } from "./progress/StatsGrid";
import { WeeklyChart } from "./progress/WeeklyChart";
import { TaskBreakdown } from "./progress/TaskBreakdown";
import { Leaderboard } from "./progress/Leaderboard";
import { ActivityFeed } from "./progress/ActivityFeed";

const SEGMENTS = [
  { label: "Trends", value: "trends" },
  { label: "Activity", value: "activity" },
];

export function ProgressScreen() {
  const t = useTheme();

  const { profileId, householdId, bootstrapped } = useSessionBootstrap();

  const [view, setView] = useState("trends");
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [trend, setTrend] = useState<DailyPoints[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [activity, setActivity] = useState<HouseholdActivity[]>([]);
  const [oneOffsById, setOneOffsById] = useState<Map<string, OneOffTask>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  /* ── Parallel data fetch ────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    if (!profileId || !householdId) return;
    // Settle any due one-off tasks before reading, so the feed + leaderboard
    // reflect finalized points (lazy settlement, idempotent).
    await settleDueOneOffTasks(householdId);
    const [statsRes, trendRes, leaderboardRes, taskStatsRes, activityRes, oneOffsRes] = await Promise.all([
      getPersonalStats(profileId, householdId),
      getWeeklyPointsTrend(householdId, profileId),
      getWeeklyLeaderboard(householdId),
      getTaskStats(householdId),
      getHouseholdActivity(householdId),
      getHouseholdOneOffs(householdId),
    ]);
    if (statsRes.error || trendRes.error || leaderboardRes.error || taskStatsRes.error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoadError(false);
    setStats(statsRes.stats);
    setTrend(trendRes.trend);
    setLeaderboard(leaderboardRes.entries);
    setTaskStats(taskStatsRes.taskStats);
    setActivity(activityRes.events);
    setOneOffsById(new Map(oneOffsRes.tasks.map((task) => [task.id, task])));
    setLoading(false);
  }, [profileId, householdId]);

  /* ── Contest / withdraw (Activity feed) ─────────────────────────────────── */
  const handleContest = useCallback(async (taskId: string) => {
    if (busyId) return;
    setBusyId(taskId);
    await contestOneOffTask(taskId);
    await loadData();
    setBusyId(null);
  }, [busyId, loadData]);

  const handleWithdraw = useCallback(async (taskId: string) => {
    if (busyId) return;
    setBusyId(taskId);
    await withdrawContestOneOffTask(taskId);
    await loadData();
    setBusyId(null);
  }, [busyId, loadData]);

  /* Refetch the numbers every time the tab gains focus (tab screens stay
   * mounted, so a plain mount effect would never refresh on revisit). */
  useFocusEffect(
    useCallback(() => {
      if (!bootstrapped) return;
      if (!profileId || !householdId) { setLoading(false); return; }
      void loadData();
    }, [bootstrapped, profileId, householdId, loadData])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /* ── Loading state ──────────────────────────────────────────────────────── */
  if (!bootstrapped || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.color.bg }}>
        <ActivityIndicator color={t.color.accent} />
        <Text
          style={{
            color: t.color.inkMuted,
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySmallSize,
            marginTop: t.spacing.md,
          }}
        >
          Loading your progress...
        </Text>
      </View>
    );
  }

  /* ── Error state ────────────────────────────────────────────────────────── */
  if (loadError) {
    return (
      <View style={{ flex: 1, padding: t.spacing.lg, backgroundColor: t.color.bg }}>
        <MobileErrorState
          description="We couldn't load your progress. Check your connection and try again."
          onRetry={() => { setLoading(true); void loadData(); }}
        />
      </View>
    );
  }

  /* ── Dashboard ──────────────────────────────────────────────────────────── */
  const trendsEmpty =
    !stats ||
    (stats.pointsThisWeek === 0 &&
      stats.totalPointsAllTime === 0 &&
      stats.completionsThisWeek === 0 &&
      stats.streak === 0);

  // Pull-to-refresh (from main) is on the outer ScrollView, so it works in the
  // empty state too. The empty panel renders inside the Trends segment, keeping
  // the Activity segment reachable even before any personal progress exists.
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.color.bg }}
      contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />
      }
    >
      <MobileSegmentedControl options={SEGMENTS} value={view} onChange={setView} />

      {view === "trends" ? (
        trendsEmpty ? (
          <MobileEmptyState
            title="No progress yet"
            description="Complete your first task to see progress here."
          />
        ) : (
          <>
            {stats && <StatsGrid stats={stats} />}
            {trend.length > 0 && <WeeklyChart trend={trend} />}
            {profileId && leaderboard.length > 0 && (
              <Leaderboard entries={leaderboard} profileId={profileId} />
            )}
            {taskStats.length > 0 && <TaskBreakdown taskStats={taskStats} />}
          </>
        )
      ) : (
        <ActivityFeed
          events={activity}
          oneOffsById={oneOffsById}
          profileId={profileId}
          busyId={busyId}
          onContest={handleContest}
          onWithdraw={handleWithdraw}
        />
      )}
    </ScrollView>
  );
}
