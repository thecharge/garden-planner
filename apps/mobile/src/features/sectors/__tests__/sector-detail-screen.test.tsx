import { createElement } from "react";
import { act } from "react-test-renderer";
import {
  findByAccessibilityLabel,
  findTextContents,
  flush,
  renderWithProviders
} from "@/__tests__/test-utils";
import { SectorDetailScreen } from "@/features/sectors/components/sector-detail-screen";
import { __resetMemoryRepositoryForTests, getMemoryRepository } from "@/core/query/repository";

const seedSector = async (id = "s-1", name = "North bed") => {
  const repo = await getMemoryRepository();
  await repo.saveSector({
    id,
    plotId: "plot-a",
    name,
    polygon: [
      { lat: 42.7, lon: 23.3 },
      { lat: 42.7001, lon: 23.3 },
      { lat: 42.7001, lon: 23.3001 },
      { lat: 42.7, lon: 23.3001 }
    ],
    createdAt: new Date().toISOString()
  });
};

describe("SectorDetailScreen", () => {
  beforeEach(() => {
    __resetMemoryRepositoryForTests();
  });

  it("renders the sector name as a header", async () => {
    await seedSector("s-1", "North bed");
    const tree = renderWithProviders(createElement(SectorDetailScreen, { id: "s-1" }));
    await flush();
    const texts = findTextContents(tree);
    expect(texts).toContain("North bed");
  });

  it("shows not-found when the id is missing", async () => {
    const tree = renderWithProviders(createElement(SectorDetailScreen, { id: "missing" }));
    await flush();
    const texts = findTextContents(tree);
    expect(texts).toContain("Sector not found");
  });

  it("renames the sector in the repository", async () => {
    await seedSector("s-1", "North bed");
    const tree = renderWithProviders(createElement(SectorDetailScreen, { id: "s-1" }));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "New sector name").props.onChangeText("Greenhouse");
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Save new sector name").props.onPress();
    });
    await flush();
    const repo = await getMemoryRepository();
    expect((await repo.getSector("s-1"))?.name).toBe("Greenhouse");
  });
});
