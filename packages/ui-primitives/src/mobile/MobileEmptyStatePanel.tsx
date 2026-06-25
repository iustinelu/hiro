import React from "react";
import { Text, View } from "react-native";
import type { EmptyStatePanelProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily, resolveFontFamilyMono } from "./utils";

export function MobileEmptyStatePanel({
  title,
  description,
  icon = "empty",
  subtitle = "SPEC 04.3"
}: EmptyStatePanelProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: resolveColor(t, "ink"), fontSize: 18, fontFamily: resolveFontFamily(t, 800) }}>EMPTY STATE</Text>
        <Text style={{ color: resolveColor(t, "inkSoft"), fontFamily: resolveFontFamilyMono(t, 400), letterSpacing: 1.4 }}>{subtitle}</Text>
      </View>
      <View
        style={{
          borderRadius: t.radius.xl,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: resolveColor(t, "borderStrong"),
          minHeight: 220,
          alignItems: "center",
          justifyContent: "center",
          padding: t.spacing.xl,
          backgroundColor: resolveColor(t, "surfaceMuted")
        }}
      >
        <View style={{ alignItems: "center", gap: t.spacing.md }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: t.radius.pill,
              borderWidth: 1,
              borderColor: resolveColor(t, "accentStrong"),
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <MobileIcon name={icon} size={28} color={resolveColor(t, "inkSoft")} />
          </View>
          <Text style={{ color: resolveColor(t, "inkMuted"), fontSize: t.typography.titleSize, fontFamily: resolveFontFamily(t, 700) }}>{title}</Text>
          <Text
            style={{
              color: resolveColor(t, "inkSoft"),
              fontFamily: resolveFontFamilyMono(t, 400),
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
