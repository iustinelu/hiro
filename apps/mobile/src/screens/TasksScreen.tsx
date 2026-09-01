import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutAnimation, Platform, ScrollView, Text, UIManager, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { HouseholdActivity, OneOffTask, RecurringTask, TaskCadence, CadenceMeta, OneOffTaskKind } from "@hiro/domain";
import { MobileButton, MobileCard, MobileIcon, MobileSegmentedControl, useTheme } from "@hiro/ui-primitives/mobile";
import { supabase } from "../lib/supabase";
import {
  getHouseholdTasks,
  getTodayCompletions,
  createTask,
  updateTask,
  archiveTask,
  completeTask,
  uncompleteTask,
  isDueToday,
} from "../lib/taskService";
import {
  createOneOffTask,
  getBacklogTasks,
  getHouseholdActivity,
  getHouseholdOneOffs,
  claimOneOffTask,
  completeOneOffTask,
  contestOneOffTask,
  withdrawContestOneOffTask,
  settleDueOneOffTasks,
  type BacklogTask,
} from "../lib/oneOffService";
import { useReducedMotion } from "../lib/useReducedMotion";
import { TaskCreateModal } from "./TaskCreateModal";
import { BoardView } from "./tasks/BoardView";
import { ManageView } from "./tasks/ManageView";
import { isDoneTodayEvent } from "./tasks/DoneTodaySection";
import { TaskDetailSheet, type DetailTarget } from "./tasks/TaskDetailSheet";
import { PointsBurst } from "./celebrations";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SEGMENTS = [
  { label: "Board", value: "board" },
  { label: "Manage", value: "manage" },
];

interface CompletionResult { pointsEarned: number; taskName: string; }

