# BUILDING.md

From a fresh Ubuntu 24 / Fedora / WSL machine to a working Android emulator running the garden-planner APK. Read top-to-bottom. Every step is something a human or a CI runner should be able to execute verbatim.

## Requirements

- Linux (tested on Ubuntu 24.04 and Fedora 40). macOS works with minor path tweaks. Windows is supported via WSL2.
- ~10 GB free disk for the Android SDK + emulator.
- Node 20+ and pnpm 10.

## Step 1 — Install JDK 17+

### The easy route: use the JBR shipped with Android Studio

If you've installed **Android Studio** (snap, Flatpak, or direct tarball), it ships with the JetBrains Runtime — a working OpenJDK 21:

```bash
ls /snap/android-studio/current/jbr/bin/java       # snap install
# or wherever your Android Studio sits
```

`scripts/setup-env.sh` picks this up automatically. Skip to Step 2.

### The standalone route

Download Adoptium Temurin 17 or 21:

```bash
mkdir -p ~/.jdks && cd ~/.jdks
curl -L -o temurin-21.tar.gz \
  "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz"
tar xf temurin-21.tar.gz
# Point setup-env.sh at it (or export JAVA_HOME manually):
echo "export JAVA_HOME=$PWD/jdk-21.0.6+7" >> ~/.bashrc
```

## Step 2 — Install the Android SDK (no sudo needed)

```bash
mkdir -p "$HOME/Android/Sdk/cmdline-tools"
cd "$HOME/Android/Sdk/cmdline-tools"
curl -L -o tools.zip \
  "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
unzip -q tools.zip
mv cmdline-tools latest                  # directory name must be `latest/`
rm tools.zip
```

## Step 3 — Export environment + verify

```bash
cd ~/workspace/garden-planner
. ./scripts/setup-env.sh                # exports JAVA_HOME, ANDROID_HOME, PATH
./scripts/doctor.sh                     # green = toolchain is usable
```

Expected output (paths may differ):

```
JAVA_HOME=/snap/android-studio/current/jbr
ANDROID_HOME=/home/you/Android/Sdk
OK   Java: openjdk 21 …
OK   adb: Android Debug Bridge version 1.0.41
OK   emulator: Android emulator version …
OK   sdkmanager on PATH
OK   avdmanager on PATH
OK   pnpm: 10.x
OK   node: v20 or newer
--- All required dev-env pieces present. ---
```

If any row is `MISS`, re-read the matching step.

## Step 4 — Accept SDK licences + install platform components

```bash
yes | sdkmanager --licenses >/dev/null
sdkmanager \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "emulator" \
  "system-images;android-35;google_apis;x86_64"
```

This takes 2–5 minutes and downloads ~2 GB.

## Step 5 — Install repo dependencies

```bash
pnpm install
```

pnpm runs the `prepare` hook, which initialises husky and its pre-commit hook (`.husky/pre-commit`). First install may take 1–2 minutes.

## Step 6 — Verify everything compiles and tests pass

```bash
pnpm turbo run typecheck lint test
pnpm test:coverage             # per-package HTML reports in packages/*/coverage/
```

Expected: 5/6 packages green, 140+ tests passing.

## Step 7 — Create the AVD

```bash
./scripts/create-avd.sh        # idempotent; creates Pixel_6_API_35 if missing
```

## Step 8 — Launch the emulator

```bash
./scripts/launch-emulator.sh   # boots the AVD, waits for adb, prints device list
```

The first boot is slow (60–120 s). Subsequent boots reuse the emulator snapshot.

## Step 9 — Run the app

### Dev loop (Metro bundler + hot reload)

```bash
pnpm --filter apps-mobile run start
# Then in another terminal (or press `a` in the Metro UI):
pnpm --filter apps-mobile run android
```

### Local APK build (no EAS account required)

```bash
pnpm --filter apps-mobile run apk:local
# Produces android/app/build/outputs/apk/release/app-release.apk
```

### EAS cloud APK build (requires an Expo account)

```bash
npm i -g eas-cli
eas login
pnpm --filter apps-mobile run apk
```

## Step 10 — Install the APK on a real phone

1. Enable **Developer options** on the phone (tap Settings → About phone → Build number 7 times).
2. Turn on **USB debugging**.
3. Plug the phone in and confirm the fingerprint prompt.
4. `adb install android/app/build/outputs/apk/release/app-release.apk`
5. Open the app and follow `QUICKSTART.md` from "Step 10 — First boundary walk" onwards.

## Troubleshooting

### `expo start` complains about missing Reanimated plugin

`apps/mobile/babel.config.js` must have `"react-native-reanimated/plugin"` as the **last** plugin. Don't reorder.

### Gradle fails with Kotlin / JDK mismatch

AGP 8.x requires JDK 17+. JDK 21 works; JDK 8 or 11 does not. Re-run Step 1.

### `node-gyp` error when installing `better-sqlite3` on Node 24

Node 24 has no prebuilt binary. Downgrade to Node 20 (see `.nvmrc`) or install `build-essential` + `node-gyp`:

```bash
sudo apt-get install -y build-essential
pnpm rebuild better-sqlite3
```

### Husky pre-commit is slow

`lint-staged` runs ESLint + Prettier + cspell on staged files only. Expect ~1–2 s per 10 files. If it's much slower, check if `.cspell-cache` is being written.

### Android emulator hangs / fails to boot

- Check that KVM is available: `ls /dev/kvm && kvm-ok`. If missing, turn on "Intel VT-x" / "AMD-V" in BIOS.
- Delete the AVD and recreate: `avdmanager delete avd -n Pixel_6_API_35 && ./scripts/create-avd.sh`.

### `expo doctor` says version X of Y is unexpected

We pin exact versions in `apps/mobile/package.json`. If `expo doctor` flags a mismatch after an upstream release, that's intentional — the Expo SDK bump is its own follow-up change (see `openspec/changes/bump-expo-sdk-56` when it exists).

## Notes for CI

CI runs on Linux with Node 20. The Android emulator is **not** part of CI — `pnpm turbo run typecheck lint test test:coverage`, the citations/contrast audits, `pnpm audit`, and cspell are the gate. Device testing is manual (see `apps/mobile/DEVICE-TESTING.md`).
