import { Screen, Heading, Body, Card, ListItem, Button } from "@garden/ui";
import { useSectors, useSaveSector } from "@/features/sectors";

const PLOT_ID = "plot-a";

export const SectorsScreen = () => {
  const sectors = useSectors(PLOT_ID);
  const save = useSaveSector(PLOT_ID);

  const onAdd = () => {
    const id = `sector-${Date.now()}`;
    save.mutate({
      id,
      plotId: PLOT_ID,
      name: `Bed ${((sectors.data?.length ?? 0) + 1).toString()}`,
      polygon: [
        { lat: 42.7, lon: 23.3 },
        { lat: 42.7001, lon: 23.3 },
        { lat: 42.7001, lon: 23.3001 },
        { lat: 42.7, lon: 23.3001 }
      ],
      createdAt: new Date().toISOString()
    });
  };

  return (
    <Screen accessibilityLabel="Sectors screen">
      <Heading>Sectors</Heading>
      <Body muted>
        {sectors.isLoading
          ? "Loading…"
          : `${sectors.data?.length ?? 0} sector(s) on this plot.`}
      </Body>
      {(sectors.data ?? []).map((s) => (
        <ListItem
          key={s.id}
          title={s.name}
          description={`Plot ${s.plotId} · ${s.polygon.length} corners`}
        />
      ))}
      <Card>
        <Body>Add a new sector — bed, row, or greenhouse zone.</Body>
        <Button onPress={onAdd} accessibilityLabel="Add sector">
          Add sector
        </Button>
      </Card>
    </Screen>
  );
};
