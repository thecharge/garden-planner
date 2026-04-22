import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useThemeTokens } from "./theme-provider";
import { ButtonMode } from "./button-mode";

export { ButtonMode } from "./button-mode";

export type GardenButtonProps = {
  readonly children: ReactNode;
  readonly onPress: () => void;
  readonly mode?: ButtonMode;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
};

export const Button = ({
  children,
  onPress,
  mode = ButtonMode.Primary,
  disabled = false,
  accessibilityLabel
}: GardenButtonProps) => {
  const tokens = useThemeTokens();
  const isPrimary = mode === ButtonMode.Primary;
  const bg = isPrimary ? tokens.colors.primary : "transparent";
  const fg = isPrimary ? tokens.colors.onPrimary : tokens.colors.primary;
  const borderColor = tokens.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        alignSelf: "stretch"
      })}
    >
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 18,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: isPrimary ? 0 : 2,
          borderColor
        }}
      >
        <Text
          style={{
            color: fg,
            fontFamily: tokens.typography.bodyFontFamily,
            fontSize: tokens.typography.bodyFontSizeSp,
            fontWeight: "600"
          }}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
};
