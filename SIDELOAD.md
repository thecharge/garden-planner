# Sideload the Garden Planner on your Android phone

Ten steps, plain language, in order. No developer account. No Play Store.

If you built the APK yourself via `pnpm apk`, your file is under `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. Otherwise someone handed you an `.apk` — the file you need to install.

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

The app asks for:

- **Camera** — maps the slope.
- **Microphone** — reads spoken commands (when voice-in lands).
- **Location** — ties data to your plot.

Tap **Allow** for each.

## 9. Paste your Anthropic key (optional)

Only if you want reasoning suggestions.

1. Copy your `sk-ant-…` key.
2. Open **Settings** in the app.
3. Tap **Paste from clipboard** → **Save key**.

The key is stored in Android's secure store. Nothing leaves the phone.

## 10. You are done

- Add a sector in the **Sectors** tab.
- Log a harvest from the sector detail screen.
- Change the theme in **Settings**.

If anything breaks, read [HOW-TO.md](HOW-TO.md) or open an issue.

---

## Alternative: install via adb

If USB debugging is on and `adb` is on your computer, you can skip steps 3–6:

```bash
adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

`-r` replaces an existing install without wiping your data.

## Minimum Android version

Android 10 (API level 29) or newer. Earlier versions are untested.
