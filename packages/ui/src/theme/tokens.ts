import { FontFamily } from "@garden/config";

/** Theme tokens — neutral pastel light, neutral pastel dark, AAA high-contrast.
 *
 * Every foreground/background pair declared here is audited at CI time against
 * WCAG 2.2 contrast thresholds (AA for light + dark; AAA for high-contrast).
 * See `scripts/audit-contrast.ts`.
 */

export const ThemeId = {
  LightPastel: "light-pastel",
  DarkPastel: "dark-pastel",
  HighContrast: "high-contrast"
} as const;
export type ThemeId = (typeof ThemeId)[keyof typeof ThemeId];

export type ThemeTokens = {
  readonly id: ThemeId;
  readonly colors: {
    readonly background: string;
    readonly surface: string;
    readonly onSurface: string;
    readonly primary: string;
    readonly onPrimary: string;
    readonly secondary: string;
    readonly onSecondary: string;
    readonly success: string;
    readonly onSuccess: string;
    readonly warning: string;
    readonly onWarning: string;
    readonly error: string;
    readonly onError: string;
    readonly muted: string;
    readonly onMuted: string;
  };
  readonly typography: {
    readonly bodyFontFamily: FontFamily;
    readonly bodyFontSizeSp: number;
    readonly lineHeight: number;
    readonly letterSpacingEm: number;
  };
};

const BASE_BODY_FONT_SP = 18;
const BASE_LINE_HEIGHT = 1.55;
const BASE_LETTER_SPACING_EM = 0.02;

const baseTypography = {
  bodyFontFamily: FontFamily.Lexend,
  bodyFontSizeSp: BASE_BODY_FONT_SP,
  lineHeight: BASE_LINE_HEIGHT,
  letterSpacingEm: BASE_LETTER_SPACING_EM
} as const;

export const lightPastel: ThemeTokens = {
  id: ThemeId.LightPastel,
  colors: {
    background: "#F6F3EE",
    surface: "#FFFFFF",
    onSurface: "#1C1C1E",
    primary: "#3E6B45",
    onPrimary: "#FFFFFF",
    secondary: "#5A4A6F",
    onSecondary: "#FFFFFF",
    success: "#2F5E3D",
    onSuccess: "#FFFFFF",
    warning: "#7A5616",
    onWarning: "#FFFFFF",
    error: "#8A2E2E",
    onError: "#FFFFFF",
    muted: "#E7DFD2",
    onMuted: "#3A3A3C"
  },
  typography: baseTypography
};

export const darkPastel: ThemeTokens = {
  id: ThemeId.DarkPastel,
  colors: {
    background: "#1E1F22",
    surface: "#2A2C30",
    onSurface: "#F0ECE3",
    primary: "#A3C9A4",
    onPrimary: "#0F1F12",
    secondary: "#C5B2D6",
    onSecondary: "#1A1023",
    success: "#B0D9B5",
    onSuccess: "#0F1F12",
    warning: "#E6C38B",
    onWarning: "#1E1400",
    error: "#E09A9A",
    onError: "#1D0808",
    muted: "#3D3F44",
    onMuted: "#D5D0C4"
  },
  typography: baseTypography
};

export const highContrast: ThemeTokens = {
  id: ThemeId.HighContrast,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    onSurface: "#000000",
    primary: "#004D1A",
    onPrimary: "#FFFFFF",
    secondary: "#2E1A5A",
    onSecondary: "#FFFFFF",
    success: "#004D1A",
    onSuccess: "#FFFFFF",
    warning: "#5A3200",
    onWarning: "#FFFFFF",
    error: "#660000",
    onError: "#FFFFFF",
    muted: "#E8E8E8",
    onMuted: "#000000"
  },
  typography: baseTypography
};

export const themes: Readonly<Record<ThemeId, ThemeTokens>> = {
  [ThemeId.LightPastel]: lightPastel,
  [ThemeId.DarkPastel]: darkPastel,
  [ThemeId.HighContrast]: highContrast
};

/** The foreground/background pairs that the contrast auditor checks. */
export const declaredPairs: ReadonlyArray<{
  readonly fgKey: keyof ThemeTokens["colors"];
  readonly bgKey: keyof ThemeTokens["colors"];
  readonly label: string;
}> = [
  { fgKey: "onSurface", bgKey: "surface", label: "body on surface" },
  { fgKey: "onSurface", bgKey: "background", label: "body on background" },
  { fgKey: "onPrimary", bgKey: "primary", label: "text on primary" },
  { fgKey: "onSecondary", bgKey: "secondary", label: "text on secondary" },
  { fgKey: "onSuccess", bgKey: "success", label: "text on success" },
  { fgKey: "onWarning", bgKey: "warning", label: "text on warning" },
  { fgKey: "onError", bgKey: "error", label: "text on error" },
  { fgKey: "onMuted", bgKey: "muted", label: "text on muted" }
];
