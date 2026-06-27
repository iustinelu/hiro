import React from "react";
import { Text, View } from "react-native";
import { MobileButton, MobileCard, MobileStatusBadge, useTheme } from "@hiro/ui-primitives/mobile";
import type { BacklogTask } from "../../lib/oneOffService";

/* Claimable one-off chores (HIR-67): open items can be claimed; items I've
 * claimed can be marked done; items others claimed show who has them. */
export function BacklogView({ items, profileId, busyId, onClaim, onComplete }: {
  items: BacklogTask[];
  profileId: string | null;
  busyId: string | null;
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const t = useTheme();
  if (items.length === 0) {
    return (
      <MobileCard>
        <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySmallSize }}>
          Nothing up for grabs. Use “+ New Task” → One-off to post a chore anyone can claim.
        </Text>
      </MobileCard>
    );
  }

  return (
    <MobileCard>
      <View style={{ gap: t.spacing.md }}>
        {items.map((item) => {
          const claimedByMe = item.status === "claimed" && item.claimedByProfileId === profileId;
          const claimedByOther = item.status === "claimed" && !claimedByMe;
          const busy = busyId === item.id;
          return (
            <View key={item.id} style={{ gap: t.spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text numberOfLines={1} style={{ color: t.color.ink, fontFamily: t.typography.fontFamily, fontSize: t.typography.bodySize, fontWeight: "600" }}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text numberOfLines={2} style={{ color: t.color.inkSoft, fontFamily: t.typography.fontFamily, fontSize: t.typography.labelSize }}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>{item.points} pts</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                {item.status === "open" && (
                  <MobileButton label={busy ? "…" : "Claim"} variant="primary" size="sm" disabled={busy} onPress={() => onClaim(item.id)} />
                )}
                {claimedByMe && (
                  <MobileButton label={busy ? "…" : "Mark done"} variant="primary" size="sm" disabled={busy} onPress={() => onComplete(item.id)} />
                )}
                {claimedByOther && (
                  <MobileStatusBadge label={`Claimed by ${item.claimedByDisplayName ?? "member"}`} tone="neutral" />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </MobileCard>
  );
}
