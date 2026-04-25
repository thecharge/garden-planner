import { EventKind } from "@garden/config";
import {
  createAcquireEvent,
  createSowEvent,
  createTransplantEvent,
  createHarvestEvent,
  createPestEvent,
  createSoilSampleEvent,
  createCorrectionEvent,
  createPlantFailureEvent
} from "../events";
import type { EventFactoryInput } from "../events";

const BASE: EventFactoryInput = {
  id: "ev-1",
  capturedAt: "2026-01-01T00:00:00.000Z",
  delta: 1
};

describe("event factories", () => {
  it.each([
    ["createAcquireEvent", createAcquireEvent, EventKind.Acquired],
    ["createSowEvent", createSowEvent, EventKind.Sowed],
    ["createTransplantEvent", createTransplantEvent, EventKind.Transplanted],
    ["createHarvestEvent", createHarvestEvent, EventKind.Harvested],
    ["createPestEvent", createPestEvent, EventKind.PestObserved],
    ["createSoilSampleEvent", createSoilSampleEvent, EventKind.SoilSample],
    ["createCorrectionEvent", createCorrectionEvent, EventKind.Correction],
    ["createPlantFailureEvent", createPlantFailureEvent, EventKind.PlantFailure]
  ] as const)("%s — happy: sets correct kind and base fields", (_name, factory, expectedKind) => {
    const ev = factory(BASE);
    expect(ev.kind).toBe(expectedKind);
    expect(ev.id).toBe("ev-1");
    expect(ev.capturedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(ev.delta).toBe(1);
  });

  it("side: optional fields are included when provided", () => {
    const ev = createSowEvent({
      ...BASE,
      sectorId: "s-1",
      speciesId: "sp-1",
      notes: "test note"
    });
    expect(ev.sectorId).toBe("s-1");
    expect(ev.speciesId).toBe("sp-1");
    expect(ev.notes).toBe("test note");
  });

  it("side: optional fields are absent when not provided", () => {
    const ev = createAcquireEvent(BASE);
    expect("sectorId" in ev).toBe(false);
    expect("speciesId" in ev).toBe(false);
    expect("notes" in ev).toBe(false);
  });
});
