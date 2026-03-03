import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { ListRowProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileListRow({
  title,
  subtitle,
  meta,
  density = "comfortable",
  disabled,
  onPress
}: ListRowProps) {
  const verticalPadding = density === "compact" ? tokens.spacing.sm : tokens.spacing.md;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        minHeight: tokens.size.touchMin,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor(tokens.component.listRow.border),
        backgroundColor: disabled
          ? resolveColor("surface")
          : resolveColor(tokens.component.listRow.bg),
        paddingVertical: verticalPadding,
        paddingHorizontal: tokens.spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacing.md
      }}
    >
      <View style={{ flex: 1, gap: tokens.spacing.xs }}>
        <Text
          numberOfLines={1}
          style={{
            color: resolveColor(tokens.component.listRow.fg),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.bodySize,
            fontWeight: "700"
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              color: resolveColor("inkMuted"),
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySmallSize
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text
          style={{
            color: resolveColor("accentInk"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.labelSize,
            fontWeight: "700"
          }}
        >
          {meta}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
