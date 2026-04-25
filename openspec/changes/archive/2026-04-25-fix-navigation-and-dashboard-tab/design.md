## Context

Three distinct but compounding problems exist after `production-readiness-and-ux-overhaul`:

**Problem 1 — Navigation:** `HomeDashboard` lives at the app root (`/`) as a standalone Stack screen. The `(tabs)` layout with `AppTabs` is a sibling group, not a parent. Result: tab bar is invisible on launch; 5 of 7 tabs unreachable without pressing a specific button.

**Problem 2 — Visual identity:** `HomeDashboard` and `SettingsScreen` use identical primitives (`Screen → Heading → Body → stacked Cards → Buttons`), identical layout, and the first visible element on the dashboard is `SoundOnboardingCard` — a settings action. No hero, no metric emphasis, no hub affordances.

**Problem 3 — Font switching:** `SettingsThemeProvider` reads only `themeId` from `settingsStore`. `tokens.typography.bodyFontFamily` is a compile-time constant (`FontFamily.Lexend`). Toggling `setFontFamily()` flips in-memory state that nothing downstream subscribes to. Additionally, both font files are bundled but never explicitly loaded via `useFonts`.

```
CURRENT STATE
─────────────────────────────────────────────────────────────────

Stack (root)
├── index.tsx  →  <HomeDashboard />    ← no tab bar, isolated
└── (tabs)/    →  AppTabs              ← tab bar only here
     ├── capture
     ├── sectors
     ├── yield
     ├── rotation
     ├── nutrient
     ├── inventory
     └── settings

settingsStore.fontFamily  ──→  (nothing reads this)
tokens.bodyFontFamily     ──→  hardcoded "Lexend"
ThemeProvider             ──→  reads themeId only

HomeDashboard render order:
  <Screen>
    <Heading>Garden Planner</Heading>
    <Body muted>...</Body>
    <SoundOnboardingCard />     ← settings card first!
    <Card>Scan hero card</Card>
    <Card>Sector health card</Card>
    <Card>Last scan card</Card>   (conditional)
  </Screen>

TARGET STATE
─────────────────────────────────────────────────────────────────

Stack (root)
├── index.tsx  →  <Redirect href="/(tabs)/home" />
└── (tabs)/    →  AppTabs              ← tab bar on ALL screens
     ├── home       ← HomeDashboard here
     ├── capture
     ├── sectors
     ├── yield
     ├── rotation
     ├── nutrient
     ├── inventory
     └── settings

settingsStore.fontFamily  ──→  SettingsThemeProvider
SettingsThemeProvider     ──→  ThemeProvider(fontFamilyOverride)
ThemeProvider             ──→  merges tokens.bodyFontFamily reactively
useFonts (RootGate)       ──→  loads Lexend + OpenDyslexic at startup

HomeDashboard render order:
  <Screen>
    <Heading>Garden Planner</Heading>
    <Body muted>...</Body>
    <MetricTiles>               ← sector count + last slope
    <Button primary large>Tap to scan</Button>   ← hero CTA
    <QuickLinks row>            ← Capture, Sectors, Yield, Settings
    <SoundOnboardingCard />     ← moved below primary content
  </Screen>
```

## Goals / Non-Goals

**Goals:**

- Tab bar visible on every main app screen including the dashboard
- HomeDashboard reads as a hub/dashboard, not a settings list
- Toggling font in Settings immediately re-renders all text with the new font
- Fonts are guaranteed loaded before first render
- All existing routes, tab icons, and feature screen components unchanged

**Non-Goals:**

- Adding new UI primitives or @garden/ui components (use existing)
- Changing AppTabs icon styles or tab-bar colors
- Supporting more than two font families in this change
- Persisting settings to SQLite (in-memory store only, as today)
- Any changes to feature screens other than HomeDashboard

## Decisions

### D1: Move HomeDashboard into `(tabs)` group

**Decision:** Add `app/(tabs)/home.tsx` exporting `HomeDashboard`. Change `app/index.tsx` to `<Redirect href="/(tabs)/home" />`. Prepend `{ name: "home", title: "Home", icon: FeatherIcon.Home }` to `AppTabs`.

**Rationale:** The tab bar is rendered exclusively by `AppTabs` inside the `(tabs)` layout. Any screen needing the tab bar must be a child of that group. Three-file change, zero risk to existing screens.

**Rejected:** Custom bottom-nav bar on the standalone screen — duplicates tab logic, diverges from Expo Router conventions.

### D2: Dashboard visual restructure — no new primitives

**Decision:** Reorder `HomeDashboard` content and promote the primary CTA outside of its `Card` container. Use a compact two-column `View` row for metric tiles (sector count, last slope) using existing `Body` with `Heading`-style sizing. Move `SoundOnboardingCard` below the primary content block.

Add a Quick Links row: four `Button mode={ButtonMode.Ghost}` (or Secondary) side by side using a wrapping `View` with `flexDirection: row`. Links: Capture, Sectors, Yield, Settings — all `router.push("/(tabs)/...")`.

**Rationale:** No new @garden/ui primitives needed. Restructuring layout alone breaks the visual parity with Settings. The key signal is a prominent primary action above the fold and metric numbers rather than prose.

**Rejected:** New `HeroBanner` or `MetricTile` primitive — out of scope for a fix change; would require @garden/ui updates and accessibility audits.

### D3: `fontFamilyOverride` prop on `ThemeProvider`

**Decision:** Add `fontFamilyOverride?: FontFamily` prop to `packages/ui/src/primitives/theme-provider.tsx`. Inside the provider, compute `activeTokens = useMemo(() => fontFamilyOverride ? { ...tokens, typography: { ...tokens.typography, bodyFontFamily: fontFamilyOverride } } : tokens, [tokens, fontFamilyOverride])`. Expose `activeTokens` via the existing tokens context.

`SettingsThemeProvider` subscribes to both `themeId` and `fontFamily` from `settingsStore` and passes `fontFamilyOverride={fontFamily}` to `ThemeProvider`.

**Rationale:** Minimal surface-area change. `ThemeProvider` already owns the tokens context; a single optional prop is the cleanest extension point. All primitives already read from context — no changes needed in `body.tsx`, `heading.tsx`, etc.

**Rejected:** Mutating static token objects at runtime — not reactive, not safe for concurrent renders.

### D4: Load fonts at startup in `RootGate`

**Decision:** Call `useFonts({ [FontFamily.Lexend]: require("../../assets/fonts/Lexend-Regular.ttf"), [FontFamily.OpenDyslexic]: require("../../assets/fonts/OpenDyslexic-Regular.otf") })` inside `RootGate`. Extend `useAppReady` (or gate the `SplashScreen.hideAsync()` call) to wait until both `fontsLoaded` and the existing readiness condition are true.

**Rationale:** Fonts are already bundled. `useFonts` is the standard Expo pattern. Without it, React Native may silently fall back to the system font for the first render frame.

**Rejected:** Inline `Font.loadAsync` calls per-component — not idiomatic, harder to track loading state globally.

## Risks / Trade-offs

- **8 tabs on small screens** → Tab bar may feel crowded at very narrow widths. Acceptable for now; can add label-hiding or tab overflow in a future UX pass.
- **Font load delay** → If fonts take > 2 s to load (first cold launch), the splash stays visible longer. Acceptable trade-off; subsequent launches hit the bundle cache.
- **`useMemo` on tokens** → Negligible overhead; runs only when `themeId` or `fontFamily` changes.
- **Dashboard quick-link row width** → Four buttons in a `flexDirection: row` may wrap on small screens. Use `flex: 1` per button or `flexWrap: wrap` as a backstop.
