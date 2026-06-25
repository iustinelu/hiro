import React from "react";
import { Text, View } from "react-native";
import type { DailyPoints } from "@hiro/domain";
import { MobileChartContainer, useTheme } from "@hiro/ui-primitives/mobile";

interface Props {
  trend: DailyPoints[];
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyChart({ trend }: Props) {
  const t = useTheme();
  // Monday-indexed: 0=Mon..6=Sun. getDay() returns 0=Sun..6=Sat
  const todayIdx = (new Date().getDay() + 6) % 7;
  const maxPoints = Math.max(...trend.map((d) => d.points), 1);
  const totalPoints = trend.reduce((sum, d) => sum + d.points, 0);

  const accentColor = t.color.accent;
  const barHeight = 80;

  return (
    <MobileChartContainer
      title="This Week"
      subtitle={`${totalPoints} points total`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: barHeight + 36,
          paddingTop: 8,
        }}
      >
        {trend.map((day, i) => {
          const fillRatio = day.points > 0 ? day.points / maxPoints : 0;
          const fillHeight = Math.max(4, Math.round(fillRatio * barHeight));

          let opacity: number;
          if (i === todayIdx) opacity = 1;
          else if (i < todayIdx) opacity = 0.55;
          else opacity = 0.2;

          const isToday = i === todayIdx;

          return (
            <View
              key={day.date}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-end",
                height: barHeight + 36,
                gap: 4,
              }}
            >
              {day.points > 0 && (
                <Text
                  style={{
                    color: t.color.inkSoft,
                    fontFamily: t.typography.fontFamilyMono,
                    fontSize: 9,
                    letterSpacing: 0.4,
                    marginBottom: 2,
                  }}
                >
                  {day.points}
                </Text>
              )}
              <View
                style={{
                  width: "70%",
                  height: fillHeight,
                  borderRadius: t.radius.sm,
                  backgroundColor: accentColor,
                  opacity,
                  ...(isToday && {
                    shadowColor: accentColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 4,
                  }),
                }}
              />
              <Text
                style={{
                  color: isToday ? t.color.ink : t.color.inkMuted,
                  fontFamily: t.typography.fontFamily,
                  fontSize: t.typography.labelSize,
                  fontWeight: isToday ? "800" : "400",
                  marginTop: 4,
                }}
              >
                {DAY_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </MobileChartContainer>
  );
}
