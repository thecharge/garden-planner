## ADDED Requirements

### Requirement: Sound and haptics default to off on first install

The system SHALL initialise `voiceEnabled` and `hapticsEnabled` to `false` in `settingsStore` so new users are not startled by audio on first launch.

#### Scenario: First launch has no audio

- **WHEN** the app is launched for the first time
- **THEN** no TTS speech SHALL fire on any mutation
- **AND** no haptic vibration SHALL fire on any mutation
- **AND** the caption bar SHALL remain visible (captionsMode defaults to AlwaysOn)

### Requirement: Settings screen has a dedicated Sound & Notifications section

The Settings screen SHALL expose a labelled "Sound & Notifications" card with individual toggles for TTS voice, haptics, and captions mode. Each toggle SHALL be reachable by accessibility label.

#### Scenario: User enables TTS from Settings

- **WHEN** the user opens Settings and taps the "Enable voice" toggle
- **THEN** `settingsStore.voiceEnabled` SHALL become `true`
- **AND** subsequent mutation announcements SHALL fire TTS

#### Scenario: User disables haptics from Settings

- **WHEN** the user taps the "Enable haptics" toggle while haptics are on
- **THEN** `settingsStore.hapticsEnabled` SHALL become `false`
- **AND** subsequent announcements SHALL NOT fire haptic feedback

#### Scenario: Toggles are individually independent

- **WHEN** voiceEnabled is `true` and hapticsEnabled is `false`
- **THEN** a mutation announce SHALL fire TTS only — no haptic

### Requirement: First-run onboarding card prompts sound opt-in

On the first render after install the app SHALL display a dismissible onboarding card that explains the voice/haptic feature and offers a single-tap "Enable sound & haptics" action.

#### Scenario: Onboarding card shown once only

- **WHEN** it is the first app launch (no persisted onboarding-seen flag)
- **THEN** the onboarding card SHALL be visible on the home or capture screen
- **AND** a "Enable sound & haptics" button SHALL be present

#### Scenario: Onboarding accept enables both channels

- **WHEN** the user taps "Enable sound & haptics" on the onboarding card
- **THEN** `voiceEnabled` and `hapticsEnabled` SHALL both become `true`
- **AND** the card SHALL be dismissed and SHALL NOT appear again
