import "@/core/i18n";
import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@garden/ui";
import { QueryProvider } from "@/core/query/provider";

const RootLayout = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
