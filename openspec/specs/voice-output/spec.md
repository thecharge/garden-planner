# voice-output Specification

## Purpose
TBD - created by archiving change make-capture-voice-yoy-real. Update Purpose after archive.
## Requirements
### Requirement: Device channels wire `announce()` at the app root

The mobile app SHALL provide an `AnnounceProvider` at the root of the
component tree that supplies concrete `tts`, `caption`, and `haptic`
channels to `@garden/ui`'s `announce()` helper. The provider MUST live
under `apps/mobile/src/core/announce/` and MUST be the only place in the
app that imports `expo-speech` or `expo-haptics`. Feature code MUST call
`useAnnounce()` and pass the returned function a `Summary` — it MUST NOT
import Expo modules directly.

#### Scenario: Feature code announces a verdict without importing expo-\*

- **GIVEN** a mutation in `apps/mobile/src/features/sectors/` resolves with a `Summary`
- **WHEN** the onSuccess callback calls `announce(summary.success("Sector saved"))`
- **THEN** `expo-speech.speak` MUST be invoked with the message text
- **AND** a caption MUST be pushed to the caption store
- **AND** `expo-haptics.notificationAsync` MUST fire with the mapped pattern
- **AND** the feature source file MUST NOT import from `expo-speech` or `expo-haptics`

#### Scenario: Channels are individually disable-able per user setting

- **GIVEN** the user turns off the TTS toggle in Settings (`settingsStore.voiceEnabled = false`)
- **WHEN** `announce(summary)` is called
- **THEN** `Speech.speak` MUST NOT be invoked
- **AND** the caption MUST still be pushed
- **AND** the haptic MUST still fire

### Requirement: Persistent caption bar at the root of the app

The app SHALL render a sticky `<CaptionBar />` at the root layout so every
spoken utterance is accompanied by a readable subtitle regardless of which
screen fired it. The bar MUST use `@garden/ui` primitives (`Caption`,
`Body`) and MUST meet the accessibility capability (≥18 sp, line-height
≥1.55, AAA contrast option).

#### Scenario: Caption appears when announced and auto-dismisses after TTL

- **WHEN** `announce(summary)` is called
- **THEN** the caption bar MUST display the summary message within one render cycle
- **AND** the caption MUST disappear after `config.CAPTION_TTL_MS` (default 5000 ms)
- **AND** a second announcement during the TTL MUST replace the first, not stack

#### Scenario: Caption bar does not cover the tab bar

- **GIVEN** the Capture tab is focused with a caption visible
- **THEN** the caption bar MUST render above the tab bar and below the screen content
- **AND** the tab bar MUST remain tappable

### Requirement: Every terminal mutation surfaces a Summary

The app MUST announce a `Summary` for every user-visible mutation in
Capture, Sectors, Yield, Inventory, and Settings — exactly once on
resolution — either with the `Summary` returned by the engine /
repository call, or with a typed error translated via `SmepErrors.*`.

#### Scenario: Sector save announces success

- **WHEN** the user taps "Add sector" and `saveSector` resolves
- **THEN** `announce(summary.success("Sector <name> saved"))` MUST be called exactly once
- **AND** the caption MUST carry the sector's name

#### Scenario: Sector save failure announces actionRequired

- **WHEN** `saveSector` throws `SmepErrors.repositoryUnavailable()`
- **THEN** `announce(summary.actionRequired(<plain-language recovery step>))` MUST be called
- **AND** the raw Error MUST NOT be surfaced to the user

### Requirement: Haptic pattern mapping lives outside @garden/ui

The app MUST map `HapticPattern` (defined in `@garden/ui`) to
`Haptics.NotificationFeedbackType` inside
`apps/mobile/src/core/announce/haptic.ts`, so that `@garden/ui` stays
free of `expo-*` imports. The mapper MUST cover every `HapticPattern`
value and MUST fall back to `Light` for any unmapped future value
rather than throwing.

#### Scenario: Every current pattern maps to an expo-haptics type

- **WHEN** `announce(summary.success(...))`, `announce(summary.warning(...))`, `announce(summary.rejection(...))`, and `announce(summary.actionRequired(...))` are each called in turn
- **THEN** `Haptics.notificationAsync` MUST fire 4 times
- **AND** each call MUST receive a valid `NotificationFeedbackType` value

