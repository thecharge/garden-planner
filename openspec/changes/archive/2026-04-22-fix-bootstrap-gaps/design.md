## Context

`bootstrap-spatial-garden-planner` shipped a working engine (144 tests green across six packages) but left gaps that blocked day-to-day use. User review enumerated them; this change closes them. The work is mechanical-heavy: mass code-mod of string-literal unions; toolchain wiring (husky / cspell / audit / coverage / emulator scripts / Expo dep promotion); i18n scaffolding; Claude Code docs and skills; plus the deferred real-hardware tasks from the original change (Paper-wrapped primitives, Skia overlays, Reanimated worklets, capture driver).

Pre-existing toolchain the plan can lean on:
- **JDK 21** at `/snap/android-studio/current/jbr` (JetBrains Runtime shipped with Android Studio snap).
- **Android SDK** at `$HOME/Android/Sdk` with platform-tools, platform 35, build-tools 35, emulator, `system-images;android-35;google_apis;x86_64`.
- **pnpm 10.33.0**, Node 24, Turborepo 2.9.
- 19 Expo/RN packages already hoisted in root `node_modules` (expo@55.0.16, react-native@0.85.2, react-native-paper@5.15.1, etc.).

Nothing in this change touches `bootstrap-spatial-garden-planner` — that stays as historical record of what was attempted and merged.

## Goals / Non-Goals

**Goals:**

- Every string-literal union in non-test code is replaced with a named `const X = {...} as const` + `type X = typeof X[keyof typeof X]` pair. Consumers use `X.Member`, never the raw literal. An ESLint rule prevents regressions.
- `pnpm turbo run test -- --coverage` produces per-package coverage HTML + lcov under `packages/*/coverage/` (and `apps/*/coverage/`). CI uploads the reports as an artifact.
- `.husky/pre-commit` exists and runs `lint-staged` + `cspell` on every commit.
- `pnpm audit --audit-level=high` runs in CI.
- `apps/mobile/` has all 19 Expo/RN packages as direct `dependencies` at pinned versions, plus `assets/fonts/` populated, plus `.env.example` and `expo-env.d.ts`.
- `scripts/doctor.sh`, `scripts/launch-emulator.sh`, `scripts/create-avd.sh`, `scripts/setup-env.sh` work on the user's machine.
- i18next initialised in `app/_layout.tsx`; EN + BG locale stubs present; feature copy migrated to `t(...)`.
- `CLAUDE.md`, `BUILDING.md`, `DEVICE-TESTING.md` authored; `.claude/skills/` extended with build/test/emulator/convention skills.
- Deferred bootstrap tasks closed: Paper-wrapped primitives, theme provider, capture driver, Reanimated bridge, Skia overlay, permission rationale, CSV export, magic-numbers lint.

**Non-Goals:**

- Archiving the original bootstrap change.
- Full BG translations (stubs only; translator sign-off tracked in ACCESSIBILITY.md).
- iOS scaffolding.
- Replacing `react-native-paper`.
- Remote log sink (Sentry, etc.) — the `setTransport` hook in `core/logger/` stays in place as a follow-up seat.
- Live on-device accessibility reviewer sign-offs — sign-off ledger structure exists; a real reviewer still needs to execute.

## Decisions

### D1. Union pattern: `const X = {...} as const` + derived type

**Chosen:** Every former union type becomes two exports from the same file: a const object whose keys are PascalCase member labels and whose values are SCREAMING_SNAKE or kebab-case string literals, plus a type alias derived via `typeof X[keyof typeof X]`. Member labels use descriptive names (`SameFamilyTooSoon`) not the raw string (`SAME_FAMILY_TOO_SOON`) so callsites read well.

```ts
export const RotationReasonCode = {
  SameFamilyTooSoon: "SAME_FAMILY_TOO_SOON",
  LegumeNitrogenCarryover: "LEGUME_NITROGEN_CARRYOVER",
  ...
} as const;
export type RotationReasonCode = typeof RotationReasonCode[keyof typeof RotationReasonCode];
```

Callsites: `{ code: RotationReasonCode.SameFamilyTooSoon, ... }` — never `{ code: "SAME_FAMILY_TOO_SOON", ... }`.

**Why:** User's explicit requirement. Gives `enum`-like ergonomics without TS `enum`'s reverse-map runtime and tree-shake pitfalls. Callsites are refactor-safe (IDE rename-symbol updates every use).

**Trade-off:** Slightly more verbose at the const declaration than a union literal, offset by better refactorability. No runtime cost vs `enum` (const object already present).

### D2. Shared vs per-file location

**Chosen:** Consts used across ≥2 packages live in `packages/config/src/enums.ts` (the canonical cross-package enum hub):

- `SoilTexture` — used in `protocol.ts`, `sector.ts`, `species.ts`.
- `OrientationFit` — narrow usage (species only) but groups with shared enums for discoverability.
- `LimitingFactorCode` — NutrientCode's values + `PH`; used by the nutrient advisor and soon by UI.
- `FontFamily` — used by both `@garden/ui` and `apps/mobile` settings store.

