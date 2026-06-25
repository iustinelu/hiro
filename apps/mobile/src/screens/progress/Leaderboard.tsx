import React from "react";
import { Text, View } from "react-native";
import type { LeaderboardEntry } from "@hiro/domain";
import { MobileCard, MobilePresenceAvatar, useTheme } from "@hiro/ui-primitives/mobile";

interface Props {
  entries: LeaderboardEntry[];
  profileId: string;
}

export function Leaderboard({ entries, profileId }: Props) {
  const t = useTheme();

  if (entries.length === 0) return null;

  const RANK_BADGES = ["🥇", "🥈", "🥉"];

  return (
    <MobileCard title="This Week's Leaderboard">
      <View style={{ gap: t.spacing.sm }}>
        {entries.map((entry, i) => {
          const isMe = entry.profileId === profileId;
          const name = entry.displayName ?? "Member";
          const rankBadge = RANK_BADGES[i] ?? null;

          return (
            <View
              key={entry.profileId}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: t.spacing.sm,
                padding: t.spacing.sm,
                borderRadius: t.radius.lg,
                borderWidth: 1,
                borderColor: isMe ? t.color.accentStrong : t.color.border,
                backgroundColor: isMe
                  ? `${t.color.accent}18`
                  : "transparent",
              }}
            >
              <Text
                style={{
                  width: 24,
                  textAlign: "center",
                  fontSize: 16,
                  color: t.color.inkSoft,
                  fontFamily: t.typography.fontFamilyMono,
                }}
              >
                {rankBadge ?? String(i + 1)}
              </Text>
              <MobilePresenceAvatar
                name={name}
                size="sm"
                status="online"
                highlighted={isMe}
              />
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  color: isMe ? t.color.accent : t.color.ink,
                  fontFamily: t.typography.fontFamily,
                  fontSize: t.typography.bodySize,
                  fontWeight: isMe ? "800" : "600",
                }}
              >
                {name}
                {isMe ? " (you)" : ""}
              </Text>
              <Text
                style={{
                  color: t.color.inkMuted,
                  fontFamily: t.typography.fontFamilyMono,
                  fontSize: t.typography.labelSize,
                  fontWeight: "700",
                }}
              >
                {entry.pointsThisWeek} pts
              </Text>
            </View>
          );
        })}
      </View>
    </MobileCard>
  );
}
