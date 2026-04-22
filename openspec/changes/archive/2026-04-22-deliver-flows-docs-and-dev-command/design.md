## Context

The app renders and installs on the Pixel_9 emulator (`make-app-runnable-on-android` + `deliver-real-ui` closed those gaps), but it's still a stub from the user's point of view: inventory is empty and uneditable, sectors can only be incremented, harvests have no entry point, settings has no key field, and the theme toggle is cosmetic. The user flagged all of it. This change wires the flows end-to-end, writes the docs they need to actually use it, and gives them a single `pnpm dev` command to run it.

Pre-existing constraints carried forward unchanged:

- No string-literal unions.
- Primitives live in `@garden/ui`; raw `react-native-paper` imports only inside `@garden/ui` (currently unused — our primitives use raw RN + tokens).
- `app/` files ≤30 lines, no business-logic imports.
- FSD features — cross-feature imports only through `index.ts`.
- `accessibility` spec — Lexend default, ≥18sp, AA contrast, cross-modal redundancy, plain-language copy.

## Goals / Non-Goals

**Goals:**

- Each user flow listed below works end-to-end on the emulator, with a fresh screenshot checked in.
- Each new flow has at least one React component test (`react-test-renderer` + existing `react-native` mock) asserting render + interaction + repo side-effect.
- The docs exist and are cross-linked from `README.md`.
- A fresh `pnpm dev` from a clean shell boots the emulator (if needed), starts Metro, installs the APK on the device, and streams Metro logs.

**Non-Goals:**

- Live camera, Reanimated worklets, Skia overlays — all remain placeholders per the earlier changes.
- expo-sqlite persistence — still in-memory; data resets at app restart. Documented.
- Map-based polygon editor for sectors.

## Decisions

### D1. `TextInput` primitive, raw RN, themed

`@garden/ui/src/primitives/text-input.tsx` wraps `react-native`'s `TextInput`. Props: `value`, `onChangeText`, `placeholder`, `secureTextEntry?`, `keyboardType?`, `accessibilityLabel`. Styling: border from `tokens.colors.muted`, focus-border from `tokens.colors.primary` (managed via a local `onFocus`/`onBlur` state), body-sized Lexend, 12px vertical padding, 14px horizontal padding. Label rendered above as a `<Body muted>`.

### D2. Theme live-switch via Zustand selector

The current `ThemeProvider` takes a static `themeId` prop. Change: when no prop is passed, `ThemeProvider` subscribes to `settingsStore` via a new `useSettings` React hook (`zustand/react`) and uses the active theme id. The root `_layout.tsx` doesn't pass `themeId`, so the app's theme follows the store.

**Trade-off:** adding a React binding to the store makes `@garden/ui` depend on `zustand` as a runtime dep (currently only transitively). Acceptable — Zustand is tiny.

### D3. Sector detail at `/sector/[id]` (stack, outside tabs)

Expo Router file-based route. `app/sector/[id].tsx` → `SectorDetailScreen`. Navigated from the Sectors tab list via `router.push(`/sector/${id}`)`. Harvest log form is rendered on the detail screen. Route stays outside the `(tabs)` group so the tab bar hides during detail (standard RN UX).

### D4. Anthropic key via `expo-secure-store` + `expo-clipboard`

`src/features/settings/hooks/use-anthropic-key.ts` exposes `{ keyMasked, hasKey, saveKey(plain), clearKey() }`. `saveKey` calls `SecureStore.setItemAsync('anthropic_api_key', plain)` then flips `settingsStore.anthropicKeyConfigured = true`. Masked display: first 7 chars (`sk-ant-`) + `***…***` + last 4 chars. `useAnthropicKey` reads from `SecureStore.getItemAsync` on mount (tanstack-query-backed). The paste button calls `Clipboard.getStringAsync()` and pushes into the text-input state.

### D5. `deleteSector` on `MemoryRepository`

