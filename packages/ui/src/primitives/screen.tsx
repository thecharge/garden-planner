import type { ReactNode } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeTokens } from "./theme-provider";

const HORIZONTAL_PADDING = 16;
const VERTICAL_PADDING = 16;

export type ScreenProps = {
  readonly children: ReactNode;
  readonly scroll?: boolean;
  readonly accessibilityLabel?: string;
};

export const Screen = ({ children, scroll = true, accessibilityLabel }: ScreenProps) => {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const statusBarHeight = StatusBar.currentHeight ?? 0;
  const topPadding = Math.max(insets.top, statusBarHeight) + VERTICAL_PADDING;

  const content = (
    <View style={{ gap: 12, paddingHorizontal: HORIZONTAL_PADDING, paddingTop: topPadding, paddingBottom: VERTICAL_PADDING }}>
      {children}
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: tokens.colors.background }}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
    >
      {scroll ? <ScrollView style={{ flex: 1 }}>{content}</ScrollView> : content}
    </View>
  );
};
