"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { WebButton } from "@hiro/ui-primitives/web";

function ThrowOnRender(): never {
  throw new Error("Controlled test error — HIR-35 QA");
}

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  // Dev-only QA route — 404 in production now that web is publicly deployed.
  if (process.env.NODE_ENV === "production") notFound();

  if (shouldThrow) return <ThrowOnRender />;

  return (
    <div style={{ padding: "2rem" }}>
      <WebButton label="Trigger Error" variant="danger" onPress={() => setShouldThrow(true)} />
    </div>
  );
}
