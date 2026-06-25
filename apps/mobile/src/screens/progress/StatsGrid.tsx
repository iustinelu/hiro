import React from "react";
import { View } from "react-native";
import type { PersonalStats } from "@hiro/domain";
import { MobileKpiTile, useTheme } from "@hiro/ui-primitives/mobile";

interface Props {
  stats: PersonalStats;
}

function pointsDelta(
  current: number,
  previous: number
): { label: string; tone: "success" | "error" | "neutral" } {
  if (previous === 0 && current === 0) return { label: "same", tone: "neutral" };
  if (previous === 0) return { label: "+100%", tone: "success" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { label: `+${pct}%`, tone: "success" };
  if (pct < 0) return { label: `${pct}%`, tone: "error" };
  return { label: "same", tone: "neutral" };
}

function completionsDelta(
  current: number,
  previous: number
): { label: string; tone: "success" | "error" | "neutral" } {
  const diff = current - previous;
  if (diff > 0) return { label: `+${diff}`, tone: "success" };
  if (diff < 0) return { label: `${diff}`, tone: "error" };
  return { label: "same", tone: "neutral" };
}

export function StatsGrid({ stats }: Props) {
  const t = useTheme();
  const ptsDelta = pointsDelta(stats.pointsThisWeek, stats.pointsLastWeek);
  const compDelta = completionsDelta(stats.completionsThisWeek, stats.completionsLastWeek);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: t.spacing.sm,
      }}
    >
      <View style={{ flex: 1, minWidth: "45%" }}>
        <MobileKpiTile
          title="Points This Week"
          value={String(stats.pointsThisWeek)}
          deltaLabel={ptsDelta.label}
          deltaTone={ptsDelta.tone}
          bars={[]}
        />
      </View>
      <View style={{ flex: 1, minWidth: "45%" }}>
        <MobileKpiTile
          title="Streak"
          value={stats.streak > 0 ? `\u{1F525} ${stats.streak}` : "0"}
          bars={[]}
        />
      </View>
      <View style={{ flex: 1, minWidth: "45%" }}>
        <MobileKpiTile
          title="Tasks Done"
          value={String(stats.completionsThisWeek)}
          deltaLabel={compDelta.label}
          deltaTone={compDelta.tone}
          bars={[]}
        />
      </View>
      <View style={{ flex: 1, minWidth: "45%" }}>
        <MobileKpiTile
          title="All-Time Points"
          value={String(stats.totalPointsAllTime)}
          bars={[]}
        />
      </View>
    </View>
  );
}
