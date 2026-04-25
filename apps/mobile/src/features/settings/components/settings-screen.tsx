import { useStore } from "zustand";
import { FontFamily, ThemeId } from "@garden/config";
import { Body, Button, ButtonMode, Card, Heading, ListItem, Screen } from "@garden/ui";
import { CaptionsMode, settingsStore } from "@/features/settings";
import { AnthropicKeyField } from "@/features/settings/components/anthropic-key-field";
import { PermissionsCard } from "@/features/settings/components/permissions-card";

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
  const voiceEnabled = useStore(settingsStore, (s) => s.voiceEnabled);
  const hapticsEnabled = useStore(settingsStore, (s) => s.hapticsEnabled);

  const nextCaptionsMode = (m: CaptionsMode): CaptionsMode => {
    if (m === CaptionsMode.AlwaysOn) {
      return CaptionsMode.On;
    }
    if (m === CaptionsMode.On) {
      return CaptionsMode.Off;
    }
    return CaptionsMode.AlwaysOn;
  };

  return (
    <Screen accessibilityLabel="Settings screen">
      <Heading>Settings</Heading>
      <Body muted>Accessibility and provider configuration.</Body>

      <Card accessibilityLabel="Sound and notifications card">
        <Body>Sound &amp; Notifications</Body>
        <Body muted>
          Sound and haptics are off by default. Turn them on for spoken verdicts and vibration
          feedback.
        </Body>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setVoiceEnabled(!voiceEnabled)}
          accessibilityLabel={voiceEnabled ? "Disable voice output" : "Enable voice output"}
        >
          {voiceEnabled ? "Voice: On" : "Voice: Off"}
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setHapticsEnabled(!hapticsEnabled)}
          accessibilityLabel={hapticsEnabled ? "Disable haptics" : "Enable haptics"}
        >
          {hapticsEnabled ? "Haptics: On" : "Haptics: Off"}
        </Button>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => settingsStore.getState().setCaptionsMode(nextCaptionsMode(captionsMode))}
          accessibilityLabel={`Captions mode: ${captionsLabel(captionsMode)}. Tap to cycle.`}
        >
          Captions: {captionsLabel(captionsMode)}
        </Button>
      </Card>

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

      <Heading>Camera &amp; Location</Heading>
      <PermissionsCard />

      <ListItem
        title="Provider"
        description={`anthropic · ${anthropicKeyConfigured ? "configured" : "not configured"}`}
      />
      <Body muted>
        Settings are in-memory until `make-device-sqlite-adapter` lands persistence.
      </Body>
    </Screen>
  );
};
