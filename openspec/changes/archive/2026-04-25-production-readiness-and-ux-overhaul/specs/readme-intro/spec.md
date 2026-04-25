## ADDED Requirements

### Requirement: README opens with a plain-language two-sentence description

The first non-heading content in `README.md` SHALL be two sentences in plain language that a non-technical gardener can understand, explaining what the app is and who it is for.

#### Scenario: README starts with plain-language intro

- **WHEN** `README.md` is opened
- **THEN** the first paragraph after the `# Garden Planner` heading SHALL contain no technical jargon, no command-line snippets, and SHALL be at most two sentences

### Requirement: README includes a video or GIF embed placeholder

Immediately after the plain-language intro, `README.md` SHALL contain either an embedded GIF/video or a clearly labelled placeholder `<!-- TODO: add 30-second demo video -->` so contributors know to add one.

#### Scenario: Video placeholder present

- **WHEN** `README.md` is read
- **THEN** a video embed or `<!-- TODO: add 30-second demo video -->` comment SHALL appear before the "Run it" section

### Requirement: README has a "What can I do today?" user-facing section before technical docs

A `## What can I do today?` section SHALL appear before the "Run it" or "Architecture" sections and SHALL list the shipped user-facing capabilities in plain language using the ✅ / 🟡 / 🔴 legend.

#### Scenario: User-facing section precedes developer docs

- **WHEN** README headings are listed in order
- **THEN** `## What can I do today?` SHALL appear before `## Run it`
- **AND** SHALL reference at least three ✅ shipped capabilities in user-facing language (e.g., "photograph your plot", "log a harvest", "get a rotation recommendation")
