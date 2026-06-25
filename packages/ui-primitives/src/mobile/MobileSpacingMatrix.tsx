import React from "react";
import { Text, View } from "react-native";
import type { SpacingMatrixProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

const spacingRows = [
  { px: 4, token: "token.xs" },
  { px: 8, token: "token.sm" },
  { px: 16, token: "token.md" },
  { px: 24, token: "token.lg" },
  { px: 32, token: "token.xl" },
  { px: 48, token: "token.2xl" }
];

export function MobileSpacingMatrix({ title = "Spacing Matrix" }: SpacingMatrixProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: resolveColor(t, "ink"), fontSize: t.typography.titleSize, lineHeight: t.typography.lineHeightHeadline, fontFamily: t.typography.fontFamily, fontWeight: "800", textTransform: "uppercase", flex: 1, paddingRight: t.spacing.sm }}>{title}</Text>
        <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel, letterSpacing: 1.4 }}>SPEC 05.1</Text>
      </View>
      <View style={{ gap: t.spacing.sm }}>
        {spacingRows.map((row) => (
          <View
            key={row.token}
            style={{
              borderRadius: t.radius.lg,
              borderWidth: t.flags.borderWidth,
              borderColor: resolveColor(t, "border"),
              backgroundColor: "rgba(12, 15, 28, 0.82)",
              paddingVertical: t.spacing.md,
              paddingHorizontal: t.spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: t.spacing.md
            }}
          >
            <Text style={{ width: 56, color: resolveColor(t, "inkMuted"), fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel, fontWeight: "700" }}>{row.px}px</Text>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: t.spacing.md }}>
              <View
                style={{
                  width: row.px,
                  height: row.px,
                  borderRadius: t.radius.sm,
                  backgroundColor: resolveColor(t, "accent")
                }}
              />
              <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
            </View>
            <Text style={{ width: 76, textAlign: "right", color: resolveColor(t, "inkSoft"), fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>{row.token}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
