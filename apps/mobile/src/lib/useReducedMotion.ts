import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Tracks the OS "reduce motion" accessibility setting. When true, callers should
 * swap celebratory/spring animations for instant state changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      setReduced(value);
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
