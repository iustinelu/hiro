import React from "react";
import { Pressable, Text, View } from "react-native";
import type { SegmentedControlProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

export function MobileSegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        gap: t.spacing.xs,
        padding: t.spacing.xs,
        borderRadius: t.radius.md,
        borderWidth: t.flags.borderWidth,
        borderColor: resolveColor(t, "border"),
        backgroundColor: "rgba(17, 20, 33, 0.9)"
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange?.(option.value)}
            style={{
              flex: 1,
              borderRadius: t.radius.sm,
              paddingVertical: t.spacing.sm,
              paddingHorizontal: t.spacing.md,
              backgroundColor: active ? resolveColor(t, "accent") : "transparent"
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: active ? resolveColor(t, "ink") : resolveColor(t, "inkMuted"),
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.bodySmallSize,
                lineHeight: t.typography.lineHeightLabel,
                fontWeight: "700",
                flexShrink: 1
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
