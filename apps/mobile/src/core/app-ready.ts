import { useEffect, useState } from "react";

const MAX_READY_WAIT_MS = 2000;

/** Flips to true when fonts (or any other async prereq) resolve. Times out to
 * true after MAX_READY_WAIT_MS so the splash never stays up indefinitely.
 */
export const useAppReady = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MAX_READY_WAIT_MS);
    // Flip ready on next tick. With no blocking async prereqs today this
    // resolves almost immediately; the timer is the backstop for future
    // additions (e.g., async font loading) that could stall.
    const tick = setTimeout(() => setReady(true), 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(tick);
    };
  }, []);
  return ready;
};
