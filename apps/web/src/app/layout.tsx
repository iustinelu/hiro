import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { ALL_THEME_IDS, DEFAULT_THEME } from "@hiro/ui-tokens";
import type { ThemeId } from "@hiro/ui-tokens";
import { ThemeCssVars } from "../theme/ThemeCssVars";
import { ThemeBootstrap } from "../theme/ThemeBootstrap";

export const metadata: Metadata = {
  title: "Hiro Web",
  description: "Hiro web starter shell"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("hiro-theme")?.value;
  const themeId: ThemeId =
    raw && (ALL_THEME_IDS as string[]).includes(raw) ? (raw as ThemeId) : DEFAULT_THEME;

  return (
    <html lang="en" data-theme={themeId}>
      <head>
        <ThemeCssVars />
      </head>
      <body>
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
