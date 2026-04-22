# Quickstart

From a clean machine to a working `.apk` on your phone, in ten steps. Plain language. Short sentences. Read top to bottom.

## Before you start

You need:

- A computer running macOS, Linux, or Windows (WSL is fine).
- An Android phone.
- An Anthropic API key. (The app runs local-first — the key only powers optional reasoning hints.)

## Step 1 — Install Node and pnpm

Use Node 20 or newer. Install pnpm.

```bash
# With nvm (recommended):
nvm install 20
nvm use 20
npm i -g pnpm@10
```

## Step 2 — Clone the repo

```bash
git clone https://github.com/YOUR-ORG/garden-planner.git
cd garden-planner
```

## Step 3 — Install dependencies

```bash
pnpm install
```

This builds the five `@garden/*` packages and the `apps/mobile` workspace.

## Step 4 — Verify the engine works

```bash
pnpm turbo run typecheck lint test
```

Every package should pass. If anything fails, fix it before moving on.

## Step 5 — Install the Expo CLI (optional but easier)

```bash
npm i -g eas-cli
```

## Step 6 — Build a preview `.apk`

From the repo root:

```bash
pnpm --filter apps/mobile run apk
```

This runs `eas build --platform android --profile preview` under the hood. The first build asks you to log in (`eas login`) and takes a few minutes. When it finishes, EAS gives you a download URL.

## Step 7 — Enable sideloading on your phone

On your Android phone:

1. Open **Settings → About phone**.
2. Tap **Build number** seven times. You are now a developer.
3. Back in **Settings**, open **System → Developer options** and turn on **USB debugging**.
4. In **Settings → Apps → Special access → Install unknown apps**, allow your browser (or your file manager) to install `.apk` files.

## Step 8 — Install the `.apk`

Download the URL from Step 6 to your phone and tap the file. Tap through the "install anyway" warnings.

On first launch, the app asks for **camera**, **microphone**, and **location** permissions. Grant them — the app cannot map your plot without the camera and sensors.

## Step 9 — Add your Anthropic key

1. Open the app. Tap the gear icon.
2. Paste your Anthropic API key under **Reasoning provider**.
3. The key is stored in the device secure-store. It never touches the app's SQLite database.

## Step 10 — First boundary walk and first scan

1. On the home screen, tap **Walk boundary**.
2. Walk to each corner of your plot. Tap **Drop pin** at each corner.
3. Tap **Done** when you have at least three corners.
4. Back on the home screen, point the camera at the slope you care about. Tap **Scan**.
5. Pan the phone slowly across the slope for three seconds. The phone vibrates once when the scan is captured.
6. The app speaks the verdict and shows a caption: green (compliant), yellow (warning), or red (rejection). Every verdict cites the rule that produced it.

You are running.

## What next

- Open the **Sectors** tab to carve your plot into beds, rows, and zones.
- Open the **Inventory** tab to log seeds, transplants, and harvests.
- Open the **Rotation** tab next spring to see what to plant where — with citations.
- Open the **Nutrient** tab to see the amendment and irrigation plan for each sector.

## If something breaks

- **The scan is low-confidence** — pan slower, hold the phone steadier, try again.
- **TalkBack reads something wrong** — file an issue. Accessibility is a release gate; regressions are fixed fast.
- **You need to change your Anthropic key** — Settings → Reasoning provider → **Clear key**, then paste a new one.

## Minimum Android version

Android 10 (API level 29) or newer. Earlier versions are untested.
