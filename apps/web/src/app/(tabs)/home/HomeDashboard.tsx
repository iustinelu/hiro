"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { TaskCreateModal } from "../tasks/TaskCreateModal";
import { HomeTaskList } from "./HomeTaskList";
import { HomeLeaderboard } from "./HomeLeaderboard";
import PointsBurst from "./PointsBurst";
import AllDoneCelebration from "./AllDoneCelebration";
import styles from "./home.module.css";

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

interface CompletionResult { pointsEarned: number; taskName: string; }
interface Props { householdId: string; profileId: string; }

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function HomeDashboard({ householdId, profileId }: Props) {
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

  /* ── Data fetching ──────────────────────────────────────────────────── */

  const fetchData = useCallback(async () => {
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

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Complete a task ────────────────────────────────────────────────── */

  const handleComplete = useCallback(async (taskId: string) => {
    if (completing) return;
    setCompleting(taskId);
    const result = await completeTask(taskId);
    if (!result.error) {
      setCompletedIds((prev) => new Set(prev).add(taskId));
      setCombo((prev) => prev + 1);
      setLastCompletion({ pointsEarned: result.pointsEarned, taskName: result.taskName });
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

  /* ── Create a task ──────────────────────────────────────────────────── */

  const handleCreate = useCallback(async (
    name: string, points: number, cadence: TaskCadence, cadenceMeta: CadenceMeta, _description: string | null
  ) => {
    const result = await createTask(householdId, name, points, cadence, cadenceMeta);
    if (result.error) throw new Error(result.error);
    await fetchData();
  }, [householdId, fetchData]);

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

  /* ── Loading ────────────────────────────────────────────────────────── */

  if (loading) return <div className={styles.loading}>Loading your dashboard...</div>;

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
            {"\uD83D\uDD25"} {streak}
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
