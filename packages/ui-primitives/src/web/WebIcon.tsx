import { Circle, CircleAlert, CircleDot, Compass, House, Inbox, Link2, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import type { IconName } from "../shared/types";

interface WebIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const iconMap = {
  spark: Sparkles,
  shield: ShieldCheck,
  integrations: Link2,
  empty: Inbox,
  loading: LoaderCircle,
  error: CircleAlert,
  home: House,
  strokeOutline: Circle,
  strokeFill: CircleDot,
  close: X,
  navigation: Compass
} as const;

export function WebIcon({ name, size = 18, color = "currentColor" }: WebIconProps) {
  const IconComponent = iconMap[name];
  return <IconComponent size={size} color={color} strokeWidth={2} aria-hidden />;
}
