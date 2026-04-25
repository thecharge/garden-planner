import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SummaryType } from "@garden/config";
import type { ThemeTokens } from "../theme/tokens";
import { useThemeTokens } from "./theme-provider";

const CAPTION_FONT_SIZE = 16;

export type CaptionProps = {
  readonly children: ReactNode;
  readonly variant?: SummaryType;
};

const palette = (variant: SummaryType | undefined, tokens: ThemeTokens) => {
  if (variant === SummaryType.Success) {
    return { bg: tokens.colors.success, fg: tokens.colors.onSuccess };
  }
  if (variant === SummaryType.Warning) {
    return { bg: tokens.colors.warning, fg: tokens.colors.onWarning };
  }
  if (variant === SummaryType.ActionRequired) {
    return { bg: tokens.colors.secondary, fg: tokens.colors.onSecondary };
  }
  if (variant === SummaryType.Rejection) {
    return { bg: tokens.colors.error, fg: tokens.colors.onError };
  }
  return { bg: tokens.colors.muted, fg: tokens.colors.onMuted };
};

export const Caption = ({ children, variant }: CaptionProps) => {
  const tokens = useThemeTokens();
  const { bg, fg } = palette(variant, tokens);
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10
      }}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontFamily: tokens.typography.bodyFontFamily,
          fontSize: CAPTION_FONT_SIZE,
          lineHeight: CAPTION_FONT_SIZE * tokens.typography.lineHeight,
          color: fg,
          flexShrink: 1,
          minWidth: 0
        }}
      >
        {children}
      </Text>
    </View>
  );
};
