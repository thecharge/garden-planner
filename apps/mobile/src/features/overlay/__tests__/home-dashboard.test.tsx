import { createElement } from "react";
import { Body, Card } from "@garden/ui";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { HomeDashboard } from "@/features/overlay/components/home-dashboard";
import { useHomeDashboard } from "@/features/overlay/hooks/use-home-dashboard";
import { settingsStore } from "@/features/settings";

jest.mock("@/features/overlay/hooks/use-home-dashboard", () => ({
  useHomeDashboard: jest.fn()
}));

jest.mock("@/features/settings", () => ({
  settingsStore: {
    getState: () => ({ soundOnboardingDismissed: false }),
    setState: jest.fn()
  },
  SoundOnboardingCard: jest.fn()
}));

const mockUseHomeDashboard = useHomeDashboard as jest.MockedFunction<typeof useHomeDashboard>;
const mockedSettingsStore = settingsStore as unknown as {
  getState: () => { soundOnboardingDismissed: boolean };
  setState: jest.Mock;
};

const MockedSoundOnboardingCard = (
  jest.requireMock("@/features/settings") as { SoundOnboardingCard: jest.Mock }
).SoundOnboardingCard;

const readTexts = (tree: ReturnType<typeof renderWithProviders>): string[] =>
  tree.root
    .findAll((node) => node.children.some((child) => typeof child === "string"))
    .map((node) => node.children.join(""));

const makeSoundCard = (dismissed: boolean) => {
  if (dismissed) {
    return null;
  }
  return createElement(Card, {
    accessibilityLabel: "Sound onboarding card",
    children: createElement(Body, null, "Want spoken verdicts and haptic feedback?")
  });
};

describe("HomeDashboard", () => {
  beforeEach(() => {
    mockedSettingsStore.setState.mockReset();
    mockedSettingsStore.getState = () => ({ soundOnboardingDismissed: false });
    mockUseHomeDashboard.mockReturnValue({
      sectorCount: 1,
      lastScanSlope: 0,
      isLoading: false
    });
    MockedSoundOnboardingCard.mockImplementation(() => makeSoundCard(false));
  });

  it.each([
    {
      name: "renders the scan hero button",
      dashboard: { sectorCount: 1, lastScanSlope: 0, isLoading: false },
      dismissed: true,
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(findByAccessibilityLabel(tree, "Go to capture screen")).toBeDefined();
        expect(readTexts(tree)).toContain("home.tapToScan");
      }
    },
    {
      name: "shows the empty sectors prompt",
      dashboard: { sectorCount: 0, lastScanSlope: 0, isLoading: false },
      dismissed: true,
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(readTexts(tree)).toContain("home.noSectors");
        expect(readTexts(tree)).toContain("home.noSectorsHint");
      }
    },
    {
      name: "shows the last scan card when a slope is available",
      dashboard: { sectorCount: 1, lastScanSlope: 12.3, isLoading: false },
      dismissed: true,
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(readTexts(tree)).toContain("12.3°");
        expect(readTexts(tree)).toContain("home.slopeLabel");
      }
    },
    {
      name: "renders the sound onboarding card when not dismissed",
      dashboard: { sectorCount: 1, lastScanSlope: 0, isLoading: false },
      dismissed: false,
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(findByAccessibilityLabel(tree, "Sound onboarding card")).toBeDefined();
      }
    }
  ])("$name", async ({ dashboard, dismissed, assertTree }) => {
    MockedSoundOnboardingCard.mockImplementation(() => makeSoundCard(dismissed));
    mockUseHomeDashboard.mockReturnValue(dashboard);
    const tree = renderWithProviders(createElement(HomeDashboard));
    await flush();
    assertTree(tree);
  });
});
