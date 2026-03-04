import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { IconographySpecProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { resolveColor } from "./utils";

export function MobileIconographySpec({ title = "Iconography Standards" }: IconographySpecProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: resolveColor("inkMuted"), fontSize: tokens.typography.titleSize, lineHeight: tokens.typography.lineHeightHeadline, fontFamily: tokens.typography.fontFamily, fontWeight: "800", textTransform: "uppercase", flex: 1, paddingRight: tokens.spacing.sm }}>{title}</Text>
        <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>SPEC_V1.2</Text>
      </View>
      <View style={{ gap: tokens.spacing.md }}>
        <View style={{ borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: resolveColor("border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, gap: tokens.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>Grid</Text>
            <Text style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>24px</Text>
          </View>
          <View style={{ height: 120, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: resolveColor("borderStrong"), alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 52, height: 52, borderRadius: tokens.radius.pill, borderWidth: 3, borderColor: resolveColor("accent"), alignItems: "center", justifyContent: "center" }}>
              <MobileIcon name="home" size={22} color={resolveColor("ink")} />
            </View>
          </View>
          <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightBody }}>Fixed 24px bounding box with 2px safe padding.</Text>
        </View>
        <View style={{ borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: resolveColor("border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, gap: tokens.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>Stroke</Text>
            <Text style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightLabel }}>1.5px</Text>
          </View>
          <View style={{ height: 120, borderRadius: tokens.radius.md, backgroundColor: "rgba(7, 10, 18, 0.95)", alignItems: "center", justifyContent: "center", gap: tokens.spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
              <MobileIcon name="strokeOutline" size={24} color={resolveColor("ink")} />
              <MobileIcon name="strokeFill" size={24} color={resolveColor("ink")} />
            </View>
            <View style={{ width: 100, height: 4, borderRadius: tokens.radius.pill, backgroundColor: resolveColor("accent") }} />
          </View>
          <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: tokens.typography.bodySmallSize, lineHeight: tokens.typography.lineHeightBody }}>Outlined inactive to filled active transition.</Text>
        </View>
      </View>
    </View>
  );
}
