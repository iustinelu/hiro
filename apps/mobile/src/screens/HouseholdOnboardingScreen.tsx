import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileInput, MobileButton } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { createHousehold, getMyHousehold } from "../lib/householdService";
import { getDisplayName, updateDisplayName } from "../lib/profileService";
import { supabase } from "../lib/supabase";

interface HouseholdOnboardingScreenProps {
  /** Called once every outstanding onboarding requirement is satisfied. */
  onCompleted: () => void;
}

type Step = "loading" | "name" | "household";

/**
 * Resolves BOTH onboarding gates: a missing display name (Google sign-ups, or
 * invite-joiners who never picked one) and a missing household. The name step
 * comes first; the household step is skipped when the user already belongs to
 * one (e.g. after accepting an invite).
 */
export function HouseholdOnboardingScreen({ onCompleted }: HouseholdOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("loading");
  const [needsHousehold, setNeedsHousehold] = useState(true);

  useEffect(() => {
    let active = true;
    async function resolve() {
      const { data: profileId } = await supabase.rpc("current_profile_id");
      if (!profileId) {
        // No profile yet — treat as needing the full flow.
        if (active) {
          setNeedsHousehold(true);
          setStep("name");
        }
        return;
      }
      const [{ displayName }, { household }] = await Promise.all([
        getDisplayName(profileId as string),
        getMyHousehold(),
      ]);
      if (!active) return;
      const needsName = !displayName || !displayName.trim();
      setNeedsHousehold(!household);
      setStep(needsName ? "name" : "household");
    }
    void resolve();
    return () => {
      active = false;
    };
  }, []);

  function handleNameDone() {
    if (needsHousehold) {
      setStep("household");
    } else {
      onCompleted();
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: tokens.spacing.xl,
          paddingTop: insets.top + tokens.spacing.xl,
          paddingBottom: insets.bottom + tokens.spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: tokens.spacing.xxl }}>
          <Text
            style={{
              fontFamily: tokens.typography.fontFamilyMono,
              fontSize: tokens.typography.bodySmallSize,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <Text style={{ color: tokens.color.accent }}>● </Text>
            <Text style={{ color: tokens.color.ink }}>HIRO</Text>
          </Text>
        </View>

        <View
          style={{
            backgroundColor: tokens.color.surface,
            borderRadius: tokens.radius.xl,
            borderWidth: 1,
            borderColor: tokens.color.border,
            padding: tokens.spacing.xxl,
            gap: tokens.spacing.md,
          }}
        >
          {step === "loading" && (
            <View style={{ alignItems: "center", paddingVertical: tokens.spacing.xl }}>
              <ActivityIndicator color={tokens.color.accent} />
            </View>
          )}
          {step === "name" && <NameStep onDone={handleNameDone} />}
          {step === "household" && <HouseholdStep onCreated={onCompleted} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
    <>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: tokens.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        What should we call you?
      </Text>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: tokens.color.inkMuted,
        }}
      >
        This is the name your household will see.
      </Text>

      <MobileInput
        label="Your name"
        placeholder="e.g. Alex"
        value={name}
        onChangeText={setName}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Continue"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Saving…"
        onPress={() => void handleContinue()}
      />
    </>
  );
}

function HouseholdStep({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    const { error: createError, alreadyExists } = await createHousehold(name.trim());
    setLoading(false);
    if (alreadyExists) { onCreated(); return; }
    if (createError) { setError(createError); return; }
    onCreated();
  }

  return (
    <>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: tokens.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Create your household
      </Text>
      <Text
        style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: tokens.color.inkMuted,
        }}
      >
        Give your household a name to get started.
      </Text>

      <MobileInput
        label="Household name"
        placeholder="e.g. The Smiths"
        value={name}
        onChangeText={setName}
        state={error ? "error" : "default"}
        helperText={error ?? undefined}
      />

      <MobileButton
        label="Create household"
        variant="primary"
        fullWidth
        loading={loading}
        loadingLabel="Creating…"
        onPress={() => void handleCreate()}
      />
    </>
  );
}
