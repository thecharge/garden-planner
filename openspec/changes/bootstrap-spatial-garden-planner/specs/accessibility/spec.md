## ADDED Requirements

### Requirement: Neutral pastel theme with full dark mode

The system SHALL ship two default themes — `light-pastel` and `dark-pastel` — defined as typed token sets in `packages/ui/theme/` and selectable by the user. A third `high-contrast` theme MUST be available from the accessibility settings and MUST meet WCAG 2.2 AAA contrast (7:1 body, 4.5:1 large).

#### Scenario: User switches to dark mode
- **WHEN** the user toggles dark mode in accessibility settings
- **THEN** every screen MUST re-render with the `dark-pastel` token set
- **AND** contrast on every visible foreground/background pair MUST meet WCAG AA (4.5:1 body, 3:1 large)

#### Scenario: AAA high-contrast mode
- **WHEN** the user enables the AAA high-contrast mode
- **THEN** every foreground/background pair rendered MUST meet AAA contrast
- **AND** the switch MUST NOT require an app restart

### Requirement: Automated contrast check in CI

The system SHALL ship a CI step that loads every theme's token set and asserts WCAG AA contrast for every declared foreground/background pair (and AAA for the high-contrast theme). PRs that drop any pair below its required ratio MUST fail CI.

#### Scenario: A regression in the pastel primary fails the build
- **WHEN** a PR lightens the `primary-on-surface` pair below 4.5:1 in the light theme
- **THEN** the contrast-check CI step MUST fail
- **AND** the error MUST name the offending pair and the measured ratio

### Requirement: Dyslexia-friendly typography by default

The system SHALL set Lexend (SIL Open Font License) as the default body typeface across the entire app. OpenDyslexic MUST be available as an opt-in from accessibility settings. Body text size MUST be ≥18sp, line height ≥1.55, letter spacing ≥0.02em. Italics MUST NOT be used for paragraph text; emphasis MUST use weight instead.

#### Scenario: Default typography is Lexend
- **WHEN** the app renders any `Text` primitive from `@garden/ui` without an explicit font override
- **THEN** the rendered font family MUST be Lexend
- **AND** the size MUST be ≥18sp and line height ≥1.55

#### Scenario: User switches to OpenDyslexic
- **WHEN** the user enables OpenDyslexic in accessibility settings
- **THEN** every `Text` primitive from `@garden/ui` MUST switch to OpenDyslexic on the next render
- **AND** the font MUST be bundled in the APK (no network fetch required)

### Requirement: Cross-modal redundancy — never color-only, never sound-only, never text-only

The system SHALL NOT convey any state by color alone, by audio alone, or by text alone. Every verdict or state change MUST be surfaced on at least two independent channels: color + icon + caption; audio + caption + haptic; etc. The `announce(summary)` helper in `@garden/ui` MUST be the single point where this cross-modal contract is enforced.

#### Scenario: Success verdict uses color, icon, caption, audio, haptic
- **WHEN** a success verdict is announced via `announce(summary.success(...))`
- **THEN** the UI MUST render a green-tone accent *and* a "✓" icon *and* the caption text
- **AND** the audio TTS MUST play *and* a single-short haptic MUST fire

#### Scenario: Rejection verdict in silent mode still fully conveyed
- **WHEN** the device is in silent mode and a rejection is announced
- **THEN** the red-tone accent *and* the "✕" icon *and* the persistent caption *and* the long haptic MUST still fire
- **AND** no capability MUST be gated on audio playback

### Requirement: Screen-reader labels on every interactive element

Every interactive element rendered from `@garden/ui` MUST carry an `accessibilityLabel` (or equivalent) that describes its purpose in plain language. Decorative images MUST carry `accessibilityRole="image"` with `accessibilityLabel=""` or `importantForAccessibility="no"`.

#### Scenario: TalkBack announces the capture button
- **WHEN** TalkBack focuses the capture button
- **THEN** the announced label MUST be "Start capture" or equivalent plain-language description
- **AND** the announced role MUST be "button"

#### Scenario: Decorative image is skipped by TalkBack
- **WHEN** TalkBack navigates past a decorative image
- **THEN** it MUST NOT announce the image file name or a generic "image" label
- **AND** focus MUST skip to the next interactive element

