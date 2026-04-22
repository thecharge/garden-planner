## ADDED Requirements

### Requirement: Root layout provider order

`apps/mobile/app/_layout.tsx` SHALL wrap the app tree in this exact provider order, outside → in: `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` (from `@garden/ui`, which hosts `PaperProvider` + exposes token context) → `QueryProvider`. The root layout file stays ≤30 lines per the existing `app/` thin-glue rule.

#### Scenario: Providers mount in the expected order
- **WHEN** `_layout.tsx` renders
- **THEN** the rendered tree MUST include each of the four providers in order
- **AND** no feature-level imports (e.g., `@garden/memory`, `@garden/engine`) MUST appear in `app/_layout.tsx`

### Requirement: Bottom-tab navigation via expo-router `Tabs`

The app SHALL use expo-router's `Tabs` layout at `apps/mobile/app/(tabs)/_layout.tsx` to expose the 7 feature screens (capture, sectors, yield, rotation, nutrient, inventory, settings). Tab labels and icons MUST come from the active theme's color tokens and from `@expo/vector-icons/Feather`.

#### Scenario: All 7 tabs are reachable
- **WHEN** the app launches to the Capture tab
- **THEN** the user MUST be able to reach each of the 7 feature screens by tapping its tab icon
- **AND** the active tab indicator MUST use `theme.colors.primary`

#### Scenario: No blank white flash on launch
- **WHEN** the app cold-starts
- **THEN** the splash screen MUST paint the theme's `background` color
- **AND** `SplashScreen.hideAsync()` MUST only fire once fonts and the initial theme are ready
