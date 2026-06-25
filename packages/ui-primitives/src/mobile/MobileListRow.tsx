import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { ListRowProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

export function MobileListRow({
  title,
  subtitle,
  meta,
  density = "comfortable",
  disabled,
  onPress
}: ListRowProps) {
  const t = useTheme();
  const verticalPadding = density === "compact" ? t.spacing.sm : t.spacing.md;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        minHeight: t.size.touchMin,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: resolveColor(t, t.component.listRow.border as keyof typeof t.color),
        backgroundColor: disabled
          ? resolveColor(t, "surface")
          : resolveColor(t, t.component.listRow.bg as keyof typeof t.color),
        paddingVertical: verticalPadding,
        paddingHorizontal: t.spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: t.spacing.md
      }}
    >
      <View style={{ flex: 1, gap: t.spacing.xs }}>
        <Text
          numberOfLines={1}
          style={{
            color: resolveColor(t, t.component.listRow.fg as keyof typeof t.color),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySize,
            fontWeight: "700"
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              color: resolveColor(t, "inkMuted"),
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.bodySmallSize
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text
          style={{
            color: resolveColor(t, "accentInk"),
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.labelSize,
            fontWeight: "700"
          }}
        >
          {meta}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
