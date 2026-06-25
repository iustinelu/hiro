import React from "react";
import { View } from "react-native";
import { MobileEmptyStatePanel, MobileButton, useTheme } from "@hiro/ui-primitives/mobile";
import type { Reward } from "@hiro/domain";
import { RewardCard } from "./RewardCard";

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
  const t = useTheme();

  if (rewards.length === 0) {
    return (
      <View style={{ gap: t.spacing.md }}>
        <MobileEmptyStatePanel
          title="No rewards yet"
          description="Create something worth working toward."
          icon="empty"
        />
        <MobileButton
          label="+ New Reward"
          variant="primary"
          onPress={onCreateNew}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: t.spacing.sm }}>
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
    </View>
  );
}
