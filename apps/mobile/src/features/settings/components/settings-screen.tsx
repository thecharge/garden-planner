import { useStore } from "zustand";
import { FontFamily, ThemeId } from "@garden/config";
import { Body, Button, ButtonMode, Card, Heading, ListItem, Screen } from "@garden/ui";
import { CaptionsMode, settingsStore } from "@/features/settings";
import { AnthropicKeyField } from "@/features/settings/components/anthropic-key-field";

const themeLabel = (id: ThemeId): string => {
  if (id === ThemeId.LightPastel) {
    return "Light pastel";
  }
  if (id === ThemeId.DarkPastel) {
    return "Dark pastel";
  }
  return "High contrast (AAA)";
};

const captionsLabel = (m: CaptionsMode): string => {
  if (m === CaptionsMode.AlwaysOn) {
    return "Always on";
  }
  if (m === CaptionsMode.On) {
    return "On";
  }
  return "Off";
};

export const SettingsScreen = () => {
  const themeId = useStore(settingsStore, (s) => s.themeId);
  const fontFamily = useStore(settingsStore, (s) => s.fontFamily);
  const captionsMode = useStore(settingsStore, (s) => s.captionsMode);
  const anthropicKeyConfigured = useStore(settingsStore, (s) => s.anthropicKeyConfigured);

  return (
    <Screen accessibilityLabel="Settings screen">
      <Heading>Settings</Heading>
      <Body muted>Accessibility and provider configuration.</Body>

      <Card accessibilityLabel="Theme card">
        <Body>Theme — {themeLabel(themeId)}</Body>
        <Body muted>Switch the palette. Takes effect immediately.</Body>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.LightPastel)}
          accessibilityLabel="Pick Light pastel theme"
        >
          Light pastel
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.DarkPastel)}
          accessibilityLabel="Pick Dark pastel theme"
        >
          Dark pastel
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.HighContrast)}
          accessibilityLabel="Pick High contrast theme"
        >
          High contrast (AAA)
        </Button>
      </Card>

      <Card accessibilityLabel="Font card">
        <Body>Font — {fontFamily}</Body>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setFontFamily(FontFamily.Lexend)}
          accessibilityLabel="Pick Lexend font"
        >
          Lexend
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setFontFamily(FontFamily.OpenDyslexic)}
          accessibilityLabel="Pick OpenDyslexic font"
        >
          OpenDyslexic
        </Button>
      </Card>

      <AnthropicKeyField />

      <ListItem
        title="Provider"
        description={`anthropic · ${anthropicKeyConfigured ? "configured" : "not configured"}`}
      />
      <ListItem title="Captions" description={captionsLabel(captionsMode)} />
      <Body muted>
        Settings are in-memory until `make-device-sqlite-adapter` lands persistence.
      </Body>
    </Screen>
  );
};
