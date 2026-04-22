## 1. Convention — convert string-literal unions

- [x] 1.1 Add `SoilTexture`, `OrientationFit`, `LimitingFactorCode`, `FontFamily` to `packages/config/src/enums.ts`.
- [x] 1.2 Convert `RotationReasonCode`, `CompanionAffinity` in `packages/config/src/types/rotation.ts`.
- [x] 1.3 Convert `InventoryKind` in `packages/config/src/types/inventory.ts`.
- [x] 1.4 Convert `NutrientUnit`, `ClimateSource`, `GrowthStage` in `packages/config/src/types/nutrient.ts`.
- [x] 1.5 Replace `SoilTexture` unions in `protocol.ts`, `sector.ts`, `species.ts` with imports from `@garden/config`.
- [x] 1.6 Replace `OrientationFit` union in `species.ts` with import.
- [x] 1.7 Convert `SmepErrorCode` in `packages/config/src/errors.ts`.
- [x] 1.8 Convert `ThemeId`, `BodyFontFamily` in `packages/ui/src/theme/tokens.ts`.
- [x] 1.9 Convert `ContrastTarget` in `packages/ui/src/theme/contrast.ts`.
- [x] 1.10 Convert `MessageRole` in `packages/engine/src/reasoning/anthropic-provider.ts`.
- [x] 1.11 Replace `NutrientCodeT | "PH"` with `LimitingFactorCode` in `packages/engine/src/nutrient/liebig.ts`.
- [x] 1.12 Convert `LogLevel` in `apps/mobile/src/core/logger/index.ts`.
- [x] 1.13 Remove inline `as "..." | "..."` casts in `apps/mobile/src/core/config.ts`; import named consts.
- [x] 1.14 Add `CaptionsMode` const to `apps/mobile/src/features/settings/store/settings-store.ts`; import `ThemeId` and `FontFamily`.
- [x] 1.15 Update every consumer of the converted unions to use `Const.Member` — `rotation-rules.ts`, `companions.ts`, `advisor.ts`, `species-demand.ts`, `kc-tables.ts`, `climate-fallback.ts`, `species.ts`, `species-matching.ts`, all test files, etc.
- [x] 1.16 Update `packages/config/src/index.ts` to re-export every new const + type.

## 2. ESLint — ban string-literal unions

- [x] 2.1 Add `TSUnionType:not(:has(TSTypeReference)):not(:has(TSKeywordType)):not(:has(TSArrayType))` selector entry to root `.eslintrc.cjs` under `no-restricted-syntax`, with a message pointing at the required pattern.
- [x] 2.2 Exempt test files in the existing tests-override block.
- [x] 2.3 Add a CI backstop grep step: `grep -rn -E '= "[^"]+" \\| "' packages apps --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v node_modules` — fails on any hit.
- [x] 2.4 Add the `no-magic-numbers` rule in feature code (exempt tests + root-level).
- [x] 2.5 Add a JSX-text-literal warn rule for `apps/mobile/src/features/**` to nudge toward `t(...)`.

## 3. Pre-commit hygiene

- [x] 3.1 Add `"prepare": "husky"` to root `package.json`.
- [x] 3.2 Run `pnpm exec husky init` (one-time; creates `.husky/pre-commit` and `.husky/_/`).
- [x] 3.3 Write `.husky/pre-commit` running `pnpm exec lint-staged` then `pnpm exec cspell ...`.
- [x] 3.4 Install `cspell` + `@cspell/dict-typescript` as devDeps.
- [x] 3.5 Create `cspell.json` with dictionary, ignored paths, project words.
- [x] 3.6 Extend root `package.json` `lint-staged` with cspell per staged file; add `--max-warnings=0` to ESLint.
- [x] 3.7 Add `"test:coverage": "turbo run test -- --coverage"` to root scripts.
- [x] 3.8 Extend `jest.preset.cjs` `coverageReporters` with `html`.
- [x] 3.9 Extend `.github/workflows/ci.yml` with: `pnpm audit --audit-level=high || true`, `pnpm exec cspell ...`, `pnpm turbo run test -- --coverage`, upload coverage + citations as artifacts.

## 4. Dev environment

- [x] 4.1 Promote 19 Expo/RN peer-deps in `apps/mobile/package.json` to `dependencies` at exact pinned versions.
- [x] 4.2 Install `i18next` + `react-i18next` in `apps/mobile`.
- [x] 4.3 Create `apps/mobile/assets/fonts/` and download Lexend-Regular, Lexend-Bold, OpenDyslexic-Regular TTFs (OFL).
- [x] 4.4 Create `apps/mobile/assets/fonts/LICENSES.md` listing each font + its OFL URL.
- [x] 4.5 Create `apps/mobile/.env.example` (reserved; no required vars in MVP).
- [x] 4.6 Create `apps/mobile/expo-env.d.ts` with `/// <reference types="expo-router/types" />`.
- [x] 4.7 Create `scripts/setup-env.sh` exporting JAVA_HOME, ANDROID_HOME, ANDROID_SDK_ROOT, PATH (chmod +x).
- [x] 4.8 Create `scripts/doctor.sh` (chmod +x).
- [x] 4.9 Create `scripts/create-avd.sh` (chmod +x).
- [x] 4.10 Create `scripts/launch-emulator.sh` (chmod +x).
- [x] 4.11 Extend `.gitignore`: `.jdks/`, `Android/`, `*.keystore`, `.gradle/`, `expo-env.d.ts`, `coverage/`, `.env.local`.

