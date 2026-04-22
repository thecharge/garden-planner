import { createStore } from "zustand/vanilla";

/** Live spatial pose sampled at capture frame-rate (up to 60 Hz).
 *
 * DO NOT place this in React `useState` or a TanStack Query cache — it would
 * trigger a render for every sample and melt the UI. Instead, consumers use
 * the transient subscription API (`subscribe(...)` with a selector) so updates
 * arrive without re-renders.
 *
 * The capture driver writes samples here via `setPose`. Reanimated worklets
 * and Skia canvases read from this store directly. A React component that
 * needs to DISPLAY a pose value uses `useThrottledPose` (see ./use-throttled-pose.ts).
 */

export type SpatialPose = {
  readonly pitchDeg: number;
  readonly yawDeg: number;
  readonly rollDeg: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly confidence: number;
  readonly updatedAt: number;
};

type SpatialState = {
  readonly pose: SpatialPose;
  readonly setPose: (next: SpatialPose) => void;
};

const ZERO_POSE: SpatialPose = {
  pitchDeg: 0,
  yawDeg: 0,
  rollDeg: 0,
  x: 0,
  y: 0,
  z: 0,
  confidence: 0,
  updatedAt: 0
};

export const spatialStore = createStore<SpatialState>((set) => ({
  pose: ZERO_POSE,
  setPose: (next) => set({ pose: next })
}));

/** Transient subscription — callback fires whenever pose changes; no React render. */
export const subscribePose = (callback: (pose: SpatialPose) => void): (() => void) =>
  spatialStore.subscribe((state, prev) => {
    if (state.pose !== prev.pose) {
      callback(state.pose);
    }
  });

/** Read the current pose. */
export const getPose = (): SpatialPose => spatialStore.getState().pose;

/** Write a new pose. Used by the capture driver and tests. */
export const setPose = (next: SpatialPose): void => {
  spatialStore.getState().setPose(next);
};
