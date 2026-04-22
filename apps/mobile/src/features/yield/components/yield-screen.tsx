import { View, Text } from "react-native";
import { useHeatmap } from "@/features/yield";

export const YieldScreen = () => {
  const heatmap = useHeatmap("plot-a", new Date().getFullYear());
  return (
    <View accessibilityLabel="Yield screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Year-over-year yield</Text>
      <Text>{heatmap.isLoading ? "Loading…" : `${heatmap.data?.length ?? 0} sectors`}</Text>
    </View>
  );
};
