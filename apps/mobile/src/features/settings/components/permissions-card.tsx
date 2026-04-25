import { Linking } from "react-native";
import { router } from "expo-router";
import { Body, Button, ButtonMode, Card, ListItem } from "@garden/ui";
import { useCapturePermissions } from "@/features/capture";

const statusLabel = (granted: boolean): string => (granted ? "Granted" : "Not granted");

export const PermissionsCard = () => {
  const perms = useCapturePermissions();

  const anyUndetermined = !perms.camera || !perms.location || !perms.motion;
  const allGranted = perms.allGranted;

  const handleManage = async () => {
    if (anyUndetermined && !allGranted) {
      router.push("/capture/permissions");
      return;
    }
    await Linking.openSettings();
  };

  return (
    <Card accessibilityLabel="Camera and location permissions card">
      <Body>Camera &amp; Location</Body>
      <Body muted>
        {allGranted
          ? "All permissions granted. The capture feature is fully enabled."
          : "Some permissions are missing. Tap below to grant them."}
      </Body>
      <ListItem title="Camera" description={statusLabel(perms.camera)} />
      <ListItem title="Location" description={statusLabel(perms.location)} />
      <ListItem title="Motion sensor" description={statusLabel(perms.motion)} />
      {!allGranted ? (
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => {
            void handleManage();
          }}
          accessibilityLabel={
            anyUndetermined ? "Open permissions rationale screen" : "Open device settings"
          }
        >
          {anyUndetermined ? "Manage permissions" : "Open device settings"}
        </Button>
      ) : null}
    </Card>
  );
};
