# CLAUDE.md

Guidance for Claude Code (and any other AI assistant) working in this repo. Treat this file as non-negotiable context.

## What this repo is

A local-first, voice-led, accessibility-first spatial garden planner for small home growers and farmers in Chepinci (Sofia basin, Bulgaria). Built as an Expo Android app over a pure-TypeScript engine in a pnpm + Turborepo monorepo.

See `README.md` for the feature-level overview, `BUILDING.md` for setup, `ACCESSIBILITY.md` for the a11y release gate.

## Hard rules — failing any one of these fails CI

These are not suggestions. Lint, typecheck, cspell, and the custom `no-restricted-syntax` rule all enforce them. Do not bypass with `eslint-disable` or `// @ts-ignore` unless you have a load-bearing reason and document it inline.

### Code conventions

- **Imports by package name only.** `@garden/config`, never `../../packages/config/src/index`.
- **≤300 lines per file.** Split when approaching the limit.
- **Max 2 nesting levels.** Extract helpers or use early return.
- **No `else if`.** Use early return / continue.
- **No `switch`/`case`.** Use early returns with `if`.
- **No `function` declarations.** Const arrow only: `export const fn = async () => {};`.
- **No `.js` extensions in imports.** `from "./parser"` not `from "./parser.js"`.
- **No `new Error(...)` outside `@garden/config`.** Throw via `SmepErrors.xxx()`.
- **Enums from `@garden/config`.** `TaskStatus.Verified`, never the raw string `"VERIFIED"`.
- **All shared types in `@garden/config`.** One source of truth.
- **No Redux, no Redux Toolkit, no Redux Saga.** TanStack Query + Zustand only.
- **Accessibility primitives via `@garden/ui`.** Never import `react-native-paper` directly from `apps/mobile`.
- **Descriptive variable names.** `memoryRepository` not `mem`.

### String-literal unions are forbidden

Not a style preference — a **hard rule**. `type X = "A" | "B";` fails lint immediately.

Required pattern (PascalCase keys, SCREAMING_SNAKE_CASE values for codes / kebab-case for settings ids):

```ts
export const RotationReasonCode = {
  SameFamilyTooSoon: "SAME_FAMILY_TOO_SOON",
  LegumeNitrogenCarryover: "LEGUME_NITROGEN_CARRYOVER"
} as const;
export type RotationReasonCode = (typeof RotationReasonCode)[keyof typeof RotationReasonCode];

// Call sites:
reason.code === RotationReasonCode.SameFamilyTooSoon; // ✓
reason.code === "SAME_FAMILY_TOO_SOON"; // ✗ — raw literal comparison flagged
```

Shared domain enums live in `packages/config/src/enums.ts`. Single-package enums stay next to their consumer (e.g., `LogLevel` in `apps/mobile/src/core/log-level.ts`).

Tests may use narrow local unions for tuple types (lint exempts them) — but prefer `const + type` even in tests when practical.

### Accessibility is a release gate

- Neutral pastel palette (light + dark) with AAA high-contrast toggle; contrast audited in CI.
- Lexend default, OpenDyslexic opt-in; body text ≥18 sp, line height ≥1.55.
- Cross-modal redundancy: every verdict fires TTS + caption + haptic via `announce()` in `@garden/ui`.
- Plain-language copy: short sentences, active voice, no unexplained jargon.
- Never convey state by color alone.

See `ACCESSIBILITY.md` for the reviewer sign-off ledger (release is blocked until filled).

## Architecture (pnpm workspaces + Turborepo)

```
packages/
  config/    @garden/config   enums + constants + SmepErrors + shared types
  core/      @garden/core     Protocol, summary, events, FAO-56 ET₀, pH curves
  memory/    @garden/memory   SqliteLike + MemoryRepository (better-sqlite3 in Node; expo-sqlite on device)
  engine/    @garden/engine   compliance, species matcher, rotation advisor,
                              nutrient/irrigation advisor, reasoning (Anthropic)
  ui/        @garden/ui       theme tokens, Paper-theme mapper, announce(), contrast auditor

apps/
  mobile/    Expo Android app (Feature-Sliced Design)
    app/          Expo Router glue (≤30 lines/file; no business logic)
    src/core/     config, log-level, logger, query client, i18n, theme bridge
    src/engine/   spatial store (Zustand transient), pose throttle, capture driver, Reanimated, Skia
    src/features/ capture, sectors, yield, rotation, nutrient, inventory, voice, a11y, overlay, settings

scripts/       setup-env / doctor / create-avd / launch-emulator
openspec/      spec-driven design trail — every change lives in openspec/changes/
```

