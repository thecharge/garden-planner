## Why

Our documentation was written by developers for developers. Growers — the people who actually use this app — encounter unexplained jargon ("Protocol", "FAO-56 ET₀", "BYOK") that makes the app feel inaccessible. The ACCESSIBILITY.md reviewer ledger is entirely blank, which blocks public release per our own policy.

## What Changes

- **README.md**: Rewrite opening for growers; replace all developer jargon in the feature list with plain equivalents; add honest "data resets on reinstall" caveat (until persistent SQLite ships); replace the demo video TODO placeholder with "video coming soon"; add a note that Bulgarian translation is not yet complete.
- **HOW-TO.md**: Replace remaining technical terms ("Protocol", "DeviceMotion", etc.) with the approved plain-language equivalents while preserving all flow steps.
- **docs/STATUS.md**: Add a one-paragraph plain-language "What works today" summary at the very top; leave all existing developer ground-truth rows untouched.
- **ACCESSIBILITY.md**: Fill the three empty reviewer ledger rows with "Reviewer: TBD — sign-off required before public release" and add clear instructions for future reviewers on what to check and how to record sign-off.

No `.ts`/`.tsx` source files are touched. `CLAUDE.md` is not changed (developer-facing; jargon is appropriate there).

## Capabilities

### New Capabilities

- `plain-language-docs`: User-facing documentation written at a grower's reading level — no unexplained technical jargon, honest status disclosures, and a filled accessibility reviewer ledger.

### Modified Capabilities

- `accessibility`: The reviewer sign-off ledger in ACCESSIBILITY.md is changing from empty to "TBD with instructions" — this is a requirement-level change (release gate behaviour).
- `readme-intro`: The README introduction is being rewritten to target growers rather than developers.
- `i18n`: A note is being added to README clarifying that Bulgarian translations are currently placeholder English, so Bulgarian-speaking users are not misled.

## Impact

- Documentation files only: `README.md`, `HOW-TO.md`, `docs/STATUS.md`, `ACCESSIBILITY.md`.
- No code changes; no API changes; no dependency changes.
- Existing screenshot references in docs must remain intact.
- `pnpm spell` (cspell) must pass after edits.
