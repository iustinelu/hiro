import React from "react";
import { Pressable, Text, View } from "react-native";
import type { NavigationPatternProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily, resolveFontFamilyMono } from "./utils";

export function MobileNavigationPattern({ activeTabLabel = "TAB_BAR_ACTIVE_STATE", tabs, activeTab, onChange }: NavigationPatternProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
        <MobileIcon name="navigation" size={16} color={resolveColor(t, "accent")} />
        <Text style={{ color: resolveColor(t, "inkMuted"), fontFamily: resolveFontFamily(t, 800), fontSize: t.typography.titleSize, lineHeight: t.typography.lineHeightHeadline, textTransform: "uppercase", flex: 1 }}>
          Navigation Patterns
        </Text>
      </View>
      <View style={{ borderRadius: t.radius.xl, borderWidth: 1, borderColor: resolveColor(t, "border"), backgroundColor: "rgba(11, 15, 29, 0.92)", padding: t.spacing.lg, gap: t.spacing.lg }}>
        <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>{activeTabLabel}</Text>
        <View style={{ flexDirection: "row", gap: t.spacing.md }}>
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable key={tab.id} onPress={() => onChange?.(tab.id)} style={{ flex: 1, alignItems: "center", gap: 8, paddingVertical: t.spacing.sm }}>
                <View
                  style={{
                    width: 32,
                    height: 4,
                    borderRadius: t.radius.pill,
                    backgroundColor: active ? resolveColor(t, "accent") : "transparent"
                  }}
                />
                <MobileIcon name={active ? "strokeFill" : "strokeOutline"} size={16} color={active ? resolveColor(t, "ink") : resolveColor(t, "inkSoft")} />
                <Text style={{ color: active ? resolveColor(t, "ink") : resolveColor(t, "inkMuted"), textTransform: "uppercase", fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel, textAlign: "center" }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ borderRadius: t.radius.lg, backgroundColor: "rgba(4, 7, 16, 0.95)", padding: t.spacing.md, borderWidth: 1, borderColor: resolveColor(t, "border"), gap: t.spacing.xs }}>
          <Text style={{ color: resolveColor(t, "accentAlt"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel }}>Indicator Logic</Text>
          <Text style={{ color: resolveColor(t, "inkMuted"), fontFamily: resolveFontFamily(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightBody }}>
            Active tab uses cobalt-to-orange gradient bar (32x4dp) anchored to top border with 8px blur glow.
          </Text>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: resolveColor(t, "accentStrong"), backgroundColor: "rgba(92, 42, 20, 0.28)", borderRadius: t.radius.md, alignItems: "center", paddingVertical: t.spacing.sm }}>
          <Text style={{ color: resolveColor(t, "accent"), fontFamily: resolveFontFamilyMono(t, 400), fontSize: t.typography.bodySmallSize, lineHeight: t.typography.lineHeightLabel, letterSpacing: 1.4 }}>
            IOS SAFE AREA (34PT)
          </Text>
        </View>
      </View>
    </View>
  );
}
