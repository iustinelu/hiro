import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { RecurringTask, LeaderboardEntry, TaskCadence, CadenceMeta, OneOffTaskKind } from "@hiro/domain";
import { MobileButton, MobileCard, MobileTaskRow, useTheme } from "@hiro/ui-primitives/mobile";
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
  cadenceLabel,
} from "../lib/taskService";
import { createOneOffTask, getBacklogTasks, type BacklogTask } from "../lib/oneOffService";
import { registerForPushNotifications } from "../lib/notificationService";
import { TaskCreateModal } from "./TaskCreateModal";
import { WeekLeaderboardCard } from "./home/WeekLeaderboardCard";
import { PointsBurst, AllDoneCelebration } from "./celebrations";
import { useOnboardingTour, type TourStep } from "../onboarding/OnboardingTourProvider";
import { OnboardingTourCard } from "../onboarding/OnboardingTourCard";
import { TourSpotlight } from "../onboarding/TourSpotlight";

/** Steps whose coaching card lives on Home (the rest play out on Rewards). */
const isHomeStep = (s: TourStep) => s === "create" || s === "complete" || s === "celebrate" || s === "notify";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface CompletionResult { pointsEarned: number; taskName: string; }

export function HomeScreen() {
  const t = useTheme();
  const navigation = useNavigation<{ navigate: (name: string, params?: Record<string, unknown>) => void }>();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [upForGrabs, setUpForGrabs] = useState<BacklogTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [lastCompletion, setLastCompletion] = useState<CompletionResult | null>(null);
  const [combo, setCombo] = useState(0);
  const [showAllDone, setShowAllDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [undoableTaskId, setUndoableTaskId] = useState<string | null>(null);

  /* ── Onboarding tour ─────────────────────────────────────────────────── */
  const { tourActive, tourStep, setTourStep, endTour } = useOnboardingTour();
  const [notifLoading, setNotifLoading] = useState(false);
  // Counts at the moment the tour (re)starts. Advancing requires progress made
  // *during* the tour, so a Replay for an established user still walks the full
  // create → complete → celebrate flow instead of jumping to the end.
  const tourBaseline = useRef({ tasks: 0, completions: 0 });
  const prevTourStep = useRef<TourStep | null>(null);

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
    const [tasksRes, completionsRes, lbRes, streakRes, backlogRes] = await Promise.all([
      getHouseholdTasks(householdId),
      getTodayCompletions(profileId),
      getWeeklyLeaderboard(householdId),
      getStreak(profileId),
      getBacklogTasks(householdId),
    ]);
    setTasks(tasksRes.tasks);
    setCompletedIds(new Set(completionsRes.completedTaskIds));
    setLeaderboard(lbRes.entries);
    setStreak(streakRes.streak);
    setUpForGrabs(backlogRes.tasks.filter((task) => task.status === "open").slice(0, 3));
    setLoading(false);
  }, [householdId, profileId]);

  /* Refetch on focus — tab screens stay mounted, so a task archived from the
   * Tasks tab must drop off Home's "Today's Tasks" on revisit. The mount case is
   * still covered: the callback identity changes once householdId/profileId
   * resolve, re-running the focus effect. Silent refresh (loading already false). */
  useFocusEffect(
    useCallback(() => {
      if (householdId && profileId) void fetchData();
    }, [householdId, profileId, fetchData])
  );

  /* ── Auto-dismiss undo after 5 seconds ───────────────────────────────── */
  useEffect(() => {
    if (!undoableTaskId) return;
    const timer = setTimeout(() => setUndoableTaskId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoableTaskId]);

  /* Snapshot baseline only on the transition INTO "create" (not every render),
   * so a real new task still advances the step and Replay re-captures cleanly. */
  useEffect(() => {
    if (!tourActive) { prevTourStep.current = null; return; }
    if (tourStep === "create" && prevTourStep.current !== "create") {
      tourBaseline.current = { tasks: tasks.length, completions: completedIds.size };
    }
    prevTourStep.current = tourStep;
  }, [tourActive, tourStep, tasks.length, completedIds.size]);

  /* ── Tour: auto-advance as the user performs each real action ──────────── */
  useEffect(() => {
    if (!tourActive) return;
    if (tourStep === "create" && tasks.length > tourBaseline.current.tasks) {
      setTourStep("complete");
    } else if (tourStep === "complete" && completedIds.size > tourBaseline.current.completions) {
      setTourStep("celebrate");
    }
  }, [tourActive, tourStep, tasks.length, completedIds.size]);

  const handleEnableNotifications = useCallback(async () => {
    setNotifLoading(true);
    // Push (HIR-66) is live: the tour's contextual prompt both asks OS permission
    // and registers this device's push token. Never throws; ends the tour either way.
    await registerForPushNotifications();
    setNotifLoading(false);
    endTour();
  }, [endTour]);

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

  /* ── Create a one-off task (parity with the Tasks tab) ───────────────────── */
  const handleCreateOneOff = useCallback(async (
    name: string, points: number, kind: OneOffTaskKind, description: string | null
  ) => {
    if (!householdId) return;
    const result = await createOneOffTask(householdId, name, points, kind, description);
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
  const firstPendingId = todayTasks.find((task) => !completedIds.has(task.id))?.id ?? null;

  const handleBurstComplete = useCallback(() => {
    setLastCompletion(null);
    // During the tour the coaching card is the celebration; don't stack the
    // full-screen "all done" modal on top of it.
    if (allDone && !tourActive) setShowAllDone(true);
  }, [allDone, tourActive]);

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
                const isTourTarget = tourActive && tourStep === "complete" && !done && task.id === firstPendingId;
                const row = (
                  <MobileTaskRow
                    title={task.name}
                    meta={cadenceLabel(task.cadence, task.cadenceMeta)}
                    points={task.points}
                    completed={done}
                    leading={{
                      kind: "checkbox",
                      busy: completing === task.id,
                      onToggle: () => { if (!done) void handleComplete(task.id); },
                    }}
                    actions={canUndo ? (
                      <MobileButton label="Undo" variant="ghost" size="sm" onPress={() => void handleUndo(task.id)} />
                    ) : undefined}
                  />
                );
                return (
                  <View key={task.id}>
                    {isTourTarget ? <TourSpotlight active>{row}</TourSpotlight> : row}
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ marginTop: t.spacing.sm }}>
            <MobileButton label="+ Add task" variant="ghost" size="sm" onPress={() => setModalOpen(true)} />
          </View>
        </MobileCard>

        {/* Up for grabs — claimable backlog chores */}
        {upForGrabs.length > 0 && (
          <MobileCard title="Up for grabs" description="Claimable one-off chores">
            <View style={{ gap: t.spacing.sm }}>
              {upForGrabs.map((item) => (
                <MobileTaskRow
                  key={item.id}
                  title={item.name}
                  meta={`Posted by ${item.postedByDisplayName ?? "someone"}`}
                  points={item.points}
                  leading={{ kind: "glyph", icon: "tasks" }}
                  onPress={() => navigation.navigate("tasks", { focusBacklog: true })}
                />
              ))}
              <View style={{ marginTop: t.spacing.xs }}>
                <MobileButton
                  label="See all in Backlog"
                  variant="ghost"
                  size="sm"
                  onPress={() => navigation.navigate("tasks", { focusBacklog: true })}
                />
              </View>
            </View>
          </MobileCard>
        )}

        {/* This Week leaderboard */}
        <WeekLeaderboardCard leaderboard={leaderboard} profileId={profileId} />
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
        onCreateOneOff={handleCreateOneOff}
      />

      {tourActive && !modalOpen && isHomeStep(tourStep) && (
        <OnboardingTourCard
          step={tourStep}
          pointsEarned={totalPointsToday}
          streak={streak}
          notifLoading={notifLoading}
          onAddChore={() => setModalOpen(true)}
          onAdvance={() => { setTourStep("reward-create"); navigation.navigate("rewards"); }}
          onEnableNotifications={() => void handleEnableNotifications()}
          onSkip={endTour}
        />
      )}
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
