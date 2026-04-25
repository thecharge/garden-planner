## MODIFIED Requirements

### Requirement: Reviewer sign-off ledger

`ACCESSIBILITY.md` SHALL contain a reviewer sign-off ledger with one row per accessibility persona (Dyslexic reader, Low-vision reader, Deaf/hard-of-hearing). Each row SHALL be filled with either a named reviewer and date, or "Reviewer: TBD — sign-off required before public release". The ledger SHALL include clear instructions for future reviewers explaining what to verify and how to record sign-off. Public release SHALL remain blocked until all three rows have a named reviewer and date.

#### Scenario: Empty ledger rows are replaced with TBD entries

- **WHEN** `ACCESSIBILITY.md` is opened
- **THEN** every reviewer ledger row SHALL contain either a named reviewer or the text "Reviewer: TBD — sign-off required before public release"
- **AND** no row SHALL be left entirely blank

#### Scenario: Reviewer instructions are present

- **WHEN** a new reviewer opens `ACCESSIBILITY.md`
- **THEN** they SHALL find clear written instructions explaining what each persona must test and how to record their sign-off in the table
