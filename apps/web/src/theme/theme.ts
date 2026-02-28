import { webCssVariables } from "@hiro/ui-tokens";

export function applyWebTheme(): void {
  if (typeof document === "undefined") return;
  Object.entries(webCssVariables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
