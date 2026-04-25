import { createElement } from "react";
import { act } from "react-test-renderer";
import {
  findByAccessibilityLabel,
  findTextContents,
  flush,
  renderWithProviders
} from "@/__tests__/test-utils";
import { EventForm } from "@/features/inventory/components/event-form";
import { getMemoryRepository, __resetMemoryRepositoryForTests } from "@/core/query/repository";
import { EventKind } from "@garden/config";

const seedSector = async () => {
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
};

describe("EventForm", () => {
  beforeEach(() => {
    __resetMemoryRepositoryForTests();
  });

  it("prompts user to add a sector when none exist", async () => {
    const tree = renderWithProviders(createElement(EventForm));
    await flush();
    const texts = findTextContents(tree);
    expect(texts.join(" ")).toContain("Add a sector first");
  });

  it("blocks submit when no sector is picked", async () => {
    await seedSector();
    const tree = renderWithProviders(createElement(EventForm));
    await flush();
    const submit = findByAccessibilityLabel(tree, "Submit event");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();
    const texts = findTextContents(tree);
    expect(texts).toContain("Pick a sector");
  });

  it("appends an event when sector is picked", async () => {
    await seedSector();
    const tree = renderWithProviders(createElement(EventForm));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Pick sector North bed").props.onPress();
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Submit event").props.onPress();
    });
    await flush();

    const repo = await getMemoryRepository();
    const events = await repo.listEventsBySector("s-1");
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe(EventKind.Sowed);
    expect(events[0]?.sectorId).toBe("s-1");
  });
});
