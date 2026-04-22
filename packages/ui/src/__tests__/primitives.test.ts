/** Smoke test: the primitive modules load and export the expected names.
 *
 * We import from relative paths (not "@garden/ui") because the barrel
 * transitively loads Paper components whose native deps can't run in Node.
 * Full Paper-tree rendering tests are tracked as `make-jest-expo-runner`.
 */
import { ThemeId } from "../theme/tokens";
import { ButtonMode } from "../primitives/button-mode";

describe("@garden/ui primitive constants", () => {
  it("ButtonMode is a const object with three modes", () => {
    expect(ButtonMode.Primary).toBe("primary");
    expect(ButtonMode.Secondary).toBe("secondary");
    expect(ButtonMode.Text).toBe("text");
  });

  it("ThemeId exposes the three declared themes", () => {
    expect(ThemeId.LightPastel).toBe("light-pastel");
    expect(ThemeId.DarkPastel).toBe("dark-pastel");
    expect(ThemeId.HighContrast).toBe("high-contrast");
  });
});
