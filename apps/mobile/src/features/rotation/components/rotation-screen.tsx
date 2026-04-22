import { View, Text } from "react-native";
import { useRotationAdvice } from "@/features/rotation";

export const RotationScreen = () => {
  const advice = useRotationAdvice({
    sectorId: "north-bed",
    currentYear: new Date().getFullYear(),
    sectorHistory: [],
    neighbourCurrentCrops: []
  });
  return (
    <View accessibilityLabel="Rotation screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Rotation recommendations</Text>
      <Text>
        {advice.isLoading
          ? "Loading…"
          : `${advice.data?.recommendations.length ?? 0} recommendations`}
      </Text>
    </View>
  );
};