export function TasksScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const navigation = useNavigation<{ setParams: (p: Record<string, unknown>) => void }>();
  const route = useRoute<{ key: string; name: string; params?: { focusBacklog?: boolean } }>();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [tab, setTab] = useState("board");
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [backlog, setBacklog] = useState<BacklogTask[]>([]);
  const [doneEvents, setDoneEvents] = useState<HouseholdActivity[]>([]);
  const [oneOffsById, setOneOffsById] = useState<Map<string, OneOffTask>>(new Map());
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastCompletion, setLastCompletion] = useState<CompletionResult | null>(null);
  const [undoableTaskId, setUndoableTaskId] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);

  /* ── Bootstrap ───────────────────────────────────────────────────────── */
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

  /* ── Fetch ───────────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!householdId || !profileId) return;
    // Settle any due one-off tasks before reading (lazy settlement, idempotent).
    await settleDueOneOffTasks(householdId);
    const [tasksRes, completionsRes, backlogRes, activityRes, oneOffsRes] = await Promise.all([
      getHouseholdTasks(householdId),
      getTodayCompletions(profileId),
      getBacklogTasks(householdId),
      getHouseholdActivity(householdId),
      getHouseholdOneOffs(householdId),
    ]);
    setTasks(tasksRes.tasks);
    setCompletedIds(new Set(completionsRes.completedTaskIds));
    setBacklog(backlogRes.tasks);
    setDoneEvents(activityRes.events.filter(isDoneTodayEvent));
    setOneOffsById(new Map(oneOffsRes.tasks.map((o) => [o.id, o])));
    setLoading(false);
  }, [householdId, profileId]);

  useFocusEffect(
    useCallback(() => {
      if (!bootstrapped) return;
      if (!householdId || !profileId) { setLoading(false); return; }
      void fetchData();
    }, [bootstrapped, householdId, profileId, fetchData])
  );

  /* Deep-link from Home's "Up for grabs" strip lands on the board (Up for grabs
   * lives in the single scrolling board now, so selecting the Board segment is
   * enough to surface it). */
  useEffect(() => {
    if (route.params?.focusBacklog) {
      setTab("board");
      navigation.setParams({ focusBacklog: undefined });
    }
  }, [route.params?.focusBacklog, navigation]);

  /* Auto-dismiss the undo affordance after 5s (matches Home). */
  useEffect(() => {
    if (!undoableTaskId) return;
    const timer = setTimeout(() => setUndoableTaskId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoableTaskId]);

  /* ── Completion + undo ───────────────────────────────────────────────── */
  const animateReflow = useCallback(() => {
    if (!reducedMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [reducedMotion]);

  const completeRecurring = useCallback(async (taskId: string) => {
    if (busyId) return;
    setBusyId(taskId);
    const result = await completeTask(taskId);
    if (!result.error) {
      animateReflow();
      setCompletedIds((prev) => new Set(prev).add(taskId));
      setUndoableTaskId(taskId);
      if (!reducedMotion) setLastCompletion({ pointsEarned: result.pointsEarned, taskName: result.taskName });
      await fetchData();
    }
    setBusyId(null);
  }, [busyId, animateReflow, reducedMotion, fetchData]);

  const undoRecurring = useCallback(async (taskId: string) => {
    if (!profileId) return;
    setUndoableTaskId(null);
    animateReflow();
    const result = await uncompleteTask(taskId, profileId);
    if (!result.error) {
      setCompletedIds((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
      await fetchData();
    }
  }, [profileId, animateReflow, fetchData]);

  const runOneOff = useCallback(async (
    id: string,
    fn: (id: string) => Promise<{ error: string | null }>,
  ) => {
    if (busyId) return;
    setBusyId(id);
    const result = await fn(id);
    if (!result.error) { animateReflow(); await fetchData(); }
    setBusyId(null);
    setDetailTarget(null);
  }, [busyId, animateReflow, fetchData]);

  const completeOneOff = useCallback(async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    const result = await completeOneOffTask(id);
    if (!result.error) {
      animateReflow();
      if (!reducedMotion) setLastCompletion({ pointsEarned: result.pointsEarned, taskName: result.taskName });
      await fetchData();
    }
    setBusyId(null);
    setDetailTarget(null);
  }, [busyId, animateReflow, reducedMotion, fetchData]);

  /* ── Create / edit / archive ─────────────────────────────────────────── */
  const handleCreate = useCallback(async (
    name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, _description: string | null
  ) => {
    if (!householdId) return;
    const result = await createTask(householdId, name, points, cadence, cadenceMeta);
    if (result.error) throw new Error(result.error);
    await fetchData();
  }, [householdId, fetchData]);

  const handleUpdate = useCallback(async (
    taskId: string,
    updates: { name?: string; points?: number; cadence?: TaskCadence; cadenceMeta?: CadenceMeta; description?: string | null }
  ) => {
    const result = await updateTask(taskId, updates);
    if (result.error) throw new Error(result.error);
    await fetchData();
  }, [fetchData]);

  const handleArchive = useCallback(async (taskId: string) => {
    animateReflow();
    const result = await archiveTask(taskId);
    if (!result.error) setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, [animateReflow]);

  const handleCreateOneOff = useCallback(async (
    name: string, points: number, kind: OneOffTaskKind, description: string | null
  ) => {
    if (!householdId) return;
    const result = await createOneOffTask(householdId, name, points, kind, description);
    if (result.error) throw new Error(result.error);
    await fetchData();
  }, [householdId, fetchData]);

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task: RecurringTask) { setEditingTask(task); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingTask(null); }

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const todayTasks = useMemo(() => tasks.filter(isDueToday), [tasks]);
  const todayPending = useMemo(() => todayTasks.filter((task) => !completedIds.has(task.id)), [todayTasks, completedIds]);
  const doneToday = todayTasks.length - todayPending.length;
  const pointsToday = useMemo(
    () => todayTasks.filter((task) => completedIds.has(task.id)).reduce((sum, task) => sum + task.points, 0),
    [todayTasks, completedIds],
  );
  const progress = todayTasks.length > 0 ? doneToday / todayTasks.length : 0;
  const dateLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
    [],
  );

  const containerStyle = { padding: t.spacing.lg, gap: t.spacing.md, paddingBottom: t.spacing.xxxxl + t.spacing.xxl };

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
        <Text style={mutedText(t)}>Loading tasks…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={containerStyle}>
        {/* Momentum header */}
        <View style={{ gap: t.spacing.sm }}>
          <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {dateLabel}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: t.spacing.sm }}>
            <Text style={{ flex: 1, color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.titleSize, fontWeight: "800" }}>
              {todayTasks.length === 0 ? "No tasks due today" : `${doneToday} of ${todayTasks.length} done today`}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs, paddingVertical: t.spacing.xs, paddingHorizontal: t.spacing.sm, borderRadius: t.radius.pill, backgroundColor: t.color.accentSoft, borderWidth: t.flags.borderWidth, borderColor: t.color.accent }}>
              <Text style={{ color: t.color.accentInk, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, fontWeight: "800" }}>
                +{pointsToday} pts
              </Text>
            </View>
          </View>
          {todayTasks.length > 0 && (
            <View style={{ height: 8, borderRadius: t.radius.pill, backgroundColor: t.color.surfaceStrong, overflow: "hidden" }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: "100%", backgroundColor: t.color.accent, borderRadius: t.radius.pill }} />
            </View>
          )}
        </View>

        <MobileSegmentedControl options={SEGMENTS} value={tab} onChange={setTab} />

        {tab === "board" ? (
          <BoardView
            todayPending={todayPending}
            upForGrabs={backlog}
            doneEvents={doneEvents}
            oneOffsById={oneOffsById}
            profileId={profileId}
            busyId={busyId}
            onToggleComplete={(id) => void completeRecurring(id)}
            onOpenRecurring={(task, completed) => setDetailTarget({ type: "recurring", task, completed })}
            onOpenOneOff={(item) => setDetailTarget({ type: "oneoff", task: item, postedByName: item.postedByDisplayName, claimedByName: item.claimedByDisplayName })}
            onOpenDoneOneOff={(task) => setDetailTarget({ type: "oneoff", task, postedByName: null, claimedByName: null })}
          />
        ) : (
          <ManageView tasks={tasks} onEdit={openEdit} onArchive={(id) => void handleArchive(id)} onCreate={openCreate} />
        )}
      </ScrollView>

      {/* Undo affordance (5s window) */}
      {undoableTaskId && (
        <View style={{ position: "absolute", left: t.spacing.lg, right: t.spacing.lg, bottom: insets.bottom + t.spacing.xxxxl + t.spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.spacing.sm, paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.lg, borderRadius: t.radius.lg, borderWidth: t.flags.borderWidth, borderColor: t.color.border, backgroundColor: t.color.surfaceStrong }}>
          <Text style={{ color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize, fontWeight: "600" }}>
            Marked done
          </Text>
          <MobileButton label="Undo" variant="ghost" size="sm" onPress={() => void undoRecurring(undoableTaskId)} />
        </View>
      )}

      {/* Create FAB (extended) */}
      <View style={{ position: "absolute", right: t.spacing.lg, bottom: insets.bottom + t.spacing.lg, borderRadius: t.radius.lg, elevation: 8 }}>
        <MobileButton
          label="New task"
          variant="primary"
          iconLeft={<MobileIcon name="add" size={18} color={t.color.ink} />}
          onPress={openCreate}
        />
      </View>

      {lastCompletion && (
        <PointsBurst
          points={lastCompletion.pointsEarned}
          taskName={lastCompletion.taskName}
          combo={1}
          onComplete={() => setLastCompletion(null)}
        />
      )}

      <TaskDetailSheet
        target={detailTarget}
        profileId={profileId}
        busy={busyId !== null}
        onClose={() => setDetailTarget(null)}
        onCompleteRecurring={(id) => { setDetailTarget(null); void completeRecurring(id); }}
        onUndoRecurring={(id) => { setDetailTarget(null); void undoRecurring(id); }}
        onClaim={(id) => void runOneOff(id, claimOneOffTask)}
        onCompleteOneOff={(id) => void completeOneOff(id)}
        onContest={(id) => void runOneOff(id, contestOneOffTask)}
        onWithdraw={(id) => void runOneOff(id, withdrawContestOneOffTask)}
      />

      <TaskCreateModal
        open={modalOpen}
        editingTask={editingTask}
        onClose={closeModal}
        onSave={handleCreate}
        onUpdate={handleUpdate}
        onCreateOneOff={handleCreateOneOff}
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
