## Context

This change is narrowly scoped but cross-cutting: it touches `@garden/ui` theme plumbing, the UI package Jest environment, and React test files in both `packages/ui` and `apps/mobile`. The regressions are already known and concrete: TS5+ rejects string host names like `findByType("Text")` for React Native `ElementType`, `paper-theme.ts` still treats em-based letter spacing as a raw React Native pixel value, `packages/ui` lacks an `expo-font` Jest mock even though `theme-provider.tsx` depends on font loading, and the home dashboard test constructs `Card` children with a `createElement` overload that no longer typechecks.

The repo's hard rules shape the design: no `@ts-ignore`, no source-level suppressions, no implementation shortcuts that bypass package boundaries, and no behavior changes outside the robustness fixes themselves. Because the user requested proposal artifacts only, this document captures the intended implementation approach without changing code.

## Goals / Non-Goals

**Goals:**

- Eliminate the known TS2345 and TS2769 regressions from the listed test files using typed React Native component references or a typed helper.
- Keep the fix local to tests and helpers rather than weakening package typings.
- Correct `packages/ui/src/theme/paper-theme.ts` so typography tokens expressed in em produce correct React Native `letterSpacing` values.
- Add a package-local `expo-font` Jest mock path that makes `@garden/ui` tests deterministic and independent of the native Expo module.
- Preserve existing runtime behavior except for the intended letter-spacing correction and test-environment stabilization.

**Non-Goals:**

- No feature work, translation work, or source-string rewrites beyond the named robustness problems.
- No lint-rule relaxations, no `@ts-ignore`, and no weakening of React Native or React typings.
- No changes to unrelated screens, primitives, or OpenSpec capabilities outside the new robustness capability.
- No runtime font-loading redesign in `ThemeProvider`; only the Jest support needed for current imports.

## Decisions

### D1: Fix `findByType` regressions with imported React Native components or one typed helper

**Rationale:** TS5+ and current `react-test-renderer` typings require an `ElementType`, not the string host name used in DOM-style tests. The least risky approach is to import `Text`, `View`, `TextInput`, and `Pressable` from `react-native` in the affected tests and replace `findByType("...")` with `findByType(Component)`. If repeated test patterns remain noisy, a small typed helper local to the test file or test support layer can wrap the same component-based lookup without changing runtime behavior.

**Alternative considered:** Loosen the test typing or cast the string values to `unknown as ElementType`. Rejected because it hides the exact regression the typecheck is supposed to catch and violates the repo's no-suppression intent.

### D2: Keep the home dashboard `Card` fix inside the test callsite

**Rationale:** The TS2769 issue comes from a single `createElement(Card, { accessibilityLabel }, children)` pattern. The most maintainable fix is to move `children` into the props object or to route the render through a typed test wrapper dedicated to that component shape. This keeps production component APIs unchanged while satisfying React's stricter overload resolution.

**Alternative considered:** Broaden the `Card` prop type in source to accommodate the test callsite. Rejected because the production primitive already has a valid API; the problem is the test invocation.

### D3: Convert `letterSpacingEm` at the Paper adapter boundary

**Rationale:** Tokens already model letter spacing in em, and `packages/ui/src/primitives/body.tsx` was corrected earlier in the session by multiplying the token by font size. `packages/ui/src/theme/paper-theme.ts` should follow the same rule so Paper-backed text and direct primitive text derive from the same typography semantics. The adapter is the correct boundary because it is where abstract tokens become React Native numeric style values.

**Alternative considered:** Redefine tokens to store React Native pixel spacing instead of em. Rejected because that would ripple through the theme system and diverge from existing token meaning.

### D4: Add an explicit `expo-font` mock in `@garden/ui` Jest config

**Rationale:** `packages/ui/src/primitives/theme-provider.tsx` depends on `expo-font`, but the package-local Jest configuration only remaps `react-native` and `react-native-safe-area-context`. A package-owned mock registered through `moduleNameMapper` or Jest's standard mock conventions keeps `@garden/ui` self-sufficient and avoids relying on app-level mocks.

**Alternative considered:** Expect every consuming package to mock `expo-font`. Rejected because the dependency originates in `@garden/ui`, so the package should provide its own deterministic test environment.

## Risks / Trade-offs

- **[Risk] Multiple test files repeat the same primitive imports and lookup patterns** → Mitigation: allow a shared typed helper if duplication becomes large, but keep it constrained to test support.
- **[Risk] The Paper adapter and primitive components could drift again on typography math** → Mitigation: add or update targeted tests that assert the computed `letterSpacing` matches `letterSpacingEm * fontSize`.
- **[Risk] A too-minimal `expo-font` mock may satisfy import resolution but not the font-loading code path used by tests** → Mitigation: mirror the specific `expo-font` API surface used by `theme-provider.tsx` and verify in `@garden/ui` Jest runs.
- **[Risk] OpenSpec proposal scope mentions i18n completeness while current fixes are mostly robustness-oriented** → Mitigation: keep artifacts explicit that this change addresses infrastructure needed for stable localized UI work, not translation content changes.

## Migration Plan

1. Update test files first so package typecheck can run without the known TS2345 and TS2769 failures.
2. Add the `expo-font` mock and wire it into `packages/ui/jest.config.cjs` so theme-provider consumers can execute in Jest.
3. Correct `packages/ui/src/theme/paper-theme.ts` and add/adjust test coverage for computed spacing behavior.
4. Run targeted package typecheck and Jest commands for `@garden/ui` and `apps-mobile` to confirm the regressions are removed.
5. If any verification step fails, roll back by reverting the local test/helper/mock changes because this work does not require schema or data migrations.

## Open Questions

- Should the repeated React Native primitive lookups in test files be centralized into one shared typed test helper, or kept inline per file for clarity?
- Which exact `expo-font` exports does `packages/ui/src/primitives/theme-provider.tsx` exercise today, and should the mock cover only those exports or the broader common surface used elsewhere in the repo?
