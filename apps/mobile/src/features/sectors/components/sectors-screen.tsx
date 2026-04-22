import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Body,
  Button,
  ButtonMode,
  Caption,
  Card,
  Heading,
  ListItem,
  Screen,
  TextInput
} from "@garden/ui";
import { SummaryType } from "@garden/config";
import { useSaveSector, useSectors } from "@/features/sectors";

const PLOT_ID = "plot-a";

const placeholderPolygon = [
  { lat: 42.7, lon: 23.3 },
  { lat: 42.7001, lon: 23.3 },
  { lat: 42.7001, lon: 23.3001 },
  { lat: 42.7, lon: 23.3001 }
];

const makeId = (): string =>
  `sector-${Date.now().toString()}-${Math.floor(Math.random() * 1e6).toString()}`;

export const SectorsScreen = () => {
  const sectors = useSectors(PLOT_ID);
  const save = useSaveSector(PLOT_ID);
  const [newName, setNewName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onAdd = () => {
    const name = newName.trim();
    if (!name) {
      setError("Name cannot be empty");
      return;
    }
    setError(null);
    save.mutate(
      {
        id: makeId(),
        plotId: PLOT_ID,
        name,
        polygon: placeholderPolygon,
        createdAt: new Date().toISOString()
      },
      { onSuccess: () => setNewName("") }
    );
  };

  return (
    <Screen accessibilityLabel="Sectors screen">
      <Heading>Sectors</Heading>
      <Body muted>
        {sectors.isLoading
          ? "Loading…"
          : `${(sectors.data?.length ?? 0).toString()} sector(s) on this plot.`}
      </Body>

      <Card accessibilityLabel="Add sector">
        <Body>Add a new sector — bed, row, or greenhouse zone.</Body>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          label="Sector name"
          placeholder="North bed, Greenhouse row 2, …"
          accessibilityLabel="New sector name"
        />
        {error ? <Caption variant={SummaryType.ActionRequired}>{error}</Caption> : null}
        <Button
          onPress={onAdd}
          mode={ButtonMode.Primary}
          disabled={save.isPending}
          accessibilityLabel="Add sector"
        >
          {save.isPending ? "Saving…" : "Add sector"}
        </Button>
      </Card>

      {(sectors.data ?? []).map((s) => (
        <View key={s.id} style={{ marginTop: 8 }}>
          <ListItem
            title={s.name}
            description={`Plot ${s.plotId} · ${s.polygon.length.toString()} corners`}
          />
          <Button
            onPress={() => router.push(`/sector/${s.id}`)}
            mode={ButtonMode.Secondary}
            accessibilityLabel={`Open sector ${s.name}`}
          >
            Open
          </Button>
        </View>
      ))}

      {(sectors.data ?? []).length === 0 && !sectors.isLoading ? (
        <Card>
          <Body>No sectors yet.</Body>
          <Body muted>Add your first sector above. A sector is a bed, row, or zone.</Body>
        </Card>
      ) : null}
    </Screen>
  );
};
