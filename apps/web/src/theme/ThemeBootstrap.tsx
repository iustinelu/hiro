"use client";

import { useEffect } from "react";
import { applyWebTheme } from "./theme";

export function ThemeBootstrap() {
  useEffect(() => {
    applyWebTheme();
  }, []);

  return null;
}
