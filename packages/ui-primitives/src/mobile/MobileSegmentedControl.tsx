import React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { SegmentedControlProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileSegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: tokens.spacing.xs,
        padding: tokens.spacing.xs,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: resolveColor("border"),
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
              borderRadius: tokens.radius.sm,
              paddingVertical: tokens.spacing.sm,
              paddingHorizontal: tokens.spacing.md,
              backgroundColor: active ? resolveColor("accent") : "transparent"
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: active ? resolveColor("ink") : resolveColor("inkSoft"),
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.bodySmallSize,
                fontWeight: "700"
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
