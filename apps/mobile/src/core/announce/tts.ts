import * as Speech from "expo-speech";
import { config } from "@/core/config";

/** Speak with a 2 s soft deadline — if the TTS stack stalls, we resolve the
 * promise and let the caller move on. Caption + haptic still fire.
 */
export const speak = async (text: string): Promise<void> => {
  return new Promise((resolve) => {
    const guard = setTimeout(resolve, 2000);
    try {
      Speech.speak(text, {
        rate: config.TTS_RATE,
        onDone: () => {
          clearTimeout(guard);
          resolve();
        },
        onStopped: () => {
          clearTimeout(guard);
          resolve();
        },
        onError: () => {
          clearTimeout(guard);
          resolve();
        }
      });
    } catch {
      clearTimeout(guard);
      resolve();
    }
  });
};

export const cancelSpeech = (): void => {
  try {
    Speech.stop();
  } catch {
    // no-op
  }
};
