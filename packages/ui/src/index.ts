export { ThemeId, themes, lightPastel, darkPastel, highContrast, declaredPairs } from "./theme/tokens";
export type { ThemeTokens } from "./theme/tokens";

export { ContrastTarget, contrastRatio, AA, AAA } from "./theme/contrast";
export type { ContrastRequirement } from "./theme/contrast";

export { toPaperTheme } from "./theme/paper-theme";
export type { PaperMd3Theme } from "./theme/paper-theme";

export { announce } from "./announce/announce";
export type { AnnounceChannels, AnnounceOptions } from "./announce/announce";

export { hapticPatternFor } from "./announce/haptic-patterns";
export type { HapticPattern } from "./announce/haptic-patterns";

// Primitive components (Paper-wrapped).
export { ThemeProvider, useThemeTokens, useActiveThemeId } from "./primitives/theme-provider";
export type { ThemeProviderProps } from "./primitives/theme-provider";
export { Screen } from "./primitives/screen";
export type { ScreenProps } from "./primitives/screen";
export { Heading } from "./primitives/heading";
export type { HeadingProps } from "./primitives/heading";
export { Body } from "./primitives/body";
export type { BodyProps } from "./primitives/body";
export { Caption } from "./primitives/caption";
export type { CaptionProps } from "./primitives/caption";
export { Button, ButtonMode } from "./primitives/button";
export type { GardenButtonProps } from "./primitives/button";
export { Card } from "./primitives/card";
export type { CardProps } from "./primitives/card";
export { ListItem } from "./primitives/list-item";
export type { ListItemProps } from "./primitives/list-item";
