# code-conventions-strict Specification

## Purpose
TBD - created by archiving change fix-bootstrap-gaps. Update Purpose after archive.
## Requirements
### Requirement: No string-literal union types in non-test code

The system SHALL forbid TypeScript union types whose members are all string literals anywhere in non-test `.ts` or `.tsx` source. Any such value domain MUST be expressed as `const X = {...} as const; type X = typeof X[keyof typeof X]`. Callsites MUST reference `X.Member`, never the raw string.

#### Scenario: Adding a string-literal union fails lint
- **WHEN** a developer writes `type Direction = "up" | "down";` in a non-test source file
- **THEN** `pnpm turbo run lint` MUST fail with the `no-restricted-syntax` rule citing the union-ban selector
- **AND** the error message MUST reference the required `const X = {...} as const` pattern

#### Scenario: Accepted const + type pair passes lint
- **WHEN** the same domain is expressed as
  ```ts
  export const Direction = { Up: "UP", Down: "DOWN" } as const;
  export type Direction = typeof Direction[keyof typeof Direction];
  ```
- **THEN** lint MUST pass
- **AND** consumers MUST reference `Direction.Up` not `"UP"`

#### Scenario: Test files are exempted but encouraged
- **WHEN** a `*.test.ts` file declares a narrow local union (e.g., `readonly [label: string, mode: "a" | "b"]`)
- **THEN** lint MUST allow it (via the ESLint override for tests)
- **AND** the reviewer checklist MUST flag it as a nice-to-fix

### Requirement: Shared domain enums live in `@garden/config`

Domain enums used by two or more packages SHALL live in `packages/config/src/enums.ts` and be re-exported from `@garden/config`. Single-package enums live alongside their consumer.

#### Scenario: SoilTexture used across config / engine / memory
- **WHEN** `SoilTexture` is referenced from any package
- **THEN** the import source MUST be `@garden/config`
- **AND** no other package MAY redefine it

### Requirement: Every const-object entry uses SCREAMING_SNAKE_CASE values for machine-readable codes; kebab-case or CamelCase where already established

The system SHALL use `SCREAMING_SNAKE_CASE` string values for codes stored in persisted artifacts (error codes, rotation reason codes, limiting-factor codes) and MAY use kebab-case or the domain-conventional casing for IDs that surface in URLs/filenames (theme IDs, climate sources). Member key names SHALL use PascalCase descriptive labels.

#### Scenario: Rotation reason code value is SCREAMING_SNAKE
- **WHEN** a `RotationReasonCode` entry is added
- **THEN** its value MUST match `^[A-Z]+(_[A-Z]+)*$`
- **AND** its key MUST be a PascalCase descriptive label

#### Scenario: ThemeId keeps kebab-case
- **WHEN** `ThemeId.LightPastel` is used
- **THEN** its value MUST remain `"light-pastel"` so persisted settings continue to resolve

### Requirement: Consumers read `Const.Member`, not raw literals

Non-test code MUST NOT compare against or produce raw string literals that match an existing const-object value. An ESLint rule warns on direct comparison with a string literal that also appears in a declared `as const` object (best-effort detection; grep-based CI check is the backstop).

#### Scenario: Direct literal comparison warns
- **WHEN** `if (event.kind === "SOWED")` is written in feature code
- **THEN** lint MUST warn pointing to `EventKind.Sowed`

### Requirement: Zero residual string-literal unions in non-test code at PR merge time

CI SHALL include a grep backstop that counts non-test `TSUnionType`-of-string-literals matches and fails on any non-zero count. This is redundant with the ESLint rule but catches rule bypasses.

#### Scenario: Backstop grep finds zero matches in non-test code
- **WHEN** the CI union-grep step runs
- **THEN** the match count in non-test `.ts` / `.tsx` MUST be zero

