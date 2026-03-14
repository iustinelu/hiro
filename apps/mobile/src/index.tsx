import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { tokens } from "@hiro/ui-tokens";
import "./lib/supabase";
import { RootNavigator } from "./navigation/RootNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
        <StatusBar style="light" />
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
