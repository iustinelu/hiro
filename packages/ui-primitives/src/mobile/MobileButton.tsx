import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps } from "../shared/types";
import { buttonPaddingBySize, getButtonColors, resolveColor } from "./utils";

export function MobileButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  fullWidth,
  onPress
}: ButtonProps) {
  const colors = getButtonColors(variant);
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        minHeight: tokens.size.touchMin,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: disabled ? resolveColor("disabledBorder") : colors.border,
        backgroundColor: disabled ? resolveColor("disabledBg") : colors.background,
        opacity: 1,
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : undefined,
        ...buttonPaddingBySize[size]
      }}
    >
      <Text
        style={{
          color: disabled ? resolveColor("disabledInk") : colors.foreground,
          fontFamily: tokens.typography.fontFamily,
          fontWeight: "800",
          fontSize: tokens.typography.bodySmallSize,
          letterSpacing: 0.2
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
