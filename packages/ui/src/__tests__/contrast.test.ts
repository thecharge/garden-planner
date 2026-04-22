import { AA, AAA, ContrastTarget, contrastRatio } from "../theme/contrast";
import { declaredPairs, themes, ThemeId } from "../theme/tokens";
import type { ThemeTokens } from "../theme/tokens";

describe("contrastRatio", () => {
  const cases: ReadonlyArray<readonly [fg: string, bg: string, min: number, max: number]> = [
    ["#000000", "#FFFFFF", 20.9, 21.1],
    ["#FFFFFF", "#FFFFFF", 0.99, 1.01],
    ["#000000", "#000000", 0.99, 1.01]
  ];
  it.each(cases)("%s on %s yields ratio in [%s, %s]", (fg, bg, lo, hi) => {
    const r = contrastRatio(fg, bg);
    expect(r).toBeGreaterThanOrEqual(lo);
    expect(r).toBeLessThanOrEqual(hi);
  });
});

type ThemePair = {
  readonly tokens: ThemeTokens;
  readonly pair: (typeof declaredPairs)[number];
  readonly requirement: typeof AA;
};

const flattenPairs = (): ReadonlyArray<readonly [string, ThemePair]> => {
  const out: [string, ThemePair][] = [];
  for (const tokens of Object.values(themes)) {
    const requirement = tokens.id === ThemeId.HighContrast ? AAA : AA;
    for (const pair of declaredPairs) {
      out.push([
        `${tokens.id}: ${pair.label} meets ${requirement.target}`,
        { tokens, pair, requirement }
      ]);
    }
  }
  return out;
};

describe("theme token contrast", () => {
  it.each(flattenPairs())("%s", (_label, { tokens, pair, requirement }) => {
    const fg = tokens.colors[pair.fgKey];
    const bg = tokens.colors[pair.bgKey];
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(requirement.normalMin);
  });

  it("ContrastTarget exports both tiers", () => {
    expect(ContrastTarget.AA).toBe("AA");
    expect(ContrastTarget.AAA).toBe("AAA");
  });
});
