"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import type { RecurringTask, TaskCadence, CadenceMeta } from "@hiro/domain";
import { WebSegmentedControl, WebButton } from "@hiro/ui-primitives/web";
import {
  getHouseholdTasks,
  getTodayCompletions,
  createTask,
  updateTask,
  archiveTask,
} from "../../../lib/taskService";
import { cacheKeys, revalidateHousehold } from "../../../lib/cacheKeys";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { TaskCreateModal } from "./TaskCreateModal";
import styles from "./tasks.module.css";

interface TasksData {
  tasks: RecurringTask[];
  completedIds: Set<string>;
}

const EMPTY_TASKS: RecurringTask[] = [];
const EMPTY_SET: Set<string> = new Set();
const EMPTY_TASKS_DATA: TasksData = { tasks: EMPTY_TASKS, completedIds: EMPTY_SET };

async function fetchTasksData(householdId: string, profileId: string): Promise<TasksData> {
  const [tasksRes, completionsRes] = await Promise.all([
    getHouseholdTasks(householdId),
    getTodayCompletions(profileId),
  ]);
  return { tasks: tasksRes.tasks, completedIds: new Set(completionsRes.completedTaskIds) };
}

const DAY_MAP: Record<string, string> = {
  sunday: "sun", monday: "mon", tuesday: "tue", wednesday: "wed",
  thursday: "thu", friday: "fri", saturday: "sat",
};

function isDueToday(task: RecurringTask): boolean {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const today = days[new Date().getDay()];
  if (task.cadence === "daily") return true;
  if (task.cadence === "weekly") return DAY_MAP[task.cadenceMeta.day ?? ""] === today;
  if (task.cadence === "custom") return (task.cadenceMeta.days ?? []).includes(today);
  return false;
}

function cadenceLabel(cadence: TaskCadence, meta: CadenceMeta): string {
  if (cadence === "daily") return "Every day";
  if (cadence === "weekly") {
    const d = meta.day ?? "";
    return `Every ${d.charAt(0).toUpperCase()}${d.slice(1)}`;
  }
  if (cadence === "custom") {
    return (meta.days ?? []).map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");
  }
  return "";
}

const SEGMENTS = [{ label: "Today", value: "today" }, { label: "All Tasks", value: "all" }];

interface Props { householdId: string; profileId: string; }

export function TasksManager({ householdId, profileId }: Props) {
  const { data, isLoading, mutate } = useSWR(
    cacheKeys.tasks(householdId, profileId),
    () => fetchTasksData(householdId, profileId),
  );

  const tasks = data?.tasks ?? EMPTY_TASKS;
  const completedIds = data?.completedIds ?? EMPTY_SET;

  const [tab, setTab] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  /* ── Actions ───────────────────────────────────────────────────────── */

  const handleCreate = useCallback(async (
    name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, description: string | null
  ) => {
    const result = await createTask(householdId, name, points, cadence, cadenceMeta);
    if (result.error) throw new Error(result.error);
    await mutate();
    void revalidateHousehold(householdId);
  }, [householdId, mutate]);

  const handleUpdate = useCallback(async (
    taskId: string,
    updates: { name?: string; points?: number; cadence?: TaskCadence; cadenceMeta?: CadenceMeta; description?: string | null }
  ) => {
    const result = await updateTask(taskId, updates);
    if (result.error) throw new Error(result.error);
    await mutate();
    void revalidateHousehold(householdId);
  }, [householdId, mutate]);

  const handleArchive = useCallback(async (taskId: string) => {
    try {
      await mutate(
        async () => {
          const result = await archiveTask(taskId);
          if (result.error) throw new Error(result.error);
          return fetchTasksData(householdId, profileId);
        },
        {
          optimisticData: (current) => {
            const base = current ?? EMPTY_TASKS_DATA;
            return { ...base, tasks: base.tasks.filter((t) => t.id !== taskId) };
          },
          rollbackOnError: true,
          revalidate: false,
        },
      );
      void revalidateHousehold(householdId);
    } catch {
      // rolled back automatically
    }
  }, [householdId, profileId, mutate]);

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task: RecurringTask) { setEditingTask(task); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingTask(null); }

  /* ── Derived ───────────────────────────────────────────────────────── */

  const todayTasks = tasks.filter(isDueToday);
  const todayPending = todayTasks.filter((t) => !completedIds.has(t.id));
  const todayDone = todayTasks.filter((t) => completedIds.has(t.id));

  /* ── Render ────────────────────────────────────────────────────────── */

  if (isLoading && !data) return <DashboardSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <WebButton label="+ New Task" variant="primary" size="sm" onPress={openCreate} />
      </div>

      <WebSegmentedControl options={SEGMENTS} value={tab} onChange={setTab} />

      {tab === "today" ? (
        <TodayView
          pending={todayPending}
          done={todayDone}
          showCompleted={showCompleted}
          onToggleCompleted={() => setShowCompleted((p) => !p)}
        />
      ) : (
        <AllTasksView
          tasks={tasks}
          onEdit={openEdit}
          onArchive={handleArchive}
        />
      )}

      <TaskCreateModal
        open={modalOpen}
        editingTask={editingTask}
        onClose={closeModal}
        onSave={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

/* ─── Today View (read-only — completing tasks happens on Home) ──────── */

function TodayView({ pending, done, showCompleted, onToggleCompleted }: {
  pending: RecurringTask[]; done: RecurringTask[];
  showCompleted: boolean; onToggleCompleted: () => void;
}) {
  if (pending.length === 0 && done.length === 0) {
    return <div className={styles.card}><p className={styles.emptyState}>No tasks scheduled for today.</p></div>;
  }

  return (
    <section className={styles.card}>
      {pending.length > 0 && (
        <ul className={styles.taskList}>
          {pending.map((task) => (
            <li key={task.id} className={styles.taskRow}>
              <span className={styles.taskName}>{task.name}</span>
              <span className={styles.pointsBadge}>{task.points} pts</span>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <WebButton
            label={`${showCompleted ? "\u25BC" : "\u25B6"} Completed today (${done.length})`}
            variant="ghost"
            size="sm"
            onPress={onToggleCompleted}
          />
          {showCompleted && (
            <ul className={styles.taskList}>
              {done.map((task) => (
                <li key={task.id} className={`${styles.taskRow} ${styles.taskRowDone}`}>
                  <span className={`${styles.taskName} ${styles.taskNameDone}`}>{task.name}</span>
                  <span className={styles.pointsBadge}>{task.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

/* ─── All Tasks View ─────────────────────────────────────────────────── */

function AllTasksView({ tasks, onEdit, onArchive }: {
  tasks: RecurringTask[];
  onEdit: (t: RecurringTask) => void;
  onArchive: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return <div className={styles.card}><p className={styles.emptyState}>No tasks yet. Create your first one!</p></div>;
  }

  return (
    <section className={styles.card}>
      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li key={task.id} className={styles.taskRow} onClick={() => onEdit(task)}>
            <div className={styles.taskInfo}>
              <span className={styles.taskName}>{task.name}</span>
              <span className={styles.taskCadence}>{cadenceLabel(task.cadence, task.cadenceMeta)}</span>
            </div>
            <div className={styles.taskActions}>
              <span className={styles.pointsBadge}>{task.points} pts</span>
              <WebButton
                label="Archive"
                variant="ghost"
                size="sm"
                onPress={() => onArchive(task.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
