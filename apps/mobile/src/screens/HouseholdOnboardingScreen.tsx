import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileInput, MobileButton } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { createHousehold } from "../lib/householdService";

interface HouseholdOnboardingScreenProps {
  onCreated: () => void;
}

export function HouseholdOnboardingScreen({ onCreated }: HouseholdOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
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
    onCreated();
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
