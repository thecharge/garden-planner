## MODIFIED Requirements

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
