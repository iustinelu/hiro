import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { RecurringTask, LeaderboardEntry, TaskCadence, CadenceMeta } from "@hiro/domain";
import { MobileButton, MobileCard, useTheme } from "@hiro/ui-primitives/mobile";
import { supabase } from "../lib/supabase";
import {
  getHouseholdTasks,
  getTodayCompletions,
  getWeeklyLeaderboard,
  getStreak,
  completeTask,
  uncompleteTask,
  createTask,
  isDueToday,
} from "../lib/taskService";
import { TaskCreateModal } from "./TaskCreateModal";
import { PointsBurst, AllDoneCelebration } from "./celebrations";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface CompletionResult { pointsEarned: number; taskName: string; }

export function HomeScreen() {
  const t = useTheme();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [lastCompletion, setLastCompletion] = useState<CompletionResult | null>(null);
  const [combo, setCombo] = useState(0);
  const [showAllDone, setShowAllDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [undoableTaskId, setUndoableTaskId] = useState<string | null>(null);

  /* ── Bootstrap profile + household ───────────────────────────────────── */
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

  /* ── Data fetching ───────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!householdId || !profileId) return;
    const [tasksRes, completionsRes, lbRes, streakRes] = await Promise.all([
      getHouseholdTasks(householdId),
      getTodayCompletions(profileId),
      getWeeklyLeaderboard(householdId),
      getStreak(profileId),
    ]);
    setTasks(tasksRes.tasks);
    setCompletedIds(new Set(completionsRes.completedTaskIds));
    setLeaderboard(lbRes.entries);
    setStreak(streakRes.streak);
    setLoading(false);
  }, [householdId, profileId]);

  useEffect(() => { if (householdId && profileId) void fetchData(); }, [fetchData, householdId, profileId]);

  /* ── Auto-dismiss undo after 5 seconds ───────────────────────────────── */
  useEffect(() => {
    if (!undoableTaskId) return;
    const timer = setTimeout(() => setUndoableTaskId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoableTaskId]);

  /* ── Complete a task ─────────────────────────────────────────────────── */
  const handleComplete = useCallback(async (taskId: string) => {
    if (completing || !householdId || !profileId) return;
    setCompleting(taskId);
    const result = await completeTask(taskId);
    if (!result.error) {
      setCompletedIds((prev) => new Set(prev).add(taskId));
      setCombo((prev) => prev + 1);
      setLastCompletion({ pointsEarned: result.pointsEarned, taskName: result.taskName });
      setUndoableTaskId(taskId);
      const [lbRes, streakRes] = await Promise.all([
        getWeeklyLeaderboard(householdId),
        getStreak(profileId),
      ]);
      setLeaderboard(lbRes.entries);
      setStreak(streakRes.streak);
    }
    setCompleting(null);
  }, [completing, householdId, profileId]);

  /* ── Undo a completion ───────────────────────────────────────────────── */
  const handleUndo = useCallback(async (taskId: string) => {
    if (!householdId || !profileId) return;
    setUndoableTaskId(null);
    const result = await uncompleteTask(taskId, profileId);
    if (!result.error) {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setCombo((prev) => Math.max(0, prev - 1));
      const [lbRes, streakRes] = await Promise.all([
        getWeeklyLeaderboard(householdId),
        getStreak(profileId),
      ]);
      setLeaderboard(lbRes.entries);
      setStreak(streakRes.streak);
    }
  }, [profileId, householdId]);

  /* ── Create a task ───────────────────────────────────────────────────── */
  const handleCreate = useCallback(async (
    name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, _description: string | null
  ) => {
    if (!householdId) return;
    const result = await createTask(householdId, name, points, cadence, cadenceMeta);
    if (result.error) throw new Error(result.error);
    await fetchData();
  }, [householdId, fetchData]);

  /* ── Derived data ────────────────────────────────────────────────────── */
  const todayTasks = tasks.filter(isDueToday);
  const doneCount = todayTasks.filter((task) => completedIds.has(task.id)).length;
  const totalPointsToday = useMemo(
    () => todayTasks.filter((task) => completedIds.has(task.id)).reduce((sum, task) => sum + task.points, 0),
    [todayTasks, completedIds],
  );
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;

  const handleBurstComplete = useCallback(() => {
    setLastCompletion(null);
    if (allDone) setShowAllDone(true);
  }, [allDone]);

  const containerStyle = { padding: t.spacing.lg, gap: t.spacing.md };

  /* ── Bootstrap / no-household / loading states ───────────────────────── */
  if (!bootstrapped || loading) {
    if (bootstrapped && !householdId) {
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={containerStyle}>
          <MobileCard title="No household yet">
            <Text style={mutedText(t)}>Join or create a household to start tracking tasks.</Text>
          </MobileCard>
        </ScrollView>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={mutedText(t)}>Loading your dashboard…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={containerStyle}>
        {/* Greeting + streak */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.titleSize, fontWeight: "800" }}>
            {getGreeting()}
          </Text>
          {streak > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs, paddingVertical: t.spacing.xs, paddingHorizontal: t.spacing.sm, borderRadius: t.radius.pill, backgroundColor: t.color.surface, borderWidth: 1, borderColor: t.color.border }}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={{ color: t.color.accent, fontFamily: t.typography.fontFamily, fontWeight: "800", fontSize: t.typography.bodySmallSize }}>{streak}</Text>
            </View>
          )}
        </View>

        {/* Today's Tasks */}
        <MobileCard title="Today's Tasks" description={todayTasks.length > 0 ? `${doneCount}/${todayTasks.length} done` : undefined}>
          {todayTasks.length === 0 ? (
            <Text style={mutedText(t)}>No tasks scheduled for today.</Text>
          ) : (
            <View style={{ gap: t.spacing.sm }}>
              {todayTasks.map((task) => {
                const done = completedIds.has(task.id);
                const canUndo = done && undoableTaskId === task.id;
                return (
                  <View
                    key={task.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: t.spacing.sm,
                      paddingVertical: t.spacing.xs,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: done ? t.color.inkSoft : t.color.ink,
                        textDecorationLine: done ? "line-through" : "none",
                        fontFamily: t.typography.fontFamily,
                        fontSize: t.typography.bodySize,
                      }}
                    >
                      {task.name}
                    </Text>
                    <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>
                      {task.points} pts
                    </Text>
                    {done ? (
                      canUndo ? (
                        <MobileButton label="Undo" variant="ghost" size="sm" onPress={() => void handleUndo(task.id)} />
                      ) : (
                        <Text style={{ color: t.color.success, fontSize: 16, fontWeight: "800" }}>✓</Text>
                      )
                    ) : (
                      <MobileButton
                        label={completing === task.id ? "…" : "Done"}
                        variant="primary"
                        size="sm"
                        disabled={completing === task.id}
                        onPress={() => void handleComplete(task.id)}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ marginTop: t.spacing.sm }}>
            <MobileButton label="+ Add task" variant="ghost" size="sm" onPress={() => setModalOpen(true)} />
          </View>
        </MobileCard>

        {/* This Week leaderboard */}
        <MobileCard title="This Week">
          {leaderboard.length === 0 ? (
            <Text style={mutedText(t)}>No points scored yet this week.</Text>
          ) : (
            <View style={{ gap: t.spacing.sm }}>
              {leaderboard.map((entry, i) => {
                const isMe = entry.profileId === profileId;
                return (
                  <View key={entry.profileId} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                    <Text style={{ color: t.color.inkSoft, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, width: 22 }}>{i + 1}.</Text>
                    <Text
                      numberOfLines={1}
                      style={{ flex: 1, color: isMe ? t.color.accent : t.color.ink, fontFamily: t.typography.fontFamily, fontWeight: isMe ? "800" : "600", fontSize: t.typography.bodySize }}
                    >
                      {entry.displayName ?? "Member"}
                    </Text>
                    <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize }}>{entry.pointsThisWeek} pts</Text>
                  </View>
                );
              })}
            </View>
          )}
        </MobileCard>
      </ScrollView>

      {lastCompletion && (
        <PointsBurst
          points={lastCompletion.pointsEarned}
          taskName={lastCompletion.taskName}
          combo={combo}
          onComplete={handleBurstComplete}
        />
      )}

      {showAllDone && (
        <AllDoneCelebration totalPoints={totalPointsToday} onDismiss={() => setShowAllDone(false)} />
      )}

      <TaskCreateModal
        open={modalOpen}
        editingTask={null}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        onUpdate={async () => {}}
      />
    </View>
  );
}

function mutedText(t: ReturnType<typeof useTheme>) {
  return {
    color: t.color.inkMuted,
    fontFamily: t.typography.fontFamily,
    fontSize: t.typography.bodySmallSize,
  };
}
