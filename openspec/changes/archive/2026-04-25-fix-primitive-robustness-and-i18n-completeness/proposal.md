## Why

The repo currently carries TS5+ typecheck regressions in UI and mobile test files, a typography unit bug in the Paper theme adapter, and a missing `expo-font` Jest mock in `@garden/ui`. These issues make primitive rendering, dashboard coverage, and theme-backed test runs brittle right where the app needs reliable foundations for accessible, localized UI work.

## What Changes

- Replace invalid `react-test-renderer` lookups such as `tree.root.findByType("Text")` with valid React Native component references or typed helpers in the affected test files, without using `@ts-ignore` or other type suppressions.
- Fix `apps/mobile/src/features/overlay/__tests__/home-dashboard.test.tsx` so `Card` children are provided through typed props or a typed wrapper instead of the rejected `createElement(Card, props, children)` overload.
- Correct `packages/ui/src/theme/paper-theme.ts` so `letterSpacingEm` tokens are converted to React Native `letterSpacing` units by multiplying by the active font size.
- Add an `expo-font` Jest mock for `@garden/ui` so `packages/ui/src/primitives/theme-provider.tsx` and dependent tests can render without native font module failures.
- Verify the affected package typecheck and Jest flows stay green after the robustness fixes land.

## Capabilities

### New Capabilities

- `primitive-robustness`: Keep UI primitive and screen test infrastructure type-safe under current React Native and TypeScript typings, preserve typography token semantics in the Paper adapter, and provide a stable Jest font mock for `@garden/ui`.

### Modified Capabilities

None.

## Impact

- `packages/ui/src/primitives/__tests__/render.test.tsx`
- `packages/ui/src/primitives/theme-provider.tsx`
- `packages/ui/src/theme/paper-theme.ts`
- `packages/ui/jest.config.cjs`
- `packages/ui/src/__mocks__/expo-font.ts` (new mock expected)
- `apps/mobile/src/features/sectors/__tests__/sectors-screen.test.tsx`
- `apps/mobile/src/features/sectors/__tests__/sector-detail-screen.test.tsx`
- `apps/mobile/src/features/settings/__tests__/anthropic-key-field.test.tsx`
- `apps/mobile/src/features/inventory/__tests__/event-form.test.tsx`
- `apps/mobile/src/features/inventory/__tests__/record-form.test.tsx`
- `apps/mobile/src/features/yield/__tests__/harvest-form.test.tsx`
- `apps/mobile/src/features/overlay/__tests__/home-dashboard.test.tsx`
- `pnpm --filter @garden/ui run typecheck`
- `pnpm --filter apps-mobile run typecheck`
