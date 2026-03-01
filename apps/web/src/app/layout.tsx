import "./globals.css";
import type { Metadata } from "next";
import { ThemeBridge } from "./ThemeBridge";

export const metadata: Metadata = {
  title: "Hiro Web",
  description: "Hiro web starter shell"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeBridge />
        {children}
      </body>
    </html>
  );
}
