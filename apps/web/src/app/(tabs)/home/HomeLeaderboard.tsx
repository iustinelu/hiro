"use client";

import type { LeaderboardEntry } from "@hiro/domain";
import styles from "./home.module.css";

interface Props {
  entries: LeaderboardEntry[];
  profileId: string;
}

export function HomeLeaderboard({ entries, profileId }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>This Week</h2>
      </div>

      {entries.length === 0 ? (
        <p className={styles.emptyState}>No points scored yet this week.</p>
      ) : (
        <ol className={styles.leaderboardList}>
          {entries.map((entry, i) => {
            const isMe = entry.profileId === profileId;
            const isFirst = i === 0;
            return (
              <li
                key={entry.profileId}
                className={[
                  styles.leaderboardRow,
                  isFirst ? styles.leaderboardRowFirst : "",
                  isMe ? styles.leaderboardRowMe : "",
                ].join(" ")}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className={`${styles.rank} ${isFirst ? styles.rankFirst : ""}`}>
                  {isFirst ? "🥇" : `#${i + 1}`}
                </span>
                <span className={`${styles.memberName} ${isMe ? styles.memberNameMe : ""}`}>
                  {entry.displayName ?? "Member"}
                  {isMe ? " (you)" : ""}
                </span>
                <span className={`${styles.memberPoints} ${isMe ? styles.memberPointsMe : ""} ${isFirst ? styles.memberPointsFirst : ""}`}>
                  {entry.pointsThisWeek} pts
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
