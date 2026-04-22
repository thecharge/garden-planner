import { Screen, Heading, Body, Card, ListItem } from "@garden/ui";
import { EventForm } from "./event-form";
import { RecordForm } from "./record-form";
import { useEventsInRange, useInventory } from "../hooks/use-inventory";

const yearRange = (): { readonly fromIso: string; readonly toIso: string } => {
  const now = new Date();
  const from = new Date(now.getFullYear(), 0, 1).toISOString();
  const to = new Date(now.getFullYear() + 1, 0, 1).toISOString();
  return { fromIso: from, toIso: to };
};

export const InventoryScreen = () => {
  const inventory = useInventory();
  const { fromIso, toIso } = yearRange();
  const events = useEventsInRange(fromIso, toIso);
  const records = inventory.data ?? [];
  const evList = events.data ?? [];

  return (
    <Screen accessibilityLabel="Inventory screen">
      <Heading>Inventory</Heading>
      <Body muted>
        {inventory.isLoading
          ? "Loading…"
          : `${records.length.toString()} record(s), ${evList.length.toString()} event(s) this year`}
      </Body>

      <RecordForm />
      <EventForm />

      <Card accessibilityLabel="Recent records">
        <Body>Recent records</Body>
        {records.length === 0 ? <Body muted>No records yet.</Body> : null}
        {records.slice(0, 10).map((item) => (
          <ListItem
            key={item.id}
            title={item.name}
            description={`${item.kind} · ${item.quantity.toString()} ${item.unit}`}
            right={item.acquiredAt.slice(0, 10)}
          />
        ))}
      </Card>

      <Card accessibilityLabel="Recent events">
        <Body>Recent events this year</Body>
        {evList.length === 0 ? <Body muted>No events yet.</Body> : null}
        {evList
          .slice(-10)
          .reverse()
          .map((e) => (
            <ListItem
              key={e.id}
              title={e.kind}
              description={`${e.capturedAt.slice(0, 10)}${e.sectorId ? ` · ${e.sectorId}` : ""}`}
              right={e.speciesId ?? ""}
            />
          ))}
      </Card>
    </Screen>
  );
};
