import { useCallback } from "react";
import { useRouter } from "expo-router";
import { Body, Button, ButtonMode, Caption, Card, Heading, Screen } from "@garden/ui";
import { useCapturePermissions } from "../hooks/use-capture-permissions";

const Row = ({ label, granted }: { label: string; granted: boolean }) => (
  <Card accessibilityLabel={`${label} ${granted ? "granted" : "not granted"}`}>
    <Body>{label}</Body>
    <Caption variant={granted ? "success" : "actionRequired"}>
      {granted ? "Granted" : "Not granted"}
    </Caption>
  </Card>
);

export const PermissionsScreen = () => {
  const router = useRouter();
  const perms = useCapturePermissions();

  const onGrant = useCallback(async () => {
    await perms.request();
    if (perms.allGranted) {
      router.back();
    }
  }, [perms, router]);

  return (
    <Screen accessibilityLabel="Capture permissions">
      <Heading>Capture needs three things</Heading>
      <Body muted>
        The Scan flow fuses the camera, compass, and location into a real Protocol. Without these
        three, we cannot produce a compliance verdict.
      </Body>
      <Row label="Camera" granted={perms.camera} />
      <Row label="Location" granted={perms.location} />
      <Row label="Motion (compass + gyroscope)" granted={perms.motion} />
      <Button onPress={onGrant} accessibilityLabel="Grant all three permissions">
        Grant access
      </Button>
      {perms.allGranted ? (
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => router.back()}
          accessibilityLabel="Return to capture"
        >
          Back to Capture
        </Button>
      ) : null}
    </Screen>
  );
};
