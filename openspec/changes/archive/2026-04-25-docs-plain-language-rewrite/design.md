## Context

All user-facing documentation (README.md, HOW-TO.md, docs/STATUS.md, ACCESSIBILITY.md) was authored by engineers and contains unexplained technical jargon that is opaque to growers. The ACCESSIBILITY.md reviewer ledger — a hard release gate — is entirely empty. Bulgarian-speaking users cannot tell from the docs that the BG locale is currently English placeholder text.

This is a documentation-only change. No source code, no schemas, no data files are touched.

## Goals / Non-Goals

**Goals:**

- Replace all developer jargon in user-facing docs with the approved plain-language equivalents.
- Add an honest "data resets on reinstall" caveat in README until persistent SQLite ships.
- Replace the demo video TODO comment with a "video coming soon" note.
- Add a plain-language "What works today" paragraph at the top of docs/STATUS.md.
- Fill ACCESSIBILITY.md's three empty reviewer rows with "Reviewer: TBD — sign-off required before public release" and add clear reviewer instructions.
- Add a note in README that Bulgarian translations are currently placeholder English.
- Pass `pnpm spell` (cspell) after all edits.

**Non-Goals:**

- Changing CLAUDE.md (developer-facing; jargon is deliberate and appropriate).
- Touching any `.ts` / `.tsx` source files.
- Implementing actual Bulgarian translations.
- Replacing docs/app-flow.md content (developer narrative; jargon is acceptable there).
- Obtaining actual accessibility reviewer sign-offs (only the ledger structure and TBD entries are added).

## Decisions

### Decision 1: Edit files directly rather than regenerating them

**Rationale:** The docs are long-form prose. A surgical find-and-replace approach (read → apply jargon mapping → write) preserves all existing structure, links, and screenshot references with minimal diff noise. Full regeneration risks breaking anchors, badge URLs, and screenshot paths.

**Alternative considered:** Rewrite from scratch. Rejected because it would delete accurate sections and orphan existing screenshot references.

### Decision 2: Apply jargon mapping consistently across all user-facing docs

The approved mapping (from the change brief) is the single source of truth:
| Jargon | Plain language |
|---|---|
| Protocol | scan result / the data captured when you scan your garden |
| FAO-56 Penman-Monteith ET₀ | a scientific formula (FAO-56) used to estimate how much water plants need |
| DeviceMotion | your phone's motion sensors (tilt and compass) |
| BYOK | paste your own Anthropic AI key |
| Liebig amendments | fertilizer and soil amendment suggestions |
| Reanimated / Skia overlay | visual map overlay (coming soon) |
| Zustand / TanStack Query | remove from user docs entirely |
| local-first | works offline, no internet needed |
| MemoryRepository | never in user docs |

### Decision 3: STATUS.md — add summary section, leave body untouched

STATUS.md is developer ground-truth. Adding a "What works today" paragraph at the very top satisfies growers without changing the existing table rows that CI tooling and developers reference.

### Decision 4: ACCESSIBILITY.md — fill ledger with TBD entries and reviewer instructions

Adding placeholder entries (rather than leaving blank rows) makes the release-blocking status unambiguous to anyone who reads the file. Instructions tell future reviewers exactly what to verify and how to record sign-off.

## Risks / Trade-offs

- [Risk: cspell flags new plain-language terms] → Run `pnpm spell` after every file edit and add legitimate new words to `.cspell.json` if needed.
- [Risk: Jargon appears in contexts not covered by the mapping] → Do a full-text search of each file for the banned terms before marking a task done.
- [Risk: Screenshot links break] → Never remove or rename paths in `docs/screenshots/`; verify links after editing.

## Open Questions

None — scope is fully defined by the change brief.
