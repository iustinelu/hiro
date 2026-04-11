"use client";

import type { Reward } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import { RewardCard } from "./RewardCard";
import styles from "./rewards.module.css";

interface Props {
  rewards: Reward[];
  balance: number;
  confirming: string | null;
  redeeming: string | null;
  onConfirm: (rewardId: string) => void;
  onRedeem: (reward: Reward) => void;
  onCancelConfirm: () => void;
  onArchive: (rewardId: string) => void;
  onCreateNew: () => void;
}

export function RewardCardGrid({
  rewards,
  balance,
  confirming,
  redeeming,
  onConfirm,
  onRedeem,
  onCancelConfirm,
  onArchive,
  onCreateNew,
}: Props) {
  if (rewards.length === 0) {
    return (
      <div className={styles.emptyGrid}>
        <p className={styles.emptyTitle}>No rewards yet</p>
        <p className={styles.emptyHint}>Create something worth working toward.</p>
        <WebButton label="+ New Reward" variant="primary" size="sm" onPress={onCreateNew} />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          balance={balance}
          confirming={confirming}
          redeeming={redeeming}
          onConfirm={onConfirm}
          onRedeem={onRedeem}
          onCancelConfirm={onCancelConfirm}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
