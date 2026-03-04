import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { CardProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileCard({ title, description, tone = "default", children }: CardProps) {
  const backgroundColor =
    tone === "accent"
      ? resolveColor(tokens.component.card.accentBg)
      : tone === "warning"
        ? resolveColor(tokens.component.card.warningBg)
        : resolveColor(tokens.component.card.bg);

  return (
    <View
      style={{
        gap: tokens.spacing.sm,
        borderRadius: tokens.radius.xl,
        borderWidth: 1,
        borderColor: resolveColor(tokens.component.card.border),
        backgroundColor,
        padding: tokens.spacing.xl
      }}
    >
      <View
        style={{
          height: 3,
          borderRadius: tokens.radius.pill,
          backgroundColor: resolveColor("accent")
        }}
      />
      {title ? (
        <Text
          style={{
            color: resolveColor(tokens.component.card.fg),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.subtitleSize,
            lineHeight: tokens.typography.lineHeightHeadline,
            flexShrink: 1,
            fontWeight: "800"
          }}
        >
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySmallSize,
            lineHeight: tokens.typography.lineHeightBody,
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
