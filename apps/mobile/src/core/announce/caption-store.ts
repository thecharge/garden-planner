import { createStore } from "zustand/vanilla";

export type CaptionState = {
  readonly text: string | null;
  readonly expiresAt: number | null;
};

export type CaptionStore = CaptionState & {
  readonly pushCaption: (text: string, ttlMs: number) => void;
  readonly clearCaption: () => void;
};

let clearTimer: ReturnType<typeof setTimeout> | null = null;

export const captionStore = createStore<CaptionStore>((set) => ({
  text: null,
  expiresAt: null,
  pushCaption: (text, ttlMs) => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    const expiresAt = Date.now() + ttlMs;
    set({ text, expiresAt });
    clearTimer = setTimeout(() => {
      set({ text: null, expiresAt: null });
      clearTimer = null;
    }, ttlMs);
  },
  clearCaption: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    set({ text: null, expiresAt: null });
  }
}));

export const getCaption = (): CaptionState => captionStore.getState();
