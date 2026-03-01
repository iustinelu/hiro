import React, { createContext, useContext } from "react";
import { mobileTheme } from "./theme";

type MobileTheme = typeof mobileTheme;

const ThemeContext = createContext<MobileTheme>(mobileTheme);

export function MobileThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={mobileTheme}>{children}</ThemeContext.Provider>;
}

export function useMobileTheme(): MobileTheme {
  return useContext(ThemeContext);
}
