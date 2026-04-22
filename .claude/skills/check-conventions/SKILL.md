---
name: check-conventions
description: Run every pre-PR gate in one shot. Use when the user wants to verify "everything is green" before pushing, or when they ask to "check conventions" / "run the full gate".
---

## Purpose

One command that runs the same set of checks CI will run, so a PR can be opened with confidence.

## The one-liner

```bash
pnpm check:all
```

That expands to:
- `pnpm typecheck` — TSC across every package.
- `pnpm lint` — ESLint across every package (including the custom string-literal-union ban).
- `pnpm test` — Jest across every package.
- `pnpm spell` — cspell over `.ts/.tsx/.md`.
- `pnpm audit:citations` — fail if any engine data entry lacks `sourceCitation`.
- `pnpm audit:contrast` — fail if any theme token pair drops below WCAG AA (AAA for `high-contrast`).

If anything fails, fix it locally **before** pushing. CI won't merge a red branch.

## Extra (non-gate, helpful)

```bash
pnpm test:coverage          # fresh HTML reports
pnpm audit:deps             # pnpm audit at high+ level; non-blocking in CI
```

## Residual union grep (backstop)

The custom ESLint rule catches string-literal unions at edit time. A grep backstop confirms zero residuals exist in non-test code:

```bash
grep -rn -E '= "[^"]+" \| "' packages apps --include='*.ts' --include='*.tsx' \
  | grep -v __tests__ | grep -v node_modules
```

Expected output: empty.

## Common fixes

- **Union-ban error** — convert to `const X = {...} as const; type X = typeof X[keyof typeof X]`; update callsites.
- **cspell unknown word** — add to `cspell.json` `words` list if the word is legitimately domain-specific (botanical family, SDK name, etc.).
- **Missing citation** — every entry in `packages/engine/src/data/*.ts`, `rotation/*.ts`, `nutrient/*.ts` must carry a `sourceCitation: "..."` field.
- **Contrast regression** — re-check the offending pair in `packages/ui/src/theme/tokens.ts`; darken the foreground until `audit:contrast` passes.
