import React from "react";
import { Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { PresenceAvatarProps } from "../shared/types";
import { resolveColor } from "./utils";

const statusColorByState = {
  online: "success",
  idle: "warning",
  offline: "error"
} as const;

const sizeByVariant = {
  sm: 32,
  md: 44,
  lg: 56
} as const;

export function MobilePresenceAvatar({ name, status = "online", highlighted, size = "md" }: PresenceAvatarProps) {
  const avatarSize = sizeByVariant[size];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View style={{ position: "relative", width: avatarSize, height: avatarSize }}>
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: tokens.radius.pill,
          borderWidth: 2,
          borderColor: highlighted ? resolveColor("accent") : resolveColor("borderStrong"),
          backgroundColor: resolveColor("surfaceMuted"),
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ color: resolveColor("ink"), fontFamily: tokens.typography.fontFamily, fontWeight: "700" }}>
          {initials}
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: Math.max(10, Math.round(avatarSize * 0.28)),
          height: Math.max(10, Math.round(avatarSize * 0.28)),
          borderRadius: tokens.radius.pill,
          borderWidth: 2,
          borderColor: resolveColor("bg"),
          backgroundColor: resolveColor(statusColorByState[status])
        }}
      />
    </View>
  );
}
