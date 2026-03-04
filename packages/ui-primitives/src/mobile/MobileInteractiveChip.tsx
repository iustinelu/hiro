import React from "react";
import { Pressable, Text } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { InteractiveChipProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
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
        borderWidth: 2,
        borderColor: active ? resolveColor("accent") : resolveColor("borderStrong"),
        backgroundColor: active ? "rgba(255,109,36,0.12)" : "rgba(20, 24, 40, 0.92)",
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.md
      }}
    >
      {leadingIcon ? <MobileIcon name={leadingIcon} size={14} color={active ? resolveColor("accent") : resolveColor("ink")} /> : null}
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
          <MobileIcon name="close" size={12} color={resolveColor("inkSoft")} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
