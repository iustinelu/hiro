import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { ChartContainerProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileChartContainer({ title, subtitle, children }: ChartContainerProps) {
  return (
    <View
      style={{
        borderRadius: tokens.radius.xl,
        borderWidth: 1,
        borderColor: resolveColor(tokens.component.chartContainer.border),
        backgroundColor: resolveColor(tokens.component.chartContainer.bg),
        padding: tokens.spacing.xl,
        gap: tokens.spacing.md
      }}
    >
      {title ? (
        <Text
          style={{
            color: resolveColor("ink"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.subtitleSize,
            fontWeight: "800"
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
