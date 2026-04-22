import type { ReactNode } from "react";
import { View } from "react-native";
import { useThemeTokens } from "./theme-provider";

export type CardProps = {
  readonly children: ReactNode;
  readonly accessibilityLabel?: string;
};

export const Card = ({ children, accessibilityLabel }: CardProps) => {
  const tokens = useThemeTokens();
  return (
    <View
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: tokens.colors.muted,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1
      }}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
    >
      {children}
    </View>
  );
};
