import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";

/**
 * Wraps a call-to-action and, while `active`, draws a softly pulsing accent ring
 * around it to say "tap here". Layout-free (no measuring) so it can't drift or
 * fight a scroll view — when inactive it renders the child untouched.
 */
export function TourSpotlight({ active, children }: { active: boolean; children: React.ReactNode }) {
  const t = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  if (!active) return <>{children}</>;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -6,
          left: -6,
          right: -6,
          bottom: -6,
          borderRadius: t.radius.xl,
          borderWidth: 2,
          borderColor: t.color.accent,
          opacity,
        }}
      />
      {children}
    </Animated.View>
  );
}
