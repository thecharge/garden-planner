# reasoning-provider Specification

## Purpose
TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.
## Requirements
### Requirement: Extensible `ReasoningProvider` interface with a single Anthropic implementation

The system SHALL define one `ReasoningProvider` interface in `@garden/engine` and SHALL ship **exactly one** implementation in this change: `anthropicProvider`. Features that need reasoning MUST depend on the interface, not the concrete provider, so future implementations can be added without touching consumers.

#### Scenario: Feature consumes the interface, not the provider
- **WHEN** a feature calls into reasoning
- **THEN** it MUST accept a `ReasoningProvider` via dependency injection
- **AND** MUST NOT import `anthropicProvider` directly

#### Scenario: Only Anthropic ships in this change
- **WHEN** the app's provider list is inspected
- **THEN** exactly one provider with `id="anthropic"` MUST be registered
- **AND** the interface MUST remain open for follow-up implementations (no Anthropic-specific types leak into the interface)

### Requirement: BYOK key stored in device secure storage

The Anthropic API key MUST be stored exclusively in `expo-secure-store` (backed by Android Keystore when available). The key MUST NOT be written to SQLite, AsyncStorage, JS bundle constants, or logs.

#### Scenario: Key write goes to secure-store only
- **WHEN** the user saves their Anthropic API key in settings
- **THEN** the persisted location MUST be `expo-secure-store`
- **AND** the SQLite database MUST NOT contain the key value

#### Scenario: Logs never contain the key
- **WHEN** a reasoning request fails and the error is logged
- **THEN** the log line MUST NOT contain the API key value
- **AND** the provider id (`"anthropic"`) MUST be visible in logs for debugging

### Requirement: No default or bundled key

The system SHALL ship with no API key. Until the user configures one, reasoning-dependent features MUST degrade gracefully rather than call an external service.

#### Scenario: No key configured
- **WHEN** a reasoning-dependent feature is invoked with no active key
- **THEN** the call MUST throw `SmepErrors.providerNotConfigured()`
- **AND** callers MUST translate this into `summary.actionRequired("Add your Anthropic API key in settings to continue.")`

### Requirement: Provider identity is visible to the user

The system SHALL display the active provider (`"anthropic"`) and a key-configured indicator in the settings screen, and MUST attach `providerId` to every reasoning result. The user MUST at all times be able to confirm *which* key is in use.

#### Scenario: Active provider label visible
- **WHEN** the settings screen is open
- **THEN** the provider id `"anthropic"` MUST be rendered alongside a "key configured" or "key missing" status
- **AND** the provider MUST meet the accessibility spec (captioned, screen-reader-labelled, AA contrast)

#### Scenario: Reasoning responses carry provider id
- **WHEN** a reasoning call returns a result
- **THEN** the `ReasoningResult` MUST include `providerId: "anthropic"`

### Requirement: Anthropic implementation uses the official SDK and latest model

The `anthropicProvider` MUST use `@anthropic-ai/sdk` and MUST default to the latest stable Claude model family. The model id MUST be a single constant in `@garden/config` so upgrades are a one-line change reviewable in isolation.

#### Scenario: Default model id is centralised
- **WHEN** a developer changes the default Claude model
- **THEN** the edit MUST be a single-line change to a constant in `@garden/config`
- **AND** `anthropicProvider` MUST read that constant, not hard-code a model string

#### Scenario: SDK errors map to factory errors
- **WHEN** the Anthropic SDK throws (auth, rate limit, network)
- **THEN** the provider MUST translate the error into `SmepErrors.providerNotConfigured()` (for auth) or return `summary.actionRequired(...)` (for rate limit / transient network)
- **AND** MUST NOT throw a raw SDK error object to consumers

