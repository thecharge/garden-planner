# voice-interaction Specification

## Purpose
TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.
## Requirements
### Requirement: Voice-first conversational loop

The system SHALL drive the primary capture workflow via voice: user intent captured through STT, system guidance delivered through TTS ("whisper"), with the screen used only for confirmations and compliance overlays. A user MUST be able to complete a scan-and-verdict flow with the phone in a pocket except during the camera pan.

#### Scenario: End-to-end voice capture flow
- **WHEN** the user says "I want to grade this slope and plant an orchard"
- **THEN** the system MUST respond via TTS with the next-step instruction to pan the camera
- **AND** after the scan completes, the system MUST read the compliance verdict aloud

#### Scenario: Screen-only fallback when audio is disabled
- **WHEN** TTS / STT is disabled by the user or unavailable on the device
- **THEN** the same workflow MUST complete through on-screen prompts and tap confirmations
- **AND** no capability MUST be gated on voice availability

### Requirement: STT errors surface as `actionRequired`, not crashes

The system SHALL translate STT failures (timeout, low confidence, unsupported locale) into a `summary.actionRequired` response prompting the user to repeat or switch to on-screen input. STT failures MUST NOT throw unhandled errors.

#### Scenario: STT returns low-confidence transcript
- **WHEN** STT confidence is below the configured threshold
- **THEN** the system MUST emit `summary.actionRequired("I didn't catch that — say it again or tap to type.")`
- **AND** MUST NOT pass the low-confidence transcript to the reasoning provider

#### Scenario: STT times out
- **WHEN** STT returns no result within the configured window
- **THEN** the system MUST prompt the user to retry via TTS
- **AND** MUST NOT throw

### Requirement: TTS whisper is non-blocking and interruptible

TTS playback MUST NOT block subsequent capture; the user MUST be able to start a camera pan or speak the next intent while the whisper is still playing. In-flight TTS MUST be cancelable when a new utterance begins.

#### Scenario: User interrupts whisper to speak
- **WHEN** the user starts speaking while a TTS whisper is playing
- **THEN** the in-flight TTS MUST be cancelled within 200 ms
- **AND** the new utterance MUST be captured by STT

### Requirement: Always-on captions for every spoken utterance

Every TTS utterance MUST also render as a persistent caption on the active screen so hearing-impaired users and noisy-environment users are never excluded. Captions MUST persist for at least 5 seconds and MUST be dismissable.

#### Scenario: Whisper is captioned
- **WHEN** the system plays a TTS whisper (e.g., the compliance verdict)
- **THEN** the same text MUST be visible on-screen within 100 ms of playback start
- **AND** the caption MUST remain on-screen for at least 5 seconds or until the user dismisses it

#### Scenario: Screen-only mode still works
- **WHEN** the user has disabled TTS in accessibility settings
- **THEN** the caption alone MUST carry the verdict
- **AND** no capability MUST be gated on TTS being enabled

### Requirement: Haptic confirmation distinct per verdict type

Every verdict MUST fire a haptic pattern that is distinct per `summary.type` (`success` single short, `warning` double short, `actionRequired` triple short, `rejection` long). This is the third channel (beyond voice and text) so color-blind users and users with any single-channel impairment can still perceive the verdict.

#### Scenario: Haptic fires together with TTS and caption
- **WHEN** a verdict is surfaced via `announce(summary)`
- **THEN** the TTS utterance, the on-screen caption, and the haptic pattern MUST all fire
- **AND** the haptic pattern MUST map to `summary.type` per the table in `@garden/ui`

