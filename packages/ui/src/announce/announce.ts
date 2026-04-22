import type { Summary, SummaryType } from "@garden/config";
import { hapticPatternFor } from "./haptic-patterns";
import type { HapticPattern } from "./haptic-patterns";

/** Channel wiring. Consumer provides a real implementation; tests can pass mocks.
 * Keeps @garden/ui free of expo-speech / expo-haptics imports.
 */
export type AnnounceChannels = {
  readonly tts?: (text: string) => Promise<void>;
  readonly caption?: (text: string, ttlMs: number) => void;
  readonly haptic?: (pattern: HapticPattern) => Promise<void>;
};

export type AnnounceOptions = {
  readonly channels?: AnnounceChannels;
  readonly enabled?: {
    readonly tts?: boolean;
    readonly caption?: boolean;
    readonly haptic?: boolean;
  };
  readonly captionTtlMs?: number;
};

/** The one helper every feature calls to surface a Summary. Fires TTS + caption +
 * haptic in parallel, each gated by the `enabled` toggles. Any channel not
 * provided or disabled is silently skipped — no capability is gated on a single
 * channel.
 */
export const announce = async (summary: Summary, options: AnnounceOptions = {}): Promise<void> => {
  const channels = options.channels ?? {};
  const enabled = options.enabled ?? { tts: true, caption: true, haptic: true };
  const captionTtl = options.captionTtlMs ?? 5000;
  const promises: Array<Promise<void>> = [];

  if (enabled.tts && channels.tts) {
    promises.push(channels.tts(summary.message));
  }
  if (enabled.caption && channels.caption) {
    channels.caption(summary.message, captionTtl);
  }
  if (enabled.haptic && channels.haptic) {
    promises.push(channels.haptic(hapticPatternFor(summary.type as SummaryType)));
  }
  await Promise.all(promises);
};
