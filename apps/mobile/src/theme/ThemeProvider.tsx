import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { MobileThemeProvider as PackageThemeProvider } from "@hiro/ui-primitives/mobile";
import { ALL_THEME_IDS, DEFAULT_THEME, type ThemeId } from "@hiro/ui-tokens";

const THEME_STORAGE_KEY = "hiro-theme";

interface ThemeControl {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeControlContext = createContext<ThemeControl>({
  themeId: DEFAULT_THEME,
  setThemeId: () => undefined
});

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && (ALL_THEME_IDS as string[]).includes(value);
}

export function MobileThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  // Load persisted preference on mount.
  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(THEME_STORAGE_KEY)
      .then((stored) => {
        if (active && isThemeId(stored)) {
          setThemeIdState(stored);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  function setThemeId(id: ThemeId) {
    setThemeIdState(id);
    void SecureStore.setItemAsync(THEME_STORAGE_KEY, id).catch(() => undefined);
  }

  return (
    <ThemeControlContext.Provider value={{ themeId, setThemeId }}>
      <PackageThemeProvider themeId={themeId}>{children}</PackageThemeProvider>
    </ThemeControlContext.Provider>
  );
}

/** Read/update the active theme id (persists to SecureStore on set). */
export function useThemeControl(): ThemeControl {
  return useContext(ThemeControlContext);
}
