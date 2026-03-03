import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { tokens } from "@hiro/ui-tokens";
import { AppShellScreen } from "./screens/AppShell";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <StatusBar barStyle="dark-content" />
      <AppShellScreen />
    </SafeAreaView>
  );
}
