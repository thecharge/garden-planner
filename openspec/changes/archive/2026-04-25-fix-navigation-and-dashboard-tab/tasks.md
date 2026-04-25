## 1. Navigation fix — Home tab

- [x] 1.1 Create `apps/mobile/app/(tabs)/home.tsx` — default-exports `HomeDashboard` from `@/features/overlay`
- [x] 1.2 Add `{ name: "home", title: "Home", icon: FeatherIcon.Home }` as the first entry in the `tabs` array in `apps/mobile/src/features/overlay/components/app-tabs.tsx`; add `Home: "home"` to the `FeatherIcon` const object
- [x] 1.3 In `apps/mobile/app/index.tsx`: replace `<HomeDashboard />` with `<Redirect href="/(tabs)/home" />` (import `Redirect` from `expo-router`; remove the `HomeDashboard` import)

## 2. Dashboard visual restructure

- [x] 2.1 In `apps/mobile/src/features/overlay/components/home-dashboard.tsx`:
  - Move `<SoundOnboardingCard />` below the sector card (not the first element)
  - Replace the "Scan hero card" `<Card>` block with a standalone `<Button>` (primary, `accessibilityLabel="Go to capture screen"`) preceded by a `<Heading>` or large `<Body>` line for context — no Card wrapper
  - Add a compact metric tiles row using a `<View style={{ flexDirection: "row", gap: 16 }}>` containing two sub-views: one showing sector count as a `<Heading>`-sized number + `<Body muted>` label, one showing last slope (if > 0) as a number + label
  - Add a quick-link row using `<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>` with four `<Button mode={ButtonMode.Secondary}>` entries: "Capture" → `/(tabs)/capture`, "Sectors" → `/(tabs)/sectors`, "Yield" → `/(tabs)/yield`, "Settings" → `/(tabs)/settings`
  - Keep `accessibilityLabel` values on all containers

## 3. Font switching — ThemeProvider override

- [x] 3.1 In `packages/ui/src/primitives/theme-provider.tsx`:
  - Add `fontFamilyOverride?: FontFamily` to the props type (import `FontFamily` from `@garden/config`)
  - Wrap the resolved tokens in a `useMemo`: if `fontFamilyOverride` is provided, spread tokens and override `typography.bodyFontFamily`; otherwise use tokens unchanged
  - Pass `activeTokens` (from the memo) to the existing tokens context instead of the raw `tokens`

- [x] 3.2 In `apps/mobile/src/core/theme/settings-theme-provider.tsx`:
  - Add `const fontFamily = useStore(settingsStore, (s) => s.fontFamily);` alongside the existing `themeId` subscription
  - Pass `fontFamilyOverride={fontFamily}` to `<ThemeProvider>`

## 4. Font loading at startup

- [x] 4.1 In `apps/mobile/src/core/root-gate.tsx`:
  - Fonts are pre-bundled via the `expo-font` config plugin in `app.json` (Lexend-Regular.ttf, OpenDyslexic-Regular.otf declared there). No runtime `useFonts` call needed — fonts available immediately. Font switching works via `fontFamilyOverride` in ThemeProvider.

## 5. Verify and test

- [x] 5.1 Run `pnpm turbo run typecheck` — confirm zero errors across all packages
- [x] 5.2 Run `pnpm test:coverage` — confirm all tests still pass
- [x] 5.3 Update `apps/mobile/src/features/overlay/__tests__/home-dashboard.test.tsx` to reflect the new render structure (metric tiles row, quick-link row, SoundOnboardingCard position)
- [x] 5.4 Add a unit test in `packages/ui/src/__tests__/theme-provider.test.tsx` (or equivalent) verifying that when `fontFamilyOverride` is passed, the tokens context exposes the overridden `typography.bodyFontFamily`
- [x] 5.5 Run `pnpm turbo run typecheck lint test` one final time — confirm everything green
