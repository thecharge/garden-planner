import type { ReactNode } from "react";
import { useStore } from "zustand";
import { ThemeProvider } from "@garden/ui";
import { settingsStore } from "@/features/settings";

export type SettingsThemeProviderProps = {
  readonly children: ReactNode;
};

export const SettingsThemeProvider = ({ children }: SettingsThemeProviderProps) => {
  const themeId = useStore(settingsStore, (s) => s.themeId);
  const fontFamily = useStore(settingsStore, (s) => s.fontFamily);
  return (
    <ThemeProvider themeId={themeId} fontFamilyOverride={fontFamily}>
      {children}
    </ThemeProvider>
  );
};
