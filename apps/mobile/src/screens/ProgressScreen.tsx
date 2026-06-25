import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { DailyPoints, LeaderboardEntry, PersonalStats, TaskStats } from "@hiro/domain";
import { MobileEmptyStatePanel, useTheme } from "@hiro/ui-primitives/mobile";
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
  useEffect(() => {
    if (!bootstrapped || !profileId || !householdId) {
      if (bootstrapped) setLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      const [statsRes, trendRes, leaderboardRes, taskStatsRes] = await Promise.all([
        getPersonalStats(profileId, householdId),
        getWeeklyPointsTrend(householdId, profileId),
        getWeeklyLeaderboard(householdId),
        getTaskStats(householdId),
      ]);
      if (!active) return;
      setStats(statsRes.stats);
      setTrend(trendRes.trend);
      setLeaderboard(leaderboardRes.entries);
      setTaskStats(taskStatsRes.taskStats);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [bootstrapped, profileId, householdId]);

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
        <MobileEmptyStatePanel
          title="No progress yet"
          description="Complete your first task to see progress here."
          icon="empty"
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
