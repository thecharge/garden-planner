import { useEffect, type ReactNode } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsThemeProvider } from "@/core/theme/settings-theme-provider";
import { QueryProvider } from "@/core/query/provider";
import { AnnounceProvider, CaptionBar } from "@/core/announce";
import { useAppReady } from "@/core/app-ready";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const RootGate = ({ children }: { children: ReactNode }) => {
  const ready = useAppReady();
  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);
  if (!ready) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsThemeProvider>
          <QueryProvider>
            <AnnounceProvider>
              <StatusBar style="dark" />
              {children}
              <CaptionBar />
            </AnnounceProvider>
          </QueryProvider>
        </SettingsThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
