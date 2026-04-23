import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";
import type { Summary } from "@garden/config";
import { announce as announceCore, type AnnounceChannels } from "@garden/ui";
import { settingsStore } from "@/features/settings/store/settings-store";
import { config } from "@/core/config";
import { captionStore } from "./caption-store";
import { fireHaptic } from "./haptic";
import { speak } from "./tts";

type AnnounceFn = (summary: Summary) => Promise<void>;

const AnnounceContext = createContext<AnnounceFn | null>(null);

export const AnnounceProvider = ({ children }: { children: ReactNode }) => {
  const voiceEnabled = useStore(settingsStore, (s) => s.voiceEnabled);
  const hapticsEnabled = useStore(settingsStore, (s) => s.hapticsEnabled);
  const captionsMode = useStore(settingsStore, (s) => s.captionsMode);

  const announceFn = useMemo<AnnounceFn>(() => {
    const channels: AnnounceChannels = {
      tts: speak,
      caption: (text) => captionStore.getState().pushCaption(text, config.CAPTION_TTL_MS),
      haptic: fireHaptic
    };
    const enabled = {
      tts: voiceEnabled,
      caption: captionsMode !== "off",
      haptic: hapticsEnabled
    };
    return (summary: Summary) =>
      announceCore(summary, { channels, enabled, captionTtlMs: config.CAPTION_TTL_MS });
  }, [voiceEnabled, hapticsEnabled, captionsMode]);

  return <AnnounceContext.Provider value={announceFn}>{children}</AnnounceContext.Provider>;
};

export const useAnnounce = (): AnnounceFn => {
  const fn = useContext(AnnounceContext);
  if (!fn) {
    // No-op fallback so feature code never crashes if AnnounceProvider is not
    // mounted (e.g., in isolated component tests). In production the provider
    // is always mounted at the root layout.
    return async () => {
      // intentional no-op
    };
  }
  return fn;
};
