import { useState } from "react";
import { View } from "react-native";
import { AutoCapitalize, Body, Button, ButtonMode, Caption, Card, TextInput } from "@garden/ui";
import { InventoryKind, SummaryType } from "@garden/config";
import { useSaveInventoryRecord } from "@/features/inventory";

const KIND_OPTIONS: ReadonlyArray<{ readonly label: string; readonly value: InventoryKind }> = [
  { label: "Seed", value: InventoryKind.Seed },
  { label: "Plant", value: InventoryKind.Plant },
  { label: "Tool", value: InventoryKind.Tool },
  { label: "Amendment", value: InventoryKind.Amendment }
];

const makeId = (): string =>
  `rec-${Date.now().toString()}-${Math.floor(Math.random() * 1e6).toString()}`;

export const RecordForm = () => {
  const [kind, setKind] = useState<InventoryKind>(InventoryKind.Seed);
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const save = useSaveInventoryRecord();

  const onSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required (g, kg, pcs, …)");
      return;
    }
    setError(null);
    save.mutate(
      {
        id: makeId(),
        kind,
        name: name.trim(),
        quantity: q,
        unit: unit.trim(),
        acquiredAt: new Date().toISOString(),
        ...(supplier.trim() ? { sourceSupplierId: supplier.trim() } : {})
      },
      {
        onSuccess: () => {
          setName("");
          setQuantity("");
          setUnit("");
          setSupplier("");
        }
      }
    );
  };

  return (
    <Card accessibilityLabel="Log inventory record">
      <Body>Log a new inventory record.</Body>
      <Body muted>Seeds, plants, tools, or amendments you brought in.</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {KIND_OPTIONS.map((o) => (
          <Button
            key={o.value}
            mode={kind === o.value ? ButtonMode.Primary : ButtonMode.Secondary}
            onPress={() => setKind(o.value)}
            accessibilityLabel={`Pick kind ${o.label}`}
          >
            {o.label}
          </Button>
        ))}
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        label="Name"
        placeholder="e.g. Detvan tomato"
        maxLength={80}
        accessibilityLabel="Record name"
      />
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        label="Quantity"
        placeholder="e.g. 25"
        keyboardType="numeric"
        accessibilityLabel="Record quantity"
      />
      <TextInput
        value={unit}
        onChangeText={setUnit}
        label="Unit"
        placeholder="g, kg, pcs, …"
        maxLength={20}
        autoCapitalize={AutoCapitalize.None}
        accessibilityLabel="Record unit"
      />
      <TextInput
        value={supplier}
        onChangeText={setSupplier}
        label="Supplier (optional)"
        placeholder="Maria — Chepinci co-op"
        maxLength={80}
        accessibilityLabel="Record supplier"
      />
      {error ? <Caption variant={SummaryType.ActionRequired}>{error}</Caption> : null}
      <Button
        onPress={onSubmit}
        mode={ButtonMode.Primary}
        disabled={save.isPending}
        accessibilityLabel="Submit inventory record"
      >
        {save.isPending ? "Saving…" : "Save record"}
      </Button>
    </Card>
  );
};
