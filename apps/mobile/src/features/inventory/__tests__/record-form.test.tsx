import { createElement } from "react";
import { act } from "react-test-renderer";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { RecordForm } from "@/features/inventory/components/record-form";
import { getMemoryRepository, __resetMemoryRepositoryForTests } from "@/core/query/repository";
import { InventoryKind } from "@garden/config";

describe("RecordForm", () => {
  beforeEach(() => {
    __resetMemoryRepositoryForTests();
  });

  it("blocks submit when name is empty", async () => {
    const tree = renderWithProviders(createElement(RecordForm));
    const submit = findByAccessibilityLabel(tree, "Submit inventory record");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Name is required");
  });

  it("blocks submit when quantity is not positive", async () => {
    const tree = renderWithProviders(createElement(RecordForm));
    await act(async () => {
      findByAccessibilityLabel(tree, "Record name").props.onChangeText("Detvan tomato");
    });
    const submit = findByAccessibilityLabel(tree, "Submit inventory record");
    await act(async () => {
      submit.props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Quantity must be greater than zero");
  });

  it("saves a valid record to the repository", async () => {
    const tree = renderWithProviders(createElement(RecordForm));
    await act(async () => {
      findByAccessibilityLabel(tree, "Pick kind Seed").props.onPress();
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Record name").props.onChangeText("Detvan tomato");
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Record quantity").props.onChangeText("25");
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Record unit").props.onChangeText("g");
    });
    await act(async () => {
      findByAccessibilityLabel(tree, "Submit inventory record").props.onPress();
    });
    await flush();

    const repo = await getMemoryRepository();
    const records = await repo.listInventoryRecords();
    expect(records).toHaveLength(1);
    expect(records[0]?.name).toBe("Detvan tomato");
    expect(records[0]?.quantity).toBe(25);
    expect(records[0]?.unit).toBe("g");
    expect(records[0]?.kind).toBe(InventoryKind.Seed);
  });
});
