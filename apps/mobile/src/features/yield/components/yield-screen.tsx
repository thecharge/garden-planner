import { Screen, Heading, Body, Card } from "@garden/ui";
import { useYoy } from "../hooks/use-yoy";
import { YoyTable } from "./yoy-table";
import { ExportCsvButton } from "./export-csv-button";

const PLOT_ID = "plot-a";

export const YieldScreen = () => {
  const currentYear = new Date().getFullYear();
  const yoy = useYoy(PLOT_ID, currentYear);
  const rows = yoy.data ?? [];
  const currentTotal = rows.reduce((acc, r) => acc + r.currentGrams, 0);
  const priorTotal = rows.reduce((acc, r) => acc + r.priorGrams, 0);
  const deltaTotal = currentTotal - priorTotal;

  return (
    <Screen accessibilityLabel="Yield screen">
      <Heading>Year-over-year yield</Heading>
      <Body muted>{yoy.isLoading ? "Loading…" : `${rows.length} row(s) — plot ${PLOT_ID}`}</Body>
      <Card accessibilityLabel="Yield totals summary">
        <Body>{currentYear - 1} total</Body>
        <Heading>{(priorTotal / 1000).toFixed(1)} kg</Heading>
        <Body>{currentYear} total</Body>
        <Heading>{(currentTotal / 1000).toFixed(1)} kg</Heading>
        <Body muted>
          {deltaTotal === 0
            ? "No change year over year."
            : `${deltaTotal > 0 ? "+" : ""}${(deltaTotal / 1000).toFixed(1)} kg vs last year`}
        </Body>
      </Card>
      <YoyTable rows={rows} year={currentYear} />
      <ExportCsvButton rows={rows} year={currentYear} />
    </Screen>
  );
};
