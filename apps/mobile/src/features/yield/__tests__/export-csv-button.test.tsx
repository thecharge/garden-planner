import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { YoyRow } from "@garden/engine";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { ExportCsvButton } from "../components/export-csv-button";

const makeRow = (overrides: Partial<YoyRow> = {}): YoyRow => ({
  sectorId: "s-1",
  speciesId: "tomato-detvan",
  priorGrams: 2000,
  currentGrams: 3500,
  deltaGrams: 1500,
  deltaPct: 75,
  ...overrides
});

describe("ExportCsvButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  });

  it("happy: writes CSV and calls shareAsync", async () => {
    const rows = [makeRow()];
    const tree = renderWithProviders(<ExportCsvButton rows={rows} year={2026} />);
    const button = findByAccessibilityLabel(tree, "Export yield history to CSV");
    await flush();
    await button.props.onPress();
    await flush();
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const [uri, body] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
    expect(uri).toContain("yield-2026.csv");
    expect(body).toContain("sectorId,speciesId,year,priorGrams,currentGrams,deltaGrams,deltaPct");
    expect(body).toContain("s-1,tomato-detvan,2026,2000,3500,1500,75");
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
  });

  it("side: sharing unavailable still writes the file", async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    const rows = [makeRow()];
    const tree = renderWithProviders(<ExportCsvButton rows={rows} year={2026} />);
    const button = findByAccessibilityLabel(tree, "Export yield history to CSV");
    await flush();
    await button.props.onPress();
    await flush();
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it("critical: zero rows skips file write entirely", async () => {
    const tree = renderWithProviders(<ExportCsvButton rows={[]} year={2026} />);
    const button = findByAccessibilityLabel(tree, "Export yield history to CSV");
    await flush();
    await button.props.onPress();
    await flush();
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});
