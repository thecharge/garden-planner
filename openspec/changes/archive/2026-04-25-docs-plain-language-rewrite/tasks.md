## 1. README.md — plain-language rewrite

- [x] 1.1 Replace the two-sentence opening paragraph with a plain-language version for growers (no jargon)
- [x] 1.2 Replace `<!-- TODO: add 30-second demo video -->` with visible "Video coming soon" text
- [x] 1.3 Replace "Protocol" with "scan result" / "the data captured when you scan your garden" throughout the feature list
- [x] 1.4 Replace "FAO-56 Penman-Monteith ET₀" with "a scientific formula (FAO-56) used to estimate how much water plants need"
- [x] 1.5 Replace "DeviceMotion" with "your phone's motion sensors (tilt and compass)"
- [x] 1.6 Replace "BYOK" with "paste your own Anthropic AI key"
- [x] 1.7 Replace "Liebig amendments" with "fertilizer and soil amendment suggestions"
- [x] 1.8 Replace "Reanimated worklet" / "Skia overlay" with "visual map overlay (coming soon)"
- [x] 1.9 Remove "Zustand" and "TanStack Query" from all user-facing sections
- [x] 1.10 Replace "local-first" with "works offline, no internet needed"
- [x] 1.11 Add a "Note: app data resets on reinstall until persistent storage ships" caveat to the features or limitations section
- [x] 1.12 Add a note that the Bulgarian locale is currently English placeholder text and that a native translation is in progress

## 2. HOW-TO.md — jargon cleanup

- [x] 2.1 Replace "Protocol" with "scan result" or "scan data" wherever it appears
- [x] 2.2 Replace "DeviceMotion" with "your phone's motion sensors (tilt and compass)"
- [x] 2.3 Replace any remaining technical terms using the approved jargon → plain-language mapping
- [x] 2.4 Verify all flow steps are still present and complete after edits

## 3. docs/STATUS.md — plain-language summary

- [x] 3.1 Add a "What works today" paragraph in plain language at the very top of the file (before all tables)
- [x] 3.2 Confirm all existing developer ground-truth rows are unchanged below the new summary

## 4. ACCESSIBILITY.md — reviewer ledger

- [x] 4.1 Add reviewer instructions before the ledger table explaining what each persona must test and how to record sign-off
- [x] 4.2 Fill the Dyslexic reader row with "Reviewer: TBD — sign-off required before public release"
- [x] 4.3 Fill the Low-vision reader row with "Reviewer: TBD — sign-off required before public release"
- [x] 4.4 Fill the Deaf/hard-of-hearing row with "Reviewer: TBD — sign-off required before public release"

## 5. Spell check

- [x] 5.1 Run `pnpm spell` and fix any new cspell errors introduced by the doc edits (add legitimate new words to `.cspell.json` if needed)
