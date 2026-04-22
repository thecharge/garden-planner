import { ThemeId } from "./tokens";
import type { ThemeTokens } from "./tokens";

/** Map a `ThemeTokens` set to a react-native-paper MD3-compatible theme object.
 *
 * We don't import Paper here — the mobile app assembles the actual `PaperProvider`
 * theme using this shape. That keeps @garden/ui lean and avoids forcing Paper to
 * be resolvable during Node tests.
 */
export type PaperMd3Theme = {
  readonly dark: boolean;
  readonly colors: {
    readonly primary: string;
    readonly onPrimary: string;
    readonly secondary: string;
    readonly onSecondary: string;
    readonly background: string;
    readonly onBackground: string;
    readonly surface: string;
    readonly onSurface: string;
    readonly surfaceVariant: string;
    readonly onSurfaceVariant: string;
    readonly error: string;
    readonly onError: string;
  };
  readonly fonts: Readonly<
    Record<
      string,
      { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number }
    >
  >;
};

const fontVariants = (tokens: ThemeTokens): PaperMd3Theme["fonts"] => {
  const body = {
    fontFamily: tokens.typography.bodyFontFamily,
    fontSize: tokens.typography.bodyFontSizeSp,
    lineHeight: tokens.typography.bodyFontSizeSp * tokens.typography.lineHeight,
    letterSpacing: tokens.typography.letterSpacingEm
  };
  return {
    bodySmall: body,
    bodyMedium: body,
    bodyLarge: body,
    labelSmall: body,
    labelMedium: body,
    labelLarge: body,
    titleSmall: { ...body, fontSize: 20 },
    titleMedium: { ...body, fontSize: 22 },
    titleLarge: { ...body, fontSize: 26 }
  };
};

export const toPaperTheme = (tokens: ThemeTokens): PaperMd3Theme => ({
  dark: tokens.id === ThemeId.DarkPastel,
  colors: {
    primary: tokens.colors.primary,
    onPrimary: tokens.colors.onPrimary,
    secondary: tokens.colors.secondary,
    onSecondary: tokens.colors.onSecondary,
    background: tokens.colors.background,
    onBackground: tokens.colors.onSurface,
    surface: tokens.colors.surface,
    onSurface: tokens.colors.onSurface,
    surfaceVariant: tokens.colors.muted,
    onSurfaceVariant: tokens.colors.onMuted,
    error: tokens.colors.error,
    onError: tokens.colors.onError
  },
  fonts: fontVariants(tokens)
});
