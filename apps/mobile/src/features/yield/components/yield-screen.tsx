import { Screen, Heading, Body, Card, ListItem } from "@garden/ui";
import { useHeatmap } from "../hooks/use-sector-yield";

const PLOT_ID = "plot-a";

export const YieldScreen = () => {
  const currentYear = new Date().getFullYear();
  const heatmap = useHeatmap(PLOT_ID, currentYear);
  const tiles = heatmap.data ?? [];
  const totalGrams = tiles.reduce((acc, t) => acc + t.totalGrams, 0);

  return (
    <Screen accessibilityLabel="Yield screen">
      <Heading>Year-over-year yield</Heading>
      <Body muted>
        {heatmap.isLoading ? "Loading…" : `${tiles.length} sector(s), ${currentYear}`}
      </Body>
      <Card accessibilityLabel="Yield summary">
        <Body>This year total</Body>
        <Heading>{(totalGrams / 1000).toFixed(1)} kg</Heading>
        <Body muted>Across all sectors on plot {PLOT_ID}.</Body>
      </Card>
      {tiles.map((t) => (
        <ListItem
          key={t.sectorId}
          title={t.sectorId}
          description={`${t.year}`}
          right={`${t.totalGrams} g`}
        />
      ))}
      {tiles.length === 0 ? (
        <Card>
          <Body>No harvests logged this year.</Body>
          <Body muted>Log a harvest on the Inventory tab and it'll show here.</Body>
        </Card>
      ) : null}
    </Screen>
  );
};
