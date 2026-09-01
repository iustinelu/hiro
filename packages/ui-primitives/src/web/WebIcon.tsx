import { BarChart3, Check, Circle, CircleAlert, CircleDot, Compass, Gift, House, Inbox, Link2, ListChecks, LoaderCircle, MoreHorizontal, Plus, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import type { IconName } from "../shared/types";

interface WebIconProps {
  name: IconName;
  size?: number;
  color?: string;
  // Accepted for cross-platform API symmetry with MobileIcon. No-op on web:
  // lucide icons are stroke-based and active emphasis is CSS/currentColor-driven.
  filled?: boolean;
}

const iconMap = {
  spark: Sparkles,
  shield: ShieldCheck,
  integrations: Link2,
  empty: Inbox,
  loading: LoaderCircle,
  error: CircleAlert,
  home: House,
  tasks: ListChecks,
  progress: BarChart3,
  budget: Wallet,
  rewards: Gift,
  more: MoreHorizontal,
  strokeOutline: Circle,
  strokeFill: CircleDot,
  close: X,
  check: Check,
  add: Plus,
  navigation: Compass
} as const;

export function WebIcon({ name, size = 18, color = "currentColor" }: WebIconProps) {
  const IconComponent = iconMap[name];
  return <IconComponent size={size} color={color} strokeWidth={2} aria-hidden />;
}
