import React from "react";
import { Text, View } from "react-native";
import type { ChartContainerProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

export function MobileChartContainer({ title, subtitle, children }: ChartContainerProps) {
  const t = useTheme();
  return (
    <View
      style={{
        borderRadius: t.radius.xl,
        borderWidth: 1,
        borderColor: resolveColor(t, t.component.chartContainer.border as keyof typeof t.color),
        backgroundColor: resolveColor(t, t.component.chartContainer.bg as keyof typeof t.color),
        padding: t.spacing.xl,
        gap: t.spacing.md
      }}
    >
      {title ? (
        <Text
          style={{
            color: resolveColor(t, "ink"),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.subtitleSize,
            fontWeight: "800"
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySmallSize
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
