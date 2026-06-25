import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";
import type { RewardRedemptionWithDetails } from "@hiro/domain";
import { RedemptionFeedItem } from "./RedemptionFeedItem";

interface Props {
  redemptions: RewardRedemptionWithDetails[];
}

export function RedemptionFeed({ redemptions }: Props) {
  const t = useTheme();

  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text
        style={{
          color: t.color.ink,
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.subtitleSize,
          fontWeight: "800",
        }}
      >
        Household Activity
      </Text>

      {redemptions.length === 0 ? (
        <Text
          style={{
            color: t.color.inkMuted,
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySmallSize,
          }}
        >
          No redemptions yet.
        </Text>
      ) : (
        <View>
          {redemptions.map((r) => (
            <RedemptionFeedItem key={r.id} redemption={r} />
          ))}
        </View>
      )}
    </View>
  );
}
