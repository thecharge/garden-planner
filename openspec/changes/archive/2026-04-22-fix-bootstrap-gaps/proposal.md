## Why

User review of `bootstrap-spatial-garden-planner` (ships 144 passing tests and a working engine) surfaced a list of real gaps that block day-to-day development:

- **Convention violation** — string-literal unions (`type X = "a" | "b"`) appear throughout the codebase. The project rulebook requires named `const X = {...} as const` + matching `type X = typeof X[keyof typeof X]`. 17 non-test unions + 2 test-only unions must be converted and all consumers updated.
- **No pre-commit hygiene** — `husky` installed but never initialised; no `.husky/pre-commit`; no `cspell`; no `pnpm audit` gate; no coverage reports generated; no way to see coverage evidence.
- **No way to run the app** — `apps/mobile/package.json` keeps the 19 Expo/React Native packages in `peerDependencies` (resolved only via pnpm monorepo hoisting); font files the `app.json` references don't exist on disk; there's no emulator launch script and no `BUILDING.md` so a new contributor can't get to a running app.
- **No i18n** — `expo-localization` is declared but never wired; no `i18next`; no locale files. The app is EN-only with no pathway to BG.
- **No Claude Code integration** — no `CLAUDE.md`; `.claude/skills/` only has OpenSpec skills, no build/test/emulator task skills.
- **Missing `.gitignore` entries** — `.jdks/`, `Android/`, `*.keystore`, `.gradle/`, `expo-env.d.ts`, `coverage/`, `.env.local` all un-ignored.
- **Deferred bootstrap tasks** — 29 tasks in the original change were marked pending (Paper-wrapped primitives, Skia overlays, Reanimated worklets, capture driver, CSV export, manual device checklist, magic-numbers lint). The user wants them actually done.

The Android toolchain is now available: **JDK 21 via `/snap/android-studio/current/jbr`**, Android SDK at `$HOME/Android/Sdk` (platform-tools, platform 35, build-tools 35, emulator, system-image `android-35;google_apis;x86_64`), and `adb`, `emulator`, `sdkmanager`, `avdmanager` on disk. So "install the needed packages" is doable — this change does it and scripts the rest.

## What Changes

