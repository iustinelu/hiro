import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { MobileButton, useTheme } from "@hiro/ui-primitives/mobile";

/* ─── Points Burst ──────────────────────────────────────────────────────────
 * Lightweight celebratory pill that springs up + fades on task completion.
 * Web uses framer-motion particles; mobile keeps a single tasteful pill with a
 * scale/translate/opacity animation via RN's built-in Animated (no reanimated).
 */

export interface PointsBurstProps {
  points: number;
  taskName: string;
  combo: number;
  onComplete: () => void;
}

export function PointsBurst({ points, taskName, combo, onComplete }: PointsBurstProps) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      Animated.delay(450),
      Animated.timing(progress, { toValue: 2, duration: 250, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
    ]).start(() => onComplete());
  }, [progress, onComplete, points, taskName]);

  const translateY = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [20, -30, -50] });
  const scale = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [0.5, 1, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 1, 1.5, 2], outputRange: [0, 1, 1, 0] });

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing.sm,
          paddingVertical: t.spacing.sm,
          paddingHorizontal: t.spacing.lg,
          borderRadius: t.radius.pill,
          backgroundColor: t.color.surface,
          borderWidth: 2,
          borderColor: t.color.accent,
          transform: [{ translateY }, { scale }],
          opacity,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: t.color.ink, fontFamily: t.typography.fontFamily }}>
          +{points}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontWeight: "600", color: t.color.accentInk, maxWidth: 160, fontFamily: t.typography.fontFamily }}
        >
          {taskName}!
        </Text>
        {combo >= 2 && (
          <Text style={{ fontSize: 16, fontWeight: "800", color: t.color.accent, fontFamily: t.typography.fontFamily }}>
            x{combo}!
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

/* ─── All Done Celebration ──────────────────────────────────────────────────
 * Full-screen overlay with a spring-in summary card. Web rains confetti via
 * framer-motion; mobile keeps a clean card + 🎉 and auto-dismisses after 3s.
 */

export interface AllDoneCelebrationProps {
  totalPoints: number;
  onDismiss: () => void;
}

export function AllDoneCelebration({ totalPoints, onDismiss }: AllDoneCelebrationProps) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, { toValue: 1, useNativeDriver: true, friction: 7, tension: 60 }).start();
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [progress, onDismiss]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: t.color.overlay,
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          gap: t.spacing.sm,
          paddingVertical: t.spacing.xxl,
          paddingHorizontal: t.spacing.xxxl,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          borderWidth: 2,
          borderColor: t.color.accent,
          transform: [{ scale }],
          opacity: progress,
        }}
      >
        <Text style={{ fontSize: 40 }}>🎉</Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: t.color.ink, fontFamily: t.typography.fontFamily }}>
          All tasks complete!
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "700", color: t.color.accent, fontFamily: t.typography.fontFamily }}>
          +{totalPoints} points today
        </Text>
        <View style={{ marginTop: t.spacing.sm }}>
          <MobileButton label="Dismiss" variant="secondary" size="sm" onPress={onDismiss} />
        </View>
      </Animated.View>
    </View>
  );
}