Consts used by one package stay in that package (e.g., `RotationReasonCode` in `packages/config/src/types/rotation.ts`; `LogLevel` in `apps/mobile/src/core/logger/index.ts`).

**Why:** Keeps the config package the single source of truth for cross-cutting state while not bloating it with internal-to-one-package details.

### D3. ESLint rule: AST-level ban on string-literal unions

**Chosen:** Add to the root `.eslintrc.cjs` `no-restricted-syntax` array:

```js
{
  selector: "TSUnionType:not(:has(TSTypeReference)):not(:has(TSKeywordType)):not(:has(TSArrayType))",
  message: "String-literal unions are forbidden. Use `const X = {...} as const; type X = typeof X[keyof typeof X]` and reference X.Member."
}
```

The selector matches union types whose *only* members are `TSLiteralType` (no interspersed references, keywords, or arrays). Tests are exempted via an override block in the same file.

**Why:** Catches violations at edit-time (in the IDE) and at CI lint-time. User chose this over a grep-based CI check for editor integration and precise matching.

**Trade-off:** The selector is subtle — it forbids e.g. `"asc" | "desc"` as a return type. For genuinely narrow local return types where a const would feel over-engineered (rare), an inline `// eslint-disable-next-line no-restricted-syntax` with a comment explaining is allowed.

### D4. Pre-commit: husky v9 + lint-staged + cspell

**Chosen:** `husky@9` (already a devDep) gets initialised via `pnpm exec husky init`, producing `.husky/_/pre-commit` and `.husky/pre-commit`. The user-edited `.husky/pre-commit` contents:

```sh
pnpm exec lint-staged
pnpm exec cspell --no-must-find-files --gitignore --cache --cache-strategy content "**/*.{ts,tsx,md}"
```

`lint-staged` extended to run ESLint (`--fix --max-warnings=0`), Prettier (`--write`), and cspell per staged file. `cspell.json` at repo root with a project dictionary (chepinci, sofia basin slang, botanical families, agronomy terms, project-specific identifiers).

**Why:** Husky v9 is the lightest install; cspell is the cleanest choice for a prose-heavy repo (README, QUICKSTART, CLAUDE.md, source-citation fields). `--gitignore` respects existing ignore rules; `--no-must-find-files` avoids failures when lint-staged passes zero files; the cache keeps the hook fast.

### D5. Coverage: generate, don't fail

**Chosen:** Per user instruction — no `coverageThreshold`. `jest.preset.cjs` gains an `html` reporter in `coverageReporters`. Root `package.json` gains `"test:coverage": "turbo run test -- --coverage"`. CI runs this and uploads `packages/*/coverage/` and `apps/*/coverage/` as an artifact. A new badge is not added (no threshold means no meaningful badge).

**Why:** The user chose report-only; this avoids forcing premature test-writing while making coverage discoverable.

### D6. `pnpm audit` in CI, warn-mode first

