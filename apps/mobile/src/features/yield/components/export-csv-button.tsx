import { useCallback, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Button, ButtonMode } from "@garden/ui";
import { summary } from "@garden/core";
import type { YoyRow } from "@garden/engine";
import { useAnnounce } from "@/core/announce";
import { createLogger } from "@/core/logger";

const log = createLogger("yield-csv");
const HEADER = "sectorId,speciesId,year,priorGrams,currentGrams,deltaGrams,deltaPct";

const escape = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const toRow = (row: YoyRow, year: number): string =>
  [
    escape(row.sectorId),
    escape(row.speciesId),
    String(year),
    String(row.priorGrams),
    String(row.currentGrams),
    String(row.deltaGrams),
    row.deltaPct === null ? "" : String(row.deltaPct)
  ].join(",");

export type ExportCsvButtonProps = {
  readonly rows: ReadonlyArray<YoyRow>;
  readonly year: number;
};

export const ExportCsvButton = ({ rows, year }: ExportCsvButtonProps) => {
  const announce = useAnnounce();
  const [busy, setBusy] = useState(false);

  const onPress = useCallback(async () => {
    if (rows.length === 0) {
      void announce(summary.actionRequired("Nothing to export yet. Log a harvest first."));
      return;
    }
    setBusy(true);
    try {
      const body = [HEADER, ...rows.map((r) => toRow(r, year))].join("\n");
      const uri = `${FileSystem.cacheDirectory}yield-${year}.csv`;
      await FileSystem.writeAsStringAsync(uri, body);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: `Yield ${year}` });
        void announce(summary.success(`Exported yield for ${year}`));
      } else {
        log.info("sharing unavailable — file saved", { uri });
        void announce(summary.actionRequired("Sharing not available. File saved to cache."));
      }
    } catch (err) {
      log.warn("csv export failed", { message: err instanceof Error ? err.message : "unknown" });
      void announce(summary.actionRequired("Could not export yield. Try again."));
    } finally {
      setBusy(false);
    }
  }, [rows, year, announce]);

  return (
    <Button
      mode={ButtonMode.Secondary}
      onPress={onPress}
      disabled={busy}
      accessibilityLabel="Export yield history to CSV"
    >
      {busy ? "Exporting…" : "Export yield history"}
    </Button>
  );
};
