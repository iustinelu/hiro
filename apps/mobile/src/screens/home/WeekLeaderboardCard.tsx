import React from "react";
import { Text, View } from "react-native";
import type { LeaderboardEntry } from "@hiro/domain";
import { MobileCard, useTheme } from "@hiro/ui-primitives/mobile";

/** Read-only "This Week" leaderboard card on Home. */
export function WeekLeaderboardCard({ leaderboard, profileId }: {
  leaderboard: LeaderboardEntry[];
  profileId: string | null;
}) {
  const t = useTheme();
  return (
    <MobileCard title="This Week">
      {leaderboard.length === 0 ? (
        <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize }}>
          No points scored yet this week.
        </Text>
      ) : (
        <View style={{ gap: t.spacing.sm }}>
          {leaderboard.map((entry, i) => {
            const isMe = entry.profileId === profileId;
            return (
              <View key={entry.profileId} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                <Text style={{ color: t.color.inkSoft, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, width: 22 }}>{i + 1}.</Text>
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, color: isMe ? t.color.accent : t.color.ink, fontFamily: t.typography.fontFamily, fontWeight: isMe ? "800" : "600", fontSize: t.typography.bodySize }}
                >
                  {entry.displayName ?? "Member"}
                </Text>
                <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize }}>{entry.pointsThisWeek} pts</Text>
              </View>
            );
          })}
        </View>
      )}
    </MobileCard>
  );
}
