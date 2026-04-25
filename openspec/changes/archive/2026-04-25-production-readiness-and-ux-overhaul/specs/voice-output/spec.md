## MODIFIED Requirements

### Requirement: Channels are individually disable-able per user setting

The app's announce channels (TTS, haptics, captions) SHALL each be individually gated by a Settings toggle. TTS and haptics SHALL default to `false` on first install so that new users are not startled by audio. Captions (visual only) SHALL continue to default to `AlwaysOn`.

#### Scenario: First install — no audio fires

- **WHEN** the app is launched for the first time with no persisted settings
- **THEN** `settingsStore.voiceEnabled` SHALL be `false`
- **AND** `settingsStore.hapticsEnabled` SHALL be `false`
- **AND** `settingsStore.captionsMode` SHALL be `CaptionsMode.AlwaysOn`
- **AND** `announce()` calls SHALL push captions but SHALL NOT invoke `expo-speech.speak` or `expo-haptics`

#### Scenario: User enables TTS in Settings

- **WHEN** the user sets `voiceEnabled` to `true` via the Settings screen toggle
- **THEN** subsequent `announce()` calls SHALL invoke `expo-speech.speak`

#### Scenario: Channels are independently toggled

- **WHEN** `voiceEnabled` is `true` and `hapticsEnabled` is `false`
- **THEN** a mutation announce SHALL fire TTS only — no haptic
