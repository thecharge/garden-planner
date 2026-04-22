import type { ReactNode } from "react";
import { Text } from "react-native";
import { useThemeTokens } from "./theme-provider";

const HEADING_FONT_SIZE = 28;
const HEADING_LINE_HEIGHT = 36;

export type HeadingProps = {
  readonly children: ReactNode;
};

export const Heading = ({ children }: HeadingProps) => {
  const tokens = useThemeTokens();
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: tokens.typography.bodyFontFamily,
        fontSize: HEADING_FONT_SIZE,
        lineHeight: HEADING_LINE_HEIGHT,
        color: tokens.colors.onSurface,
        fontWeight: "700",
        marginBottom: 8
      }}
    >
      {children}
    </Text>
  );
};
