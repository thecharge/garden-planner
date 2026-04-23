# Sideload the Garden Planner on your Android phone

Ten steps, plain language, in order. No developer account. No Play Store.

If you built the APK yourself, follow the quick recipe below before step 1 — or skip it if someone handed you an `.apk`.

```bash
. ./scripts/setup-env.sh
pnpm --filter apps-mobile run apk:local
```

This runs `expo prebuild --platform android` then `./gradlew assembleRelease`. On first build it takes 10-15 minutes because Gradle downloads every dependency. Subsequent builds are ~1 minute. The finished file lives at:

```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

~170 MB today. Most of it is Skia + Hermes + the JS bundle.

---

## 1. Enable Developer Mode on the phone

1. Open **Settings**.
2. Scroll to **About phone**.
3. Find **Build number** and tap it **seven times**.

You see a toast: _You are now a developer_. That switches on the **Developer options** menu.

## 2. Turn on USB debugging

1. Go to **Settings → System → Developer options**.
2. Turn on **USB debugging**.
3. If you plan to install over USB, connect the phone to your computer.
4. Accept the **Allow USB debugging?** prompt on the phone. Check **Always allow from this computer**.

## 3. Allow install from unknown sources

Android blocks `.apk` installs by default. Pick the app you will open the `.apk` with — usually your browser or a file manager.

1. **Settings → Apps → Special access → Install unknown apps**.
2. Tap the app you will use (Chrome, Files, Drive).
3. Turn on **Allow from this source**.

## 4. Get the `.apk` onto the phone

Pick one:

- **USB (most reliable):** copy the `.apk` from your computer to `Downloads/` on the phone.
- **Share link:** upload the file to Drive / Dropbox. Open the link on the phone. Tap **Download**.
- **Local mesh:** put it on your LAN share, tap it from the file browser.

## 5. Tap the `.apk` on the phone

Open **Files** (or your file manager). Find `app-release.apk`. Tap it.

## 6. Accept the install prompts

Android warns that the app is from an unknown source. Tap **Install**. On some phones tap **Install anyway**.

## 7. Open the app

When install finishes, tap **Open**.

Alternatively find the **Garden Planner** icon in the app drawer.

## 8. Accept permissions on first run

When you open the **Capture** tab for the first time, the **Scan** button is greyed out and a caption tells you which permissions are missing. Tap the **Grant access** button beneath the caption. A rationale screen appears with three rows:

- **Camera** — lets the viewfinder show the slope you are scanning.
- **Location** — pins the scan coordinate to your plot.
- **Motion (compass + gyroscope)** — reads pitch and heading for the slope calculation.

Tap **Grant access** on that rationale screen. Android will pop **three system dialogs** in sequence, one per permission. Tap **While using the app** for each one.

Once all three say **Granted**, tap **Back to Capture**. The Scan button turns on. **Pin the property-line distance** in the text input above the button (metres — try `3.5`) before your first real scan. Without it, the compliance verdict will be _"Pin the property line distance..."_ rather than a pass/fail.

Microphone and voice-in permissions arrive in a later change (`make-voice-stt-real`). Today the app talks to _you_, not the other way around.

## 9. Paste your Anthropic key (optional)

Only if you want reasoning suggestions.

1. Copy your `sk-ant-…` key.
2. Open **Settings** in the app.
3. Tap **Paste from clipboard** → **Save key**.

The key is stored in Android's secure store. Nothing leaves the phone.

## 10. You are done

- Tap **Scan** on the Capture tab and pan the phone slowly across a slope for three seconds. Listen for the spoken verdict.
- Add a sector in the **Sectors** tab. Log a harvest from the sector detail screen.
- Open the **Yield** tab — the year-over-year table fills with your first row the moment you log a harvest. Tap **Export yield history** to share the CSV to email or Drive.
- Flip the theme in **Settings**. The whole app re-colours live. Turn **Voice (TTS)** or **Haptics** off if you want a quiet device.

If anything breaks, read [HOW-TO.md](HOW-TO.md) or open an issue. Status of every feature lives in [docs/STATUS.md](docs/STATUS.md).

---

## Alternative: install via adb

If USB debugging is on and `adb` is on your computer, you can skip steps 3–6:

```bash
adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

`-r` replaces an existing install without wiping your data.

## Minimum Android version

Android 10 (API level 29) or newer. Earlier versions are untested.
