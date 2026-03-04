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
        backgroundColor: "rgba(15, 18, 30, 0.72)"
      }}
    >
      <Text
        style={{
          color: resolveColor("ink"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          lineHeight: tokens.typography.lineHeightBody,
          fontWeight: "600",
          flex: 1,
          paddingRight: tokens.spacing.sm
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
          backgroundColor: value ? resolveColor("accent") : resolveColor("surfaceStrong"),
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
            backgroundColor: value ? resolveColor("ink") : resolveColor("inkMuted")
          }}
        />
      </Pressable>
    </View>
  );
}
