import { lightPastel, darkPastel, highContrast } from "../theme/tokens";
import { toPaperTheme } from "../theme/paper-theme";

describe("toPaperTheme", () => {
  const cases = [
    ["light-pastel", lightPastel, false],
    ["dark-pastel", darkPastel, true],
    ["high-contrast", highContrast, false]
  ] as const;

  it.each(cases)("%s maps to MD3 shape with expected dark flag", (_name, tokens, expectedDark) => {
    const mapped = toPaperTheme(tokens);
    expect(mapped.dark).toBe(expectedDark);
    expect(mapped.colors.primary).toBe(tokens.colors.primary);
    expect(mapped.colors.background).toBe(tokens.colors.background);
    expect(mapped.fonts.bodyMedium?.fontFamily).toBe(tokens.typography.bodyFontFamily);
    expect(mapped.fonts.bodyMedium?.fontSize).toBe(tokens.typography.bodyFontSizeSp);
  });

  it("letterSpacing is em × fontSize, not the raw em value", () => {
    const mapped = toPaperTheme(lightPastel);
    const expected = lightPastel.typography.letterSpacingEm * lightPastel.typography.bodyFontSizeSp;
    expect(mapped.fonts.bodyMedium?.letterSpacing).toBe(expected);
    expect(mapped.fonts.bodyMedium?.letterSpacing).not.toBe(lightPastel.typography.letterSpacingEm);
  });
});
