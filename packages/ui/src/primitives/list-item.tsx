import { View } from "react-native";
import { Body } from "./body";
import { useThemeTokens } from "./theme-provider";

export type ListItemProps = {
  readonly title: string;
  readonly description?: string;
  readonly right?: string;
  readonly accessibilityLabel?: string;
};

export const ListItem = ({ title, description, right, accessibilityLabel }: ListItemProps) => {
  const tokens = useThemeTokens();
  return (
    <View
      accessibilityRole="text"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: tokens.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: tokens.colors.muted,
        gap: 12
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Body>{title}</Body>
        {description ? <Body muted>{description}</Body> : null}
      </View>
      {right ? <Body muted>{right}</Body> : null}
    </View>
  );
};
