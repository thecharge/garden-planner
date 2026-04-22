## Why

The app builds and runs on a Pixel_9 emulator (proven in `make-app-runnable-on-android`), but the UI is effectively a plain white screen with a handful of unstyled text nodes in the top-left. Root cause: the feature screens are `<View><Text>…</Text></View>` stubs with no theme, no layout, no SafeArea, no navigation, no splash. The `accessibility` + `mobile-architecture` specs already describe what the app SHOULD look like (pastel theme, Paper primitives, announce, AAA toggle, tab navigation). This change delivers that — and proves it with screenshots + RN component tests.

## What Changes

- **NEW** `@garden/ui/src/primitives/` — Paper-wrapped, a11y-first primitives: `ThemeProvider`, `Screen`, `Heading`, `Body`, `Caption`, `Button`, `Card`, `ListItem`, `TabLabel`. Every consumer imports from `@garden/ui`; direct `react-native-paper` imports outside `@garden/ui` remain banned.
- **NEW** `apps/mobile/app/(tabs)/_layout.tsx` — expo-router bottom tab nav covering the 7 feature screens (capture, sectors, yield, rotation, nutrient, inventory, settings), with Paper-themed icons and labels.
- **MODIFIED** `apps/mobile/app/_layout.tsx` — wraps the app in `GestureHandlerRootView` + `SafeAreaProvider` + `ThemeProvider` (from `@garden/ui`, which hosts `PaperProvider`) + `QueryProvider`.
- **MODIFIED** every feature screen component — real layout: header (`Heading`), body content in `Card`s, primary actions as `Button`. The Capture screen gets a visible viewfinder placeholder, a big "Scan" button, and a verdict `Caption` area.
- **NEW** Splash screen + status-bar config in `apps/mobile/app.json` and `apps/mobile/app/_layout.tsx`.
- **NEW** RN component tests using `react-test-renderer` against the Paper tree — snapshot tests per primitive + per screen. Lightweight: no jest-expo runner needed; uses a plain test environment with a `PaperProvider` + `SafeAreaProvider` wrapper. Coverage of the UI layer appears in `apps/mobile/coverage/`.
- **NEW** Emulator-verified screenshots checked into `apps/mobile/docs/screenshots/` so a reviewer can confirm the visual without booting an emulator themselves.
- **UPDATED** `BUILDING.md` and `CLAUDE.md` to point at the new primitives and the screenshot evidence.

## Capabilities

### Modified Capabilities

- `accessibility` — adds a requirement that every feature screen renders through `@garden/ui`'s `Screen` + `Heading` + `Body` primitives so theme, type-size, and SafeArea are applied consistently, and that every screen is exercised by a component test.
- `mobile-architecture` — adds a requirement that `app/_layout.tsx` wraps the tree in `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` → `QueryProvider`, and that the app uses an expo-router Tabs layout for the feature screens.

### New Capabilities

None — this change is UI delivery for existing capabilities.

## Impact

- **New runtime deps in `@garden/ui`**: `react-native-safe-area-context` (already installed), `@expo/vector-icons` for tab icons.
- **New devDeps**: `react-test-renderer`, `@testing-library/react-native` (optional — enables screen tests).
- **Breaking in `apps/mobile`**: every screen import swaps from raw RN `View/Text` to `@garden/ui` primitives; `app/capture.tsx`, `app/sectors.tsx` etc. move into `app/(tabs)/` group.
- **Non-goals for this change** (explicit, to avoid scope drift):
  - Live `expo-camera` feed in the Capture viewfinder — that stays a styled placeholder pending the `make-capture-driver` follow-up.
  - Live Reanimated/Skia overlays — stubbed as static shapes; `make-capture-driver` lights them up.
  - Real `expo-sqlite` persistence — the in-memory JS repository stays until `make-device-sqlite-adapter`.
  - Dyslexic / low-vision / deaf reviewer sign-off — still blocked in `ACCESSIBILITY.md`.
