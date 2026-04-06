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
            return (
              <li
                key={entry.profileId}
                className={`${styles.leaderboardRow} ${isMe ? styles.leaderboardRowMe : ""}`}
              >
                <span className={styles.rank}>{i + 1}.</span>
                <span className={`${styles.memberName} ${isMe ? styles.memberNameMe : ""}`}>
                  {entry.displayName ?? "Member"}
                </span>
                <span className={styles.memberPoints}>{entry.pointsThisWeek} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
