## Context

The garden planner's engine is production-quality (compliance, rotation, nutrition, FAO-56, voice output, camera capture, yield YoY). The mobile app shell around it has several UX friction points that make it feel unfinished to real users:

1. Voice/haptic fires on every mutation with no opt-in — jarring on first launch.
2. Camera permission appears unexpectedly when the Capture tab is visited — no mental model built beforehand.
3. Post-scan flow dead-ends: the protocol is displayed but nothing connects it to creating a sector.
4. The home screen (`app/index.tsx`) is a blank redirect — no information, no orientation.
5. No signed production APK pipeline; `eas.json` has only `development` and `preview` profiles.
6. Test coverage has gaps (settings, capture flow, home dashboard, capture→sector integration).
7. README leads with tech context — a new grower has no idea what the app does or why they'd use it.

## Goals / Non-Goals

**Goals:**

- Sounds/haptics default `false`; a first-run card explains the feature and lets users opt in.
- Settings screen gets two new cards: "Sound & Notifications" (TTS, haptics, captions) and "Camera & Location" (permission status + manage shortcut).
- Capture verdict screen gets a "Create sector from this scan" CTA; Sectors FAB gains a "Scan new sector" shortcut.
- Home screen replaced with a live dashboard: last scan card, sector health, rotation nudge, scan hero CTA.
- `eas.json` production profile added; `pnpm apk:prod` builds a signed release APK locally.
- Jest coverage threshold (70 % lines / 80 % functions) enforced; missing test tables added for settings, home, capture-to-sector, permissions-card.
- README restructured: plain-language 2-sentence intro, video embed placeholder, "What can I do today?" section before architecture docs.

**Non-Goals:**

- SQLite persistence (tracked separately in `make-device-sqlite-adapter`).
- STT voice input (tracked in `make-voice-stt-real`).
- Skia/Reanimated spatial overlay (tracked in `make-spatial-overlay-real`).
- Any engine-level algorithmic changes.
- i18n BG translations (blocked on native reviewer sign-off).

## Decisions

### D1: Default sounds/haptics to `false`

**Rationale**: First-run users on an Android device in a quiet environment (a garden) will be startled by TTS firing immediately. Accessibility guidelines prefer opt-in for audio. The existing `voiceEnabled` and `hapticsEnabled` flags in `settingsStore` need only their default values changed — no API surface changes.

**Alternative considered**: Keep defaults `true` but add a dismissible onboarding dialog. Rejected: the dialog approach requires persistent state (a "shown" flag) and still fires sound before the dialog can be shown on first render.

### D2: Permissions card in Settings (not a new screen)

**Rationale**: A separate "Permissions" route adds navigation complexity. A card inside the existing Settings screen integrates naturally with the existing "Camera & location" mental model and lets the user manage permissions alongside other app controls. The card uses `Linking.openSettings()` to hand off to the OS when permissions are denied.

**Alternative considered**: Badge on the Capture tab icon when permissions are missing. Rejected: color-only state signal violates the a11y contract.

### D3: Capture → Sector CTA as a bottom-sheet confirm step

**Rationale**: Jumping directly from a scan result to sector creation could lose the user's context about what the scan measured. A confirm step ("Create sector from this scan?") that pre-populates the form and lets the user edit the name before saving is safer UX. Sector creation already accepts `name` + optional `plotId`; we extend it to accept a `ScanProtocol` pre-fill bag.

**Alternative considered**: Automatic sector creation on scan. Rejected: too destructive for an accidental tap; creates unnamed duplicates.

### D4: Home dashboard driven by existing query hooks (no new API)

**Rationale**: `useSectors`, `useSectorYield`, `useRotationAdvisor` already exist and return live data. The dashboard is a composition screen, not a new data layer. The only new hook needed is `useLastScan` that reads from the spatial store's latest protocol.

### D5: Jest coverage thresholds in `jest.config.js` per-package

**Rationale**: A single root threshold would hide package-level gaps. Per-package thresholds (`coverageThreshold`) catch regressions at the module boundary. Initial threshold set conservatively (70 % lines) to avoid blocking existing partial coverage.

### D6: Production APK via local Gradle, not EAS cloud

**Rationale**: The project already has a full local Gradle build (`pnpm apk`). A production variant just requires a signing config in `android/app/build.gradle` (keystore env vars) and a corresponding `eas.json` profile for toolchain consistency. No cloud account required.

## Risks / Trade-offs

- **[Risk] Default-off sounds break accessibility for users who need TTS immediately** → Mitigation: First-run onboarding card prominently offers "Enable sound & captions" with a single tap. The caption bar remains `AlwaysOn` by default (visual only, no audio).
- **[Risk] Permissions card shows stale state if OS settings changed outside the app** → Mitigation: Card re-checks permission status on `AppState change` (same hook pattern as the existing capture permissions screen).
- **[Risk] Sector pre-population from scan protocol creates sectors with placeholder names** → Mitigation: The CTA opens an edit-name bottom sheet before committing. Name defaults to `"Scan YYYY-MM-DD"`.
- **[Risk] Coverage threshold blocks CI on existing gaps before new tests land** → Mitigation: Thresholds added in the same PR as the new test tables. Gate is only enabled once passing.
- **[Risk] Production signing keystore management** → Mitigation: Keystore path + passwords read from `.env.local` (git-ignored); `docs/RELEASE.md` documents the keygen step and backup procedure.

## Migration Plan

1. Merge settings defaults change → existing users see no change (settings are in-memory; re-launch resets to new defaults). Once SQLite persistence lands, a migration sets `hapticsEnabled = false` for first-time installs only (existing installs keep their explicit value).
2. Permissions card is additive — no breaking changes.
3. Capture → sector CTA is additive — existing scan flow unchanged.
4. Home dashboard replaces the blank `index.tsx` redirect — no data migration needed.
5. Coverage thresholds land with the new test files; existing green tests unaffected.
6. README restructure is docs-only — no code impact.

## Open Questions

- Should the home dashboard show a "resume last incomplete scan" card if a protocol was captured but no sector was created? (Nice-to-have for v2 of this change.)
- Should `captionsMode` also default to `Off`? Currently `AlwaysOn`. Keeping `AlwaysOn` for visual-only captions seems safe; proposal leaves it as-is.
