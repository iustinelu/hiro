import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from "@expo-google-fonts/inter";
import {
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold
} from "@expo-google-fonts/rajdhani";
import { PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium
} from "@expo-google-fonts/ibm-plex-mono";
import { useTheme, MobileErrorState } from "@hiro/ui-primitives/mobile";
import { supabaseInitError } from "./lib/supabase";
import { RootNavigator } from "./navigation/RootNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MobileThemeProvider } from "./theme/ThemeProvider";

function ThemedRoot() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg }}>
      <StatusBar style="light" />
      {supabaseInitError ? (
        // Missing/invalid runtime env (e.g. a release build without EXPO_PUBLIC_* baked
        // in). Show a diagnosable screen instead of an instant native crash.
        <View style={{ flex: 1, justifyContent: "center", padding: t.spacing.lg }}>
          <MobileErrorState
            title="Configuration error"
            description="The app is missing its runtime configuration and can't start. Please update to the latest version or contact support."
            retryLabel=""
          />
        </View>
      ) : (
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      )}
    </View>
  );
}

export default function App() {
  // Bundle the leading family of every theme stack (Inter / Rajdhani / Press Start 2P
  // display, IBM Plex Mono mono). Each weight registers under its own RN family name;
  // resolveFontFamily()/resolveFontFamilyMono() map the active theme + weight to these.
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    PressStart2P_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium
  });

  // Gate first paint until fonts register so text never renders in a system fallback
  // before swapping (the native splash screen stays up).
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MobileThemeProvider>
        <ThemedRoot />
      </MobileThemeProvider>
    </SafeAreaProvider>
  );
}
