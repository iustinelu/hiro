import React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { SwitchRowProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileSwitchRow({ label, value, onToggle }: SwitchRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.md,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: resolveColor("border"),
        backgroundColor: "rgba(255,255,255,0.02)"
      }}
    >
      <Text
        style={{
          color: resolveColor("inkMuted"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          fontWeight: "600"
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => onToggle?.(!value)}
        style={{
          width: 38,
          height: 22,
          borderRadius: tokens.radius.pill,
          backgroundColor: value ? resolveColor("accent") : "rgba(255,255,255,0.12)",
          position: "relative"
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 2,
            left: value ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: tokens.radius.pill,
            backgroundColor: resolveColor("ink")
          }}
        />
      </Pressable>
    </View>
  );
}
