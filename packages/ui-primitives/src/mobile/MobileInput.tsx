import React from "react";
import { Text, TextInput, View } from "react-native";
import type { InputProps } from "../shared/types";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

export function MobileInput({
  label,
  placeholder,
  value,
  state = "default",
  helperText,
  onChangeText,
  secureTextEntry,
  forceFocused,
  keyboardType
}: InputProps) {
  const t = useTheme();
  const borderColor =
    state === "error"
      ? resolveColor(t, t.component.input.errorBorder as keyof typeof t.color)
      : state === "success"
        ? resolveColor(t, t.component.input.successBorder as keyof typeof t.color)
        : resolveColor(t, t.component.input.border as keyof typeof t.color);

  return (
    <View style={{ gap: t.spacing.xs }}>
      {label ? (
        <Text
          style={{
            color: resolveColor(t, "inkMuted"),
            fontFamily: resolveFontFamily(t, 700),
            fontSize: t.typography.labelSize,
            textTransform: "uppercase"
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        placeholder={placeholder}
        editable={state !== "disabled"}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={resolveColor(t, "inkSoft")}
        style={{
          minHeight: t.size.touchMin,
          borderRadius: t.radius.lg,
          borderWidth: t.flags.borderWidth,
          borderColor: forceFocused ? resolveColor(t, "accent") : borderColor,
          backgroundColor: resolveColor(t, t.component.input.bg as keyof typeof t.color),
          color: resolveColor(t, t.component.input.fg as keyof typeof t.color),
          paddingHorizontal: t.spacing.md,
          paddingVertical: t.spacing.sm,
          fontFamily: resolveFontFamily(t, 400),
          fontSize: t.typography.bodySize,
          shadowColor: forceFocused ? resolveColor(t, "accent") : "transparent",
          shadowOpacity: forceFocused ? 0.3 : 0,
          shadowRadius: forceFocused ? 10 : 0
        }}
      />
      {helperText ? (
        <Text
          style={{
            color: state === "error" ? resolveColor(t, "error") : resolveColor(t, "inkSoft"),
            fontFamily: resolveFontFamily(t, 400),
            fontSize: t.typography.labelSize
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
