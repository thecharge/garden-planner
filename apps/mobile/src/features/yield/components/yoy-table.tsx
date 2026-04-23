import { View } from "react-native";
import { Body, Caption, Card, useThemeTokens } from "@garden/ui";
import type { YoyRow } from "@garden/engine";

const MIN_INTENSITY = 0.08;
const MAX_INTENSITY = 0.55;

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r, g, b };
};

const rgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
};

const formatDelta = (row: YoyRow): string => {
  if (row.priorGrams === 0 && row.currentGrams === 0) {
    return "no change";
  }
  if (row.priorGrams === 0) {
    return `+${row.currentGrams} g (new)`;
  }
  if (row.currentGrams === 0) {
    return `-${row.priorGrams} g (gone)`;
  }
  const sign = row.deltaGrams >= 0 ? "+" : "";
  const pct = row.deltaPct === null ? "—" : `${row.deltaPct >= 0 ? "+" : ""}${row.deltaPct}%`;
  return `${sign}${row.deltaGrams} g (${pct})`;
};

export type YoyTableProps = {
  readonly rows: ReadonlyArray<YoyRow>;
  readonly year: number;
};

export const YoyTable = ({ rows, year }: YoyTableProps) => {
  const tokens = useThemeTokens();
  if (rows.length === 0) {
    return (
      <Card accessibilityLabel="Year-over-year table empty">
        <Body>
          No harvests logged for {year - 1} or {year}.
        </Body>
        <Body muted>
          Log a harvest from the sector detail screen and the comparison lands here.
        </Body>
      </Card>
    );
  }
  const maxGrams = rows.reduce((acc, r) => Math.max(acc, r.currentGrams, r.priorGrams), 1);
  return (
    <Card accessibilityLabel="Year-over-year comparison">
      <View style={{ flexDirection: "row", paddingVertical: 6 }}>
        <View style={{ flex: 2 }}>
          <Body>Sector / Species</Body>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Body>{year - 1}</Body>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Body>{year}</Body>
        </View>
        <View style={{ flex: 1.2, alignItems: "flex-end" }}>
          <Body>Δ</Body>
        </View>
      </View>
      {rows.map((row) => {
        const intensity =
          MIN_INTENSITY +
          Math.min(row.currentGrams / maxGrams, 1) * (MAX_INTENSITY - MIN_INTENSITY);
        const background = rgba(tokens.colors.primary, intensity);
        const accessibilityLabel =
          `${row.sectorId} ${row.speciesId}: ${row.priorGrams} grams in ${year - 1}, ` +
          `${row.currentGrams} grams in ${year}, delta ${formatDelta(row)}`;
        return (
          <View
            key={`${row.sectorId}-${row.speciesId}`}
            accessibilityLabel={accessibilityLabel}
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              paddingHorizontal: 8,
              marginVertical: 2,
              borderRadius: 8,
              backgroundColor: background
            }}
          >
            <View style={{ flex: 2 }}>
              <Body>{row.sectorId}</Body>
              <Caption>{row.speciesId}</Caption>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Body>{row.priorGrams > 0 ? `${row.priorGrams} g` : "—"}</Body>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Body>{row.currentGrams > 0 ? `${row.currentGrams} g` : "—"}</Body>
            </View>
            <View style={{ flex: 1.2, alignItems: "flex-end" }}>
              <Body>{formatDelta(row)}</Body>
            </View>
          </View>
        );
      })}
    </Card>
  );
};
