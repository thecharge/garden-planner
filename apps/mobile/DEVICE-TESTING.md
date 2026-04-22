# Device testing checklist

What must be verified **on a real Android device** before the app can be tagged as ready for public release. Every item below is a release gate.

## Required devices + reviewers

See `../../ACCESSIBILITY.md` for the reviewer ledger:

- Dyslexic reader
- Low-vision reader
- Deaf / hard-of-hearing reader
- Bulgarian-language translator

Public release stays blocked until every row has a signed-off name and date.

## Functional checklist

Smoke flows on a physical phone (not emulator) with an Anthropic key configured:

- [ ] Cold launch → Capture screen renders with the camera preview in under 3 s.
- [ ] Grant permissions flow appears on first launch; tapping "Grant" surfaces the OS dialogs.
- [ ] Start a 3-second capture pan. A `Protocol` is saved (visible on next reload).
- [ ] Boundary walk: drop three corners, see polygon render, `distanceToPropertyLine` populates.
- [ ] Compliance verdict speaks + captions + haptic-fires for: success / warning / action-required / rejection.
- [ ] Airplane-mode capture works end-to-end (local-first contract).
- [ ] Sector editor: create / rename / delete. Year-over-year yield populates after a harvest event.
- [ ] Rotation view renders recommendations with citations; tap a reason → citation visible in one tap.
- [ ] Nutrient view renders amendments + irrigation mm/week with climatology-fallback warning.
- [ ] Inventory: log sow / transplant / harvest / pest / soil-sample events.
- [ ] Settings: theme switch (light / dark / AAA) and font switch (Lexend / OpenDyslexic) apply without app restart.
- [ ] BYOK key path: paste key → confirm "configured"; clear key → confirm fallback messaging works.

## Accessibility checklist

Run each sub-checklist on a real device with the matching reviewer present.

### Dyslexia

- [ ] Body text renders ≥18 sp, line height ≥1.55 — readable without squinting.
- [ ] OpenDyslexic toggle takes effect without app restart.
- [ ] No paragraph italics anywhere.
- [ ] Error messages begin with the action to take and are ≤20 words.

### Low vision

- [ ] Light-pastel: buttons distinguishable from background at arm's length.
- [ ] Dark-pastel: same check at dusk.
- [ ] High-contrast toggle increases contrast on all tokens; no element disappears.
- [ ] Font scale ±2 steps doesn't crop labels or overflow bounds.

### Deaf / hard-of-hearing

- [ ] Every TTS whisper has a persistent on-screen caption ≥5 s.
- [ ] Haptic patterns for success / warning / action-required / rejection are distinguishable by touch.
- [ ] Screen-only mode (TTS disabled) loses nothing important.
- [ ] Captions-always-on mode works when the device is silent.

### Screen reader (TalkBack)

- [ ] Every tab, button, and list row is TalkBack-focusable with a plain-language label.
- [ ] Invisible-UI overlays over detected spatial objects (boundary corners, verdict regions) are focusable.
- [ ] `useSpatialA11y` debounces repeated announcements during a 60 Hz pose stream.
- [ ] Facing-change announcement fires on a 45° horizontal turn with paired single-short haptic.

### Localization

- [ ] Under `en-*` locale: all strings render in English.
- [ ] Under `bg-BG` locale: all strings render (currently mirroring English per the i18n stub policy); no missing-key console warnings.
- [ ] Native BG translator sign-off recorded in `../../ACCESSIBILITY.md`.

## Performance

- [ ] Steady 60 Hz pose stream during capture doesn't cause measurable re-render storms (React Native Perf Monitor shows < 2 JS renders/s on the capture screen).
- [ ] Camera preview stays ≥30 fps during a 5-second scan window.
- [ ] APK < 50 MB.

## Security

- [ ] `adb shell run-as com.chepinci.gardenplanner cat shared_prefs/*.xml` does NOT find the Anthropic key.
- [ ] App logs (`adb logcat --pid=$(adb shell pidof -s com.chepinci.gardenplanner)`) never contain the key value.
- [ ] `expo-secure-store` usage is confirmed hardware-backed where the device supports it (`adb shell getprop ro.product.model`, check Keystore status).

## Sign-off

Once every checkbox above is green, record the reviewer names and date in `../../ACCESSIBILITY.md` and tag the release.
