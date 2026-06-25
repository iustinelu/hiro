import React from "react";
import { Text, View } from "react-native";
import type { CardProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

export function MobileCard({ title, description, tone = "default", children }: CardProps) {
  const t = useTheme();
  const backgroundColor =
    tone === "accent"
      ? resolveColor(t, t.component.card.accentBg as keyof typeof t.color)
      : tone === "warning"
        ? resolveColor(t, t.component.card.warningBg as keyof typeof t.color)
        : resolveColor(t, t.component.card.bg as keyof typeof t.color);

  return (
    <View
      style={{
        gap: t.spacing.sm,
        borderRadius: t.radius.xl,
        borderWidth: t.flags.borderWidth,
        borderColor: resolveColor(t, t.component.card.border as keyof typeof t.color),
        backgroundColor,
        padding: t.spacing.xl
      }}
    >
      {t.flags.cardAccentBar ? (
        <View
          style={{
            height: 3,
            borderRadius: t.radius.pill,
            backgroundColor: resolveColor(t, "accent")
          }}
        />
      ) : null}
      {title ? (
        <Text
          style={{
            color: resolveColor(t, t.component.card.fg as keyof typeof t.color),
            fontFamily: resolveFontFamily(t, 800),
            fontSize: t.typography.subtitleSize,
            lineHeight: t.typography.lineHeightHeadline,
            flexShrink: 1
          }}
        >
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: resolveFontFamily(t, 400),
            fontSize: t.typography.bodySmallSize,
            lineHeight: t.typography.lineHeightBody,
            flexShrink: 1
          }}
        >
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
