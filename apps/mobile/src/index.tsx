import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@hiro/ui-primitives/mobile";
import "./lib/supabase";
import { RootNavigator } from "./navigation/RootNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MobileThemeProvider } from "./theme/ThemeProvider";

function ThemedRoot() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg }}>
      <StatusBar style="light" />
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileThemeProvider>
        <ThemedRoot />
      </MobileThemeProvider>
    </SafeAreaProvider>
  );
}
