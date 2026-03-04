import type { ReactNode } from "react";

export type PrimitiveSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type InputState = "default" | "error" | "success" | "disabled";
export type CardTone = "default" | "accent" | "warning";
export type ListRowDensity = "comfortable" | "compact";
export type FeedbackState = "loading" | "empty" | "error";
export type BadgeTone = "success" | "warning" | "error" | "neutral";
export type PresenceStatus = "online" | "idle" | "offline";
export type IconName =
  | "spark"
  | "shield"
  | "integrations"
  | "empty"
  | "loading"
  | "error"
  | "home"
  | "strokeOutline"
  | "strokeFill"
  | "close"
  | "navigation";

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: PrimitiveSize;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
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
  forceFocused?: boolean;
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

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange?: (nextValue: string) => void;
}

export interface PresenceAvatarProps {
  name: string;
  status?: PresenceStatus;
  highlighted?: boolean;
  size?: PrimitiveSize;
}

export interface KpiTileProps {
  title: string;
  value: string;
  deltaLabel?: string;
  deltaTone?: BadgeTone;
  bars?: number[];
  accent?: "primary" | "accent";
}

export interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

export interface SwitchRowProps {
  label: string;
  value: boolean;
  onToggle?: (nextValue: boolean) => void;
}

export interface InteractiveChipProps {
  label: string;
  active?: boolean;
  leadingIcon?: IconName;
  removable?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}

export interface EmptyStatePanelProps {
  title: string;
  description: string;
  icon?: IconName;
  subtitle?: string;
}

export interface SpacingMatrixProps {
  title?: string;
}

export interface IconographySpecProps {
  title?: string;
}

export interface NavigationPatternProps {
  activeTabLabel?: string;
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange?: (nextTab: string) => void;
}