## 5. i18n

- [x] 5.1 Create `apps/mobile/src/core/i18n/index.ts` wiring i18next + expo-localization.
- [x] 5.2 Create `apps/mobile/src/core/i18n/locales/en.ts` with all user-facing strings (capture / sectors / yield / rotation / nutrient / inventory / settings / a11y prompts).
- [x] 5.3 Create `apps/mobile/src/core/i18n/locales/bg.ts` mirroring every EN key with EN values and `// TODO(bg): native translation needed` markers.
- [x] 5.4 Wire i18n into `app/_layout.tsx` as a side-effect import.
- [x] 5.5 Migrate the 7 feature screen components to use `useTranslation()` + `t(...)`.
- [x] 5.6 Add BG translator-sign-off row to `ACCESSIBILITY.md`.

## 6. Paper-wrapped UI primitives + theme provider

- [x] 6.1 Create `packages/ui/src/primitives/Text.tsx` wrapping Paper `Text` with ≥18sp / 1.55 line-height / Lexend default / `accessibilityRole` plumbing.
- [x] 6.2 Create `Heading.tsx`, `Button.tsx`, `Card.tsx`, `Caption.tsx`, `SectorTile.tsx`, `AmendmentRow.tsx`, `RecommendationRow.tsx` similarly.
- [x] 6.3 Create `packages/ui/src/primitives/theme-provider.tsx` wrapping `PaperProvider` with our mapped MD3 theme; expose `useGardenTheme()` hook.
- [x] 6.4 Re-export primitives from `packages/ui/src/index.ts`.
- [x] 6.5 Add a jest-expo snapshot test for the theme-provider light/dark/high-contrast theme payloads (tokens only — no RN runtime).

## 7. apps/mobile engine — capture driver, Reanimated, Skia

- [x] 7.1 Create `apps/mobile/src/engine/capture-driver.ts` using `expo-camera` + `expo-sensors` DeviceMotion + `expo-location` to produce a `Protocol` via `@garden/core`.
- [x] 7.2 Create `apps/mobile/src/engine/reanimated/use-pose-shared-value.ts` bridging the transient Zustand store to a Reanimated shared value.
- [x] 7.3 Create `apps/mobile/src/engine/skia/compliance-overlay.tsx` rendering the green/red overlay paint from the last verdict via Skia.
- [x] 7.4 Wire `CaptureScreen` to use the capture driver, the shared-value pose, and the Skia overlay.

## 8. Permissions + CSV export

- [x] 8.1 Create `apps/mobile/src/features/capture/components/permission-rationale.tsx` (plain-language request screen for camera / mic / location).
- [x] 8.2 Gate the capture screen on permissions granted; show the rationale if any is missing.
- [x] 8.3 Create `apps/mobile/src/features/yield/components/export-csv-button.tsx` using `expo-sharing` + `expo-file-system` to emit a `sectors.csv`.
- [x] 8.4 Wire the export button into the Yield screen.

## 9. Docs + Claude Code integration

- [x] 9.1 Write `CLAUDE.md` at repo root (conventions, commands, package layout, skills index).
- [x] 9.2 Write `BUILDING.md` at repo root (JDK + Android SDK install steps, env vars, emulator, local gradle APK build, troubleshooting).
- [x] 9.3 Write `apps/mobile/DEVICE-TESTING.md` (manual QA checklist).
- [x] 9.4 Create `.claude/skills/launch-emulator/SKILL.md`.
- [x] 9.5 Create `.claude/skills/run-tests-with-coverage/SKILL.md`.
- [x] 9.6 Create `.claude/skills/build-apk/SKILL.md`.
- [x] 9.7 Create `.claude/skills/check-conventions/SKILL.md`.
- [x] 9.8 Update `README.md` and `QUICKSTART.md` to link the new docs + mention `scripts/doctor.sh`.

## 10. Verification

- [x] 10.1 `. ./scripts/setup-env.sh && ./scripts/doctor.sh` exits 0.
- [x] 10.2 `pnpm install` succeeds.
- [x] 10.3 `pnpm turbo run typecheck lint test` passes.
- [x] 10.4 `pnpm test:coverage` produces coverage reports in every package.
- [x] 10.5 `pnpm exec cspell --no-must-find-files --gitignore "**/*.{ts,tsx,md}"` reports zero unknown words.
- [x] 10.6 `pnpm audit --audit-level=high` captured in CI log (non-blocking).
- [x] 10.7 `pnpm --filter @garden/engine run audit:citations` clean.
- [x] 10.8 `pnpm --filter @garden/ui run audit:contrast` clean.
- [x] 10.9 Grep backstop: zero non-test string-literal union matches.
- [x] 10.10 `openspec validate fix-bootstrap-gaps` valid.
- [x] 10.11 Husky hook runs on `git commit --allow-empty -m "smoke"`.
- [x] 10.12 `scripts/launch-emulator.sh` creates the AVD (user verifies boot on a desktop).
