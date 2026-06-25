import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { ButtonProps } from "../shared/types";
import { MobileIcon } from "./MobileIcon";
import { useTheme } from "./theme-context";
import { buttonPaddingBySize, getButtonColors, resolveColor, resolveFontFamily } from "./utils";

export function MobileButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  loadingLabel,
  fullWidth,
  iconLeft,
  onPress
}: ButtonProps) {
  const t = useTheme();
  const colors = getButtonColors(t, variant);
  const busy = Boolean(disabled || loading);
  return (
    <TouchableOpacity
      disabled={busy}
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        minHeight: t.size.touchMin,
        borderRadius: t.radius.lg,
        borderWidth: t.flags.borderWidth,
        borderColor: busy ? resolveColor(t, "disabledBorder") : colors.border,
        backgroundColor: busy ? resolveColor(t, "disabledBg") : colors.background,
        opacity: 1,
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : undefined,
        ...buttonPaddingBySize(t)[size]
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
        {loading
          ? <MobileIcon name="loading" size={14} color={busy ? resolveColor(t, "disabledInk") : colors.foreground} />
          : iconLeft ?? null}
        <Text
          style={{
            color: busy ? resolveColor(t, "disabledInk") : colors.foreground,
            fontFamily: resolveFontFamily(t, 800),
            fontSize: t.typography.bodySmallSize,
            letterSpacing: 0.2,
            textTransform: t.flags.textTransform
          }}
        >
          {loading ? loadingLabel ?? "Processing" : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
