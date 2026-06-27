import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileButton, useTheme } from "@hiro/ui-primitives/mobile";

export type TourStep = "create" | "complete" | "celebrate" | "notify";

interface OnboardingTourCardProps {
  step: TourStep;
  pointsEarned: number;
  streak: number;
  notifLoading: boolean;
  onAddChore: () => void;
  onFinish: () => void;
  onEnableNotifications: () => void;
  /** Skip / dismiss the whole tour (also the "Not now" action on the notify step). */
  onSkip: () => void;
}

const STEP_NUMBER: Record<TourStep, number | null> = {
  create: 1,
  complete: 2,
  celebrate: 3,
  notify: null,
};

/**
 * Persistent bottom coaching card for the first-win tour. It sits over a fully
 * interactive Home (it does NOT block taps on the task list), and advances as
 * the user performs each real action. Reuses the app's theme + button language;
 * no new design primitives.
 */
export function OnboardingTourCard({
  step,
  pointsEarned,
  streak,
  notifLoading,
  onAddChore,
  onFinish,
  onEnableNotifications,
  onSkip,
}: OnboardingTourCardProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const stepNumber = STEP_NUMBER[step];
  const { title, body } = copyFor(step, pointsEarned, streak);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: t.spacing.lg,
        paddingBottom: Math.max(t.spacing.lg, insets.bottom + t.spacing.sm),
      }}
    >
      <View
        style={{
          gap: t.spacing.sm,
          padding: t.spacing.xl,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          borderWidth: 2,
          borderColor: t.color.accent,
        }}
      >
        {stepNumber !== null && (
          <Text
            style={{
              color: t.color.accent,
              fontFamily: t.typography.fontFamilyMono,
              fontSize: t.typography.labelSize,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Step {stepNumber} of 3
          </Text>
        )}

        <Text
          style={{
            color: t.color.ink,
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.subtitleSize,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: t.color.inkMuted,
            fontFamily: t.typography.fontFamily,
            fontSize: t.typography.bodySize,
          }}
        >
          {body}
        </Text>

        {step === "create" && (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label="Add a chore" variant="primary" fullWidth onPress={onAddChore} />
          </View>
        )}

        {step === "celebrate" && (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label="Finish" variant="primary" fullWidth onPress={onFinish} />
          </View>
        )}

        {step === "notify" && (
          <View style={{ marginTop: t.spacing.xs, gap: t.spacing.sm }}>
            <MobileButton
              label="Enable reminders"
              variant="primary"
              fullWidth
              loading={notifLoading}
              loadingLabel="Requesting…"
              onPress={onEnableNotifications}
            />
            <MobileButton label="Not now" variant="ghost" fullWidth onPress={onSkip} />
          </View>
        )}

        {step !== "notify" && (
          <View style={{ alignItems: "center", marginTop: t.spacing.xs }}>
            <MobileButton label="Skip tour" variant="ghost" size="sm" onPress={onSkip} />
          </View>
        )}
      </View>
    </View>
  );
}

function copyFor(step: TourStep, pointsEarned: number, streak: number): { title: string; body: string } {
  switch (step) {
    case "create":
      return {
        title: "Create your first chore 🧹",
        body: "Add a chore your household needs done - it only takes a second.",
      };
    case "complete":
      return {
        title: "Now complete it ✅",
        body: "Tap “Done” on your chore above to bank the points.",
      };
    case "celebrate": {
      const streakBit = streak > 0 ? ` Your streak is at ${streak} 🔥` : "";
      return {
        title: "Nice - you're on the board! 🎉",
        body: `You earned ${pointsEarned} point${pointsEarned === 1 ? "" : "s"}.${streakBit} That's the whole loop: do chores, score points, climb the leaderboard.`,
      };
    }
    case "notify":
      return {
        title: "Stay on track 🔔",
        body: "Want a nudge when chores are due? You can change this anytime.",
      };
  }
}
