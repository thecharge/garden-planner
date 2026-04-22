## Context

The app boots and the bundle loads cleanly. The regression is purely cosmetic: the feature screens were written as `<View><Text>x</Text></View>` stubs with no styling, no theme, no SafeArea, and no navigation chrome — which renders as a white page with a few upper-left text nodes. The fix is to actually build the `@garden/ui` primitives that the earlier specs promised, wire the providers, and put the app inside an expo-router Tabs layout.

Pre-existing constraints that this change honors:

- `accessibility` spec — pastel theme, Lexend default, OpenDyslexic opt-in, AAA toggle, ≥18sp, 1.55 line height, cross-modal redundancy.
- `code-conventions-strict` — no string-literal unions, no `else if`, no `switch`, etc.
- `mobile-architecture` — FSD layout; `app/` files are thin glue (≤30 lines), cross-feature imports only through `index.ts`.
- ESLint rule: `apps/mobile/src/**` cannot import `react-native-paper` directly; only `@garden/ui` may.

## Goals / Non-Goals

**Goals:**

- Every tab renders with proper theming (pastel light in Pixel_9 default, dark-pastel toggleable in Settings).
- Bottom tab navigation works; each of the 7 screens is reachable.
- Capture screen has a visible viewfinder placeholder, prominent Scan button, verdict caption.
- Settings screen lets the user flip theme (light/dark/AAA) and see it take effect without app restart.
- Status bar color matches the theme surface.
- App shows a splash screen using the theme's background color (no blank white flash).
- Each screen has a React test that asserts it mounts inside `<ThemeProvider>` + `<SafeAreaProvider>` without throwing — proof that the UI wiring compiles and the Paper theme resolves.
- Screenshots of every tab committed to `apps/mobile/docs/screenshots/`.

**Non-Goals:**

- Camera preview with `expo-camera` live feed. Placeholder only.
- Reanimated worklets + Skia overlays with real pose data. Static shapes only.
- expo-sqlite persistence on device. The in-memory JS repository stays.
- Dyslexic / low-vision / deaf sign-off in `ACCESSIBILITY.md`. That still waits on real reviewers.
- Bulgarian translation content. `bg.ts` mirrors stay.

## Decisions

### D1. Build primitives, never import Paper outside `@garden/ui`

**Chosen:** `packages/ui/src/primitives/` hosts every wrapper. Consumer-facing API (types + components) is re-exported from `packages/ui/src/index.ts`. The lint rule in `.eslintrc.cjs` already forbids `react-native-paper` imports under `apps/mobile/src/**`; we keep it. Inside `@garden/ui`, direct Paper imports are allowed — that's the boundary.

**Why:** Non-negotiable architectural rule from the original bootstrap. Breaking it here would ripple badly.

### D2. `ThemeProvider` composes `PaperProvider` with our token set

**Chosen:** `@garden/ui`'s `ThemeProvider` takes a `themeId: ThemeId` prop (defaulting to `ThemeId.LightPastel`) plus an optional `fontFamily: FontFamily`. It:

1. Calls `toPaperTheme(themes[themeId])` to produce the MD3 theme object.
2. Renders Paper's `Provider` with that theme.
3. Exposes the tokens via React context so primitives don't re-call `toPaperTheme`.

**Why:** Centralises the theme switch so the Settings screen toggles one prop and the entire app re-paints.

### D3. Navigation via expo-router `Tabs`

**Chosen:** `apps/mobile/app/(tabs)/_layout.tsx` imports `Tabs` from `expo-router`, configures 7 tabs, uses `@expo/vector-icons/Feather` for the icons (`camera`, `grid`, `bar-chart-2`, `refresh-cw`, `droplet`, `package`, `settings`), and feeds tab color from the active theme.

Screen files move to `app/(tabs)/<name>.tsx`. The root `app/_layout.tsx` renders `<Stack>` with the `(tabs)` group as its only screen (no header). A top-level `app/index.tsx` redirects into `(tabs)/capture`.

**Why:** Expo Router is already a dep. Tabs is file-based + type-safe. Easiest path to a visible bottom nav.

### D4. Primitives: a small, useful set — not a design system

**Chosen:**

- `Screen` — `SafeAreaView` + `View` with `flex: 1`, `backgroundColor: colors.background`, padding from tokens.
- `Heading` — Paper `Text` variant="titleLarge", Lexend, `color: onSurface`, `accessibilityRole="header"`.
- `Body` — Paper `Text` variant="bodyLarge", Lexend, `color: onSurface`, size ≥ 18 sp, line height 1.55.
- `Caption` — Paper `Text` variant="bodyMedium" with muted color + accessibility live-region hint (for the announce caption line).
- `Button` — Paper `Button` mode="contained", our primary color, disables ripple.
- `Card` — Paper `Surface` elevation="1" with our tokens' `surfaceVariant` background + 16-px padding.
- `ListItem` — Paper `List.Item` with Feather icon slot, our tokens applied.
- `TabLabel` — small re-export of `Body` sized down for tab titles.

Everything else is composed from these. Eight pieces is enough to deliver the MVP screens.

