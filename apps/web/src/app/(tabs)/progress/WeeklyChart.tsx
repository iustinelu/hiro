"use client";

import { WebChartContainer } from "@hiro/ui-primitives/web";
import type { DailyPoints } from "@hiro/domain";
import styles from "./progress.module.css";

interface Props {
  trend: DailyPoints[];
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyChart({ trend }: Props) {
  const todayIdx = (new Date().getDay() + 6) % 7;
  const maxPoints = Math.max(...trend.map((d) => d.points), 1);
  const totalPoints = trend.reduce((sum, d) => sum + d.points, 0);

  return (
    <WebChartContainer title="This Week" subtitle={`${totalPoints} points total`}>
      <div className={styles.chartBars}>
        {trend.map((day, i) => {
          const heightPct = day.points > 0 ? (day.points / maxPoints) * 100 : 0;
          const minHeight = 4;
          let opacity: number;
          if (i === todayIdx) opacity = 1;
          else if (i < todayIdx) opacity = 0.6;
          else opacity = 0.2;

          return (
            <div key={day.date} className={styles.bar}>
              {day.points > 0 && (
                <span className={styles.barValue}>{day.points}</span>
              )}
              <div
                className={styles.barFill}
                style={{
                  height: `${Math.max(minHeight, heightPct)}%`,
                  opacity,
                  boxShadow: i === todayIdx ? "0 0 8px var(--hiro-color-accent)" : "none",
                }}
              />
              <span className={styles.barLabel}>{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </WebChartContainer>
  );
}
