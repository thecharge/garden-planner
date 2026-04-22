import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useThemeTokens } from "./theme-provider";

const CAPTION_FONT_SIZE = 16;

export type CaptionProps = {
  readonly children: ReactNode;
};

export const Caption = ({ children }: CaptionProps) => {
  const tokens = useThemeTokens();
  return (
    <View
      style={{
        backgroundColor: tokens.colors.muted,
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
          color: tokens.colors.onMuted
        }}
      >
        {children}
      </Text>
    </View>
  );
};
