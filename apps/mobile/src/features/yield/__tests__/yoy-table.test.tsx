import type { YoyRow } from "@garden/engine";
import { renderWithProviders } from "@/__tests__/test-utils";
import { YoyTable } from "../components/yoy-table";

const row = (overrides: Partial<YoyRow>): YoyRow => ({
  sectorId: "s-1",
  speciesId: "tomato-detvan",
  priorGrams: 2000,
  currentGrams: 3500,
  deltaGrams: 1500,
  deltaPct: 75,
  ...overrides
});

const findAllLabels = (tree: ReturnType<typeof renderWithProviders>, prefix: string) => {
  const labels = tree.root
    .findAll((n) => typeof n.props?.accessibilityLabel === "string")
    .map((n) => n.props.accessibilityLabel as string)
    .filter((label) => label.startsWith(prefix));
  return Array.from(new Set(labels));
};

describe("YoyTable", () => {
  it("renders one row per YoyRow and preserves order", () => {
    const rows: YoyRow[] = [
      row({
        sectorId: "s-1",
        speciesId: "tomato",
        currentGrams: 3000,
        priorGrams: 1000,
        deltaGrams: 2000,
        deltaPct: 200
      }),
      row({
        sectorId: "s-2",
        speciesId: "basil",
        currentGrams: 500,
        priorGrams: 0,
        deltaGrams: 500,
        deltaPct: null
      })
    ];
    const tree = renderWithProviders(<YoyTable rows={rows} year={2026} />);
    const labels = findAllLabels(tree, "s-");
    expect(labels).toHaveLength(2);
    expect(labels[0]).toContain("s-1");
    expect(labels[0]).toContain("tomato");
    expect(labels[0]).toContain("1000 grams in 2025");
    expect(labels[0]).toContain("3000 grams in 2026");
    expect(labels[1]).toContain("s-2");
    expect(labels[1]).toContain("basil");
  });

  it("shows an empty-state card when no rows are supplied", () => {
    const tree = renderWithProviders(<YoyTable rows={[]} year={2026} />);
    const emptyCard = tree.root.findAll(
      (n) => n.props?.accessibilityLabel === "Year-over-year table empty"
    );
    expect(emptyCard.length).toBeGreaterThan(0);
  });

  it("renders delta text for new-this-year row", () => {
    const rows: YoyRow[] = [
      row({
        sectorId: "s-3",
        speciesId: "kale",
        currentGrams: 1000,
        priorGrams: 0,
        deltaGrams: 1000,
        deltaPct: null
      })
    ];
    const tree = renderWithProviders(<YoyTable rows={rows} year={2026} />);
    const labels = findAllLabels(tree, "s-3");
    expect(labels[0]).toContain("+1000 g (new)");
  });
});
