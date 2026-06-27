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
import { MobileInput, MobileButton, useTheme } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { createHousehold, getMyHousehold } from "../lib/householdService";
import { getDisplayName, updateDisplayName } from "../lib/profileService";
import { registerForPushNotifications } from "../lib/notificationService";
import { supabase } from "../lib/supabase";
import { JoinHouseholdForm } from "../components/JoinHouseholdForm";

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
  const t = useTheme();
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

  // End of onboarding: contextually ask for notification permission (brief 09).
  // Fire-and-forget — the OS prompt must never block or gate completion.
  function completeOnboarding() {
    void registerForPushNotifications();
    onCompleted();
  }

  function handleNameDone() {
    if (needsHousehold) {
      setStep("household");
    } else {
      completeOnboarding();
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.color.bg }}
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
              fontFamily: t.typography.fontFamilyMono,
              fontSize: tokens.typography.bodySmallSize,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <Text style={{ color: t.color.accent }}>● </Text>
            <Text style={{ color: t.color.ink }}>HIRO</Text>
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.color.surface,
            borderRadius: t.radius.xl,
            borderWidth: 1,
            borderColor: t.color.border,
            padding: tokens.spacing.xxl,
            gap: tokens.spacing.md,
          }}
        >
          {step === "loading" && (
            <View style={{ alignItems: "center", paddingVertical: tokens.spacing.xl }}>
              <ActivityIndicator color={t.color.accent} />
            </View>
          )}
          {step === "name" && <NameStep onDone={handleNameDone} />}
          {step === "household" && <HouseholdStep onCreated={completeOnboarding} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NameStep({ onDone }: { onDone: () => void }) {
  const t = useTheme();
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
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: t.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        What should we call you?
      </Text>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: t.color.inkMuted,
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
  const t = useTheme();
  const [mode, setMode] = useState<"create" | "join">("create");
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

  const title = mode === "create" ? "Create your household" : "Join a household";
  const subtitle =
    mode === "create"
      ? "Give your household a name to get started."
      : "Paste the invite code someone shared with you.";

  return (
    <>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.titleSize,
          fontWeight: "700",
          color: t.color.ink,
          marginBottom: tokens.spacing.sm,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: t.typography.fontFamily,
          fontSize: tokens.typography.bodySize,
          color: t.color.inkMuted,
        }}
      >
        {subtitle}
      </Text>

      {mode === "create" ? (
        <>
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

          <MobileButton
            label="Have an invite code? Join a household"
            variant="ghost"
            fullWidth
            onPress={() => { setError(null); setMode("join"); }}
          />
        </>
      ) : (
        <>
          <JoinHouseholdForm onJoined={onCreated} />

          <MobileButton
            label="Create one instead"
            variant="ghost"
            fullWidth
            onPress={() => setMode("create")}
          />
        </>
      )}
    </>
  );
}
