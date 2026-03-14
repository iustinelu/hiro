"use client";

import { WebErrorState } from "@hiro/ui-primitives/web";
import { tokens } from "@hiro/ui-tokens";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: "2rem", backgroundColor: tokens.color.bg }}>
        <WebErrorState onRetry={reset} />
      </body>
    </html>
  );
}
