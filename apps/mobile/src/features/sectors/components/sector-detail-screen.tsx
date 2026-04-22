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
import { speciesCatalogue } from "@garden/engine";
import { useDeleteSector, useRenameSector, useSector } from "../hooks/use-sectors";
import { HarvestForm } from "@/features/yield/components/harvest-form";
import { useHarvestsBySector } from "@/features/yield/hooks/use-sector-yield";

const PLOT_ID = "plot-a";

const speciesName = (id: string): string =>
  speciesCatalogue.find((s) => s.id === id)?.commonName ?? id;

export type SectorDetailScreenProps = {
  readonly id: string;
};

export const SectorDetailScreen = ({ id }: SectorDetailScreenProps) => {
  const sector = useSector(id);
  const harvests = useHarvestsBySector(id);
  const rename = useRenameSector(PLOT_ID);
  const del = useDeleteSector(PLOT_ID);
  const [renameText, setRenameText] = useState<string>("");
  const [renameError, setRenameError] = useState<string | null>(null);

  if (sector.isPending) {
    return (
      <Screen accessibilityLabel="Sector detail loading">
        <Body muted>Loading…</Body>
      </Screen>
    );
  }

  if (!sector.data) {
    return (
      <Screen accessibilityLabel="Sector not found">
        <Heading>Sector not found</Heading>
        <Caption variant={SummaryType.ActionRequired}>
          No sector with that id. It may have been deleted.
        </Caption>
        <Button
          onPress={() => router.back()}
          mode={ButtonMode.Primary}
          accessibilityLabel="Back to sectors"
        >
          Back to sectors
        </Button>
      </Screen>
    );
  }

  const current = sector.data;

  const onRename = () => {
    const next = renameText.trim();
    if (!next) {
      setRenameError("Name cannot be empty");
      return;
    }
    setRenameError(null);
    rename.mutate({ id, name: next }, { onSuccess: () => setRenameText("") });
  };

  const onDelete = () => {
    del.mutate(id, { onSuccess: () => router.back() });
  };

  return (
    <Screen accessibilityLabel={`Sector detail ${current.name}`}>
      <Button
        mode={ButtonMode.Text}
        onPress={() => router.back()}
        accessibilityLabel="Back to sectors"
      >
        ← Back
      </Button>
      <Heading>{current.name}</Heading>
      <Body muted>{`Plot ${current.plotId} · ${current.polygon.length.toString()} corners`}</Body>

      <Card accessibilityLabel="Rename sector">
        <Body>Rename this sector.</Body>
        <TextInput
          value={renameText}
          onChangeText={setRenameText}
          label="New name"
          placeholder={current.name}
          accessibilityLabel="New sector name"
        />
        {renameError ? <Caption variant={SummaryType.ActionRequired}>{renameError}</Caption> : null}
        <Button
          onPress={onRename}
          mode={ButtonMode.Secondary}
          disabled={rename.isPending}
          accessibilityLabel="Save new sector name"
        >
          {rename.isPending ? "Saving…" : "Save name"}
        </Button>
      </Card>

      <HarvestForm sectorId={id} />

      <Card accessibilityLabel="Recent harvests">
        <Body>Recent harvests</Body>
        {(harvests.data ?? []).length === 0 ? <Body muted>No harvests logged yet.</Body> : null}
        {(harvests.data ?? []).map((h) => (
          <ListItem
            key={h.id}
            title={speciesName(h.speciesId)}
            description={h.harvestedAt.slice(0, 10)}
            right={`${h.weightGrams.toString()} g`}
          />
        ))}
      </Card>

      <Card accessibilityLabel="Danger zone">
        <Body>Delete this sector.</Body>
        <Body muted>This cannot be undone. Harvest records stay logged for history.</Body>
        <View style={{ marginTop: 8 }}>
          <Button
            onPress={onDelete}
            mode={ButtonMode.Secondary}
            disabled={del.isPending}
            accessibilityLabel="Delete sector"
          >
            {del.isPending ? "Deleting…" : "Delete sector"}
          </Button>
        </View>
      </Card>
    </Screen>
  );
};
