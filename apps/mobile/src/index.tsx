import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { AppShellScreen } from "./screens/AppShell";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <StatusBar style="dark" />
      <AppShellScreen />
    </SafeAreaView>
  );
}
