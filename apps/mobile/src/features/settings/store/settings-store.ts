import { createStore } from "zustand/vanilla";
import type { FontFamily, ThemeId } from "@garden/config";
import { config } from "@/core/config";

export const CaptionsMode = {
  AlwaysOn: "always-on",
  On: "on",
  Off: "off"
} as const;
export type CaptionsMode = (typeof CaptionsMode)[keyof typeof CaptionsMode];

export const FontScaleStep = {
  MinusTwo: -2,
  MinusOne: -1,
  Zero: 0,
  PlusOne: 1,
  PlusTwo: 2
} as const;
export type FontScaleStep = (typeof FontScaleStep)[keyof typeof FontScaleStep];

export type SettingsState = {
  readonly themeId: ThemeId;
  readonly fontFamily: FontFamily;
  readonly fontScaleStep: FontScaleStep;
  readonly motionReduced: boolean;
  readonly hapticsEnabled: boolean;
  readonly captionsMode: CaptionsMode;
  readonly anthropicKeyConfigured: boolean;
};

export type SettingsStore = SettingsState & {
  readonly setTheme: (id: ThemeId) => void;
  readonly setFontFamily: (family: FontFamily) => void;
  readonly setFontScale: (step: FontScaleStep) => void;
  readonly setMotionReduced: (reduced: boolean) => void;
  readonly setHapticsEnabled: (enabled: boolean) => void;
  readonly setCaptionsMode: (mode: CaptionsMode) => void;
  readonly setAnthropicKeyConfigured: (configured: boolean) => void;
};

export const settingsStore = createStore<SettingsStore>((set) => ({
  themeId: config.DEFAULT_THEME,
  fontFamily: config.DEFAULT_FONT,
  fontScaleStep: FontScaleStep.Zero,
  motionReduced: false,
  hapticsEnabled: true,
  captionsMode: CaptionsMode.AlwaysOn,
  anthropicKeyConfigured: false,
  setTheme: (themeId) => set({ themeId }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontScale: (fontScaleStep) => set({ fontScaleStep }),
  setMotionReduced: (motionReduced) => set({ motionReduced }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setCaptionsMode: (captionsMode) => set({ captionsMode }),
  setAnthropicKeyConfigured: (anthropicKeyConfigured) => set({ anthropicKeyConfigured })
}));

export const getSettings = (): SettingsState => settingsStore.getState();
