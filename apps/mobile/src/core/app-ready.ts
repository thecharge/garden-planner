import { useEffect, useState } from "react";

const MAX_READY_WAIT_MS = 2000;

export const useAppReady = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MAX_READY_WAIT_MS);
    const tick = setTimeout(() => setReady(true), 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(tick);
    };
  }, []);
  return ready;
};
