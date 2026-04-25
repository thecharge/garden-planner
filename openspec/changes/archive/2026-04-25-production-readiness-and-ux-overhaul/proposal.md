## Why

The app has all the right engine pieces — compliance, rotation, nutrition, capture — but they feel disconnected: a user can take a photo, get a protocol, and then have no obvious path to creating a sector from it. Sound fires on every mutation by default and can be jarring. Camera permissions appear unexpectedly. The home/index screen is blank. There is no short-form introduction to the app, no test matrix that can be cited as a quality gate, and several stubs block a credible production story. All of this together makes the app feel half-finished to a real grower even though the engine is solid.

## What Changes

- **Sounds off by default** — `hapticsEnabled` and `voiceEnabled` default to `false` in `settingsStore`; a first-run onboarding card explains the feature and lets the user opt in. Settings screen gains a dedicated "Sound & notifications" section exposing TTS, haptics, and captions toggles clearly labelled.
- **Camera permissions in Settings** — a new "Camera & location" card in Settings shows current permission status (granted / denied / never-asked) with a button to open the rationale screen or the OS settings page. Permission state is surfaced proactively rather than only when entering the Capture tab.
- **Seamless capture → sector flow** — after a successful scan, the verdict screen gains a primary CTA "Create sector from scan" that pre-populates a new sector with the protocol's slope, orientation, and GPS coordinates. The Sectors tab also gains a FAB shortcut "Scan new sector" that deep-links directly to the viewfinder.
- **Home screen dashboard** — `app/index.tsx` replaced with a real dashboard: last-scan summary card, sector count + last harvest date, upcoming rotation recommendation, and a "Tap to scan" hero action. Driven by live data from `repository` query hooks.
- **Production build pipeline** — `eas.json` production profile wired; `pnpm apk:prod` script builds a signed release APK locally (no cloud). App version, bundle ID, and release notes templated. `docs/RELEASE.md` documents the release checklist.
- **Test matrix** — every feature that currently has zero test coverage gets a Jest `it.each` table: `settings-screen`, `capture-permissions-card`, `home-dashboard`, `sector-from-scan` flow. Existing engine tests are confirmed passing. A coverage threshold (70 % lines, 80 % functions) is enforced in `jest.config.js`.
- **README overhaul** — README opens with a 2-sentence plain-language description, a GIF/video embed placeholder, and a "What can I do today?" section before any technical content.

## Capabilities

### New Capabilities

- `sound-opt-in`: Sound & haptics default-off with opt-in onboarding; full controls in Settings.
- `permissions-in-settings`: Camera + location permission status card in Settings with grant/revoke shortcut.
- `capture-to-sector`: Post-scan CTA to create a sector pre-populated from the scan protocol; Sectors FAB shortcut to scan.
- `home-dashboard`: Live dashboard replacing the blank index screen — recent scan, sector health, rotation nudge, hero CTA.
- `production-build`: EAS production profile, signed-APK script, release checklist, version management.
- `test-matrix`: Coverage-gated Jest tables for all features; threshold enforced in CI.
- `readme-intro`: README rewritten — plain-language intro, video embed, "What can I do today?" user-facing section first.

### Modified Capabilities

- `voice-output`: Default values for `hapticsEnabled` and `voiceEnabled` change from `true` to `false`.
- `spatial-topography`: Sector creation flow extended to accept a pre-populated `ScanProtocol` as input.

## Impact

- `apps/mobile/src/features/settings/store/settings-store.ts` — two default value changes + new `soundsEnabled` alias
- `apps/mobile/src/features/settings/components/settings-screen.tsx` — new Sound & Notifications card, new Camera & Location permissions card
- `apps/mobile/app/index.tsx` — full replacement with dashboard
- `apps/mobile/src/features/capture/components/capture-screen.tsx` — add post-scan "Create sector" CTA
- `apps/mobile/src/features/sectors/` — accept optional `ScanProtocol` pre-fill in sector creation
- `eas.json`, `apps/mobile/app.json` — production profile wiring
- `packages/*/jest.config.js` — coverage thresholds
- `README.md` — restructured
- New test files across features missing coverage
