import type { ReactNode } from "react";

export type PrimitiveSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type InputState = "default" | "error" | "success" | "disabled";
export type CardTone = "default" | "accent" | "warning";
export type ListRowDensity = "comfortable" | "compact";
export type FeedbackState = "loading" | "empty" | "error";

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: PrimitiveSize;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  state?: InputState;
  helperText?: string;
  onChangeText?: (nextValue: string) => void;
  secureTextEntry?: boolean;
}

export interface CardProps {
  title?: string;
  description?: string;
  tone?: CardTone;
  children?: ReactNode;
}

export interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  density?: ListRowDensity;
  disabled?: boolean;
  onPress?: () => void;
}

export interface ModalSheetProps {
  open: boolean;
  title?: string;
  description?: string;
  children?: ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onClose?: () => void;
}

export interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export interface FeedbackStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}
