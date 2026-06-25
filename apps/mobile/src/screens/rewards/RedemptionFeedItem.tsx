import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";
import type { RewardRedemptionWithDetails } from "@hiro/domain";

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
  const t = useTheme();
  const name = redemption.redeemedByDisplayName ?? "Someone";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: t.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: t.color.border,
      }}
    >
      <Text
        style={{
          flex: 1,
          color: t.color.ink,
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.bodySmallSize,
        }}
      >
        <Text style={{ fontWeight: "700" }}>{name}</Text>
        {" spent "}
        <Text style={{ fontWeight: "700", color: t.color.accent }}>
          {redemption.pointsSpent} pts
        </Text>
        {" on "}
        {redemption.rewardTitle}
      </Text>
      <Text
        style={{
          color: t.color.inkMuted,
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.labelSize,
          marginLeft: t.spacing.sm,
        }}
      >
        {relativeTime(redemption.redeemedAt)}
      </Text>
    </View>
  );
}
