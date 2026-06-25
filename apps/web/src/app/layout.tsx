import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { ALL_THEME_IDS, DEFAULT_THEME, tokens } from "@hiro/ui-tokens";
import type { ThemeId } from "@hiro/ui-tokens";
import { ThemeCssVars } from "../theme/ThemeCssVars";
import { ThemeBootstrap } from "../theme/ThemeBootstrap";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: tokens.color.bg
};

export const metadata: Metadata = {
  title: "Hiro",
  description: "Hiro — household chores and points tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hiro"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    apple: "/apple-touch-icon.png"
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("hiro-theme")?.value;
  const themeId: ThemeId =
    raw && (ALL_THEME_IDS as string[]).includes(raw) ? (raw as ThemeId) : DEFAULT_THEME;

  return (
    <html lang="en" data-theme={themeId}>
      <head>
        {/* Preload the default-theme display face (Inter variable) to cut first-paint swap */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <ThemeCssVars />
      </head>
      <body>
        <ThemeBootstrap />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
