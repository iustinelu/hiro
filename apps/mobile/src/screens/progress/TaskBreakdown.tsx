import React from "react";
import { Text, View } from "react-native";
import type { TaskStats } from "@hiro/domain";
import { MobileCard, useTheme } from "@hiro/ui-primitives/mobile";

interface Props {
  taskStats: TaskStats[];
}

export function TaskBreakdown({ taskStats }: Props) {
  const t = useTheme();

  if (taskStats.length === 0) return null;

  return (
    <MobileCard title="Task Breakdown">
      <View style={{ gap: t.spacing.sm }}>
        {taskStats.map((task) => {
          const fillPct = Math.max(2, (task.completionsThisWeek / 7) * 100);
          return (
            <View key={task.taskId} style={{ gap: t.spacing.xs }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: t.color.ink,
                    fontFamily: t.typography.fontFamily,
                    fontSize: t.typography.bodySmallSize,
                    fontWeight: "600",
                  }}
                >
                  {task.taskName}
                </Text>
                <Text
                  style={{
                    color: t.color.inkMuted,
                    fontFamily: t.typography.fontFamilyMono,
                    fontSize: t.typography.labelSize,
                    marginLeft: t.spacing.sm,
                  }}
                >
                  {task.completionsThisWeek}/7
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.color.surfaceMuted,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${fillPct}%`,
                    borderRadius: t.radius.pill,
                    backgroundColor: t.color.accent,
                    opacity: task.completionsThisWeek > 0 ? 1 : 0.3,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </MobileCard>
  );
}
