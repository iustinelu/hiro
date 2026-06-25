import React from "react";
import { Pressable, Text } from "react-native";
import type { InteractiveChipProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

export function MobileInteractiveChip({
  label,
  active,
  leadingIcon,
  removable,
  onPress,
  onRemove
}: InteractiveChipProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing.xs,
        borderRadius: t.radius.pill,
        borderWidth: 2,
        borderColor: active ? resolveColor(t, "accent") : resolveColor(t, "borderStrong"),
        backgroundColor: active ? resolveColor(t, "accentSoft") : resolveColor(t, "surfaceStrong"),
        paddingVertical: t.spacing.sm,
        paddingHorizontal: t.spacing.md
      }}
    >
      {leadingIcon ? <MobileIcon name={leadingIcon} size={14} color={active ? resolveColor(t, "accent") : resolveColor(t, "ink")} /> : null}
      <Text
        style={{
          color: active ? resolveColor(t, "accent") : resolveColor(t, "ink"),
          fontFamily: resolveFontFamily(t, 600),
          fontSize: t.typography.bodySmallSize
        }}
      >
        {label}
      </Text>
      {removable ? (
        <Pressable onPress={onRemove}>
          <MobileIcon name="close" size={12} color={resolveColor(t, "inkSoft")} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
