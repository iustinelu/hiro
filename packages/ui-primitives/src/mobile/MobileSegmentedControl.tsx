import React from "react";
import { Pressable, Text, View } from "react-native";
import type { SegmentedControlProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

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
        backgroundColor: resolveColor(t, "surface")
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
                fontFamily: resolveFontFamily(t, 700),
                fontSize: t.typography.bodySmallSize,
                lineHeight: t.typography.lineHeightLabel,
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
