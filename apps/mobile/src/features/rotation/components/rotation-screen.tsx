import { Screen, Heading, Body, Card, ListItem } from "@garden/ui";
import { useRotationAdvice } from "@/features/rotation";

const SECTOR_ID = "north-bed";

export const RotationScreen = () => {
  const advice = useRotationAdvice({
    sectorId: SECTOR_ID,
    currentYear: new Date().getFullYear(),
    sectorHistory: [],
    neighbourCurrentCrops: []
  });

  const top = (advice.data?.recommendations ?? []).slice(0, 5);
  const warnings = advice.data?.warnings ?? [];

  return (
    <Screen accessibilityLabel="Rotation screen">
      <Heading>Rotation recommendations</Heading>
      <Body muted>
        {advice.isLoading
          ? "Loading…"
          : `${top.length} top match(es) for ${SECTOR_ID}`}
      </Body>
      {top.map((rec) => (
        <Card key={rec.speciesId} accessibilityLabel={`Recommendation for ${rec.speciesId}`}>
          <Body>{rec.speciesId}</Body>
          <Body muted>score {rec.score.toFixed(1)}</Body>
          {rec.reasons.slice(0, 2).map((r) => (
            <Body key={r.code} muted>
              · {r.message}
            </Body>
          ))}
        </Card>
      ))}
      {warnings.map((w, idx) => (
        <ListItem key={`w-${idx.toString()}`} title={w.message} />
      ))}
    </Screen>
  );
};
