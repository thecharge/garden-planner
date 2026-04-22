import { en } from "../locales/en";
import { bg } from "../locales/bg";

const collectKeys = (obj: unknown, prefix = ""): ReadonlyArray<string> => {
  if (typeof obj !== "object" || obj === null) {
    return [prefix];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    out.push(...collectKeys(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
};

describe("locale files", () => {
  it("BG mirrors every EN key exactly", () => {
    expect(collectKeys(bg).sort()).toEqual(collectKeys(en).sort());
  });

  it("BG values default to the EN value (no machine-translated stubs)", () => {
    // If a BG key has been translated in the future, this test should be updated
    // to carve it out — the point is to make missing translator sign-offs visible.
    const enKeys = collectKeys(en);
    for (const key of enKeys) {
      const path = key.split(".");
      const enVal = path.reduce<unknown>((acc, p) => (acc as Record<string, unknown>)?.[p], en);
      const bgVal = path.reduce<unknown>((acc, p) => (acc as Record<string, unknown>)?.[p], bg);
      expect(bgVal).toBe(enVal);
    }
  });
});
