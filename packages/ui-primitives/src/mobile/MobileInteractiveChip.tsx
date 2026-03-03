import React from "react";
import { Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { InteractiveChipProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileInteractiveChip({
  label,
  active,
  leadingIcon,
  removable,
  onPress,
  onRemove
}: InteractiveChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacing.xs,
        borderRadius: tokens.radius.pill,
        borderWidth: 1,
        borderColor: active ? resolveColor("accent") : resolveColor("borderStrong"),
        backgroundColor: active ? resolveColor("accentSoft") : "rgba(255,255,255,0.05)",
        paddingVertical: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.md
      }}
    >
      {leadingIcon ? <Text style={{ color: active ? resolveColor("accent") : resolveColor("ink"), fontSize: 12 }}>{leadingIcon}</Text> : null}
      <Text
        style={{
          color: active ? resolveColor("accent") : resolveColor("ink"),
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          fontWeight: "600"
        }}
      >
        {label}
      </Text>
      {removable ? (
        <Pressable onPress={onRemove}>
          <Text style={{ color: resolveColor("inkSoft"), fontSize: 12 }}>x</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
