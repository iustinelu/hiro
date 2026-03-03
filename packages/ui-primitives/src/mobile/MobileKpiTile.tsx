import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { KpiTileProps } from "../shared/types";
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
  const accentColor = accent === "primary" ? resolveColor("accent") : resolveColor("accentAlt");
  const deltaColor = resolveColor(toneColorByBadge[deltaTone]);

  return (
    <View
      style={{
        gap: tokens.spacing.sm,
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor("border"),
        backgroundColor: "rgba(255,255,255,0.03)"
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing.sm }}>
        <Text
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            fontWeight: "700"
          }}
        >
          {title}
        </Text>
        {deltaLabel ? (
          <Text
            style={{
              color: deltaTone === "neutral" ? resolveColor("inkSoft") : deltaColor,
              fontFamily: tokens.typography.fontFamily,
              fontSize: 11,
              fontWeight: "700"
            }}
          >
            {deltaLabel}
          </Text>
        ) : null}
      </View>
      <Text style={{ color: resolveColor("ink"), fontFamily: tokens.typography.fontFamily, fontSize: 30, fontWeight: "800" }}>
        {value}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 34 }}>
        {bars.map((bar, index) => (
          <View
            key={`${title}-${index}`}
            style={{
              flex: 1,
              height: `${Math.max(20, Math.round(bar * 100))}%`,
              borderRadius: tokens.radius.sm,
              backgroundColor: `${accentColor}${index === bars.length - 1 ? "" : "88"}`
            }}
          />
        ))}
      </View>
    </View>
  );
}
