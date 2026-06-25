import React, { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { DEFAULT_THEME, resolveTheme, type ThemeId } from "@hiro/ui-tokens";

export type ResolvedTheme = ReturnType<typeof resolveTheme>;

const ThemeContext = createContext<ResolvedTheme>(resolveTheme(DEFAULT_THEME));

export function MobileThemeProvider({
  themeId,
  children
}: {
  themeId: ThemeId;
  children: ReactNode;
}) {
  const value = useMemo(() => resolveTheme(themeId), [themeId]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Returns the active resolved theme. Defaults to Aurora when no provider is mounted. */
export function useTheme(): ResolvedTheme {
  return useContext(ThemeContext);
}
