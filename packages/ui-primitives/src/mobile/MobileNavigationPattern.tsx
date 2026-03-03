import React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { NavigationPatternProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileNavigationPattern({ activeTabLabel = "TAB_BAR_ACTIVE_STATE", tabs, activeTab, onChange }: NavigationPatternProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm }}>
        <Text style={{ color: resolveColor("accent"), fontSize: 14 }}>▲</Text>
        <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamily, fontSize: 18, textTransform: "uppercase", fontWeight: "800" }}>Navigation Patterns</Text>
      </View>
      <View style={{ borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: resolveColor("border"), backgroundColor: "rgba(11, 15, 29, 0.92)", padding: tokens.spacing.lg, gap: tokens.spacing.lg }}>
        <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, fontSize: 12 }}>{activeTabLabel}</Text>
        <View style={{ flexDirection: "row", gap: tokens.spacing.md }}>
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable key={tab.id} onPress={() => onChange?.(tab.id)} style={{ flex: 1, alignItems: "center", gap: 8, paddingVertical: tokens.spacing.sm }}>
                <View
                  style={{
                    width: 32,
                    height: 4,
                    borderRadius: tokens.radius.pill,
                    backgroundColor: active ? resolveColor("accent") : "transparent"
                  }}
                />
                <Text style={{ color: active ? resolveColor("ink") : resolveColor("inkSoft"), fontSize: 16 }}>{active ? "▦" : "◻"}</Text>
                <Text style={{ color: active ? resolveColor("ink") : resolveColor("inkSoft"), textTransform: "uppercase", fontFamily: tokens.typography.fontFamilyMono, fontSize: 11 }}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ borderRadius: tokens.radius.lg, backgroundColor: "rgba(4, 7, 16, 0.95)", padding: tokens.spacing.md, borderWidth: 1, borderColor: resolveColor("border"), gap: tokens.spacing.xs }}>
          <Text style={{ color: resolveColor("accentAlt"), fontFamily: tokens.typography.fontFamilyMono, fontSize: 13 }}>Indicator Logic</Text>
          <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamily, fontSize: 14, lineHeight: 20 }}>
            Active tab uses cobalt-to-orange gradient bar (32x4dp) anchored to top border with 8px blur glow.
          </Text>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: resolveColor("accentStrong"), backgroundColor: "rgba(92, 42, 20, 0.28)", borderRadius: tokens.radius.md, alignItems: "center", paddingVertical: tokens.spacing.sm }}>
          <Text style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono, letterSpacing: 1.4 }}>IOS SAFE AREA (34PT)</Text>
        </View>
      </View>
    </View>
  );
}
