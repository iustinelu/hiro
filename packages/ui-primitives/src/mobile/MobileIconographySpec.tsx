import React from "react";
import { Text, View } from "react-native";
import type { IconographySpecProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily, resolveFontFamilyMono } from "./utils";

export function MobileIconographySpec({ title = "Iconography Standards" }: IconographySpecProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: resolveColor(t, "inkMuted"), fontSize: t.typography.titleSize, lineHeight: t.typography.lineHeightHeadline, fontFamily: resolveFontFamily(t, 800), textTransform: "uppercase", flex: 1, paddingRight: t.spacing.sm }}>{title}</Text>
        <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>SPEC_V1.2</Text>
      </View>
      <View style={{ gap: t.spacing.md }}>
        <View style={{ borderRadius: t.radius.lg, borderWidth: 1, borderColor: resolveColor(t, "border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: t.spacing.lg, gap: t.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor(t, "inkMuted"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>Grid</Text>
            <Text style={{ color: resolveColor(t, "accent"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>24px</Text>
          </View>
          <View style={{ height: 120, borderRadius: t.radius.md, borderWidth: 1, borderColor: resolveColor(t, "borderStrong"), alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 52, height: 52, borderRadius: t.radius.pill, borderWidth: 3, borderColor: resolveColor(t, "accent"), alignItems: "center", justifyContent: "center" }}>
              <MobileIcon name="home" size={22} color={resolveColor(t, "ink")} />
            </View>
          </View>
          <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: resolveFontFamily(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightBody }}>Fixed 24px bounding box with 2px safe padding.</Text>
        </View>
        <View style={{ borderRadius: t.radius.lg, borderWidth: 1, borderColor: resolveColor(t, "border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: t.spacing.lg, gap: t.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor(t, "inkMuted"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>Stroke</Text>
            <Text style={{ color: resolveColor(t, "accent"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>1.5px</Text>
          </View>
          <View style={{ height: 120, borderRadius: t.radius.md, backgroundColor: "rgba(7, 10, 18, 0.95)", alignItems: "center", justifyContent: "center", gap: t.spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
              <MobileIcon name="strokeOutline" size={24} color={resolveColor(t, "ink")} />
              <MobileIcon name="strokeFill" size={24} color={resolveColor(t, "ink")} />
            </View>
            <View style={{ width: 100, height: 4, borderRadius: t.radius.pill, backgroundColor: resolveColor(t, "accent") }} />
          </View>
          <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: resolveFontFamily(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightBody }}>Outlined inactive to filled active transition.</Text>
        </View>
      </View>
    </View>
  );
}
