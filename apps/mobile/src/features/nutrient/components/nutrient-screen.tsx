import { View, Text } from "react-native";
import { useIrrigationTarget } from "@/features/nutrient";

const dayOfYear = (): number => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const NutrientScreen = () => {
  const water = useIrrigationTarget("tomato-san-marzano", "mid-season", dayOfYear());
  return (
    <View accessibilityLabel="Nutrient screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Amendments and irrigation</Text>
      <Text>
        {water.isLoading ? "Loading…" : `${water.data?.mmPerWeek ?? 0} mm / week`}
      </Text>
    </View>
  );
};