### Requirement: Configurable motion, contrast, and font settings

The accessibility settings screen MUST expose at minimum: theme (light / dark / high-contrast), font family (Lexend / OpenDyslexic), font scale (±2 steps from default), motion reduction (on/off disabling non-essential animation), haptics (on/off), captions (always-on / on / off).

#### Scenario: User reduces motion
- **WHEN** the user enables motion reduction
- **THEN** transitions, shimmer effects, and non-essential animation MUST be suppressed app-wide
- **AND** critical feedback (haptics, captions, TTS) MUST remain active

#### Scenario: Captions always-on
- **WHEN** the user sets captions to "always-on"
- **THEN** every TTS utterance MUST render a caption regardless of the TTS enabled state
- **AND** the caption MUST persist for at least 5 seconds per the voice-interaction spec

### Requirement: Plain-language, dyslexia-aware copy

In-app copy (button labels, captions, error messages, tutorial steps) MUST use plain language: short sentences (≤20 words typical), active voice, no unexplained jargon. A lint rule or checklist MUST gate merges that introduce long or passive-voice copy in `@garden/ui`.

#### Scenario: Error copy is short and actionable
- **WHEN** `SmepErrors.providerNotConfigured()` is surfaced to the user
- **THEN** the shown message MUST be ≤20 words and MUST begin with the action the user can take (e.g., "Add your Anthropic key in settings to continue.")

### Requirement: Invisible-UI overlay pattern for spatial focus

The system SHALL render a transparent, accessible React `View` over every spatial object that must be focusable by a screen reader (detected boundary corner, sector polygon vertex, compliance overlay region). Each invisible `View` MUST carry an `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` that together describe the object's purpose in plain language. The invisible `View` MUST track the object's projected screen rectangle as the camera pose changes (throttled per the spatial-topography performance requirement).

#### Scenario: TalkBack focuses a detected boundary corner
- **WHEN** the user activates TalkBack and the capture screen shows a detected corner
- **THEN** TalkBack MUST be able to focus an invisible `View` at the corner's screen position
- **AND** the announced label MUST describe the corner (e.g., "Boundary corner 2 of 3, 3.2 metres away")

#### Scenario: Invisible views track pose updates without melting the UI
- **WHEN** the pose updates at 60 Hz
- **THEN** the invisible-view rectangles MUST reposition at the configured spatial-pose throttling threshold (e.g., ≥ 1° or ≥ 0.1 m movement)
- **AND** the invisible-view repositioning MUST NOT cause visible UI jank

### Requirement: `useSpatialA11y` announcer hook

The system SHALL expose a `useSpatialA11y` hook in `src/features/a11y/` that subscribes to the spatial store and calls `AccessibilityInfo.announceForAccessibility(...)` for named spatial events (device-facing-changed, object-detected, compliance-verdict-updated, boundary-corner-added). Each announcement MUST be paired with the same haptic pattern the cross-modal `announce(summary)` helper uses for the equivalent severity.

#### Scenario: Facing-change announced on a 45° turn
- **WHEN** the user rotates the device by 45° or more in the horizontal plane
- **THEN** `useSpatialA11y` MUST call `AccessibilityInfo.announceForAccessibility` with a plain-language description (e.g., "Facing west")
- **AND** a single-short haptic MUST fire alongside the announcement

#### Scenario: Verdict update announcement is debounced
- **WHEN** the compliance verdict changes three times within one second during a capture
- **THEN** no more than one announcement per verdict value MUST be spoken
- **AND** the final settled verdict MUST always be announced after the capture window closes

### Requirement: Accessibility testers in the release loop

The MVP release checklist MUST include sign-off from at least one dyslexic reviewer, one low-vision reviewer, and one deaf/HOH reviewer before a public `.apk` is distributed. The reviewer names and dates MUST be recorded in `QUICKSTART.md` or a dedicated `ACCESSIBILITY.md`.

#### Scenario: Release is blocked without sign-off
- **WHEN** the team attempts to tag a release without recorded accessibility sign-off
- **THEN** the release checklist MUST call out the missing sign-off
- **AND** the release MUST NOT be tagged as "public-ready" until the sign-off is recorded
