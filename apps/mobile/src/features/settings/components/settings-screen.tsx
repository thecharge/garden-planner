import { View, Text } from "react-native";
import { getSettings } from "@/features/settings";

export const SettingsScreen = () => {
  const settings = getSettings();
  return (
    <View accessibilityLabel="Settings screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Settings</Text>
      <Text>Theme: {settings.themeId}</Text>
      <Text>Font: {settings.fontFamily}</Text>
      <Text>Captions: {settings.captionsMode}</Text>
      <Text>
        Provider: anthropic ({settings.anthropicKeyConfigured ? "configured" : "not configured"})
      </Text>
    </View>
  );
};
