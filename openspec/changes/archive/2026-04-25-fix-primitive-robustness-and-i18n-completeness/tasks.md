## 1. Repair typed React Native test lookups

- [x] 1.1 Update invalid `findByType("...")` calls in `packages/ui/src/primitives/__tests__/render.test.tsx` to use imported React Native components or a file-local typed helper for `Text`, `View`, `TextInput`, and `Pressable`.
- [x] 1.2 Update the React Native primitive lookups in `apps/mobile/src/features/sectors/__tests__/sectors-screen.test.tsx` to use component references or the shared typed helper pattern selected for this change.
- [x] 1.3 Update the React Native primitive lookups in `apps/mobile/src/features/sectors/__tests__/sector-detail-screen.test.tsx` to use component references or the shared typed helper pattern selected for this change.
- [x] 1.4 Update the React Native primitive lookups in `apps/mobile/src/features/settings/__tests__/anthropic-key-field.test.tsx` to use component references or the shared typed helper pattern selected for this change.
- [x] 1.5 Update the React Native primitive lookups in `apps/mobile/src/features/inventory/__tests__/event-form.test.tsx` to use component references or the shared typed helper pattern selected for this change.
- [x] 1.6 Update the React Native primitive lookups in `apps/mobile/src/features/inventory/__tests__/record-form.test.tsx` to use component references or the shared typed helper pattern selected for this change.
- [x] 1.7 Update the React Native primitive lookups in `apps/mobile/src/features/yield/__tests__/harvest-form.test.tsx` to use component references or the shared typed helper pattern selected for this change.

## 2. Fix test-construction and theme robustness gaps

- [x] 2.1 Update `apps/mobile/src/features/overlay/__tests__/home-dashboard.test.tsx` so `Card` children are passed through typed props or a typed wrapper instead of `createElement(Card, props, child)`.
- [x] 2.2 Correct `packages/ui/src/theme/paper-theme.ts` so `letterSpacing` is derived from `letterSpacingEm * fontSize` at the Paper adapter boundary.
- [x] 2.3 Add or update a focused test around `packages/ui/src/theme/paper-theme.ts` or its nearest existing typography coverage to assert the converted letter-spacing value.
- [x] 2.4 Add a package-local `expo-font` Jest mock for `packages/ui/src/primitives/theme-provider.tsx`, likely under `packages/ui/src/__mocks__/`, and wire it through `packages/ui/jest.config.cjs`.

## 3. Verify affected package workflows

- [x] 3.1 Run `pnpm --filter @garden/ui run typecheck` and confirm the `render.test.tsx` and theme-related regressions are resolved without suppressions.
- [x] 3.2 Run `pnpm --filter apps-mobile run typecheck` and confirm the listed mobile test files no longer report TS2345 or TS2769.
- [x] 3.3 Run the relevant Jest coverage for `@garden/ui` and the affected mobile tests to confirm the new `expo-font` mock and typed test changes work in practice.