- **NEW** ESLint rule in the root `.eslintrc.cjs` that **bans string-literal union types** (`TSUnionType` whose every member is a string `TSLiteralType`) in all non-test code, with a message pointing at the required const-object + `typeof` pattern.
- **NEW** `packages/config/src/enums.ts` entries: `SoilTexture`, `OrientationFit`, `LimitingFactorCode` as const-object + type pairs.
- **NEW** Per-file const objects for the 14 remaining unions in `@garden/config`, `@garden/ui`, `@garden/engine`, and `apps/mobile`: `RotationReasonCode`, `CompanionAffinity`, `InventoryKind`, `NutrientUnit`, `ClimateSource`, `GrowthStage`, `SmepErrorCode`, `ThemeId`, `BodyFontFamily`, `ContrastTarget`, `MessageRole`, `LogLevel`, `FontFamily`, `CaptionsMode`. All consumers updated to use `Const.Member` never a raw literal.
- **NEW** Pre-commit hook wired: `"prepare": "husky"` in the root `package.json`; `.husky/pre-commit` running `lint-staged` + `cspell`. cspell + `@cspell/dict-typescript` added; `cspell.json` at repo root.
- **NEW** CI pipeline extended with `pnpm audit --audit-level=high`, `pnpm exec cspell`, `pnpm turbo run test -- --coverage` (report-only, no threshold), and an artifact upload for the coverage HTML.
- **NEW** `jest.preset.cjs` extended with an `html` coverage reporter so per-package `coverage/lcov-report/index.html` exists after `test:coverage`. No threshold.
- **NEW** `apps/mobile/package.json` promotes all 19 Expo/RN peer-deps to `dependencies`, **pinning exact versions** observed in the hoisted tree.
- **NEW** `apps/mobile/assets/fonts/` with `Lexend-Regular.ttf`, `Lexend-Bold.ttf`, `OpenDyslexic-Regular.ttf` downloaded at build-time from their upstream OFL-licensed sources.
- **NEW** `apps/mobile/.env.example`, `apps/mobile/expo-env.d.ts`, and a `DEVICE-TESTING.md` checklist.
- **NEW** `scripts/` directory: `setup-env.sh` (sourced to wire `JAVA_HOME` / `ANDROID_HOME`), `doctor.sh` (checks JDK / SDK / adb / emulator / expo / pnpm), `create-avd.sh` (idempotent AVD creation), `launch-emulator.sh` (boots the AVD and waits for `adb`).
- **NEW** i18n scaffold in `apps/mobile/src/core/i18n/` with `i18next` + `react-i18next` + `expo-localization`; EN locale is the source of truth; BG locale mirrors EN keys with the EN values and `// TODO(bg)` markers (so the app works under a BG locale without shipping bad translations).
- **NEW** `CLAUDE.md` at repo root documenting architecture, conventions (with a prominent "no string-literal unions" block), commands, test/coverage/build workflows for Claude Code sessions.
- **NEW** `BUILDING.md` at repo root explaining JDK/SDK install, env-var setup, emulator launch, local gradle APK build, troubleshooting.
- **NEW** `.claude/skills/` additions: `launch-emulator/`, `run-tests-with-coverage/`, `build-apk/`, `check-conventions/`.
- **NEW** `.gitignore` additions: `.jdks/`, `Android/`, `*.keystore`, `.gradle/`, `expo-env.d.ts`, `coverage/`, `.env.local`.
- **NEW** Paper-wrapped primitives in `packages/ui/src/primitives/` (`Text`, `Heading`, `Button`, `Card`, `SectorTile`, `Caption`, `AmendmentRow`, `RecommendationRow`, `theme-provider`) with WCAG-AA typography defaults and wired `accessibilityRole` / `accessibilityLabel`.
- **NEW** Real Expo capture driver at `apps/mobile/src/engine/capture-driver.ts`, Reanimated shared-value bridge at `apps/mobile/src/engine/reanimated/use-pose-shared-value.ts`, and Skia compliance overlay at `apps/mobile/src/engine/skia/compliance-overlay.tsx`.
- **NEW** Android permission rationale screen and CSV-export helper.
- **NEW** `"test:coverage"` root script and updates to `README.md` / `QUICKSTART.md` linking the new docs.

## Capabilities

### New Capabilities

- `code-conventions-strict` — bans string-literal unions; defines the required const-object + type-alias pattern; enforced by ESLint.
- `dev-environment` — JDK + Android SDK env-var contract; doctor / launch / create-avd scripts; Expo-dep contract; fonts + env-example + expo-env.d.ts.
- `pre-commit-hygiene` — husky pre-commit wired; lint-staged + cspell; `pnpm audit` in CI; coverage reports generated (no threshold).
- `i18n` — i18next init; EN + BG locale files; lint nudge toward `t(...)` in feature code.

### Modified Capabilities

- `mobile-architecture` — adds requirements that `apps/mobile/assets/fonts/` exists, `.env.example` exists, all Expo packages live in `dependencies` (not peer), and that `app/_layout.tsx` wraps the app in ThemeProvider + i18n init.

## Impact

- **Tooling surface grows**: husky + cspell + i18next + react-i18next + additional ESLint rule entries; CI gains audit + coverage + cspell steps.
- **Breaking for consumers**: every import of a string-literal union (e.g., `"POSITIVE"`) must be updated to the new const (`CompanionAffinity.Positive`). CI fails on missed sites via the new ESLint rule.
- **New runtime deps** in `apps/mobile`: concrete versions of 19 Expo/RN packages previously peer-declared; `i18next` + `react-i18next`.
- **New build artifacts**: coverage reports at `packages/*/coverage/` and `apps/*/coverage/`.
- **Docs**: `CLAUDE.md`, `BUILDING.md`, `DEVICE-TESTING.md` added; `README.md` + `QUICKSTART.md` updated.
- **Non-goals for this change**: archiving the original bootstrap change; full BG translations; iOS scaffolding; real on-device accessibility reviewer sign-offs; remote log sink.
