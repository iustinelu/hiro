import React from "react";
import { Text, View } from "react-native";
import { MobileButton, MobileCard } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";

interface SectionPlaceholderScreenProps {
  title: string;
  description: string;
  actionLabel: string;
}

export function SectionPlaceholderScreen({ title, description, actionLabel }: SectionPlaceholderScreenProps) {
  return (
    <View
      style={{
        flex: 1,
        padding: tokens.spacing.lg,
        backgroundColor: tokens.color.bg
      }}
    >
      <MobileCard title={title} description={description}>
        <View style={{ gap: tokens.spacing.md }}>
          <Text
            style={{
              color: tokens.color.inkMuted,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.bodySize,
              lineHeight: tokens.typography.lineHeightBody
            }}
          >
            Placeholder shell content for {title}. Feature-specific implementation is intentionally out of scope for HIR-32.
          </Text>
          <MobileButton label={actionLabel} fullWidth />
        </View>
      </MobileCard>
    </View>
  );
}
