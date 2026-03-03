import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { StatusBadgeProps } from "../shared/types";
import { resolveColor } from "./utils";

const colorMap = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function MobileStatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const toneColor = resolveColor(colorMap[tone]);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.sm,
        borderRadius: tokens.radius.sm,
        borderWidth: 1,
        borderColor: tone === "neutral" ? resolveColor("borderStrong") : `${toneColor}66`,
        backgroundColor: tone === "neutral" ? "rgba(255,255,255,0.05)" : `${toneColor}22`
      }}
    >
      <Text
        style={{
          color: tone === "neutral" ? resolveColor("inkMuted") : toneColor,
          fontFamily: tokens.typography.fontFamily,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.6,
          textTransform: "uppercase"
        }}
      >
        {label}
      </Text>
    </View>
  );
}
