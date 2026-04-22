import { useState } from "react";
import type { KeyboardTypeOptions } from "react-native";
import { TextInput as RNTextInput, View } from "react-native";
import { Body } from "./body";
import { useThemeTokens } from "./theme-provider";

const BORDER_IDLE = 1;
const BORDER_FOCUS = 2;
const PADDING_V = 12;
const PADDING_H = 14;
const RADIUS = 10;

export const AutoCapitalize = {
  None: "none",
  Sentences: "sentences",
  Words: "words",
  Characters: "characters"
} as const;
export type AutoCapitalize = (typeof AutoCapitalize)[keyof typeof AutoCapitalize];

export type TextInputProps = {
  readonly value: string;
  readonly onChangeText: (next: string) => void;
  readonly accessibilityLabel: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly secureTextEntry?: boolean;
  readonly keyboardType?: KeyboardTypeOptions;
  readonly maxLength?: number;
  readonly editable?: boolean;
  readonly autoCapitalize?: AutoCapitalize;
};

export const TextInput = ({
  value,
  onChangeText,
  accessibilityLabel,
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType,
  maxLength,
  editable = true,
  autoCapitalize = AutoCapitalize.Sentences
}: TextInputProps) => {
  const tokens = useThemeTokens();
  const [focused, setFocused] = useState(false);

  const borderColor = focused ? tokens.colors.primary : tokens.colors.muted;
  const borderWidth = focused ? BORDER_FOCUS : BORDER_IDLE;

  return (
    <View>
      {label ? <Body muted>{label}</Body> : null}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={accessibilityLabel}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.onMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: tokens.colors.surface,
          color: tokens.colors.onSurface,
          borderColor,
          borderWidth,
          borderRadius: RADIUS,
          paddingVertical: PADDING_V,
          paddingHorizontal: PADDING_H,
          marginTop: label ? 4 : 0,
          fontFamily: tokens.typography.bodyFontFamily,
          fontSize: tokens.typography.bodyFontSizeSp,
          lineHeight: tokens.typography.bodyFontSizeSp * tokens.typography.lineHeight
        }}
      />
    </View>
  );
};