**Why:** Small, bounded, testable. Avoids over-scoping a design system in a UI-delivery change.

### D5. Splash via `expo-splash-screen` + config plugin

**Chosen:** Add `expo-splash-screen` plugin to `app.json` with `backgroundColor: "#F6F3EE"` (our light-pastel `background`), `image: ./assets/splash.png` (an 1024×1024 simple logo we generate at build time via a short `scripts/make-splash.ts`), `resizeMode: "contain"`. The root layout calls `SplashScreen.preventAutoHideAsync()` on mount and `SplashScreen.hideAsync()` once the theme + fonts are ready. No blank white flash.

**Why:** Native RN apps need a native splash to avoid the system-default white flash. Expo's config plugin generates it at prebuild time.

### D6. Screen tests with `react-test-renderer`, not jest-expo

**Chosen:** `apps/mobile/__tests__/screens.test.tsx` instantiates each screen through a small `renderScreen(<TheScreen />)` helper that mounts the tree inside `<SafeAreaProvider>` + `<ThemeProvider>` + `<QueryProvider>`. Uses `react-test-renderer` (ships with `react` + `react-native`) and `jest.mock` for the native modules that don't resolve in Node (`expo-camera`, `expo-sensors`, `react-native-reanimated`, `@shopify/react-native-skia`). Assertions: the render doesn't throw; the rendered tree contains the screen's key `accessibilityLabel` strings.

**Why:** `jest-expo` pulls in a heavy preset + RN runtime fixtures. `react-test-renderer` is sufficient for "did it mount, did the strings land" — which is exactly what caught the current regression.

### D7. Screenshots committed for visual evidence

**Chosen:** After successful launch, capture a screenshot of every tab via `adb shell screencap`, pull to `apps/mobile/docs/screenshots/<tab>.png`. Commit them. The files are small (~ 50 KB each). Update `DEVICE-TESTING.md` to point to them.

**Why:** Reviewers and the user can see the app without booting the emulator. Closes the "white screen" loop.

### D8. Status bar follows the theme

**Chosen:** `_layout.tsx` reads the active theme's `background` and sets `<StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.background} />` via `expo-status-bar`. On theme switch, the status bar repaints.

## Risks / Trade-offs

- [**Paper MD3 visual drift**] — Paper's default MD3 styling can look "Google-y". Mitigation: we disable ripples, override elevation, and keep fonts locked to Lexend so the look is ours, not Material's.
- [**Tab icon dependency**] — `@expo/vector-icons` is pre-bundled with Expo; no new native build. If it's not resolvable, we fall back to Paper's `Icon` + emoji glyphs.
- [**Test-renderer with Paper**] — Paper requires `<PaperProvider>` in the tree. The helper ensures it's always there; without it, Paper throws at first render.
- [**Splash image generation**] — a 1024×1024 PNG checked into the repo adds ~ 20 KB. Acceptable.

## Post-hoc root-cause investigation (why the first attempt rendered a white screen)

After the first round of edits, the app still rendered raw text and ignored the theme. Reading the on-disk state revealed:

1. All eight `@garden/ui` primitives were present and correctly coded.
2. Six of the seven feature screens (`sectors`, `yield`, `rotation`, `nutrient`, `inventory`, `settings`) were using the new primitives.
3. **Only `apps/mobile/src/features/capture/components/capture-screen.tsx` was the original unstyled stub** — the earlier rewrite Write was overwritten or reverted at some point (most likely during the initial commit's lint-staged hook re-running `eslint --fix` against the committed tree).
4. Metro was faithfully bundling what was on disk. `grep "Point the camera" /tmp/bundle.js` returned 0 because the string was never in the file.
5. The dev-client red box "Unable to load script" seen between restarts was a separate, secondary issue: `adb reverse tcp:8081 tcp:8081` drops whenever the adb server is killed or the Metro port changes; re-establishing it per restart is a one-liner.

**Verification procedure added** to `tasks.md` to prevent loops:

- After every screen rewrite, `grep -c "<unique new string>" <file>` MUST return ≥1 before proceeding.
- After every bundle fetch, `grep -c "<unique new string>" /tmp/bundle.js` MUST return ≥1.
- After every app relaunch, `adb reverse tcp:8081 tcp:8081` is re-run unconditionally.
- Screenshot is only accepted if it visually contains at least one of the new primitives (Card border, Button background, Caption muted box, or Viewfinder placeholder).

## Migration Plan

Same-session, linear:

1. Install dev deps (`react-test-renderer`, `@testing-library/react-native` if needed).
2. Build primitives in `@garden/ui`.
3. Update `@garden/ui/src/index.ts` re-exports.
4. Write root + tabs layouts.
5. Rewrite each screen.
6. Generate splash asset.
7. Add tests.
8. Rebuild APK (`gradlew installDebug`), relaunch Metro, take screenshots.
9. Commit + `openspec archive deliver-real-ui`.

## Open Questions

- Tab-bar position: bottom (standard) vs. top. Leaning bottom — matches Android convention.
- Icon library: Feather vs. Material Community. Feather is thin-line (matches pastel aesthetic); Material is denser. Going Feather.
