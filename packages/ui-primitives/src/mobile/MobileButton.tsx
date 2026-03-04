import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { ButtonProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { buttonPaddingBySize, getButtonColors, resolveColor } from "./utils";

export function MobileButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  loadingLabel,
  fullWidth,
  onPress
}: ButtonProps) {
  const colors = getButtonColors(variant);
  const busy = Boolean(disabled || loading);
  return (
    <TouchableOpacity
      disabled={busy}
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        minHeight: tokens.size.touchMin,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: busy ? resolveColor("disabledBorder") : colors.border,
        backgroundColor: busy ? resolveColor("disabledBg") : colors.background,
        opacity: 1,
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : undefined,
        ...buttonPaddingBySize[size]
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.xs }}>
        {loading ? <MobileIcon name="loading" size={14} color={busy ? resolveColor("disabledInk") : colors.foreground} /> : null}
        <Text
          style={{
            color: busy ? resolveColor("disabledInk") : colors.foreground,
            fontFamily: tokens.typography.fontFamily,
            fontWeight: "800",
            fontSize: tokens.typography.bodySmallSize,
            letterSpacing: 0.2
          }}
        >
          {loading ? loadingLabel ?? "Processing" : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
