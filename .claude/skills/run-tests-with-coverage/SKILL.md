---
name: run-tests-with-coverage
description: Run the full Turbo test matrix with Jest coverage and surface the per-package HTML report paths. Use when the user asks "what's our coverage" or "run tests with coverage".
---

## Purpose

Produce fresh coverage reports across every workspace and tell the user where to open them.

## Steps

1. Run:
   ```bash
   pnpm test:coverage
   ```
2. List the generated reports:
   ```bash
   find . -maxdepth 4 -name "lcov-report" -type d | sort
   ```
3. Report to the user the totals Jest printed at the end of each package's run (the "All files" summary lines).
4. Point them at a specific HTML if they want a deep dive:
   ```
   open packages/<pkg>/coverage/lcov-report/index.html
   ```

## Notes

- No threshold is enforced in CI — the reports are for visibility. Don't panic over low branch coverage in UI packages; those tests run on a real device per `apps/mobile/DEVICE-TESTING.md`.
- Coverage reports are in `.gitignore`; they rebuild on every run.
