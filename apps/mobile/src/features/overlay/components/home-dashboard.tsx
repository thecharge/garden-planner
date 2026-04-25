import { View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Body, Button, ButtonMode, Card, Heading, Screen } from "@garden/ui";
import { SoundOnboardingCard } from "@/features/settings";
import { useHomeDashboard } from "../hooks/use-home-dashboard";

const MetricTile = ({
  value,
  label,
  accessibilityLabel
}: {
  readonly value: string;
  readonly label: string;
  readonly accessibilityLabel: string;
}) => (
  <View style={{ flex: 1 }} accessibilityLabel={accessibilityLabel}>
    <Heading>{value}</Heading>
    <Body muted>{label}</Body>
  </View>
);

export const HomeDashboard = () => {
  const { sectorCount, lastScanSlope, isLoading } = useHomeDashboard();
  const { t } = useTranslation();

  const buildSectorCountLabel = (count: number, loading: boolean): string => {
    if (loading) {
      return t("home.loading");
    }
    if (count === 0) {
      return t("home.noSectors");
    }
    if (count === 1) {
      return t("home.sectorCountOne", { count });
    }
    return t("home.sectorCountOther", { count });
  };

  const sectorCountLabel = buildSectorCountLabel(sectorCount, isLoading);

  return (
    <Screen accessibilityLabel="Home dashboard">
      <Heading>{t("home.title")}</Heading>
      <Body muted>{t("home.tagline")}</Body>

      <Card accessibilityLabel="Metrics row">
        <View style={{ flexDirection: "row" }}>
          <MetricTile
            value={isLoading ? "…" : sectorCount.toString()}
            label={t("home.sectorsLabel")}
            accessibilityLabel="Sector count"
          />
          {lastScanSlope > 0 ? (
            <MetricTile
              value={`${lastScanSlope.toFixed(1)}°`}
              label={t("home.slopeLabel")}
              accessibilityLabel="Last slope metric"
            />
          ) : null}
        </View>
      </Card>

      <Button
        onPress={() => router.push("/(tabs)/capture")}
        accessibilityLabel="Go to capture screen"
      >
        {t("home.tapToScan")}
      </Button>
      <Body muted>{t("home.scanHint")}</Body>

      <Card accessibilityLabel="Quick links">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ marginRight: 8, marginBottom: 8 }}>
            <Button
              mode={ButtonMode.Secondary}
              onPress={() => router.push("/(tabs)/capture")}
              accessibilityLabel="Quick link to capture"
            >
              {t("home.capture")}
            </Button>
          </View>
          <View style={{ marginRight: 8, marginBottom: 8 }}>
            <Button
              mode={ButtonMode.Secondary}
              onPress={() => router.push("/(tabs)/sectors")}
              accessibilityLabel="Quick link to sectors"
            >
              {t("sectors.title")}
            </Button>
          </View>
          <View style={{ marginRight: 8, marginBottom: 8 }}>
            <Button
              mode={ButtonMode.Secondary}
              onPress={() => router.push("/(tabs)/yield")}
              accessibilityLabel="Quick link to yield"
            >
              {t("home.yield")}
            </Button>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Button
              mode={ButtonMode.Secondary}
              onPress={() => router.push("/(tabs)/settings")}
              accessibilityLabel="Quick link to settings"
            >
              {t("settings.title")}
            </Button>
          </View>
        </View>
      </Card>

      <Card accessibilityLabel="Sector health card">
        <Body>{sectorCountLabel}</Body>
        {sectorCount === 0 && !isLoading ? <Body muted>{t("home.noSectorsHint")}</Body> : null}
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => router.push("/(tabs)/sectors")}
          accessibilityLabel="Go to sectors screen"
        >
          {t("home.viewSectors")}
        </Button>
      </Card>

      <SoundOnboardingCard />
    </Screen>
  );
};
