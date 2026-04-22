import { Screen, Heading, Body, Card, ListItem } from "@garden/ui";
import { useInventory } from "@/features/inventory";

export const InventoryScreen = () => {
  const inventory = useInventory();
  const items = inventory.data ?? [];
  return (
    <Screen accessibilityLabel="Inventory screen">
      <Heading>Inventory</Heading>
      <Body muted>
        {inventory.isLoading ? "Loading…" : `${items.length} item(s) tracked`}
      </Body>
      {items.map((item) => (
        <ListItem
          key={item.id}
          title={item.name}
          description={`${item.kind} · ${item.quantity.toString()} ${item.unit}`}
        />
      ))}
      {items.length === 0 ? (
        <Card>
          <Body>No inventory yet.</Body>
          <Body muted>
            Acquisitions, sow events, and harvests land here once the device-sqlite adapter
            (tracked as `make-device-sqlite-adapter`) ships.
          </Body>
        </Card>
      ) : null}
    </Screen>
  );
};
