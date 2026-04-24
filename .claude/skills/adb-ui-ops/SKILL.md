---
name: adb-ui-ops
description: Drive the running Expo app on a device or emulator — deep-link to a tab, tap a button by its accessibility label, capture a proof screenshot, grant runtime perms, watch for crashes. Use this whenever you are verifying a UI change or capturing evidence for docs. Never guess pixel coords.
---

## Purpose

Any UI change must be proved on a device. Proof means a screenshot under `docs/screenshots/` captured after the change is actually running, not a mock or a component test. Pixel-tap arithmetic from a scaled screenshot routinely misses the target; `scripts/adb-ui.sh` replaces that with uiautomator-resolved bounds and deep-link routing.

## Pre-flight

A device or emulator must be attached.

```bash
. ./scripts/setup-env.sh
adb devices                      # expect at least one "device" row
./scripts/launch-emulator.sh     # boot the AVD if empty
```

If this is a fresh install, grant runtime perms so feature-gated UI (capture, location-based recommendations) is exercisable:

```bash
scripts/adb-ui.sh grant
```

## Subcommands

```bash
scripts/adb-ui.sh tap "<label>"          # tap by content-desc or visible text (substring match)
scripts/adb-ui.sh tap-tab <name>         # deep-link the bottom tab: capture|sectors|yield|rotation|nutrient|inventory|settings
scripts/adb-ui.sh shot <slug>            # → docs/screenshots/<slug>.png   (proof, commit it)
scripts/adb-ui.sh shot-tmp <slug>        # → /tmp/<slug>.png                (scratch, don't commit)
scripts/adb-ui.sh grant                  # grant camera + location runtime perms
scripts/adb-ui.sh alive                  # prints "PID=<n>" or exits 1 if crashed
scripts/adb-ui.sh deep-link /sector/abc  # gardenplanner:///sector/abc
scripts/adb-ui.sh watch [seconds]        # foreground crash watcher (default 60s)
scripts/adb-ui.sh size                   # native display WxH
scripts/adb-ui.sh dump                   # writes /tmp/ui.xml (inspect with grep)
```

Everything auto-targets the first online device (phone > emulator). Force a specific one with `ANDROID_SERIAL=emulator-5554 scripts/adb-ui.sh ...`.

## When to use which label

- **`accessibilityLabel`** on a primitive → matches `content-desc` in uiautomator. Prefer this: it's the a11y contract, tested against screen readers.
- **Visible text** on a `<Button>` or `<Text>` → matches `text`. Fine when no explicit label is set.
- Tabs emit a PUA glyph from Feather Icons in their `content-desc` (`<U+F17D>, Sectors` etc). The resolver falls back to substring match, so `tap-tab sectors` routes via deep-link directly — faster than hitting a 154-pixel-wide tab target.

If `tap` cannot resolve a label, run `scripts/adb-ui.sh dump` and `grep -oE '(content-desc|text)="[^"]*"' /tmp/ui.xml` to see what the node tree actually exposes.

## Proving a UI change

Canonical flow for "verify Capture tab survives an opt-in viewfinder cycle and OOM does not trip":

```bash
scripts/adb-ui.sh watch 120 &                  # background crash watch (optional)
scripts/adb-ui.sh tap-tab capture
scripts/adb-ui.sh shot capture-default         # closed viewfinder
scripts/adb-ui.sh tap "Open viewfinder"
scripts/adb-ui.sh shot capture-viewfinder-open
scripts/adb-ui.sh tap-tab sectors              # focus-unmount test
scripts/adb-ui.sh tap-tab capture              # remount
scripts/adb-ui.sh tap "Scan"
sleep 4                                        # motion-capture window + verdict render
scripts/adb-ui.sh shot capture-verdict
scripts/adb-ui.sh alive                        # must print a PID, not exit 1
```

Commit the three `docs/screenshots/capture-*.png` files alongside the code change. Reference them in STATUS.md under the row they prove.

## Hard rules

- **Never** hand-guess tap coordinates from a screenshot. The raw display is 1080×2400; the viewer image is scaled. Use `tap` (label-based) or `deep-link` (route-based).
- **Never** commit to `docs/screenshots/` an empty or <30 KB PNG. Under 30 KB almost always means black screen / pre-splash / crash. Inspect with `Read` before committing.
- **Never** skip `alive` after a stress sequence. A screenshot can look fine while the process has just been OOM-killed and relaunched with default state — same PID check catches both.
- **Always** run `scripts/adb-ui.sh grant` on a fresh install before asserting UI that depends on camera/location perms. Otherwise you'll be screenshotting the permissions-rationale screen.

## Troubleshooting

- **"No UI node with content-desc or text containing 'X'"** → the label isn't exposed. Either it's pure decoration (no `accessibilityLabel`), or the screen you think you're on is a different one. Run `dump` and grep.
- **Tap lands but UI doesn't change** → the target is occluded by a translucent overlay (snackbar, modal). Dismiss it first, or dump and look for overlapping bounds.
- **Screenshot is 23 KB-ish and all black** → the GPU pipeline hasn't rendered yet (splash) or the app died. Run `alive`; if dead, check `scripts/adb-ui.sh watch 5`.
- **Feather tab glyph breaks grep** → known quirk. The substring-match fallback in `resolve_bounds` handles it; if you're writing a one-off, prefer `tap-tab` (deep-link) over `tap ", Capture"`.
