import React from "react";
import { Text, View } from "react-native";
import type { KpiTileProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

const toneColorByBadge = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "inkSoft"
} as const;

export function MobileKpiTile({
  title,
  value,
  deltaLabel,
  deltaTone = "neutral",
  bars = [0.35, 0.58, 0.42, 0.74, 0.92],
  accent = "primary"
}: KpiTileProps) {
  const t = useTheme();
  const accentColor = accent === "primary" ? resolveColor(t, "accent") : resolveColor(t, "accentAlt");
  const deltaColor = resolveColor(t, toneColorByBadge[deltaTone]);

  return (
    <View
      style={{
        gap: t.spacing.sm,
        padding: t.spacing.md,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor(t, "border"),
        backgroundColor: "rgba(255,255,255,0.03)"
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.spacing.sm }}>
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.labelSize,
            lineHeight: t.typography.lineHeightLabel,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            fontWeight: "700",
            flex: 1
          }}
        >
          {title}
        </Text>
        {deltaLabel ? (
          <Text
            style={{
              color: deltaTone === "neutral" ? resolveColor(t, "inkSoft") : deltaColor,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.labelSize,
              lineHeight: t.typography.lineHeightLabel,
              fontWeight: "700"
            }}
          >
            {deltaLabel}
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          color: resolveColor(t, "ink"),
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.titleSize,
          lineHeight: t.typography.lineHeightHeadline,
          fontWeight: "800"
        }}
      >
        {value}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 34 }}>
        {bars.map((bar, index) => (
          <View
            key={`${title}-${index}`}
            style={{
              flex: 1,
              height: `${Math.max(20, Math.round(bar * 100))}%`,
              borderRadius: t.radius.sm,
              backgroundColor: `${accentColor}${index === bars.length - 1 ? "" : "88"}`
            }}
          />
        ))}
      </View>
    </View>
  );
}
