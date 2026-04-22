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

The system SHALL display the active provider (`"anthropic"`) and a key-configured indicator in the settings screen, and MUST attach `providerId` to every reasoning result. The user MUST at all times be able to confirm _which_ key is in use.

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

### Requirement: Anthropic API key paste-and-save flow

The Settings screen SHALL expose a user-facing form for entering and managing the Anthropic API key, using the `TextInput` primitive from `@garden/ui` with `secureTextEntry: true`. The form MUST provide:

1. A text field labelled "Anthropic API key" accepting free-text input.
2. A "Paste from clipboard" `Button` that reads the clipboard via `expo-clipboard`'s `getStringAsync` and fills the field.
3. A "Save key" `Button`. On press the plaintext value MUST be written to `expo-secure-store` under the key `anthropic_api_key` via `setItemAsync`. On success, `settingsStore.anthropicKeyConfigured` MUST flip to `true`.
4. When a key is already configured, the field MUST be replaced by a masked read-only `Body` node showing `sk-ant-***…***<last4>` (first 7 chars `sk-ant-` + `***…***` + last 4 chars of the stored value) plus a "Clear key" `Button`. Clearing MUST call `deleteItemAsync('anthropic_api_key')` and flip `anthropicKeyConfigured` back to `false`.

The plaintext key MUST NEVER be rendered in any `Body` / `Caption` / `Heading` node after save. Secure-store failures MUST surface a `Caption` variant `actionRequired` with a plain-language message ≤20 words.

#### Scenario: User pastes and saves a key

- **GIVEN** the clipboard contains `sk-ant-abc123defGHIJ4567`
- **WHEN** the user taps "Paste from clipboard" then "Save key"
- **THEN** `SecureStore.setItemAsync('anthropic_api_key', 'sk-ant-abc123defGHIJ4567')` MUST be called
- **AND** `settingsStore.anthropicKeyConfigured` MUST be `true`
- **AND** the masked display MUST read `sk-ant-***…***4567`

#### Scenario: User clears a saved key

- **GIVEN** a key is already configured
- **WHEN** the user taps "Clear key"
- **THEN** `SecureStore.deleteItemAsync('anthropic_api_key')` MUST be called
- **AND** `anthropicKeyConfigured` MUST be `false`
- **AND** the form MUST return to the empty paste-and-save state

#### Scenario: Empty key is rejected in-UI

- **WHEN** the user taps "Save key" with an empty / whitespace-only field
- **THEN** no secure-store write MUST happen
- **AND** a `Caption` variant `actionRequired` MUST display a plain-language prompt to paste a key first

### Requirement: `useAnthropicKey` hook API

`apps/mobile/src/features/settings/hooks/use-anthropic-key.ts` SHALL export a `useAnthropicKey` hook returning `{ keyMasked: string | null, hasKey: boolean, saveKey: (plain: string) => Promise<void>, clearKey: () => Promise<void> }`. The hook MUST read the current masked value from `expo-secure-store` on mount (through tanstack-query) and MUST invalidate the query on save / clear so the UI updates without a restart.

#### Scenario: Mounted hook reflects stored key

- **GIVEN** a previously saved key `sk-ant-abc123def456XYZ9`
- **WHEN** the Settings screen mounts
- **THEN** `useAnthropicKey().keyMasked` MUST eventually resolve to `sk-ant-***…***XYZ9`
- **AND** `useAnthropicKey().hasKey` MUST be `true`
