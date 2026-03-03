import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { IconographySpecProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileIconographySpec({ title = "Iconography Standards" }: IconographySpecProps) {
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: resolveColor("inkMuted"), fontSize: 18, fontFamily: tokens.typography.fontFamily, fontWeight: "800", textTransform: "uppercase" }}>{title}</Text>
        <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamilyMono }}>SPEC_V1.2</Text>
      </View>
      <View style={{ gap: tokens.spacing.md }}>
        <View style={{ borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: resolveColor("border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, gap: tokens.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono }}>Grid</Text>
            <Text style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono }}>24px</Text>
          </View>
          <View style={{ height: 120, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: resolveColor("borderStrong"), alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 52, height: 52, borderRadius: tokens.radius.pill, borderWidth: 3, borderColor: resolveColor("accent"), alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: resolveColor("ink"), fontSize: 22 }}>⌂</Text>
            </View>
          </View>
          <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: 13 }}>Fixed 24px bounding box with 2px safe padding.</Text>
        </View>
        <View style={{ borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: resolveColor("border"), backgroundColor: "rgba(12, 16, 30, 0.9)", padding: tokens.spacing.lg, gap: tokens.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: resolveColor("inkMuted"), fontFamily: tokens.typography.fontFamilyMono }}>Stroke</Text>
            <Text style={{ color: resolveColor("accent"), fontFamily: tokens.typography.fontFamilyMono }}>1.5px</Text>
          </View>
          <View style={{ height: 120, borderRadius: tokens.radius.md, backgroundColor: "rgba(7, 10, 18, 0.95)", alignItems: "center", justifyContent: "center", gap: tokens.spacing.sm }}>
            <Text style={{ color: resolveColor("ink"), fontSize: 26 }}>◌  ◉</Text>
            <View style={{ width: 100, height: 4, borderRadius: tokens.radius.pill, backgroundColor: resolveColor("accent") }} />
          </View>
          <Text style={{ color: resolveColor("inkSoft"), fontFamily: tokens.typography.fontFamily, fontSize: 13 }}>Outlined inactive to filled active transition.</Text>
        </View>
      </View>
    </View>
  );
}
