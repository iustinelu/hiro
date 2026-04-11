"use client";

import type { RewardRedemptionWithDetails } from "@hiro/domain";
import styles from "./rewards.module.css";

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  redemption: RewardRedemptionWithDetails;
}

export function RedemptionFeedItem({ redemption }: Props) {
  const name = redemption.redeemedByDisplayName ?? "Someone";

  return (
    <div className={styles.feedItem}>
      <p className={styles.feedText}>
        <span className={styles.feedName}>{name}</span>
        {" spent "}
        <strong>{redemption.pointsSpent} pts</strong>
        {" on "}
        {redemption.rewardTitle}
      </p>
      <span className={styles.feedMeta}>{relativeTime(redemption.redeemedAt)}</span>
    </div>
  );
}
