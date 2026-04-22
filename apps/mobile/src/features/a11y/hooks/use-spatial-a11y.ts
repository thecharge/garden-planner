import { config } from "@/core/config";
import { createLogger } from "@/core/logger";

const log = createLogger("a11y");

/** Minimal screen-reader announcer shape. The device implementation in the
 * capture screen wires this to `AccessibilityInfo.announceForAccessibility`.
 */
export type Announcer = {
  readonly announce: (message: string) => void;
};

export type SpatialEvent =
  | { readonly kind: "facing-changed"; readonly heading: string }
  | { readonly kind: "object-detected"; readonly label: string }
  | { readonly kind: "verdict-updated"; readonly verdict: string }
  | { readonly kind: "boundary-corner-added"; readonly cornerIndex: number };

type Debouncer = {
  announce: (key: string, message: string) => void;
};

/** Build a debounced announcer. Repeated calls for the same key within the
 * configured window are suppressed so the reader does not stutter during a
 * 60 Hz pose stream.
 */
export const createDebouncedAnnouncer = (
  target: Announcer,
  now: () => number = Date.now
): Debouncer => {
  const lastFiredAt = new Map<string, number>();
  return {
    announce: (key: string, message: string) => {
      const last = lastFiredAt.get(key) ?? Number.NEGATIVE_INFINITY;
      const t = now();
      if (t - last < config.A11Y_ANNOUNCE_DEBOUNCE_MS) {
        return;
      }
      lastFiredAt.set(key, t);
      target.announce(message);
      log.debug("a11y announce", { key, message });
    }
  };
};

/** Translate a spatial event into a plain-language utterance. */
export const utteranceFor = (event: SpatialEvent): string => {
  if (event.kind === "facing-changed") {
    return `Facing ${event.heading}.`;
  }
  if (event.kind === "object-detected") {
    return event.label;
  }
  if (event.kind === "verdict-updated") {
    return event.verdict;
  }
  return `Corner ${event.cornerIndex} added.`;
};
