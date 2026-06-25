"use client";

import { useEffect } from "react";
import { ALL_THEME_IDS, DEFAULT_THEME } from "@hiro/ui-tokens";
import type { ThemeId } from "@hiro/ui-tokens";

/**
 * Runs on the client to ensure the data-theme attribute is in sync with
 * localStorage (which may differ from the SSR-rendered cookie value in edge
 * cases, e.g. direct localStorage writes). Also applies the current theme's
 * CSS variables as inline styles for any vars not covered by the <style> block.
 */
export function ThemeBootstrap() {
  useEffect(() => {
    // Read stored preference; fall back to what the server already set, then DEFAULT_THEME
    const stored = localStorage.getItem("hiro-theme");
    const current = document.documentElement.dataset.theme;
    const candidate = stored ?? current ?? DEFAULT_THEME;
    const themeId: ThemeId = (ALL_THEME_IDS as string[]).includes(candidate)
      ? (candidate as ThemeId)
      : DEFAULT_THEME;

    // Only update DOM if there's a mismatch (avoids unnecessary reflow)
    if (document.documentElement.dataset.theme !== themeId) {
      document.documentElement.dataset.theme = themeId;
    }
  }, []);

  return null;
}
