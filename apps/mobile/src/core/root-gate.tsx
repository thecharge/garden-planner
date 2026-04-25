import { useEffect, type ReactNode } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SettingsThemeProvider } from "@/core/theme/settings-theme-provider";
import { QueryProvider } from "@/core/query/provider";
import { AnnounceProvider, CaptionBar } from "@/core/announce";
import { useAppReady } from "@/core/app-ready";
import LexendRegular from "../../assets/fonts/Lexend-Regular.ttf";
import LexendBold from "../../assets/fonts/Lexend-Bold.ttf";
import OpenDyslexicRegular from "../../assets/fonts/OpenDyslexic-Regular.otf";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const RootGate = ({ children }: { children: ReactNode }) => {
  const [fontsLoaded] = Font.useFonts({
    Lexend: LexendRegular,
    "Lexend-Bold": LexendBold,
    OpenDyslexic: OpenDyslexicRegular
  });
  const appReady = useAppReady();
  const ready = fontsLoaded && appReady;
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
