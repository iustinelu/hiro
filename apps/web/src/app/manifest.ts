import type { MetadataRoute } from "next";
import { tokens } from "@hiro/ui-tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hiro",
    short_name: "Hiro",
    description: "Hiro — household chores and points tracker",
    start_url: "/",
    display: "standalone",
    background_color: tokens.color.bg,
    theme_color: tokens.color.bg,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
