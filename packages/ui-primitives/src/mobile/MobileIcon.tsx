import { Ionicons } from "@expo/vector-icons";
import type { IconName } from "../shared/types";

interface MobileIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const iconMap: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  spark: "sparkles-outline",
  shield: "shield-checkmark-outline",
  integrations: "link-outline",
  empty: "file-tray-outline",
  loading: "sync-outline",
  error: "alert-circle-outline",
  home: "home-outline",
  strokeOutline: "ellipse-outline",
  strokeFill: "ellipse",
  close: "close",
  navigation: "compass-outline"
};

export function MobileIcon({ name, size = 18, color = "currentColor" }: MobileIconProps) {
  return <Ionicons name={iconMap[name]} size={size} color={color} />;
}
