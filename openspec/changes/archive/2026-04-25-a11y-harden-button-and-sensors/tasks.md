## 1. Button Primitive — Required accessibilityLabel

- [x] 1.1 In `packages/ui/src/primitives/button.tsx`, change `accessibilityLabel?: string` to `accessibilityLabel: string` on `GardenButtonProps`
- [x] 1.2 Verify `pnpm --filter @garden/ui run typecheck` passes with zero errors (all 46 callsites already pass the prop)

## 2. Capture Driver — AbortSignal Support

- [x] 2.1 In `apps/mobile/src/engine/capture-driver.ts`, add `signal?: AbortSignal` to the `CaptureProtocolInput` type
- [x] 2.2 Add an abort check immediately before `deps.motion.subscribe()` — if `signal?.aborted` is true, return early without subscribing
- [x] 2.3 Add an abort check immediately after the `windowMs` sleep — if `signal?.aborted` is true, call `unsubscribe()` and return early without producing a result

## 3. Capture Screen — Wire AbortController to Focus

- [x] 3.1 In `apps/mobile/src/features/capture/components/capture-screen.tsx`, add a `activeControllerRef` ref (`useRef<AbortController | null>(null)`) to hold the in-flight controller
- [x] 3.2 In the `onScan` handler, create a new `AbortController`, store it in `activeControllerRef.current`, and pass `controller.signal` to `captureProtocol`
- [x] 3.3 After `captureProtocol` returns (normally or aborted), reset `activeControllerRef.current` to `null`
- [x] 3.4 Add a `useEffect` with `[isFocused]` dependency that calls `activeControllerRef.current?.abort()` when `isFocused` is `false`

## 4. Tests

- [x] 4.1 In `packages/ui/src/primitives/__tests__/render.test.tsx`, add `accessibilityLabel="<label>"` to every `GardenButton` render call that is missing it
- [x] 4.2 Add a test case asserting that `GardenButton` forwards `accessibilityLabel` to the underlying `Pressable`
- [x] 4.3 In the capture-driver test file, add an `it.each` scenario: call `captureProtocol` with a pre-aborted signal and assert `deps.motion.subscribe` is never called
- [x] 4.4 Add a scenario: call `captureProtocol` with an un-aborted signal, abort it after the subscribe but before the sleep resolves, and assert `unsubscribe()` is called and no result is returned

## 5. Full Gate

- [x] 5.1 Run `pnpm turbo run typecheck lint test` and confirm all packages pass with zero errors or warnings
