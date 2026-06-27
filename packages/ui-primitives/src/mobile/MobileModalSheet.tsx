import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { ModalSheetProps } from "../shared/types";
import { MobileButton } from "./MobileButton";
import { useTheme } from "./theme-context";
import { resolveColor, resolveFontFamily } from "./utils";

export function MobileModalSheet({
  open,
  title,
  description,
  children,
  primaryActionLabel,
  primaryActionVariant = "primary",
  primaryActionDisabled,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  onClose
}: ModalSheetProps) {
  const t = useTheme();
  if (!open) {
    return null;
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      {/* Lift the bottom-anchored sheet above the on-screen keyboard so focused
          inputs stay visible (Android adjustResize otherwise hides them). */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: resolveColor(t, t.component.modalSheet.overlay as keyof typeof t.color)
          }}
          onPress={onClose}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              borderTopLeftRadius: t.radius.xxl,
              borderTopRightRadius: t.radius.xxl,
              borderTopWidth: 1,
              borderColor: resolveColor(t, t.component.modalSheet.border as keyof typeof t.color),
              backgroundColor: resolveColor(t, t.component.modalSheet.bg as keyof typeof t.color),
              padding: t.spacing.xl,
              gap: t.spacing.md,
              maxHeight: "80%"
            }}
          >
            {title ? (
              <Text
                style={{
                  color: resolveColor(t, "ink"),
                  fontFamily: resolveFontFamily(t, 800),
                  fontSize: t.typography.subtitleSize
                }}
              >
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text
                style={{
                  color: resolveColor(t, "inkMuted"),
                  fontFamily: resolveFontFamily(t, 400),
                  fontSize: t.typography.bodySize
                }}
              >
                {description}
              </Text>
            ) : null}
            {/* Form content scrolls; action buttons stay pinned below it. */}
            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ gap: t.spacing.md }}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: t.spacing.sm, flexWrap: "wrap" }}>
              {secondaryActionLabel ? (
                <MobileButton label={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
              ) : null}
              {primaryActionLabel ? (
                <MobileButton
                  label={primaryActionLabel}
                  variant={primaryActionVariant}
                  disabled={primaryActionDisabled}
                  onPress={onPrimaryAction}
                />
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
