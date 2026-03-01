"use client";

import { useEffect } from "react";
import { applyWebTheme } from "../theme/theme";

export function ThemeBridge() {
  useEffect(() => {
    applyWebTheme();
  }, []);

  return null;
}
