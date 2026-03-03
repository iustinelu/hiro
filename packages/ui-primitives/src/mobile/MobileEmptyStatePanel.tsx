import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { EmptyStatePanelProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileEmptyStatePanel({
  title,
  description,
  icon = "▦",
  subtitle = "SPEC 04.3"
}: EmptyStatePanelProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: resolveColor("ink"), fontWeight: "800", fontSize: 18, fontFamily: tokens.typography.fontFamily }}>EMPTY STATE</Text>
        <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono, letterSpacing: 1.4 }}>{subtitle}</Text>
      </View>
      <View
        style={{
          borderRadius: tokens.radius.xl,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: resolveColor("borderStrong"),
          minHeight: 220,
          alignItems: "center",
          justifyContent: "center",
          padding: tokens.spacing.xl,
          backgroundColor: "rgba(10, 14, 28, 0.66)"
        }}
      >
        <View style={{ alignItems: "center", gap: tokens.spacing.md }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: tokens.radius.pill,
              borderWidth: 1,
              borderColor: resolveColor("accentStrong"),
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: resolveColor("inkSoft"), fontSize: 28 }}>{icon}</Text>
          </View>
          <Text style={{ color: resolveColor("inkMuted"), fontSize: 36, fontFamily: tokens.typography.fontFamily, fontWeight: "700" }}>{title}</Text>
          <Text
            style={{
              color: resolveColor("inkSoft"),
              fontFamily: tokens.typography.fontFamilyMono,
              fontSize: 18,
              letterSpacing: 1.6,
              textTransform: "uppercase"
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}
