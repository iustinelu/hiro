"use client";

import { useEffect, useState } from "react";
import type { RecurringTask } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import styles from "./home.module.css";

interface Props {
  tasks: RecurringTask[];
  completedIds: Set<string>;
  completing: string | null;
  doneCount: number;
  onComplete: (taskId: string) => void;
  onUndo: (taskId: string) => void;
}

export function HomeTaskList({ tasks, completedIds, completing, doneCount, onComplete, onUndo }: Props) {
  const [undoableTaskId, setUndoableTaskId] = useState<string | null>(null);

  // Auto-dismiss undo after 5 seconds
  useEffect(() => {
    if (!undoableTaskId) return;
    const timer = setTimeout(() => setUndoableTaskId(null), 5000);
    return () => clearTimeout(timer);
  }, [undoableTaskId]);

  function handleComplete(taskId: string) {
    onComplete(taskId);
    setUndoableTaskId(taskId);
  }

  function handleUndo(taskId: string) {
    setUndoableTaskId(null);
    onUndo(taskId);
  }

  if (tasks.length === 0) {
    return <p className={styles.emptyState}>No tasks scheduled for today.</p>;
  }

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Today&apos;s Tasks</h2>
        <span className={styles.progress}>
          <span className={styles.progressNumerator}>{doneCount}</span>/{tasks.length}
        </span>
      </div>

      <ul className={styles.taskList}>
        {tasks.map((task) => {
          const done = completedIds.has(task.id);
          const canUndo = done && undoableTaskId === task.id;
          return (
            <li
              key={task.id}
              className={`${styles.taskRow} ${done ? styles.taskRowDone : ""}`}
            >
              <span className={`${styles.taskName} ${done ? styles.taskNameDone : ""}`}>
                {task.name}
              </span>
              <div className={styles.taskActions}>
                <span className={styles.pointsBadge}>{task.points} pts</span>
                {done ? (
                  canUndo ? (
                    <WebButton label="Undo" variant="ghost" size="sm" onPress={() => handleUndo(task.id)} />
                  ) : (
                    <span className={styles.checkmark}>{"\u2713"}</span>
                  )
                ) : (
                  <WebButton
                    label={completing === task.id ? "..." : "Done"}
                    variant="primary"
                    size="sm"
                    disabled={completing === task.id}
                    onPress={() => handleComplete(task.id)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
