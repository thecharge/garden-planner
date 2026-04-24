import { useCallback, useState } from "react";
import { View } from "react-native";
import { CameraView } from "expo-camera";
import { useIsFocused, useRouter } from "expo-router";
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
import { SmepError } from "@garden/config";
import { summary } from "@garden/core";
import { useCapturePermissions } from "../hooks/use-capture-permissions";
import { useComplianceVerdict } from "../hooks/use-compliance-verdict";
import { captureProtocol, expoLocationAdapter, expoMotionAdapter } from "@/engine/capture-driver";
import { createLogger } from "@/core/logger";
import { useAnnounce } from "@/core/announce";
import { config } from "@/core/config";

const log = createLogger("capture-screen");
const VIEWFINDER_HEIGHT = 260;

export const CaptureScreen = () => {
  const tokens = useThemeTokens();
  const router = useRouter();
  const perms = useCapturePermissions();
  const verdict = useComplianceVerdict();
  const announce = useAnnounce();
  const isFocused = useIsFocused();
  const [propertyLineMeters, setPropertyLineMeters] = useState<string>("");
  const [scanBusy, setScanBusy] = useState(false);
  const [viewfinderOpen, setViewfinderOpen] = useState(false);

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
      setViewfinderOpen(false);
    } catch (err) {
      const message =
        err instanceof SmepError
          ? "Pan the camera across the slope for three full seconds and try again."
          : "Scan failed. Try again.";
      log.warn("scan failed", {
        name: err instanceof Error ? err.name : "unknown",
        code: err instanceof SmepError ? err.code : undefined
      });
      void announce(summary.actionRequired(message));
    } finally {
      setScanBusy(false);
    }
  }, [perms.allGranted, scanBusy, propertyLineMeters, verdict, announce]);

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
          {perms.camera && viewfinderOpen && isFocused ? (
            <CameraView style={{ flex: 1 }} facing="back" />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: tokens.colors.primary,
                padding: 16
              }}
            >
              <Body muted>
                {perms.camera
                  ? viewfinderOpen
                    ? "Viewfinder paused (off-screen)"
                    : "Viewfinder closed to save memory"
                  : "Camera permission not granted"}
              </Body>
            </View>
          )}
        </View>
        {perms.camera ? (
          <Button
            mode={ButtonMode.Secondary}
            onPress={() => setViewfinderOpen((prev) => !prev)}
            accessibilityLabel={viewfinderOpen ? "Close viewfinder" : "Open viewfinder"}
          >
            {viewfinderOpen ? "Close viewfinder" : "Open viewfinder"}
          </Button>
        ) : null}
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
