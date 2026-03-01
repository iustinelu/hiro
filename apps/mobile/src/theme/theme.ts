import { Platform } from "react-native";
import { tokens } from "@hiro/ui-tokens";

export const mobileTheme = {
  colors: tokens.color,
  semantic: tokens.semantic,
  spacing: tokens.spacing,
  radius: tokens.radius,
  elevation: tokens.elevation,
  typography: {
    ...tokens.typography,
    fontFamily: Platform.select({
      ios: "Avenir Next",
      android: "sans-serif",
      default: tokens.typography.fontFamilyMobile
    })
  }
};
