"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WebInput, WebButton } from "@hiro/ui-primitives/web";
import { createHousehold } from "../../lib/householdService";
import { tokens } from "@hiro/ui-tokens";

export function CreateHouseholdForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    const { error: createError } = await createHousehold(name.trim());
    setLoading(false);
    if (createError) {
      setError(createError);
      return;
    }
    router.push("/home");
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.lg }}>
      <h1
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: 700,
          color: "var(--hiro-color-ink)",
        }}
      >
        Create your household
      </h1>

      <p
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        Give your household a name to get started.
      </p>

      <WebInput
        label="Household name"
        placeholder="e.g. The Smiths"
        value={name}
        onChangeText={setName}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Create household"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Creating…"
        onPress={() => void handleCreate()}
      />
    </div>
  );
}
