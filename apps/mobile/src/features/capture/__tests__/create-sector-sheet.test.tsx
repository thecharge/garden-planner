import { createElement } from "react";
import { act } from "react-test-renderer";
import type { Protocol } from "@garden/config";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { CreateSectorSheet } from "@/features/capture/components/create-sector-sheet";

const makeProtocol = (): Protocol => ({
  id: "protocol-1",
  capturedAt: "2026-04-22T10:00:00.000Z",
  confidence: 0.92,
  data: {
    slopeDegree: 12.3,
    orientationDegrees: 87
  }
});

const readTexts = (tree: ReturnType<typeof renderWithProviders>): string[] =>
  tree.root
    .findAll((node) => node.children.some((child) => typeof child === "string"))
    .map((node) => node.children.join(""));

describe("CreateSectorSheet", () => {
  it.each([
    {
      name: "renders nothing when protocol is missing",
      protocol: null,
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(tree.toJSON()).toBeNull();
      }
    },
    {
      name: "renders default name and scan details",
      protocol: makeProtocol(),
      assertTree: (tree: ReturnType<typeof renderWithProviders>) => {
        expect(findByAccessibilityLabel(tree, "Sector name input").props.value).toBe(
          "Scan 2026-04-22"
        );
        expect(readTexts(tree)).toContain("Slope: 12.3°");
        expect(readTexts(tree)).toContain("Orientation: 87°");
      }
    }
  ])("$name", async ({ protocol, assertTree }) => {
    const tree = renderWithProviders(
      createElement(CreateSectorSheet, {
        protocol,
        onConfirm: jest.fn(),
        onCancel: jest.fn()
      })
    );
    await flush();
    assertTree(tree);
  });

  it.each([
    {
      name: "confirms with the current name",
      run: async () => {
        const protocol = makeProtocol();
        const onConfirm = jest.fn();
        const tree = renderWithProviders(
          createElement(CreateSectorSheet, {
            protocol,
            onConfirm,
            onCancel: jest.fn()
          })
        );
        await flush();
        await act(async () => {
          findByAccessibilityLabel(tree, "Sector name input").props.onChangeText("South terrace");
        });
        await act(async () => {
          findByAccessibilityLabel(tree, "Confirm create sector").props.onPress();
        });
        expect(onConfirm).toHaveBeenCalledWith("South terrace", protocol);
      }
    },
    {
      name: "calls cancel handler",
      run: async () => {
        const onCancel = jest.fn();
        const tree = renderWithProviders(
          createElement(CreateSectorSheet, {
            protocol: makeProtocol(),
            onConfirm: jest.fn(),
            onCancel
          })
        );
        await flush();
        await act(async () => {
          findByAccessibilityLabel(tree, "Cancel create sector").props.onPress();
        });
        expect(onCancel).toHaveBeenCalledTimes(1);
      }
    }
  ])("$name", async ({ run }) => {
    await run();
  });
});
