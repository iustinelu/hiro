"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WebInput, WebButton, WebInteractiveChip } from "@hiro/ui-primitives/web";
import { createHousehold } from "../../lib/householdService";
import { tokens } from "@hiro/ui-tokens";
import type { CurrencyCode } from "@hiro/domain";

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "EUR", label: "\u20ac EUR" },
  { code: "GBP", label: "\u00a3 GBP" },
  { code: "RON", label: "lei RON" },
  { code: "USD", label: "$ USD" },
];

export function CreateHouseholdForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    const { error: createError, alreadyExists } = await createHousehold(name.trim(), currency);
    setLoading(false);
    if (alreadyExists) { router.push("/home"); return; }
    if (createError) { setError(createError); return; }
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

      <div>
        <p
          style={{
            margin: `0 0 ${tokens.spacing.sm}px`,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.labelSize,
            fontWeight: 700,
            color: "var(--hiro-color-ink-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Currency
        </p>
        <div style={{ display: "flex", gap: tokens.spacing.sm, flexWrap: "wrap" }}>
          {CURRENCIES.map((c) => (
            <WebInteractiveChip
              key={c.code}
              label={c.label}
              active={currency === c.code}
              onPress={() => setCurrency(c.code)}
            />
          ))}
        </div>
      </div>

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
