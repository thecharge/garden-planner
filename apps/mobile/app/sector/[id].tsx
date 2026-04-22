import { useLocalSearchParams } from "expo-router";
import { SectorDetailScreen } from "@/features/sectors";

const SectorDetailRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SectorDetailScreen id={id ?? ""} />;
};

export default SectorDetailRoute;
