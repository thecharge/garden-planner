## Context

The `@garden/ui` Button primitive (`packages/ui/src/primitives/button.tsx`) exposes `accessibilityLabel` as an optional prop. Any developer who omits it produces an unlabelled interactive element — a silent a11y regression that TypeScript currently allows without complaint. All 46 current callsites already pass the label, so the fix is purely a type-contract tightening with zero runtime or callsite churn.

The capture flow (`captureProtocol` in `apps/mobile/src/engine/capture-driver.ts`) subscribes to `DeviceMotion`, waits for `windowMs`, then unsubscribes. There is no early-exit path. `CaptureScreen` already uses `useIsFocused()` to gate `<CameraView>`, but `onScan` starts a capture without any mechanism to abort it when the tab blurs mid-scan. The ACCESSIBILITY.md contract requires all expensive sensors to be released on blur.

## Goals / Non-Goals

**Goals:**

- Make `accessibilityLabel` a required field on `GardenButtonProps` at compile time.
- Provide an `AbortSignal`-based escape hatch in `captureProtocol` for mid-scan teardown.
- Wire that escape hatch to `useIsFocused()` in `CaptureScreen` so DeviceMotion is released when the tab blurs.
- Keep all existing callsites compiling without modification.

**Non-Goals:**

- Retrofitting `AbortSignal` to other sensor subscribers beyond `captureProtocol`.
- Changing the runtime behaviour of `Button` (no default label, no fallback).
- Altering the scan window duration or motion-detection logic.

## Decisions

### 1. Required prop vs. ESLint rule

**Decision**: Change the TypeScript type (`accessibilityLabel?: string` → `accessibilityLabel: string`).

**Alternatives considered**:

- An ESLint rule that warns on missing label — catches violations later (lint phase) and only in the mobile app; does not protect library consumers.
- A runtime `console.warn` — invisible at build time, silently ships.

TypeScript enforcement at the package boundary is the earliest, cheapest, and most portable signal.

### 2. AbortSignal over a custom cancellation token

**Decision**: Use the native `AbortSignal` / `AbortController` API already available in Hermes.

**Alternatives considered**:

- A boolean ref (`isCancelled`) passed by reference — mutable shared state, harder to test.
- A custom event emitter — unnecessary complexity; `AbortSignal` is the standard.

No polyfill is needed; the API is stable in React Native ≥ 0.71 / Hermes.

### 3. Where to create the AbortController

**Decision**: Create it inside the `onScan` callback in `CaptureScreen`, not inside `captureProtocol` itself.

The protocol function is a pure domain unit — it should not own focus awareness. The screen layer owns the React lifecycle and is the right place to bridge `useIsFocused()` to the signal. The protocol simply respects whatever signal it receives.

### 4. useEffect dependency on isFocused

**Decision**: A `useEffect` with `[isFocused, activeController]` deps calls `controller.abort()` when `isFocused` becomes `false` and a controller is active. The controller ref is reset to `null` once the protocol returns (whether normally or aborted).

## Risks / Trade-offs

- **Risk**: A test that renders `<Button>` without `accessibilityLabel` will fail to compile after this change. → Mitigation: Update `render.test.tsx` as part of the same PR; CI catches any miss.
- **Risk**: `signal.aborted` checked only at two discrete points (before subscribe, after sleep) — a synchronous abort between those points would be missed. → Accepted: the sleep is the only significant latency; a missed abort within a few milliseconds of subscription has negligible sensor cost.
- **Trade-off**: `onScan` now holds a ref to the active controller for the `useEffect` to abort. This adds a small amount of state to the component. It is the minimum required to bridge the React lifecycle to the protocol.

## Migration Plan

1. Update `GardenButtonProps` type in `packages/ui`.
2. Verify `pnpm turbo run typecheck` passes (all 46 callsites already compliant).
3. Patch `render.test.tsx` to pass `accessibilityLabel` in Button render calls.
4. Extend `CaptureProtocolInput` with `signal?: AbortSignal`.
5. Add abort checks in `captureProtocol`.
6. Add `AbortController` + `useEffect` in `CaptureScreen`.
7. Run full gate: `pnpm turbo run typecheck lint test`.

No database migrations, no external API changes, no rollback procedure needed — all changes are additive or type-contract narrowing.

## Open Questions

None — all technical decisions are resolved above.
