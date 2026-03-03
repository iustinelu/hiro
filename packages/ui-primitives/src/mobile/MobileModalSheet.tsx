import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import type { ModalSheetProps } from "../shared/types";
import { MobileButton } from "./MobileButton";
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
  if (!open) {
    return null;
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: resolveColor(tokens.component.modalSheet.overlay)
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            borderTopLeftRadius: tokens.radius.xxl,
            borderTopRightRadius: tokens.radius.xxl,
            borderTopWidth: 1,
            borderColor: resolveColor(tokens.component.modalSheet.border),
            backgroundColor: resolveColor(tokens.component.modalSheet.bg),
            padding: tokens.spacing.xl,
            gap: tokens.spacing.md
          }}
        >
          {title ? (
            <Text
              style={{
                color: resolveColor("ink"),
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.subtitleSize,
                fontWeight: "800"
              }}
            >
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text
              style={{
                color: resolveColor("inkMuted"),
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.bodySize
              }}
            >
              {description}
            </Text>
          ) : null}
          {children}
          <View style={{ flexDirection: "row", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
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
