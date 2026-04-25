import { useStore } from "zustand";
import { Body, Button, ButtonMode, Card } from "@garden/ui";
import { settingsStore } from "@/features/settings";
export const SoundOnboardingCard = () => {
  const dismissed = useStore(settingsStore, (s) => s.soundOnboardingDismissed);

  if (dismissed) {
    return null;
  }

  const handleEnable = () => {
    settingsStore.getState().setVoiceEnabled(true);
    settingsStore.getState().setHapticsEnabled(true);
    settingsStore.getState().setSoundOnboardingDismissed(true);
  };

  const handleDismiss = () => {
    settingsStore.getState().setSoundOnboardingDismissed(true);
  };

  return (
    <Card accessibilityLabel="Sound onboarding card">
      <Body>Want spoken verdicts and haptic feedback?</Body>
      <Body muted>
        Sound and haptics are off by default. Enable them now, or change them any time in Settings.
      </Body>
      <Button onPress={handleEnable} accessibilityLabel="Enable sound and haptics">
        Enable sound &amp; haptics
      </Button>
      <Button
        mode={ButtonMode.Secondary}
        onPress={handleDismiss}
        accessibilityLabel="No thanks, keep sound off"
      >
        No thanks
      </Button>
    </Card>
  );
};
