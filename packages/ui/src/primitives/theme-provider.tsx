import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeId } from "@garden/config";
import { themes } from "../theme/tokens";
import type { ThemeTokens } from "../theme/tokens";

type ThemeContextValue = {
  readonly tokens: ThemeTokens;
  readonly themeId: ThemeId;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  readonly themeId?: ThemeId;
  readonly children: ReactNode;
};

/** Hosts the active theme tokens via React context. Deliberately does not wrap
 * the tree in `react-native-paper`'s Provider — our primitives use raw RN
 * components styled with tokens directly, so the whole tree is predictable.
 */
export const ThemeProvider = ({
  themeId = ThemeId.LightPastel,
  children
}: ThemeProviderProps) => {
  const tokens = themes[themeId];
  const value = useMemo(() => ({ tokens, themeId }), [tokens, themeId]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeTokens = (): ThemeTokens => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return themes[ThemeId.LightPastel];
  }
  return ctx.tokens;
};

export const useActiveThemeId = (): ThemeId => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return ThemeId.LightPastel;
  }
  return ctx.themeId;
};
