import { createElement } from "react";
import { act } from "react-test-renderer";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { HarvestForm } from "@/features/yield/components/harvest-form";
import { getMemoryRepository, __resetMemoryRepositoryForTests } from "@/core/query/repository";

describe("HarvestForm", () => {
  beforeEach(() => {
    __resetMemoryRepositoryForTests();
  });

  it("rejects submit without species picked", async () => {
    const tree = renderWithProviders(createElement(HarvestForm, { sectorId: "s-1" }));
    const submit = findByAccessibilityLabel(tree, "Submit harvest");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Pick a species");
  });

  it("rejects submit when grams is zero or empty", async () => {
    const tree = renderWithProviders(createElement(HarvestForm, { sectorId: "s-1" }));
    const pick = findByAccessibilityLabel(tree, "Pick species San Marzano tomato");
    await act(async () => {
      pick.props.onPress();
    });
    const submit = findByAccessibilityLabel(tree, "Submit harvest");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Weight must be greater than zero");
  });

  it("appends harvest to the repository on valid submit", async () => {
    const tree = renderWithProviders(createElement(HarvestForm, { sectorId: "s-1" }));
    const pick = findByAccessibilityLabel(tree, "Pick species San Marzano tomato");
    await act(async () => {
      pick.props.onPress();
    });
    const gramsInput = findByAccessibilityLabel(tree, "Harvest weight in grams");
    await act(async () => {
      gramsInput.props.onChangeText("1250");
    });
    const submit = findByAccessibilityLabel(tree, "Submit harvest");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();

    const repo = await getMemoryRepository();
    const saved = await repo.listHarvestsBySector("s-1");
    expect(saved).toHaveLength(1);
    expect(saved[0]?.speciesId).toBe("tomato-san-marzano");
    expect(saved[0]?.weightGrams).toBe(1250);
  });
});
