import React from "react";
import { Text, View } from "react-native";
import type { StatusBadgeProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamilyMono } from "./utils";

const colorMap = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function MobileStatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const t = useTheme();
  const toneColor = resolveColor(t, colorMap[tone]);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: t.spacing.xs,
        paddingHorizontal: t.spacing.sm,
        borderRadius: t.radius.sm,
        borderWidth: t.flags.borderWidth,
        borderColor: tone === "neutral" ? resolveColor(t, "borderStrong") : `${toneColor}66`,
        backgroundColor: tone === "neutral" ? resolveColor(t, "surfaceMuted") : `${toneColor}22`,
        maxWidth: "100%"
      }}
    >
      <Text
        style={{
          color: tone === "neutral" ? resolveColor(t, "ink") : toneColor,
          fontFamily: resolveFontFamilyMono(t, 700),
          fontSize: t.typography.labelSize,
          lineHeight: t.typography.lineHeightLabel,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          flexShrink: 1
        }}
      >
        {label}
      </Text>
    </View>
  );
}
