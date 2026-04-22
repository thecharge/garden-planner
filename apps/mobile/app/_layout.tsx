import "@/core/i18n";
import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsThemeProvider } from "@/core/theme/settings-theme-provider";
import { QueryProvider } from "@/core/query/provider";

const RootLayout = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <SettingsThemeProvider>
        <QueryProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryProvider>
      </SettingsThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
