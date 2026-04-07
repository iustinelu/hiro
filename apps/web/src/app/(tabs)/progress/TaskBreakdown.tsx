"use client";

import type { TaskStats } from "@hiro/domain";
import styles from "./progress.module.css";

interface Props {
  taskStats: TaskStats[];
}

export function TaskBreakdown({ taskStats }: Props) {
  if (taskStats.length === 0) return null;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Task Breakdown</h2>
      </div>

      <div className={styles.taskBreakdownList}>
        {taskStats.map((task) => {
          const widthPct = Math.max(2, (task.completionsThisWeek / 7) * 100);
          return (
            <div key={task.taskId} className={styles.taskRow}>
              <span className={styles.taskName}>{task.taskName}</span>
              <div className={styles.taskBar}>
                <div
                  className={styles.taskBarFill}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className={styles.taskCount}>{task.completionsThisWeek}/7</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
