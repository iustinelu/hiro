"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WebInput, WebButton, WebInteractiveChip, cssFontFamily } from "@hiro/ui-primitives/web";
import { createHousehold } from "../../lib/householdService";
import { updateDisplayName } from "../../lib/profileService";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { tokens } from "@hiro/ui-tokens";
import type { CurrencyCode } from "@hiro/domain";

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "RON", label: "lei RON" },
  { code: "USD", label: "$ USD" },
];

type Step = "name" | "household";

interface OnboardingFlowProps {
  needsName: boolean;
  needsHousehold: boolean;
}

/**
 * Conditional onboarding that resolves BOTH gates a user may hit:
 *   1. No display name (typical for Google sign-ups, or invite-joiners who
 *      never picked one).
 *   2. No household.
 * Steps render in order (name first), and we navigate to /home only once
 * every outstanding requirement is satisfied.
 */
export function OnboardingFlow({ needsName, needsHousehold }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(needsName ? "name" : "household");

  function handleNameDone() {
    if (needsHousehold) {
      setStep("household");
    } else {
      router.replace("/home");
    }
  }

  if (step === "name") {
    return <NameStep onDone={handleNameDone} />;
  }

  return <CreateHouseholdForm onCreated={() => router.replace("/home")} />;
}

function NameStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { data: profileId } = await supabase.rpc("current_profile_id");
    if (!profileId) {
      setLoading(false);
      setError("Could not load your profile. Please try again.");
      return;
    }

    const { error: saveError } = await updateDisplayName(profileId as string, name.trim());
    setLoading(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    onDone();
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.lg }}>
      <h1
        style={{
          margin: 0,
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.titleSize,
          fontWeight: 700,
          color: "var(--hiro-color-ink)",
        }}
      >
        What should we call you?
      </h1>

      <p
        style={{
          margin: 0,
          fontFamily: cssFontFamily.default,
          fontSize: tokens.typography.bodySmallSize,
          color: "var(--hiro-color-ink-muted)",
        }}
      >
        This is the name your household will see.
      </p>

      <WebInput
        label="Your name"
        placeholder="e.g. Alex"
        value={name}
        onChangeText={setName}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <WebButton
        label="Continue"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Saving…"
        onPress={() => void handleContinue()}
      />
    </div>
  );
}

export function CreateHouseholdForm({ onCreated }: { onCreated: () => void }) {
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
    if (alreadyExists) { onCreated(); return; }
    if (createError) { setError(createError); return; }
    onCreated();
  }

  return (
    <div style={{ display: "grid", gap: tokens.spacing.lg }}>
      <h1
        style={{
          margin: 0,
          fontFamily: cssFontFamily.default,
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
          fontFamily: cssFontFamily.default,
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
            fontFamily: cssFontFamily.default,
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
