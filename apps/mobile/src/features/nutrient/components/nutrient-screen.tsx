import { GrowthStage } from "@garden/config";
import { Screen, Heading, Body, Card, Caption } from "@garden/ui";
import { useIrrigationTarget } from "@/features/nutrient";

const dayOfYear = (): number => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const NutrientScreen = () => {
  const water = useIrrigationTarget("tomato-san-marzano", GrowthStage.MidSeason, dayOfYear());

  return (
    <Screen accessibilityLabel="Nutrient screen">
      <Heading>Amendments and irrigation</Heading>
      <Body muted>For tomato (mid-season) — Sofia basin fallback climatology.</Body>
      <Card accessibilityLabel="Irrigation target card">
        <Body>Weekly irrigation target</Body>
        <Heading>{water.data ? `${water.data.mmPerWeek.toFixed(1)} mm / week` : "…"}</Heading>
        <Body muted>
          {water.data
            ? `ET₀ ${water.data.et0MmPerDay.toFixed(2)} mm/day · Kc ${water.data.kc.toFixed(2)}`
            : "Loading…"}
        </Body>
      </Card>
      {water.data?.warning ? <Caption>{water.data.warning.message}</Caption> : null}
      <Card accessibilityLabel="Amendments placeholder">
        <Body>Amendments</Body>
        <Body muted>
          Log a soil sample on the Sectors tab and a Liebig-limiting amendment plan shows up here.
        </Body>
      </Card>
    </Screen>
  );
};
