import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { SpacingMatrixProps } from "../shared/types";
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
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: resolveColor("ink"), fontSize: tokens.typography.titleSize, lineHeight: tokens.typography.lineHeightHeadline, fontFamily: tokens.typography.fontFamily, fontWeight: "800", textTransform: "uppercase", flex: 1, paddingRight: tokens.spacing.sm }}>{title}</Text>
        <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel, letterSpacing: 1.4 }}>SPEC 05.1</Text>
      </View>
      <View style={{ gap: tokens.spacing.sm }}>
        {spacingRows.map((row) => (
          <View
            key={row.token}
            style={{
              borderRadius: tokens.radius.lg,
              borderWidth: 1,
              borderColor: resolveColor("border"),
              backgroundColor: "rgba(12, 15, 28, 0.82)",
              paddingVertical: tokens.spacing.md,
              paddingHorizontal: tokens.spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: tokens.spacing.md
            }}
          >
            <Text style={{ width: 56, color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel, fontWeight: "700" }}>{row.px}px</Text>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: tokens.spacing.md }}>
              <View
                style={{
                  width: row.px,
                  height: row.px,
                  borderRadius: tokens.radius.sm,
                  backgroundColor: resolveColor("accent")
                }}
              />
              <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
            </View>
            <Text style={{ width: 76, textAlign: "right", color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>{row.token}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