## Commands

### One-time setup

```bash
. ./scripts/setup-env.sh       # exports JAVA_HOME + ANDROID_HOME + PATH
./scripts/doctor.sh            # verify toolchain is OK
pnpm install
```

### Day-to-day

```bash
pnpm turbo run typecheck lint test      # full gate
pnpm test:coverage                      # per-package coverage reports
pnpm spell                              # cspell over .ts/.tsx/.md
pnpm audit:deps                         # pnpm audit, high+ (non-blocking)
pnpm audit:citations                    # fail if any @garden/engine data entry lacks sourceCitation
pnpm audit:contrast                     # fail if any @garden/ui theme pair drops below WCAG AA / AAA
pnpm check:all                          # the lot (the same CI gate)

./scripts/launch-emulator.sh            # boot the default AVD
pnpm --filter apps-mobile run start     # Metro bundler
pnpm --filter apps-mobile run android   # build + install the APK on the running emulator
```

### OpenSpec

```bash
openspec list                                   # all changes
openspec status --change fix-bootstrap-gaps     # progress of a given change
openspec validate fix-bootstrap-gaps            # schema check
```

## Where to put new code

- **Domain primitive** (new enum, error, type) → `packages/config/src/{enums,errors,types/}`.
- **Pure domain logic** (rules, matchers, aggregators) → `packages/engine/src/`.
- **New `MemoryRepository` method** → `packages/memory/src/` + a migration under `migrations/` if schema changes.
- **New accessible UI primitive** → `packages/ui/src/primitives/` (wrap Paper; re-export from `src/index.ts`).
- **New mobile feature** → `apps/mobile/src/features/<feature>/` with `components/`, `hooks/`, `store/`, `types/`, and an `index.ts` public surface. **Cross-feature imports only through `index.ts`.**
- **New runtime constant** → `apps/mobile/src/core/config.ts`. Magic numbers / strings in feature code fail lint.

## Testing philosophy

Every pure-engine module ships with a Jest `it.each` table covering:

- **Happy** — the common, well-formed input.
- **Side** — an alternate real-world shape that still resolves.
- **Critical** — a constraint-breaching input that must be rejected via `SmepError`.
- **Chaos** — malformed input that must throw a typed error (never `new Error`).

Run with `pnpm --filter <pkg> run test` or `pnpm test:coverage` for per-package HTML reports under `coverage/lcov-report/index.html`.

## Skills available to Claude Code

Under `.claude/skills/`:

- `launch-emulator/` — source setup-env, boot AVD, verify adb.
- `run-tests-with-coverage/` — run coverage, open the HTML report path.
- `build-apk/` — local prebuild + gradle APK build.
- `check-conventions/` — single pre-PR gate (unions, lint, cspell, citations, contrast).

Plus OpenSpec workflow skills (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`).

## Open questions (tracked in OpenSpec changes, not here)

- Offline STT library choice (Vosk?).
- Chepinci cadastral polygon source.
- Agronomist reviewer for `packages/engine/src/data/species.ts` + `nutrient/species-demand.ts`.
- Native BG translator reviewer (see `ACCESSIBILITY.md`).

## Never do

- Bypass the union-ban lint with `eslint-disable`. Convert the union to a const-object pair.
- Import `react-native-paper` from `apps/mobile`. Add a primitive to `@garden/ui` and import from there.
- Introduce a magic number or user-facing string literal in feature code. Put it in `core/config.ts` or `locales/en.ts`.
- Merge a PR that drops a theme token's contrast below its threshold.
- Commit a font file without listing its OFL source in `apps/mobile/assets/fonts/LICENSES.md`.
