import { createElement } from "react";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { PermissionsCard } from "@/features/settings/components/permissions-card";
import { useCapturePermissions } from "@/features/capture";

jest.mock("@/features/capture", () => ({
  useCapturePermissions: jest.fn()
}));

const mockUseCapturePermissions = useCapturePermissions as jest.MockedFunction<
  typeof useCapturePermissions
>;

const readTexts = (tree: ReturnType<typeof renderWithProviders>): string[] =>
  tree.root
    .findAll((node) => node.children.some((child) => typeof child === "string"))
    .map((node) => node.children.join(""));

describe("PermissionsCard", () => {
  it.each([
    {
      name: "shows all granted statuses without manage button",
      permissions: {
        camera: true,
        location: true,
        motion: true,
        allGranted: true,
        refresh: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockResolvedValue(undefined)
      },
      expectedText: "Granted",
      expectedCount: 3,
      buttonLabel: "Open permissions rationale screen",
      hasButton: false
    },
    {
      name: "shows manage button when camera is not granted",
      permissions: {
        camera: false,
        location: true,
        motion: true,
        allGranted: false,
        refresh: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockResolvedValue(undefined)
      },
      expectedText: "Not granted",
      expectedCount: 1,
      buttonLabel: "Open permissions rationale screen",
      hasButton: true
    }
  ])("$name", async ({ permissions, expectedText, expectedCount, buttonLabel, hasButton }) => {
    mockUseCapturePermissions.mockReturnValue(permissions);
    const tree = renderWithProviders(createElement(PermissionsCard));
    await flush();
    const texts = readTexts(tree);
    expect(texts.filter((text) => text === expectedText)).toHaveLength(expectedCount);

    if (hasButton) {
      expect(findByAccessibilityLabel(tree, buttonLabel)).toBeDefined();
      return;
    }

    const matches = tree.root.findAll((node) => node.props?.accessibilityLabel === buttonLabel);
    expect(matches).toHaveLength(0);
  });
});
