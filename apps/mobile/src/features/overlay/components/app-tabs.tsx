import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useThemeTokens } from "@garden/ui";

const FeatherIcon = {
  Camera: "camera",
  Grid: "grid",
  BarChart: "bar-chart-2",
  RefreshCw: "refresh-cw",
  Droplet: "droplet",
  Package: "package",
  Settings: "settings"
} as const;
type FeatherIcon = (typeof FeatherIcon)[keyof typeof FeatherIcon];

const ICON_SIZE = 22;

const renderIcon =
  (name: FeatherIcon) =>
  ({ color }: { readonly color: string }) =>
    <Feather name={name} size={ICON_SIZE} color={color} />;

const tabs: ReadonlyArray<{ readonly name: string; readonly title: string; readonly icon: FeatherIcon }> = [
  { name: "capture", title: "Capture", icon: FeatherIcon.Camera },
  { name: "sectors", title: "Sectors", icon: FeatherIcon.Grid },
  { name: "yield", title: "Yield", icon: FeatherIcon.BarChart },
  { name: "rotation", title: "Rotation", icon: FeatherIcon.RefreshCw },
  { name: "nutrient", title: "Nutrient", icon: FeatherIcon.Droplet },
  { name: "inventory", title: "Inventory", icon: FeatherIcon.Package },
  { name: "settings", title: "Settings", icon: FeatherIcon.Settings }
];

export const AppTabs = () => {
  const tokens = useThemeTokens();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: tokens.colors.onMuted,
        tabBarStyle: {
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.muted
        }
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: renderIcon(t.icon) }}
        />
      ))}
    </Tabs>
  );
};
