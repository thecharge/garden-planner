import { View, Text } from "react-native";
import { useSectors } from "@/features/sectors";

export const SectorsScreen = () => {
  const sectors = useSectors("plot-a");
  return (
    <View accessibilityLabel="Sectors screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Sectors</Text>
      <Text>{sectors.isLoading ? "Loading…" : `${sectors.data?.length ?? 0} sectors`}</Text>
    </View>
  );
};
