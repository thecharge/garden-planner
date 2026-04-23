import { View } from "react-native";
import { useStore } from "zustand";
import { Caption, useThemeTokens } from "@garden/ui";
import { captionStore } from "./caption-store";

export const CaptionBar = () => {
  const text = useStore(captionStore, (s) => s.text);
  const tokens = useThemeTokens();
  if (!text) {
    return null;
  }
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Caption: ${text}`}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 88,
        padding: 12,
        borderRadius: 10,
        backgroundColor: tokens.colors.surface,
        borderWidth: 1,
        borderColor: tokens.colors.muted
      }}
    >
      <Caption>{text}</Caption>
    </View>
  );
};
