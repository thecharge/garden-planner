import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Body, Button, ButtonMode, Caption, Card, TextInput } from "@garden/ui";
import { EventKind, SummaryType } from "@garden/config";
import { speciesCatalogue } from "@garden/engine";
import { useAppendEvent } from "@/features/inventory";
import { useSectors } from "@/features/sectors";

const PLOT_ID = "plot-a";

const KIND_OPTIONS: ReadonlyArray<{ readonly label: string; readonly value: EventKind }> = [
  { label: "Sowed", value: EventKind.Sowed },
  { label: "Transplanted", value: EventKind.Transplanted },
  { label: "Pest observed", value: EventKind.PestObserved },
  { label: "Soil sample", value: EventKind.SoilSample },
  { label: "Plant failure", value: EventKind.PlantFailure },
  { label: "Correction", value: EventKind.Correction }
];

const makeId = (): string =>
  `ev-${Date.now().toString()}-${Math.floor(Math.random() * 1e6).toString()}`;

export const EventForm = () => {
  const sectors = useSectors(PLOT_ID);
  const [kind, setKind] = useState<EventKind>(EventKind.Sowed);
  const [sectorId, setSectorId] = useState<string>("");
  const [speciesId, setSpeciesId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const append = useAppendEvent();

  const onSubmit = () => {
    if (!sectorId) {
      setError("Pick a sector");
      return;
    }
    setError(null);
    append.mutate(
      {
        id: makeId(),
        kind,
        capturedAt: new Date().toISOString(),
        delta: 0,
        sectorId,
        ...(speciesId ? { speciesId } : {}),
        ...(note.trim() ? { notes: note.trim() } : {})
      },
      {
        onSuccess: () => {
          setSpeciesId("");
          setNote("");
        }
      }
    );
  };

  const list = sectors.data ?? [];

  if (list.length === 0) {
    return (
      <Card accessibilityLabel="Log event">
        <Body>Log a garden event.</Body>
        <Caption variant={SummaryType.ActionRequired}>
          Add a sector first — events are tied to a sector.
        </Caption>
        <Button
          mode={ButtonMode.Primary}
          onPress={() => router.push("/(tabs)/sectors")}
          accessibilityLabel="Go to sectors tab"
        >
          Go to Sectors
        </Button>
      </Card>
    );
  }

  return (
    <Card accessibilityLabel="Log event">
      <Body>Log a garden event.</Body>
      <Body muted>Sow, transplant, pest observed, soil sample, failure, correction.</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {KIND_OPTIONS.map((o) => (
          <Button
            key={o.value}
            mode={kind === o.value ? ButtonMode.Primary : ButtonMode.Secondary}
            onPress={() => setKind(o.value)}
            accessibilityLabel={`Pick event kind ${o.label}`}
          >
            {o.label}
          </Button>
        ))}
      </View>
      <Body muted>Sector</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {list.map((s) => (
          <Button
            key={s.id}
            mode={sectorId === s.id ? ButtonMode.Primary : ButtonMode.Secondary}
            onPress={() => setSectorId(s.id)}
            accessibilityLabel={`Pick sector ${s.name}`}
          >
            {s.name}
          </Button>
        ))}
      </View>
      <Body muted>Species (optional)</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {speciesCatalogue.map((sp) => (
          <Button
            key={sp.id}
            mode={speciesId === sp.id ? ButtonMode.Primary : ButtonMode.Secondary}
            onPress={() => setSpeciesId(speciesId === sp.id ? "" : sp.id)}
            accessibilityLabel={`Pick species ${sp.commonName}`}
          >
            {sp.commonName}
          </Button>
        ))}
      </View>
      <TextInput
        value={note}
        onChangeText={setNote}
        label="Note (optional)"
        placeholder="e.g. direct-seeded, after last frost"
        maxLength={240}
        accessibilityLabel="Event note"
      />
      {error ? <Caption variant={SummaryType.ActionRequired}>{error}</Caption> : null}
      <Button
        onPress={onSubmit}
        mode={ButtonMode.Primary}
        disabled={append.isPending}
        accessibilityLabel="Submit event"
      >
        {append.isPending ? "Saving…" : "Log event"}
      </Button>
    </Card>
  );
};
