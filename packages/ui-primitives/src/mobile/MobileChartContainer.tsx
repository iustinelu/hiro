import React from "react";
import { Text, View } from "react-native";
import type { ChartContainerProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

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
            fontFamily: resolveFontFamily(t, 800),
            fontSize: t.typography.subtitleSize
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: resolveFontFamily(t, 400),
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
