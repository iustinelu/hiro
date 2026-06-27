import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { DailyPoints, LeaderboardEntry, PersonalStats, TaskStats } from "@hiro/domain";
import { MobileEmptyState, MobileErrorState, useTheme } from "@hiro/ui-primitives/mobile";
import { supabase } from "../lib/supabase";
import { getPersonalStats, getWeeklyPointsTrend, getTaskStats } from "../lib/progressService";
import { getWeeklyLeaderboard } from "../lib/taskService";
import { StatsGrid } from "./progress/StatsGrid";
import { WeeklyChart } from "./progress/WeeklyChart";
import { TaskBreakdown } from "./progress/TaskBreakdown";
import { Leaderboard } from "./progress/Leaderboard";

export function ProgressScreen() {
  const t = useTheme();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [trend, setTrend] = useState<DailyPoints[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  /* ── Bootstrap profile + household ─────────────────────────────────────── */
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: pid } = await supabase.rpc("current_profile_id");
      if (!active) return;
      if (!pid) { setBootstrapped(true); return; }
      setProfileId(pid as string);
      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("profile_id", pid)
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (membership) setHouseholdId(membership.household_id as string);
      setBootstrapped(true);
    })();
    return () => { active = false; };
  }, []);

  /* ── Parallel data fetch ────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    if (!profileId || !householdId) return;
    const [statsRes, trendRes, leaderboardRes, taskStatsRes] = await Promise.all([
      getPersonalStats(profileId, householdId),
      getWeeklyPointsTrend(householdId, profileId),
      getWeeklyLeaderboard(householdId),
      getTaskStats(householdId),
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
    setLoading(false);
  }, [profileId, householdId]);

  /* Refetch the numbers every time the tab gains focus (tab screens stay
   * mounted, so a plain mount effect would never refresh on revisit). */
  useFocusEffect(
    useCallback(() => {
      if (!bootstrapped) return;
      if (!profileId || !householdId) { setLoading(false); return; }
      void loadData();
    }, [bootstrapped, profileId, householdId, loadData])
  );

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

  /* ── Empty state ────────────────────────────────────────────────────────── */
  const isEmpty =
    !stats ||
    (stats.pointsThisWeek === 0 &&
      stats.totalPointsAllTime === 0 &&
      stats.completionsThisWeek === 0 &&
      stats.streak === 0);

  if (isEmpty) {
    return (
      <View style={{ flex: 1, padding: t.spacing.lg, backgroundColor: t.color.bg }}>
        <MobileEmptyState
          title="No progress yet"
          description="Complete your first task to see progress here."
        />
      </View>
    );
  }

  /* ── Dashboard ──────────────────────────────────────────────────────────── */
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.color.bg }}
      contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}
    >
      {stats && <StatsGrid stats={stats} />}
      {trend.length > 0 && <WeeklyChart trend={trend} />}
      {profileId && leaderboard.length > 0 && (
        <Leaderboard entries={leaderboard} profileId={profileId} />
      )}
      {taskStats.length > 0 && <TaskBreakdown taskStats={taskStats} />}
    </ScrollView>
  );
}
