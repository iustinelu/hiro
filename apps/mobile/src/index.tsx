import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppShellScreen } from "./screens/AppShell";
import { MobileThemeProvider } from "./theme/ThemeProvider";
import { mobileTheme } from "./theme/theme";

export default function App() {
  return (
    <MobileThemeProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <AppShellScreen />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </MobileThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mobileTheme.colors.bg
  },
  content: {
    flex: 1,
    backgroundColor: mobileTheme.colors.bg
  }
});
