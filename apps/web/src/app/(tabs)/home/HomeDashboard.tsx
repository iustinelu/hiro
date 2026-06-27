"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { AnimatePresence } from "framer-motion";
import type { RecurringTask, LeaderboardEntry, TaskCadence, CadenceMeta } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import {
  getHouseholdTasks,
  getTodayCompletions,
  getWeeklyLeaderboard,
  getStreak,
  completeTask,
  uncompleteTask,
  createTask,
} from "../../../lib/taskService";
import { cacheKeys, revalidateHousehold } from "../../../lib/cacheKeys";
import { DashboardSkeleton } from "../DashboardSkeleton";
import { TaskCreateModal } from "../tasks/TaskCreateModal";
import { HomeTaskList } from "./HomeTaskList";
import { HomeLeaderboard } from "./HomeLeaderboard";
import PointsBurst from "./PointsBurst";
import AllDoneCelebration from "./AllDoneCelebration";
import styles from "./home.module.css";

/* ─── Data ──────────────────────────────────────────────────────────────── */

interface HomeData {
  tasks: RecurringTask[];
  completedIds: Set<string>;
  leaderboard: LeaderboardEntry[];
  streak: number;
}

const EMPTY_TASKS: RecurringTask[] = [];
const EMPTY_LEADERBOARD: LeaderboardEntry[] = [];
const EMPTY_SET: Set<string> = new Set();
const EMPTY_HOME: HomeData = {
  tasks: EMPTY_TASKS,
  completedIds: EMPTY_SET,
  leaderboard: EMPTY_LEADERBOARD,
  streak: 0,
};

