import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@hiro/ui-primitives/mobile";

/** Eyebrow-style board section header: uppercase mono label + a count pill. */
export function SectionHeader({ label, count }: { label: string; count?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: t.spacing.sm }}>
      <Text
        style={{
          color: t.color.inkMuted,
          fontFamily: t.typography.fontFamilyMono,
          fontSize: t.typography.labelSize,
          letterSpacing: 1.4,
          textTransform: "uppercase"
        }}
      >
        {label}
      </Text>
      {typeof count === "number" ? (
        <View
          style={{
            minWidth: 20,
            paddingHorizontal: t.spacing.xs,
            paddingVertical: 1,
            borderRadius: t.radius.pill,
            backgroundColor: t.color.surfaceStrong,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: t.color.inkMuted, fontFamily: t.typography.fontFamilyMono, fontSize: t.typography.labelSize }}>
            {count}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
