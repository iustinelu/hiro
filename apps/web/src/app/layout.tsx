import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeBootstrap } from "../theme/ThemeBootstrap";

export const metadata: Metadata = {
  title: "Hiro Web",
  description: "Hiro web starter shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
