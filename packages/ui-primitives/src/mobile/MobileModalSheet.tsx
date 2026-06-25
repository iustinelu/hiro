import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import type { ModalSheetProps } from "../shared/types";
import { MobileButton } from "./MobileButton";
import { useTheme } from "./theme-context";
import { resolveColor } from "./utils";

export function MobileModalSheet({
  open,
  title,
  description,
  children,
  primaryActionLabel,
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
            gap: t.spacing.md
          }}
        >
          {title ? (
            <Text
              style={{
                color: resolveColor(t, "ink"),
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.subtitleSize,
                fontWeight: "800"
              }}
            >
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text
              style={{
                color: resolveColor(t, "inkMuted"),
                fontFamily: t.typography.fontFamily,
                fontSize: t.typography.bodySize
              }}
            >
              {description}
            </Text>
          ) : null}
          {children}
          <View style={{ flexDirection: "row", gap: t.spacing.sm, flexWrap: "wrap" }}>
            {secondaryActionLabel ? (
              <MobileButton label={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
            ) : null}
            {primaryActionLabel ? (
              <MobileButton label={primaryActionLabel} variant="primary" onPress={onPrimaryAction} />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
