import React from "react";
import { Text, View } from "react-native";
import type { EmptyStatePanelProps } from "../shared/types";
import { MobileButton } from "./MobileButton";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily, resolveFontFamilyMono } from "./utils";

export function MobileEmptyStatePanel({
  title,
  description,
  icon = "empty",
  subtitle = "SPEC 04.3",
  variant = "spec",
  actionLabel,
  onAction
}: EmptyStatePanelProps) {
  const t = useTheme();

  // Compact, friendly panel for use inside real feature surfaces (board sections,
  // etc.): normal casing, smaller footprint, optional call to action.
  if (variant === "inline") {
    return (
      <View
        style={{
          borderRadius: t.radius.xl,
          borderWidth: t.flags.borderWidth,
          borderStyle: "dashed",
          borderColor: resolveColor(t, "borderStrong"),
          backgroundColor: resolveColor(t, "surfaceMuted"),
          paddingVertical: t.spacing.xl,
          paddingHorizontal: t.spacing.lg,
          alignItems: "center",
          gap: t.spacing.sm
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: t.radius.pill,
            borderWidth: t.flags.borderWidth,
            borderColor: resolveColor(t, "borderStrong"),
            backgroundColor: resolveColor(t, "surface"),
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <MobileIcon name={icon} size={22} color={resolveColor(t, "accent")} />
        </View>
        <Text
          style={{
            color: resolveColor(t, "ink"),
            fontFamily: resolveFontFamily(t, 700),
            fontSize: t.typography.bodySize,
            textAlign: "center",
            textTransform: t.flags.textTransform
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: resolveFontFamily(t, 400),
            fontSize: t.typography.bodySmallSize,
            lineHeight: t.typography.lineHeightBody,
            textAlign: "center"
          }}
        >
          {description}
        </Text>
        {actionLabel && onAction ? (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label={actionLabel} variant="secondary" size="sm" onPress={onAction} />
          </View>
        ) : null}
      </View>
    );
  }

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
