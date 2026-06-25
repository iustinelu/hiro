import React from "react";
import { Text, View } from "react-native";
import { MobileButton, MobileCard, useTheme } from "@hiro/ui-primitives/mobile";
import type { Reward } from "@hiro/domain";

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
  const t = useTheme();
  const canAfford = balance >= reward.pointCost;
  const isConfirming = confirming === reward.id;
  const isRedeeming = redeeming === reward.id;
  const need = reward.pointCost - balance;

  return (
    <MobileCard tone={canAfford ? "accent" : "default"}>
      <Text
        style={{
          color: t.color.ink,
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.bodySize,
          fontWeight: "700",
          marginBottom: t.spacing.xs,
        }}
      >
        {reward.title}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.spacing.sm }}>
        <View>
          <Text
            style={{
              color: canAfford ? t.color.accent : t.color.inkMuted,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.subtitleSize,
              fontWeight: "800",
            }}
          >
            {reward.pointCost} pts
          </Text>
          {!canAfford && (
            <Text
              style={{
                color: t.color.inkSoft,
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.labelSize,
              }}
            >
              Need {need} more
            </Text>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.xs, flexShrink: 1 }}>
          {isConfirming ? (
            <>
              <MobileButton
                label="Confirm"
                variant="primary"
                size="sm"
                loading={isRedeeming}
                loadingLabel="…"
                onPress={() => onRedeem(reward)}
              />
              <MobileButton
                label="Cancel"
                variant="secondary"
                size="sm"
                onPress={onCancelConfirm}
              />
            </>
          ) : (
            <>
              <MobileButton
                label={canAfford ? "Redeem" : `Need ${need} more`}
                variant={canAfford ? "primary" : "secondary"}
                size="sm"
                disabled={!canAfford}
                onPress={() => { if (canAfford) onConfirm(reward.id); }}
              />
              <MobileButton
                label="Archive"
                variant="ghost"
                size="sm"
                onPress={() => onArchive(reward.id)}
              />
            </>
          )}
        </View>
      </View>
    </MobileCard>
  );
}
