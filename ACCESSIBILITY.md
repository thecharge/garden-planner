# Accessibility

Accessibility is a **release gate** for this project, not a feature. Before any `.apk` is distributed publicly, three reviewers must sign off.

The baseline commitments are laid out in the `accessibility` capability spec (`openspec/changes/bootstrap-spatial-garden-planner/specs/accessibility/spec.md`). In short:

- **Themes:** neutral pastel light, pastel dark, and an AAA high-contrast mode. Every declared foreground/background pair is audited in CI.
- **Typography:** Lexend (SIL OFL) as default; OpenDyslexic available as opt-in. Body text ≥18 sp, line height ≥1.55, letter spacing ≥0.02 em. No italics for paragraph copy.
- **Cross-modal redundancy:** every verdict lands on at least two independent channels. `announce(summary)` in `@garden/ui` fires TTS + caption + haptic together.
- **Screen-reader labels:** every interactive element has an `accessibilityLabel`; decorative images are explicitly marked.
- **Plain-language copy:** ≤20-word sentences where possible; active voice; no jargon without definition.

## Reviewer sign-off ledger

The release checklist requires at minimum:

| Reviewer kind | Name | Role | Date reviewed | Result |
| --- | --- | --- | --- | --- |
| Dyslexic reader | _not yet recorded_ | — | — | — |
| Low-vision reader | _not yet recorded_ | — | — | — |
| Deaf / hard-of-hearing | _not yet recorded_ | — | — | — |

Until every row above is filled, **the app must not be tagged as a public release**.

## How reviewers should test

Each reviewer runs through the following checklist on a physical Android device. Any failing item blocks release until addressed.

### Dyslexia reviewer

- [ ] Every screen readable without squinting at 18 sp Lexend default.
- [ ] OpenDyslexic toggle works from Settings → Accessibility.
- [ ] No paragraph italics anywhere.
- [ ] Error and verdict copy is short, active-voice, and begins with the action to take.
- [ ] Settings screen labels are unambiguous.

### Low-vision reviewer

- [ ] Light-pastel and dark-pastel themes both pass "I can tell buttons from background at arm's length".
- [ ] High-contrast mode (AAA) takes effect without an app restart.
- [ ] Font-scale steps (+1, +2) do not crop labels.
- [ ] No information is conveyed by color alone — verdicts always have an icon + caption.

### Deaf / hard-of-hearing reviewer

- [ ] Every spoken TTS whisper is also a persistent on-screen caption.
- [ ] Captions stay visible at least 5 seconds or until dismissed.
- [ ] Haptic patterns differ by verdict type (success / warning / actionRequired / rejection are distinguishable by touch).
- [ ] Screen-only mode (TTS disabled in Settings) loses nothing important.

## Automated checks in CI

- **Contrast audit** (`pnpm --filter @garden/ui run audit:contrast`) validates every declared token pair against its required ratio (AA or AAA). PRs that drop a pair below threshold fail the build.
- **Plain-language lint** gates user-facing copy strings in `@garden/ui` against a ≤20-word rule and a passive-voice check.
- **Snapshot tests** render every key screen in `light`, `dark`, and `high-contrast` themes.

## Known gaps (tracked for follow-ups)

- Bulgarian localization. Lexend only partially covers Cyrillic — the BG release will adopt **Atkinson Hyperlegible** instead. Tracked as a follow-up change.
- Offline speech-to-text (Vosk or similar). MVP falls back to Android's built-in STT, which needs connectivity in some locales.
- Voice output tempo / voice selection. MVP uses the device default.

## Filing accessibility issues

Open an issue with the label `a11y`. Include your device, OS version, the feature screen, and whether the failure is visual, auditory, or cognitive. Accessibility issues are triaged within one working week.
