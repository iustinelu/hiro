import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileButton, useTheme } from "@hiro/ui-primitives/mobile";
import type { TourStep } from "./OnboardingTourProvider";

interface OnboardingTourCardProps {
  step: TourStep;
  pointsEarned: number;
  streak: number;
  notifLoading?: boolean;
  /** create step CTA. */
  onAddChore?: () => void;
  /** reward-create step CTA. */
  onCreateReward?: () => void;
  /** Forward button for the celebrate and what's-next steps. */
  onAdvance?: () => void;
  /** "I'll redeem later" escape on the reward-redeem step. */
  onSkipRedeem?: () => void;
  onEnableNotifications?: () => void;
  /** Skip / dismiss the whole tour (also the "Not now" action on the notify step). */
  onSkip: () => void;
}

const TOTAL_STEPS = 5;
const STEP_NUMBER: Record<TourStep, number | null> = {
  create: 1,
  complete: 2,
  celebrate: 3,
  "reward-create": 4,
  "reward-redeem": 5,
  "whats-next": null,
  notify: null,
};

/**
 * Persistent bottom coaching card for the guided tour. It sits over a fully
 * interactive screen (it does NOT block taps), and advances as the user performs
 * each real action. Rendered by both Home (earn steps) and Rewards (spend steps);
 * each host passes the callbacks for the steps it owns.
 */
export function OnboardingTourCard({
  step,
  pointsEarned,
  streak,
  notifLoading,
  onAddChore,
  onCreateReward,
  onAdvance,
  onSkipRedeem,
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
            Step {stepNumber} of {TOTAL_STEPS}
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
            <MobileButton label="Next: rewards →" variant="primary" fullWidth onPress={onAdvance} />
          </View>
        )}

        {step === "reward-create" && (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label="Create a reward" variant="primary" fullWidth onPress={onCreateReward} />
          </View>
        )}

        {step === "reward-redeem" && (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label="I'll redeem later" variant="ghost" fullWidth onPress={onSkipRedeem} />
          </View>
        )}

        {step === "whats-next" && (
          <View style={{ marginTop: t.spacing.xs }}>
            <MobileButton label="Got it →" variant="primary" fullWidth onPress={onAdvance} />
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
      const streakBit = streak > 0 ? ` Your streak is at ${streak} 🔥.` : "";
      return {
        title: "Nice - you're on the board! 🎉",
        body: `You earned ${pointsEarned} point${pointsEarned === 1 ? "" : "s"}.${streakBit} That's the earn loop - now let's turn points into rewards.`,
      };
    }
    case "reward-create":
      return {
        title: "Set up a reward 🎁",
        body: "Create something worth working for - a treat, a night off, anything. We've set its cost to your current balance so you can claim it right after.",
      };
    case "reward-redeem":
      return {
        title: "Now treat yourself 🎉",
        body: "Tap “Redeem” on the reward you just made to spend your points.",
      };
    case "whats-next":
      return {
        title: "One last thing 💰",
        body: "Use Budget to track and split household expenses fairly - it's in the tab bar whenever you need it.",
      };
    case "notify":
      return {
        title: "Stay on track 🔔",
        body: "Want a nudge when chores are due? You can change this anytime.",
      };
  }
}
