import { Ionicons } from "@expo/vector-icons";
import type { IconName } from "../shared/types";

interface MobileIconProps {
  name: IconName;
  size?: number;
  color?: string;
  // Swaps to the solid glyph variant (e.g. active tab). Defaults to the outline map.
  filled?: boolean;
}

const iconMap: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  spark: "sparkles-outline",
  shield: "shield-checkmark-outline",
  integrations: "link-outline",
  empty: "file-tray-outline",
  loading: "sync-outline",
  error: "alert-circle-outline",
  home: "home-outline",
  tasks: "checkbox-outline",
  progress: "stats-chart-outline",
  budget: "wallet-outline",
  rewards: "gift-outline",
  more: "ellipsis-horizontal",
  strokeOutline: "ellipse-outline",
  strokeFill: "ellipse",
  close: "close",
  navigation: "compass-outline"
};

const filledIconMap: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  spark: "sparkles",
  shield: "shield-checkmark",
  integrations: "link",
  empty: "file-tray",
  loading: "sync",
  error: "alert-circle",
  home: "home",
  tasks: "checkbox",
  progress: "stats-chart",
  budget: "wallet",
  rewards: "gift",
  more: "ellipsis-horizontal",
  strokeOutline: "ellipse-outline",
  strokeFill: "ellipse",
  close: "close",
  navigation: "compass"
};

export function MobileIcon({ name, size = 18, color = "currentColor", filled = false }: MobileIconProps) {
  return <Ionicons name={(filled ? filledIconMap : iconMap)[name]} size={size} color={color} />;
}
