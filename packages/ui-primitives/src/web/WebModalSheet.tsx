import { tokens } from "@hiro/ui-tokens";
import type { ModalSheetProps } from "../shared/types";
import { WebButton } from "./WebButton";
import { resolveColor } from "./utils";

export function WebModalSheet({
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: resolveColor(tokens.component.modalSheet.overlay),
        display: "grid",
        alignItems: "end",
        zIndex: 1000,
        backdropFilter: "blur(8px)"
      }}
      onClick={onClose}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: resolveColor(tokens.component.modalSheet.bg),
          borderTopLeftRadius: tokens.radius.xxl,
          borderTopRightRadius: tokens.radius.xxl,
          borderTop: `1px solid ${resolveColor(tokens.component.modalSheet.border)}`,
          padding: tokens.spacing.xl,
          display: "grid",
          gap: tokens.spacing.md,
          boxShadow: tokens.elevation.high,
          transform: "translateY(0)",
          transition: `transform ${tokens.motion.duration.normal}ms ${tokens.motion.easing.emphasized}`
        }}
      >
        {title ? (
          <h3
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.subtitleSize,
              color: resolveColor("ink")
            }}
          >
            {title}
          </h3>
        ) : null}
        {description ? (
          <p
            style={{
              margin: 0,
              fontFamily: tokens.typography.fontFamily,
              color: resolveColor("inkMuted"),
              fontSize: tokens.typography.bodySize
            }}
          >
            {description}
          </p>
        ) : null}
        {children}
        <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
          {secondaryActionLabel ? (
            <WebButton label={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
          ) : null}
          {primaryActionLabel ? (
            <WebButton label={primaryActionLabel} variant="primary" onPress={onPrimaryAction} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
