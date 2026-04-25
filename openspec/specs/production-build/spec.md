## ADDED Requirements

### Requirement: EAS production profile targets a signed app bundle

`eas.json` SHALL include a "production" profile with `buildType: "app-bundle"` and a signing configuration that reads keystore credentials from environment variables.

#### Scenario: Production profile is present in eas.json

- **WHEN** `cat eas.json` is run
- **THEN** a `"production"` key SHALL exist under `"build"` with `android.buildType` equal to `"app-bundle"`

### Requirement: pnpm apk:prod builds a signed release APK locally without EAS cloud

A root script `pnpm apk:prod` SHALL run `expo prebuild --platform android` followed by `./gradlew assembleRelease` using keystore env vars from `.env.local`, producing a signed APK at `android/app/build/outputs/apk/release/app-release.apk`.

#### Scenario: Signed APK produced locally

- **WHEN** `KEYSTORE_PATH`, `KEYSTORE_ALIAS`, `KEYSTORE_PASSWORD`, and `KEY_PASSWORD` are set in `.env.local`
- **AND** `pnpm apk:prod` is run
- **THEN** exit code SHALL be 0
- **AND** `android/app/build/outputs/apk/release/app-release.apk` SHALL exist

### Requirement: docs/RELEASE.md documents the release checklist

A `docs/RELEASE.md` file SHALL list the steps required to cut a release: bump version, generate keystore (first time), run `pnpm apk:prod`, run `pnpm check:all`, verify on device, commit release tag.

#### Scenario: RELEASE.md exists and contains version bump step

- **WHEN** `docs/RELEASE.md` is read
- **THEN** it SHALL contain a step referencing version bump in `app.json`
- **AND** a step referencing keystore generation
- **AND** a step referencing `pnpm apk:prod`
