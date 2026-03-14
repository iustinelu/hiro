"use client";

import { WebErrorState } from "@hiro/ui-primitives/web";

export default function TabsError({ reset }: { error: Error; reset: () => void }) {
  return <WebErrorState onRetry={reset} />;
}
