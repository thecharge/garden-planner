import { useMemo, useState } from "react";
import { View } from "react-native";
import { Body, Button, ButtonMode, Caption, Card, TextInput } from "@garden/ui";
import { SummaryType } from "@garden/config";
import { speciesCatalogue } from "@garden/engine";
import { useAppendHarvest } from "@/features/yield";

export type HarvestFormProps = {
  readonly sectorId: string;
};

const makeId = () => `h-${Date.now().toString()}-${Math.floor(Math.random() * 1e6).toString()}`;

export const HarvestForm = ({ sectorId }: HarvestFormProps) => {
  const [speciesId, setSpeciesId] = useState<string>("");
  const [gramsText, setGramsText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const append = useAppendHarvest();

  const species = useMemo(() => speciesCatalogue, []);

  const onSubmit = () => {
    if (!speciesId) {
      setError("Pick a species");
      return;
    }
    const grams = Number(gramsText);
    if (!Number.isFinite(grams) || grams <= 0) {
      setError("Weight must be greater than zero");
      return;
    }
    setError(null);
    append.mutate(
      {
        id: makeId(),
        sectorId,
        speciesId,
        weightGrams: grams,
        harvestedAt: new Date().toISOString()
      },
      {
        onSuccess: () => {
          setSpeciesId("");
          setGramsText("");
        }
      }
    );
  };

  return (
    <Card accessibilityLabel="Log harvest">
      <Body>Log a harvest for this sector.</Body>
      <Body muted>Pick a species and enter the weight in grams.</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {species.map((s) => (
          <Button
            key={s.id}
            mode={speciesId === s.id ? ButtonMode.Primary : ButtonMode.Secondary}
            onPress={() => setSpeciesId(s.id)}
            accessibilityLabel={`Pick species ${s.commonName}`}
          >
            {s.commonName}
          </Button>
        ))}
      </View>
      <TextInput
        value={gramsText}
        onChangeText={setGramsText}
        label="Weight (grams)"
        placeholder="e.g. 1250"
        keyboardType="numeric"
        accessibilityLabel="Harvest weight in grams"
      />
      {error ? <Caption variant={SummaryType.ActionRequired}>{error}</Caption> : null}
      <Button
        onPress={onSubmit}
        mode={ButtonMode.Primary}
        disabled={append.isPending}
        accessibilityLabel="Submit harvest"
      >
        {append.isPending ? "Saving…" : "Submit harvest"}
      </Button>
    </Card>
  );
};
