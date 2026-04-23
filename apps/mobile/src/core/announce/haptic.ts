import * as Haptics from "expo-haptics";
import type { HapticPattern } from "@garden/ui";

/** Map the UI-package pattern array to an expo-haptics feedback type. The
 * pattern length is the discriminator (see `haptic-patterns.ts`):
 *   - 1 short   → success → Success
 *   - 3 shorts  → warning → Warning
 *   - 5 shorts  → actionRequired → Warning (no notification equivalent)
 *   - 1 long    → rejection → Error
 * Any unknown shape falls back to Light so the caller never crashes.
 */
export const mapToExpoFeedback = (pattern: HapticPattern): Haptics.NotificationFeedbackType => {
  if (pattern.length === 1 && pattern[0] && pattern[0] < 200) {
    return Haptics.NotificationFeedbackType.Success;
  }
  if (pattern.length === 3) {
    return Haptics.NotificationFeedbackType.Warning;
  }
  if (pattern.length === 5) {
    return Haptics.NotificationFeedbackType.Warning;
  }
  if (pattern.length === 1 && pattern[0] && pattern[0] >= 200) {
    return Haptics.NotificationFeedbackType.Error;
  }
  return Haptics.NotificationFeedbackType.Success;
};

export const fireHaptic = async (pattern: HapticPattern): Promise<void> => {
  try {
    await Haptics.notificationAsync(mapToExpoFeedback(pattern));
  } catch {
    // Haptics unavailable on this device — silent no-op.
  }
};
