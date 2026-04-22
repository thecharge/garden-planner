/** Theme bridge. Features import from `@/core/theme` so swapping the underlying
 * source (currently `@garden/ui`) is a one-file change.
 */
export { themes, lightPastel, darkPastel, highContrast, toPaperTheme } from "@garden/ui";
export type { ThemeId, ThemeTokens, PaperMd3Theme } from "@garden/ui";
