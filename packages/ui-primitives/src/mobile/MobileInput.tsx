import React from "react";
import { Text, TextInput, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { InputProps } from "../shared/types";
import { resolveColor } from "./utils";

export function MobileInput({
  label,
  placeholder,
  value,
  state = "default",
  helperText,
  onChangeText,
  secureTextEntry
}: InputProps) {
  const borderColor =
    state === "error"
      ? resolveColor(tokens.component.input.errorBorder)
      : state === "success"
        ? resolveColor(tokens.component.input.successBorder)
        : resolveColor(tokens.component.input.border);

  return (
    <View style={{ gap: tokens.spacing.xs }}>
      {label ? (
        <Text
          style={{
            color: resolveColor("inkMuted"),
            fontFamily: tokens.typography.fontFamily,
            fontWeight: "700",
            fontSize: tokens.typography.labelSize,
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
        onChangeText={onChangeText}
        placeholderTextColor={resolveColor("inkSoft")}
        style={{
          minHeight: tokens.size.touchMin,
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor,
          backgroundColor: resolveColor(tokens.component.input.bg),
          color: resolveColor(tokens.component.input.fg),
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize
        }}
      />
      {helperText ? (
        <Text
          style={{
            color: state === "error" ? resolveColor("error") : resolveColor("inkSoft"),
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.labelSize
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