Adds a method to the interface. Node adapter runs `DELETE FROM sectors WHERE id = ?`. Mobile in-memory JS adapter deletes from the map. Existing tests in `@garden/memory` cover this via a new case in `sector-harvest.test.ts`.

### D6. `pnpm dev` orchestrator

Single `scripts/dev.sh`:

1. Source `setup-env.sh`.
2. Run `doctor.sh`, exit on fail.
3. If `adb devices` shows no device, call `./scripts/launch-emulator.sh` (which waits for boot).
4. `adb reverse tcp:8081 tcp:8081`.
5. If `curl -sS http://localhost:8081/status` 404s or times out, `nohup pnpm --filter apps-mobile exec expo start --dev-client --port 8081 > /tmp/metro.log 2>&1 & disown`; wait until `/status` returns 200.
6. Re-run `adb reverse` (it resets every time adb restarts).
7. `pnpm --filter apps-mobile exec expo run:android --no-bundler`.
8. `tail -f /tmp/metro.log` in the foreground so the user sees Metro logs + Ctrl+C stops only the tail, not Metro.

Script exits clean on Ctrl+C. Metro keeps running in the background. A `pnpm dev:stop` script kills Metro + emulator for teardown.

**Trade-off:** Metro lives across `pnpm dev` runs. That's the intended behaviour for hot reload. A `pnpm dev:stop` is provided for full teardown.

### D7. Docs — two audiences, two voices

`HOW-TO.md` and `SIDELOAD.md` are user-first: ≤20-word sentences, bullet-heavy, dyslexia-friendly phrasing per the accessibility spec. Screenshots inline. `COMMANDS.md` and `docs/app-flow.md` are developer-first: table-heavy, code-blocks. `BUILDING.md` stays as-is; `QUICKSTART.md` gets a 1-line "just run `pnpm dev`" at the top.

### D8. Tests per flow

Each new form gets one test file (`<component>.test.tsx`) using `react-test-renderer` + the existing `__mocks__/react-native.tsx` stub. Pattern:

1. Render inside `<ThemeProvider>`.
2. Find input by `accessibilityLabel` → simulate `onChangeText`.
3. Find Pressable by `accessibilityLabel` → invoke `onPress`.
4. Assert the Zustand store or mock repo was updated.

`useAnthropicKey` tests stub `expo-secure-store` and `expo-clipboard` in `packages/ui/src/__mocks__/`-style folder under `apps/mobile/src/__mocks__/`.

## Risks / Trade-offs

- **Zustand + React binding in `@garden/ui`**: adds a runtime dep. Acceptable; zustand is ~1 kB.
- **SecureStore unavailable in some AVD configs**: `expo-secure-store` falls back to plain AsyncStorage on older Android. We'll rely on the plugin's native install; if it fails, the key field shows an `actionRequired` caption.
- **`pnpm dev` tails a log file, not Metro's stdout**: if the user quits via Ctrl+C they may forget Metro is still alive. Mitigation: banner at start + `pnpm dev:stop` documented.
- **Placeholder polygons**: sectors get a 4-corner fake polygon until a map editor lands. Noted in HOW-TO.

## Migration Plan

Linear, same-session:

1. Write the OpenSpec artifacts + validate.
2. Add `TextInput` primitive + `deleteSector`.
3. Implement sector detail + harvest form + update sectors tab list.
4. Implement inventory record + event forms.
5. Implement settings key flow + wire theme live-switch.
6. Add tests for every new form + hook.
7. Write `HOW-TO.md`, `SIDELOAD.md`, `COMMANDS.md`, `docs/app-flow.md`.
8. Write `scripts/dev.sh` + add `pnpm dev / apk / doctor` to root.
9. Relaunch app on emulator, capture a screenshot per new flow.
10. `openspec validate` → `openspec archive` → commit.

## Open Questions

None. Directions from the user are explicit: A+B in sequence, C at minimum one command, key field is paste+save with `secureTextEntry`.
