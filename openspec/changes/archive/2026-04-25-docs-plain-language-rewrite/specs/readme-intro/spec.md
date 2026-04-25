## MODIFIED Requirements

### Requirement: README opens with a plain-language two-sentence description

The first non-heading content in `README.md` SHALL be two sentences in plain language that a non-technical gardener can understand, explaining what the app is and who it is for. No developer jargon SHALL appear in these two sentences.

#### Scenario: README starts with plain-language intro

- **WHEN** `README.md` is opened
- **THEN** the first paragraph after the `# Garden Planner` heading SHALL contain no technical jargon, no command-line snippets, and SHALL be at most two sentences

### Requirement: README includes a video or visible placeholder

Immediately after the plain-language intro, `README.md` SHALL contain either an embedded GIF/video or a visible user-facing note ("Video coming soon") so readers see a clear message rather than an invisible HTML comment.

#### Scenario: Video placeholder is visible to readers

- **WHEN** `README.md` is rendered
- **THEN** the reader SHALL see "Video coming soon" as visible text rather than a hidden HTML comment

## ADDED Requirements

### Requirement: README notes that Bulgarian translation is incomplete

`README.md` SHALL include a note that the Bulgarian locale is currently placeholder English text and that a native-language translation is in progress.

#### Scenario: BG language disclaimer is present

- **WHEN** `README.md` is read by a Bulgarian-speaking user
- **THEN** a note SHALL inform them that the app is not yet available in Bulgarian and that a translation is planned
