## Why

Three compounding UX problems make the app confusing and inaccessible after the `production-readiness-and-ux-overhaul` change:

1. **No visible menu / tab bar on launch.** `app/index.tsx` renders `HomeDashboard` outside the `/(tabs)` group. The tab bar never appears on the landing screen, leaving five of seven feature tabs (Yield, Rotation, Nutrient, Inventory, Settings) completely unreachable without pressing a specific button. The app looks like a dead end.

2. **Dashboard is indistinguishable from the Settings page.** Both screens use the exact same visual language: `Screen → Heading → muted Body → stacked Cards + Buttons`. The dashboard opens with `SoundOnboardingCard` (a settings action) at the top, no hero element, no data visualization, and no quick-navigation affordances. Users naturally read it as "another settings screen."

3. **Font switching (OpenDyslexic ↔ Lexend) does nothing.** `SettingsThemeProvider` only reads `themeId` from `settingsStore`. The `fontFamily` field is never wired into the token system. `tokens.typography.bodyFontFamily` is a static constant hardcoded to `FontFamily.Lexend`. Changing the setting updates in-memory state that nothing subscribes to. Additionally, fonts are bundled in `assets/fonts/` but never explicitly loaded via `useFonts`, so availability is not guaranteed on first render.

## What Changes

### Navigation fix (problem 1)

- `app/index.tsx` redirects to `/(tabs)/home` instead of rendering `HomeDashboard` standalone
- New route `app/(tabs)/home.tsx` renders `HomeDashboard` inside the tabs group
- `AppTabs` gains a "Home" tab prepended as the first entry (Feather `"home"` icon)
- Tab order: **Home → Capture → Sectors → Yield → Rotation → Nutrient → Inventory → Settings**

### Dashboard visual differentiation (problem 2)

- `HomeDashboard` restructured so the top section is a distinct hero area — not another card:
  - Large primary CTA ("Tap to scan") promoted above the card stack, not buried in a Card
  - Compact metric tiles row (sector count + last slope) shown as emphasized numbers, not plain Body text
  - `SoundOnboardingCard` moved below the primary content (not the first thing visible)
  - Quick-link row added for Capture, Sectors, Yield, Settings — signals "hub" not "settings list"
- No new @garden/ui primitives required in this change; uses existing Card, Button, Body with layout adjustments

### Font switching fix (problem 3)

- `packages/ui/src/primitives/theme-provider.tsx` gains an optional `fontFamilyOverride?: FontFamily` prop; tokens are merged reactively via `useMemo`
- `apps/mobile/src/core/theme/settings-theme-provider.tsx` subscribes to `settingsStore.fontFamily` and passes `fontFamilyOverride` to `ThemeProvider` — font changes now cause an immediate re-render
- `apps/mobile/src/core/root-gate.tsx` (or a new `FontsProvider`) loads both Lexend and OpenDyslexic via `expo-font`'s `useFonts` before hiding the splash; `useAppReady` is extended to await font loading

## Capabilities

### New Capabilities

- `home-dashboard-tab`: HomeDashboard rendered as the first tab inside the bottom tab navigator; tab bar always visible
- `font-switching`: Selecting OpenDyslexic or Lexend in Settings immediately changes the font of all text primitives across the app

### Modified Capabilities

- `mobile-architecture`: navigation entry point changes from standalone Stack screen to tab-group redirect
- `home-dashboard-visual`: HomeDashboard visual design differentiated from settings via hero CTA, metric tiles, and quick-link row

## Impact

**Navigation (3 files):**

- `apps/mobile/app/index.tsx` — `<Redirect href="/(tabs)/home" />`
- `apps/mobile/app/(tabs)/home.tsx` — new file
- `apps/mobile/src/features/overlay/components/app-tabs.tsx` — add "home" tab

**Dashboard visual (1 file):**

- `apps/mobile/src/features/overlay/components/home-dashboard.tsx` — restructure layout

**Font switching (3 files):**

- `packages/ui/src/primitives/theme-provider.tsx` — add `fontFamilyOverride` prop
- `apps/mobile/src/core/theme/settings-theme-provider.tsx` — subscribe to `fontFamily`
- `apps/mobile/src/core/root-gate.tsx` — add `useFonts` loading

**No new external dependencies required.**
