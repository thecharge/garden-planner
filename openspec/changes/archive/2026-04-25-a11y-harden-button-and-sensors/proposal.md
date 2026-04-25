## Why

Two compile-time and runtime accessibility gaps exist in the current codebase: the `Button` primitive allows omitting `accessibilityLabel`, making unlabelled interactive elements possible without a type error; and the DeviceMotion sensor in `captureProtocol` continues running after the tab loses focus, violating the ACCESSIBILITY.md contract and risking sensor leaks on background tabs.

## What Changes

- **BREAKING** (additive only — all 46 callsites already pass the label): `GardenButtonProps.accessibilityLabel` changes from optional (`?`) to required, making omission a compile error.
- `CaptureProtocolInput` gains an optional `signal?: AbortSignal` parameter; `captureProtocol` checks for abort before and after its `windowMs` sleep.
- `CaptureScreen.onScan` creates an `AbortController` and a `useEffect` that aborts it when `isFocused` goes false, ensuring the DeviceMotion subscription is torn down mid-scan on tab blur.

## Capabilities

### New Capabilities

- `button-label-required`: Button primitive enforces a non-optional `accessibilityLabel` at the type level, preventing unlabelled interactive elements.
- `capture-abort-on-blur`: `captureProtocol` accepts an `AbortSignal`; the capture screen wires it to `useIsFocused()` so DeviceMotion is released when the tab loses focus mid-scan.

### Modified Capabilities

- `accessibility`: The a11y contract for sensor gating now has a compile-enforced counterpart for interactive-element labelling.
- `primitive-robustness`: `Button` API contract tightened — `accessibilityLabel` is now required.

## Impact

- `packages/ui/src/primitives/button.tsx` — type signature change.
- `apps/mobile/src/engine/capture-driver.ts` — new `signal` field on input type; abort checks added.
- `apps/mobile/src/features/capture/components/capture-screen.tsx` — `AbortController` wired to `useIsFocused()`.
- `packages/ui/src/primitives/__tests__/render.test.tsx` — test must explicitly pass `accessibilityLabel`.
- Zero new dependencies; `AbortController`/`AbortSignal` are native in Hermes/React Native.
