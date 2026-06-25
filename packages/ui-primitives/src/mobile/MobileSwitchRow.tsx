import React from "react";
import { Pressable, Text, View } from "react-native";
import type { SwitchRowProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

export function MobileSwitchRow({ label, value, onToggle }: SwitchRowProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: t.spacing.sm,
        paddingHorizontal: t.spacing.md,
        borderRadius: t.radius.md,
        borderWidth: t.flags.borderWidth,
        borderColor: resolveColor(t, "border"),
        backgroundColor: "rgba(15, 18, 30, 0.72)"
      }}
    >
      <Text
        style={{
          color: resolveColor(t, "ink"),
          fontFamily: t.typography.fontFamily,
          fontSize: t.typography.bodySmallSize,
          lineHeight: t.typography.lineHeightBody,
          fontWeight: "600",
          flex: 1,
          paddingRight: t.spacing.sm
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => onToggle?.(!value)}
        style={{
          width: 38,
          height: 22,
          borderRadius: t.radius.pill,
          backgroundColor: value ? resolveColor(t, "accent") : resolveColor(t, "surfaceStrong"),
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
            borderRadius: t.radius.pill,
            backgroundColor: value ? resolveColor(t, "ink") : resolveColor(t, "inkMuted")
          }}
        />
      </Pressable>
    </View>
  );
}
