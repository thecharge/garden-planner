import type { ReactNode } from "react";
import { Text } from "react-native";
import { useThemeTokens } from "./theme-provider";

export type BodyProps = {
  readonly children: ReactNode;
  readonly muted?: boolean;
};

export const Body = ({ children, muted = false }: BodyProps) => {
  const tokens = useThemeTokens();
  return (
    <Text
      style={{
        fontFamily: tokens.typography.bodyFontFamily,
        fontSize: tokens.typography.bodyFontSizeSp,
        lineHeight: tokens.typography.bodyFontSizeSp * tokens.typography.lineHeight,
        letterSpacing: tokens.typography.letterSpacingEm,
        color: muted ? tokens.colors.onMuted : tokens.colors.onSurface
      }}
    >
      {children}
    </Text>
  );
};