async function fetchHomeData(householdId: string, profileId: string): Promise<HomeData> {
  const [tasksRes, completionsRes, lbRes, streakRes] = await Promise.all([
    getHouseholdTasks(householdId),
    getTodayCompletions(profileId),
    getWeeklyLeaderboard(householdId),
    getStreak(profileId),
  ]);
  return {
    tasks: tasksRes.tasks,
    completedIds: new Set(completionsRes.completedTaskIds),
    leaderboard: lbRes.entries,
    streak: streakRes.streak,
  };
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isDueToday(task: RecurringTask): boolean {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const today = days[new Date().getDay()];
  if (task.cadence === "daily") return true;
  if (task.cadence === "weekly") {
    const dayMap: Record<string, string> = {
      sunday: "sun", monday: "mon", tuesday: "tue", wednesday: "wed",
      thursday: "thu", friday: "fri", saturday: "sat",
    };
    return dayMap[task.cadenceMeta.day ?? ""] === today;
  }
  if (task.cadence === "custom") return (task.cadenceMeta.days ?? []).includes(today);
  return false;
}

function withId(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  next.add(id);
  return next;
}

function withoutId(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  next.delete(id);
  return next;
}

interface CompletionResult { pointsEarned: number; taskName: string; }
interface Props { householdId: string; profileId: string; }

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function HomeDashboard({ householdId, profileId }: Props) {
  const { data, isLoading, mutate } = useSWR(
    cacheKeys.home(householdId, profileId),
    () => fetchHomeData(householdId, profileId),
  );

  const tasks = data?.tasks ?? EMPTY_TASKS;
  const completedIds = data?.completedIds ?? EMPTY_SET;
  const leaderboard = data?.leaderboard ?? EMPTY_LEADERBOARD;
  const streak = data?.streak ?? 0;

  // Local UI-only state (animations, modal) — server data lives in SWR.
  const [completing, setCompleting] = useState<string | null>(null);
  const [lastCompletion, setLastCompletion] = useState<CompletionResult | null>(null);
  const [combo, setCombo] = useState(0);
  const [showAllDone, setShowAllDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Complete a task ────────────────────────────────────────────────── */

  const handleComplete = useCallback(async (taskId: string) => {
    if (completing) return;
    setCompleting(taskId);
    setCombo((prev) => prev + 1);
    try {
      await mutate(
        async () => {
          const result = await completeTask(taskId);
          if (result.error) throw new Error(result.error);
          setLastCompletion({ pointsEarned: result.pointsEarned, taskName: result.taskName });
          return fetchHomeData(householdId, profileId);
        },
        {
          optimisticData: (current) => {
            const base = current ?? EMPTY_HOME;
            return { ...base, completedIds: withId(base.completedIds, taskId) };
          },
          rollbackOnError: true,
          revalidate: false,
        },
      );
      void revalidateHousehold(householdId);
    } catch {
      setCombo((prev) => Math.max(0, prev - 1));
    } finally {
      setCompleting(null);
    }
  }, [completing, householdId, profileId, mutate]);

  /* ── Undo a completion ───────────────────────────────────────────────── */

  const handleUndo = useCallback(async (taskId: string) => {
    try {
      await mutate(
        async () => {
          const result = await uncompleteTask(taskId, profileId);
          if (result.error) throw new Error(result.error);
          return fetchHomeData(householdId, profileId);
        },
        {
          optimisticData: (current) => {
            const base = current ?? EMPTY_HOME;
            return { ...base, completedIds: withoutId(base.completedIds, taskId) };
          },
          rollbackOnError: true,
          revalidate: false,
        },
      );
      setCombo((prev) => Math.max(0, prev - 1));
      void revalidateHousehold(householdId);
    } catch {
      // rolled back automatically
    }
  }, [householdId, profileId, mutate]);

  /* ── Create a task ──────────────────────────────────────────────────── */

  const handleCreate = useCallback(async (
    name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, _description: string | null
  ) => {
    const result = await createTask(householdId, name, points, cadence, cadenceMeta);
    if (result.error) throw new Error(result.error);
    await mutate();
    void revalidateHousehold(householdId);
  }, [householdId, mutate]);

  /* ── Derived data ───────────────────────────────────────────────────── */

  const todayTasks = tasks.filter(isDueToday);
  const doneCount = todayTasks.filter((t) => completedIds.has(t.id)).length;
  const totalPointsToday = useMemo(
    () => todayTasks.filter((t) => completedIds.has(t.id)).reduce((sum, t) => sum + t.points, 0),
    [todayTasks, completedIds],
  );
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;

  const handleBurstComplete = useCallback(() => {
    setLastCompletion(null);
    if (allDone) setShowAllDone(true);
  }, [allDone]);

  /* ── Loading (first visit only — cached visits paint instantly) ──────── */

  if (isLoading && !data) return <DashboardSkeleton />;

  /* ── Empty state ────────────────────────────────────────────────────── */

  if (tasks.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>{getGreeting()}</h1>
        </div>
        <div className={styles.card}>
          <p className={styles.emptyState}>No tasks yet.</p>
          <WebButton label="+ Create your first task" variant="primary" size="sm" onPress={() => setModalOpen(true)} />
        </div>
        <TaskCreateModal
          open={modalOpen}
          editingTask={null}
          onClose={() => setModalOpen(false)}
          onSave={handleCreate}
          onUpdate={async () => {}}
        />
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>{getGreeting()}</h1>
        {streak > 0 && (
          <span className={styles.streak} title={`${streak}-day streak`}>
            <span className={styles.streakFlame}>{"🔥"}</span>
            <span className={styles.streakCount}>{streak}</span>
          </span>
        )}
      </div>

      <section className={styles.card}>
        <HomeTaskList
          tasks={todayTasks}
          completedIds={completedIds}
          completing={completing}
          doneCount={doneCount}
          onComplete={handleComplete}
          onUndo={handleUndo}
        />
        <div className={styles.addTaskRow}>
          <WebButton label="+ Add task" variant="ghost" size="sm" onPress={() => setModalOpen(true)} />
        </div>
      </section>

      <HomeLeaderboard entries={leaderboard} profileId={profileId} />

      <AnimatePresence>
        {lastCompletion && (
          <PointsBurst
            key="points-burst"
            points={lastCompletion.pointsEarned}
            taskName={lastCompletion.taskName}
            combo={combo}
            onComplete={handleBurstComplete}
          />
        )}
      </AnimatePresence>

      {showAllDone && (
        <AllDoneCelebration
          totalPoints={totalPointsToday}
          onDismiss={() => setShowAllDone(false)}
        />
      )}

      <TaskCreateModal
        open={modalOpen}
        editingTask={null}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        onUpdate={async () => {}}
      />
    </div>
  );
}
