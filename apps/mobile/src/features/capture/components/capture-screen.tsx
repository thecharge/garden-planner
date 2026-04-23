import { useCallback, useState } from "react";
import { View } from "react-native";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import {
  Body,
  Button,
  ButtonMode,
  Card,
  Caption,
  Heading,
  Screen,
  TextInput,
  useThemeTokens
} from "@garden/ui";
import { useCapturePermissions } from "../hooks/use-capture-permissions";
import { useComplianceVerdict } from "../hooks/use-compliance-verdict";
import { captureProtocol, expoLocationAdapter, expoMotionAdapter } from "@/engine/capture-driver";
import { createLogger } from "@/core/logger";
import { config } from "@/core/config";

const log = createLogger("capture-screen");
const VIEWFINDER_HEIGHT = 260;

export const CaptureScreen = () => {
  const tokens = useThemeTokens();
  const router = useRouter();
  const perms = useCapturePermissions();
  const verdict = useComplianceVerdict();
  const [propertyLineMeters, setPropertyLineMeters] = useState<string>("");
  const [scanBusy, setScanBusy] = useState(false);

  const onScan = useCallback(async () => {
    if (!perms.allGranted || scanBusy) {
      return;
    }
    setScanBusy(true);
    try {
      const pinned = Number(propertyLineMeters);
      const propertyLineDistanceMeters =
        propertyLineMeters.trim().length > 0 && Number.isFinite(pinned) && pinned > 0
          ? pinned
          : undefined;
      const protocol = await captureProtocol(
        { motion: expoMotionAdapter, location: expoLocationAdapter },
        { windowMs: config.CAPTURE_WINDOW_MS, propertyLineDistanceMeters }
      );
      log.info("scan produced protocol", {
        id: protocol.id,
        slope: protocol.data.slopeDegree.toFixed(1),
        hasLine: protocol.data.distanceToPropertyLine !== undefined
      });
      verdict.mutate(protocol);
    } catch (err) {
      log.warn("scan failed", { name: err instanceof Error ? err.name : "unknown" });
    } finally {
      setScanBusy(false);
    }
  }, [perms.allGranted, scanBusy, propertyLineMeters, verdict]);

  const captionText =
    scanBusy || verdict.isPending
      ? "Scanning…"
      : verdict.data
        ? verdict.data.message
        : perms.allGranted
          ? "Ready to scan."
          : "Grant camera, location, and motion access to scan";

  return (
    <Screen accessibilityLabel="Capture screen">
      <Heading>Scan the slope</Heading>
      <Body muted>Point the camera at the slope. Pan slowly for three seconds.</Body>

      <Card accessibilityLabel="Viewfinder">
        <View
          style={{
            height: VIEWFINDER_HEIGHT,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: tokens.colors.muted
          }}
        >
          {perms.camera ? (
            <CameraView style={{ flex: 1 }} />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: tokens.colors.primary
              }}
            >
              <Body muted>Camera permission not granted</Body>
            </View>
          )}
        </View>
      </Card>

      <Card accessibilityLabel="Property-line pin">
        <Body>Pinned property-line distance (metres)</Body>
        <TextInput
          value={propertyLineMeters}
          onChangeText={setPropertyLineMeters}
          keyboardType="numeric"
          accessibilityLabel="Property line distance in metres"
          placeholder="e.g. 3.5"
        />
        <Caption>Without a pin, the compliance engine cannot emit a setback verdict.</Caption>
      </Card>

      {perms.allGranted ? null : (
        <Caption variant="actionRequired">
          Grant camera, location, and motion access to scan. Tap below to open the rationale.
        </Caption>
      )}

      {perms.allGranted ? (
        <Button
          onPress={onScan}
          loading={scanBusy || verdict.isPending}
          accessibilityLabel="Start capture"
        >
          {scanBusy || verdict.isPending ? "Scanning…" : "Scan"}
        </Button>
      ) : (
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => router.push("/capture/permissions")}
          accessibilityLabel="Open permissions screen"
        >
          Grant access
        </Button>
      )}

      <Caption>{captionText}</Caption>

      {verdict.data?.meta?.sourceRuleId ? (
        <Card>
          <Body>Rule: {String(verdict.data.meta.sourceRuleId)}</Body>
          <Body muted>{String(verdict.data.meta.reference ?? "")}</Body>
        </Card>
      ) : null}
    </Screen>
  );
};
