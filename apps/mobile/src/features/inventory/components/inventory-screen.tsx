import { View, Text } from "react-native";
import { useInventory } from "@/features/inventory";

export const InventoryScreen = () => {
  const inventory = useInventory();
  return (
    <View accessibilityLabel="Inventory screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Inventory</Text>
      <Text>
        {inventory.isLoading ? "Loading…" : `${inventory.data?.length ?? 0} items`}
      </Text>
    </View>
  );
};