**Chosen:** CI runs `pnpm audit --audit-level=high || true` as a non-blocking step (failures are logged but don't fail the build). A follow-up change can flip it to blocking once the baseline is clean.

**Why:** Starts visibility without breaking builds on inherited transitive issues. Upgrading to a hard gate after triage is a one-line change.

### D7. Expo peer-dep → dep promotion with exact pins

**Chosen:** Every peer-dep in `apps/mobile/package.json` moves to `dependencies` with the exact version already installed in the root `node_modules` (per the audit). `pnpm install` will resolve from the hoisted tree, so no additional downloads.

**Why:** pnpm monorepo hoisting made the app appear to work while being non-portable. Pinning exact versions (user decision) protects against inadvertent major-version bumps on next install.

### D8. Font assets sourced from upstream OFL

**Chosen:** `apps/mobile/assets/fonts/` populated at setup time:

- `Lexend-Regular.ttf` / `Lexend-Bold.ttf` — `https://raw.githubusercontent.com/googlefonts/lexend/main/fonts/ttf/...`
- `OpenDyslexic-Regular.ttf` — `https://github.com/antijingoist/opendyslexic/raw/master/compiled/...`

`scripts/fetch-fonts.sh` downloads them into the assets folder. Fonts are committed to the repo (small binaries) so contributors don't each re-download.

**Why:** `app.json` references these files; without them `expo start` fails at font-load time. OFL-licensed fonts are safe to vendor in the repo.

### D9. i18n scaffold: i18next + expo-localization + EN/BG

**Chosen:** `i18next` + `react-i18next` installed in `apps/mobile`. `src/core/i18n/index.ts` initialises i18next with the device locale (via `expo-localization`), falls back to EN. Locale files are TypeScript so keys get type-checked: `locales/en.ts` is the source of truth; `locales/bg.ts` mirrors the same keys with the English values and `// TODO(bg): native translation needed` markers.

**Why:** Standard React Native i18n stack. TypeScript locale files let the compiler catch missing keys across locales. The BG-mirror-EN approach (user choice) guarantees the app works under a BG locale without shipping machine-translated strings.

### D10. Skills + CLAUDE.md + BUILDING.md

**Chosen:**

- **CLAUDE.md** at repo root — a short onboarding doc for Claude Code sessions. Lists the project's non-negotiable rules (no string-literal unions, errors from factory, enums from config, no Redux, plain-language copy), the package layout, common commands, test-coverage invocation, and which skills exist.
- **BUILDING.md** at repo root — step-by-step JDK + Android SDK install (matching the steps that just worked on this machine), env-var export, emulator creation + launch, local gradle APK build via `expo prebuild`, troubleshooting.
- **DEVICE-TESTING.md** in `apps/mobile/` — manual-QA checklist replacing the "on a real device" items that can't run in CI.
- **`.claude/skills/` extensions**:
  - `launch-emulator/` — source setup-env, run launch-emulator script.
  - `run-tests-with-coverage/` — run coverage, open HTML report path.
  - `build-apk/` — prebuild + gradle local build.
  - `check-conventions/` — union grep + cspell + lint + citations + contrast in one go, before a PR.

**Why:** Closes the user's "I see no CLAUDE.md, skills, tools" gap. Skills are small directories with a `SKILL.md` describing the task so Claude Code auto-discovers them.

### D11. Deferred bootstrap tasks — now

All the deferred items get done in this change:

- **Paper-wrapped primitives** in `packages/ui/src/primitives/`: `Text`, `Heading`, `Button`, `Card`, `SectorTile`, `Caption`, `AmendmentRow`, `RecommendationRow`. Each wraps Paper with our a11y defaults. They import Paper directly (allowed inside `@garden/ui`), everywhere else imports only `@garden/ui`.
- **ThemeProvider** wrapping `PaperProvider` with our mapped MD3 tokens; exposes a live-switching hook.
- **Real capture driver** (`apps/mobile/src/engine/capture-driver.ts`) using `expo-camera` + `expo-sensors` (DeviceMotion) + `expo-location`, producing a `Protocol` via `@garden/core`.
- **Reanimated bridge** (`use-pose-shared-value`) wiring the transient Zustand store into a Reanimated shared value.
- **Skia compliance overlay** (`apps/mobile/src/engine/skia/compliance-overlay.tsx`).
- **Permission rationale** screen at `apps/mobile/src/features/capture/components/permission-rationale.tsx`.
- **CSV export** using `expo-sharing` + `expo-file-system`.
- **Magic-numbers lint** via the built-in `no-magic-numbers` rule, ignored in tests and allowing `-1, 0, 1, 2`.

### D12. Snapshot / RN-runtime tests scope

**Chosen:** Snapshot tests for key RN components require jest-expo runner which pulls in the full RN test infra. For this change, snapshot coverage is limited to theme-token shape (already passes in Node) and a minimal `announce()` mock test. Full component snapshots are scoped to a follow-up change once the jest-expo runner is configured.

**Why:** Keeps this change mechanical-focused; avoids dragging the whole RN test runtime into a change that's already touching every package.

## Risks / Trade-offs

- **[Mechanical-edit breakage]** Converting 17 unions touches many consumer files; typos are easy. Mitigation: run `pnpm turbo run typecheck test` after each package's conversion; commit in logical chunks; every test file asserts the new const value matches the expected string.
- **[Font vendor size]** Committing three TTFs adds ~500 KB to the repo. Acceptable; fonts are stable.
- **[cspell false positives]** Botanical / agronomy / Bulgarian / project-specific identifiers will trigger cspell on first run. Mitigation: prime `cspell.json` with an exhaustive project dictionary before enabling the CI gate; a first-pass `cspell --words-only --unique` run produces the initial list.
- **[Emulator in CI]** GitHub Actions free tier doesn't give a reliable Android emulator. Mitigation: `scripts/launch-emulator.sh` and the APK build step are for the user's local machine, not CI. CI stays at typecheck/lint/test/audit/coverage.
- **[Expo version drift]** Pinning exact Expo SDK 55 versions blocks auto-upgrades. Mitigation: a clearly-named follow-up change (`bump-expo-sdk-56`) when ready.
- **[Reanimated babel plugin ordering]** The Reanimated plugin must be the last Babel plugin. Current `apps/mobile/babel.config.js` already orders it last — preserve during any edits.

## Migration Plan

Applied step-by-step in the order in `tasks.md`. Rollback: `git reset --hard <commit-before-this-change>`. No database migrations — this change is code + tooling only.

## Open Questions

- Do we add a pre-commit hook to also run `pnpm turbo run typecheck` on staged files? Current lint-staged is faster (per-file) but misses type errors introduced in unstaged files that depend on staged files. Leaning no — let CI catch it.
- Should the union-ban ESLint rule warn or error in tests? Leaning warn (tests are often pragmatic).
- Which minimum Android API for the AVD script? Android 35 matches `targetSdkVersion`; an older API (e.g., 29) would catch compatibility bugs but adds emulator download. Going with 35 for now; a follow-up can add a matrix.
