# pre-commit-hygiene Specification

## Purpose
TBD - created by archiving change fix-bootstrap-gaps. Update Purpose after archive.
## Requirements
### Requirement: Pre-commit hook runs lint-staged and cspell

The repo SHALL ship a `.husky/pre-commit` hook that runs `pnpm exec lint-staged` on every `git commit`. The lint-staged pipelines MUST NOT rely on shell env-var prefix syntax (`VAR=value cmd`) because lint-staged 15+ does not spawn a shell. ENV variables for invoked binaries MUST go through `cross-env` or a dedicated wrapper.

#### Scenario: Staged `.ts` file flows through ESLint via cross-env
- **WHEN** `git commit` runs with at least one staged `.ts` file
- **THEN** the pipeline MUST invoke `cross-env ESLINT_USE_FLAT_CONFIG=false eslint --fix <file>`
- **AND** the invocation MUST succeed (no ENOENT from the env-var prefix being treated as an executable)

#### Scenario: Initial large commit does not exhaust prettier
- **WHEN** the repo's first commit stages hundreds of files and lint-staged invokes prettier on the `.{json,md,yml,yaml}` subset
- **THEN** prettier MUST complete within the default worker limits
- **AND** the `.prettierignore` MUST exclude generated/binary paths (`coverage/`, `*.lcov`, `lcov.info`, `*.ttf`, `*.otf`, `*.apk`, `*.aab`, `.cspell-cache`, `android/`, `ios/`, `**/.turbo/**`, `**/dist/**`)

#### Scenario: Staged ESLint permits warnings; CI does not
- **WHEN** staged files contain ESLint warnings (not errors)
- **THEN** the commit MUST still succeed
- **AND** the full-tree `pnpm turbo run lint` invocation in CI MUST still enforce `--max-warnings=0` or equivalent at the package-script level

### Requirement: cspell config carries the project dictionary

`cspell.json` at repo root SHALL declare: language = `en`, ignore paths covering `node_modules`, `dist`, `coverage`, `.turbo`, `.expo`, pnpm-lock, and a `words` list including (non-exhaustive): `chepinci`, `sofia`, botanical family names (`solanaceae`, `brassicaceae`, `fabaceae`, `cucurbitaceae`, `apiaceae`, `poaceae`, `alliaceae`, `asteraceae`, `rosaceae`), `lexend`, `opendyslexic`, `anthropic`, `tsconfig`, `eslint`, `zustand`, `turbo`, `pnpm`, `sqlite`, `reanimated`, `skia`, `kanimated`, `pasthol`, `dyslectic`, `tanstack`.

#### Scenario: Running cspell across the repo reports zero unknown words
- **WHEN** `pnpm exec cspell --no-must-find-files --gitignore "**/*.{ts,tsx,md}"` runs against the committed tree
- **THEN** the exit code MUST be 0

### Requirement: `pnpm audit` runs in CI

The GitHub Actions workflow SHALL include a step that runs `pnpm audit --audit-level=high`. The step SHALL be non-blocking for this change (log-only) but SHALL record the result as a CI annotation.

#### Scenario: CI logs audit output
- **WHEN** the CI workflow completes
- **THEN** the audit output MUST be visible in the job log
- **AND** the job MUST NOT fail on the basis of the audit alone in this change (a follow-up change may flip it to blocking)

### Requirement: Coverage reports are generated and uploaded

`pnpm turbo run test -- --coverage` SHALL produce per-package `coverage/lcov.info` and `coverage/lcov-report/index.html` under each `packages/*` and `apps/*` workspace. CI SHALL run this command and upload `**/coverage/` as a workflow artifact.

#### Scenario: Coverage artifact is present after a CI run
- **WHEN** a CI run completes successfully
- **THEN** a `coverage-report` artifact MUST be downloadable
- **AND** the artifact MUST contain at least one package's `lcov-report/index.html`

#### Scenario: No coverage threshold blocks the build
- **WHEN** any package's coverage drops
- **THEN** CI MUST NOT fail on coverage alone in this change
- **AND** the reports remain the mechanism by which the user evaluates coverage evolution

