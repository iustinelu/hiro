"use client";

import type { Reward } from "@hiro/domain";
import { WebButton } from "@hiro/ui-primitives/web";
import styles from "./rewards.module.css";

interface Props {
  reward: Reward;
  balance: number;
  confirming: string | null;
  redeeming: string | null;
  onConfirm: (rewardId: string) => void;
  onRedeem: (reward: Reward) => void;
  onCancelConfirm: () => void;
  onArchive: (rewardId: string) => void;
}

export function RewardCard({
  reward,
  balance,
  confirming,
  redeeming,
  onConfirm,
  onRedeem,
  onCancelConfirm,
  onArchive,
}: Props) {
  const canAfford = balance >= reward.pointCost;
  const isConfirming = confirming === reward.id;
  const isRedeeming = redeeming === reward.id;
  const need = reward.pointCost - balance;

  return (
    <div className={`${styles.card} ${canAfford ? styles.cardAffordable : ""}`}>
      <p className={styles.cardTitle}>{reward.title}</p>

      <div className={styles.cardFooter}>
        <div className={styles.costBadge}>
          <span className={`${styles.costPts} ${!canAfford ? styles.costPtsDim : ""}`}>
            {reward.pointCost} pts
          </span>
          {!canAfford && (
            <span className={styles.costNeed}>Need {need} more</span>
          )}
        </div>

        <div className={styles.cardActions}>
          {isConfirming ? (
            <>
              <WebButton
                label={isRedeeming ? "…" : "Confirm"}
                variant="primary"
                size="sm"
                loading={isRedeeming}
                loadingLabel="…"
                onPress={() => onRedeem(reward)}
              />
              <WebButton
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={onCancelConfirm}
              />
            </>
          ) : (
            <>
              <WebButton
                label="Redeem"
                variant={canAfford ? "primary" : "secondary"}
                size="sm"
                onPress={() => canAfford ? onConfirm(reward.id) : undefined}
              />
              <WebButton
                label="Archive"
                variant="ghost"
                size="sm"
                onPress={() => onArchive(reward.id)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
