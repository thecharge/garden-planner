import { createElement } from "react";
import { act } from "react-test-renderer";
import { FontFamily, ThemeId } from "@garden/config";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { CaptionsMode, settingsStore } from "@/features/settings";
import { useCapturePermissions } from "@/features/capture";

jest.mock("@/features/capture", () => ({
  useCapturePermissions: jest.fn()
}));

const mockUseCapturePermissions = useCapturePermissions as jest.MockedFunction<
  typeof useCapturePermissions
>;

const resetSettings = () => {
  settingsStore.setState({
    themeId: ThemeId.LightPastel,
    fontFamily: FontFamily.Lexend,
    voiceEnabled: false,
    hapticsEnabled: false,
    captionsMode: CaptionsMode.AlwaysOn,
    anthropicKeyConfigured: false,
    soundOnboardingDismissed: false
  });
};

describe("SettingsScreen", () => {
  beforeEach(() => {
    resetSettings();
    mockUseCapturePermissions.mockReturnValue({
      camera: true,
      location: true,
      motion: true,
      allGranted: true,
      refresh: jest.fn().mockResolvedValue(undefined),
      request: jest.fn().mockResolvedValue(undefined)
    });
  });

  it.each(["renders without crash"])("%s", async () => {
    renderWithProviders(createElement(SettingsScreen));
    await flush();
  });

  it.each([
    {
      name: "toggles voice output on",
      label: "Enable voice output",
      press: () => settingsStore.getState().voiceEnabled,
      expected: true
    },
    {
      name: "toggles haptics on",
      label: "Enable haptics",
      press: () => settingsStore.getState().hapticsEnabled,
      expected: true
    },
    {
      name: "cycles captions mode to on",
      label: "Captions mode: Always on. Tap to cycle.",
      press: () => settingsStore.getState().captionsMode,
      expected: CaptionsMode.On
    }
  ])("$name", async ({ label, press, expected }) => {
    const tree = renderWithProviders(createElement(SettingsScreen));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, label).props.onPress();
    });
    await flush();
    expect(press()).toBe(expected);
  });
});
