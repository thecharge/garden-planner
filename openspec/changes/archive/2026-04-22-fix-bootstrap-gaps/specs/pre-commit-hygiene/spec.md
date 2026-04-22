## ADDED Requirements

### Requirement: Pre-commit hook runs lint-staged and cspell

The repo SHALL ship a `.husky/pre-commit` hook that runs `pnpm exec lint-staged` followed by `pnpm exec cspell --no-must-find-files --gitignore --cache --cache-strategy content "**/*.{ts,tsx,md}"` on every `git commit`.

#### Scenario: Staged file with an ESLint violation fails the hook

- **WHEN** a developer stages a file containing a string-literal union and runs `git commit -m "test"`
- **THEN** the hook MUST fail before the commit is created
- **AND** the error MUST originate from ESLint citing `no-restricted-syntax`

#### Scenario: Staged Markdown file with a typo fails the hook

- **WHEN** a developer stages a `.md` file containing an obvious misspelling not in `cspell.json`
- **THEN** the hook MUST fail before the commit
- **AND** cspell MUST report the word with a suggestion

#### Scenario: `prepare` script installs husky automatically

- **WHEN** a fresh `pnpm install` runs against a clean clone
- **THEN** the `"prepare": "husky"` script MUST run
- **AND** the `.husky/` directory MUST be linked to `.git/hooks`

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
