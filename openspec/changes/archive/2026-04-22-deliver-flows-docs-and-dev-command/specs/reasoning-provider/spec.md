## ADDED Requirements

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
