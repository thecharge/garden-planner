import { FontFamily } from "@garden/config";
import {
  Body,
  Button,
  ButtonMode,
  Card,
  Heading,
  ListItem,
  Screen,
  ThemeId,
  useActiveThemeId
} from "@garden/ui";
import { CaptionsMode, getSettings, settingsStore } from "@/features/settings";

const themeLabel = (id: ThemeId): string => {
  if (id === ThemeId.LightPastel) {
    return "Light pastel";
  }
  if (id === ThemeId.DarkPastel) {
    return "Dark pastel";
  }
  return "High contrast (AAA)";
};

export const SettingsScreen = () => {
  const active = useActiveThemeId();
  const settings = getSettings();
  return (
    <Screen accessibilityLabel="Settings screen">
      <Heading>Settings</Heading>
      <Body muted>Accessibility and provider configuration.</Body>
      <Card accessibilityLabel="Theme card">
        <Body>Theme — {themeLabel(active)}</Body>
        <Body muted>Switch the palette. Takes effect immediately.</Body>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.LightPastel)}
        >
          Light pastel
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.DarkPastel)}
        >
          Dark pastel
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setTheme(ThemeId.HighContrast)}
        >
          High contrast (AAA)
        </Button>
      </Card>
      <Card accessibilityLabel="Font card">
        <Body>Font — {settings.fontFamily}</Body>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setFontFamily(FontFamily.Lexend)}
        >
          Lexend
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setFontFamily(FontFamily.OpenDyslexic)}
        >
          OpenDyslexic
        </Button>
      </Card>
      <ListItem
        title="Provider"
        description={`anthropic · ${settings.anthropicKeyConfigured ? "configured" : "not configured"}`}
      />
      <ListItem
        title="Captions"
        description={settings.captionsMode === CaptionsMode.AlwaysOn ? "Always on" : settings.captionsMode}
      />
      <Body muted>
        Settings are in-memory until `make-device-sqlite-adapter` lands persistence.
      </Body>
    </Screen>
  );
};
