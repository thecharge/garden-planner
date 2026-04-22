#!/usr/bin/env node
import { AA, AAA, ThemeId, contrastRatio } from "@garden/ui";
import { declaredPairs, themes } from "../theme/tokens";
import type { ContrastRequirement } from "../theme/contrast";
import type { ThemeTokens } from "../theme/tokens";

type Failure = {
  readonly theme: string;
  readonly pair: string;
  readonly ratio: number;
  readonly required: number;
};

const checkOneTheme = (
  tokens: ThemeTokens,
  requirement: ContrastRequirement
): ReadonlyArray<Failure> => {
  const out: Failure[] = [];
  for (const pair of declaredPairs) {
    const fg = tokens.colors[pair.fgKey];
    const bg = tokens.colors[pair.bgKey];
    const ratio = contrastRatio(fg, bg);
    if (ratio < requirement.normalMin) {
      out.push({
        theme: tokens.id,
        pair: pair.label,
        ratio: Number(ratio.toFixed(2)),
        required: requirement.normalMin
      });
    }
  }
  return out;
};

const run = (): number => {
  const failures: Failure[] = [];
  for (const tokens of Object.values(themes)) {
    const requirement = tokens.id === ThemeId.HighContrast ? AAA : AA;
    failures.push(...checkOneTheme(tokens, requirement));
  }
  if (failures.length === 0) {
    console.log("All theme foreground/background pairs meet their contrast requirement.");
    return 0;
  }
  for (const f of failures) {
    console.error(`FAIL ${f.theme} — ${f.pair}: ratio ${f.ratio} < required ${f.required}`);
  }
  console.error(`\n${failures.length} pair(s) below threshold — failing CI.`);
  return 1;
};

process.exit(run());
