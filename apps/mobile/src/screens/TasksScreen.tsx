import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { RecurringTask, TaskCadence, CadenceMeta } from "@hiro/domain";
import { MobileButton, MobileCard, MobileSegmentedControl, useTheme } from "@hiro/ui-primitives/mobile";
import { supabase } from "../lib/supabase";
import {
  getHouseholdTasks,
  getTodayCompletions,
  createTask,
  updateTask,
  archiveTask,
  isDueToday,
  cadenceLabel,
} from "../lib/taskService";
import { TaskCreateModal } from "./TaskCreateModal";

const SEGMENTS = [
  { label: "Today", value: "today" },
  { label: "All Tasks", value: "all" },
];

export function TasksScreen() {
  const t = useTheme();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [tab, setTab] = useState("today");
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

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
    const [tasksRes, completionsRes] = await Promise.all([
      getHouseholdTasks(householdId),
      getTodayCompletions(profileId),
    ]);
    setTasks(tasksRes.tasks);
    setCompletedIds(new Set(completionsRes.completedTaskIds));
    setLoading(false);
  }, [householdId, profileId]);

  useEffect(() => { if (householdId && profileId) void fetchData(); }, [fetchData, householdId, profileId]);

  /* ── Actions ─────────────────────────────────────────────────────────── */
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
    const result = await archiveTask(taskId);
    if (!result.error) setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task: RecurringTask) { setEditingTask(task); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingTask(null); }

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const todayTasks = tasks.filter(isDueToday);
  const todayPending = todayTasks.filter((task) => !completedIds.has(task.id));
  const todayDone = todayTasks.filter((task) => completedIds.has(task.id));

  const containerStyle = { padding: t.spacing.lg, gap: t.spacing.md };

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
        <MobileButton label="+ New Task" variant="primary" size="sm" onPress={openCreate} />
        <MobileSegmentedControl options={SEGMENTS} value={tab} onChange={setTab} />

        {tab === "today" ? (
          <TodayView
            pending={todayPending}
            done={todayDone}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted((p) => !p)}
          />
        ) : (
          <AllTasksView tasks={tasks} onEdit={openEdit} onArchive={handleArchive} />
        )}
      </ScrollView>

      <TaskCreateModal
        open={modalOpen}
        editingTask={editingTask}
        onClose={closeModal}
        onSave={handleCreate}
        onUpdate={handleUpdate}
      />
    </View>
  );
}

/* ─── Today View (read-only) ─────────────────────────────────────────────── */
function TodayView({ pending, done, showCompleted, onToggleCompleted }: {
  pending: RecurringTask[]; done: RecurringTask[];
  showCompleted: boolean; onToggleCompleted: () => void;
}) {
  const t = useTheme();
  if (pending.length === 0 && done.length === 0) {
    return (
      <MobileCard>
        <Text style={mutedText(t)}>No tasks scheduled for today.</Text>
      </MobileCard>
    );
  }

  return (
    <MobileCard>
      <View style={{ gap: t.spacing.sm }}>
        {pending.map((task) => (
          <TaskRow key={task.id} name={task.name} points={task.points} />
        ))}

        {done.length > 0 && (
          <>
            <MobileButton
              label={`${showCompleted ? "▼" : "▶"} Completed today (${done.length})`}
              variant="ghost"
              size="sm"
              onPress={onToggleCompleted}
            />
            {showCompleted && done.map((task) => (
              <TaskRow key={task.id} name={task.name} points={task.points} done />
            ))}
          </>
        )}
      </View>
    </MobileCard>
  );
}

/* ─── All Tasks View ─────────────────────────────────────────────────────── */
function AllTasksView({ tasks, onEdit, onArchive }: {
  tasks: RecurringTask[];
  onEdit: (task: RecurringTask) => void;
  onArchive: (id: string) => void;
}) {
  const t = useTheme();
  if (tasks.length === 0) {
    return (
      <MobileCard>
        <Text style={mutedText(t)}>No tasks yet. Create your first one!</Text>
      </MobileCard>
    );
  }

  return (
    <MobileCard>
      <View style={{ gap: t.spacing.md }}>
        {tasks.map((task) => (
          <View key={task.id} style={{ gap: t.spacing.xs }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text numberOfLines={1} style={{ color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySize, fontWeight: "600" }}>
                  {task.name}
                </Text>
                <Text style={{ color: t.color.inkSoft, fontFamily: t.typography.fontFamily, fontSize: t.typography.labelSize }}>
                  {cadenceLabel(task.cadence, task.cadenceMeta)}
                </Text>
              </View>
              <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>{task.points} pts</Text>
            </View>
            <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
              <MobileButton label="Edit" variant="secondary" size="sm" onPress={() => onEdit(task)} />
              <MobileButton label="Archive" variant="ghost" size="sm" onPress={() => onArchive(task.id)} />
            </View>
          </View>
        ))}
      </View>
    </MobileCard>
  );
}

function TaskRow({ name, points, done }: { name: string; points: number; done?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.spacing.sm }}>
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
        {name}
      </Text>
      <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>{points} pts</Text>
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
