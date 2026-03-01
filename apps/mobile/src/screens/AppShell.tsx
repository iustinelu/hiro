import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { mobileTabs } from "../navigation/tabs";
import { useMobileTheme } from "../theme/ThemeProvider";

export function AppShellScreen() {
  const theme = useMobileTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hiro Mobile Shell</Text>
      {mobileTabs.map((tab) => (
        <View key={tab} style={styles.tabRow}>
          <Text style={styles.tabText}>{tab}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useMobileTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.xl,
      gap: theme.spacing.sm
    },
    title: {
      marginBottom: theme.spacing.md,
      color: theme.colors.textPrimary,
      fontSize: theme.typography.titleSize,
      lineHeight: theme.typography.titleLineHeight,
      fontWeight: theme.typography.weightSemibold,
      fontFamily: theme.typography.fontFamily
    },
    tabRow: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    tabText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.bodySize,
      lineHeight: theme.typography.bodyLineHeight,
      fontWeight: theme.typography.weightRegular,
      fontFamily: theme.typography.fontFamily
    }
  });
}
