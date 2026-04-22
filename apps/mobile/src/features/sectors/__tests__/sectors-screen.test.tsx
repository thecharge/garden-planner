import { createElement } from "react";
import { act } from "react-test-renderer";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { SectorsScreen } from "@/features/sectors/components/sectors-screen";
import { __resetMemoryRepositoryForTests, getMemoryRepository } from "@/core/query/repository";
import { router } from "expo-router";

describe("SectorsScreen", () => {
  beforeEach(() => {
    __resetMemoryRepositoryForTests();
    (router.push as jest.Mock).mockClear();
  });

  it("rejects empty sector name", async () => {
    const tree = renderWithProviders(createElement(SectorsScreen));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Add sector").props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Name cannot be empty");
  });

  it("adds a sector and lists it", async () => {
    const tree = renderWithProviders(createElement(SectorsScreen));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "New sector name").props.onChangeText("North greenhouse");
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Add sector").props.onPress();
    });
    await flush();

    const repo = await getMemoryRepository();
    const sectors = await repo.listSectorsByPlot("plot-a");
    expect(sectors).toHaveLength(1);
    expect(sectors[0]?.name).toBe("North greenhouse");
  });

  it("open pushes to /sector/:id", async () => {
    const repo = await getMemoryRepository();
    await repo.saveSector({
      id: "s-1",
      plotId: "plot-a",
      name: "North bed",
      polygon: [
        { lat: 42.7, lon: 23.3 },
        { lat: 42.7001, lon: 23.3 },
        { lat: 42.7001, lon: 23.3001 },
        { lat: 42.7, lon: 23.3001 }
      ],
      createdAt: new Date().toISOString()
    });
    const tree = renderWithProviders(createElement(SectorsScreen));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Open sector North bed").props.onPress();
    });
    expect(router.push).toHaveBeenCalledWith("/sector/s-1");
  });
});
