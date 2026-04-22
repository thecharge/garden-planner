import { useCallback, useState } from "react";
import { View } from "react-native";
import type { Protocol } from "@garden/config";
import { createProtocol } from "@garden/core";
import { Body, Button, Card, Caption, Heading, Screen, useThemeTokens } from "@garden/ui";
import { useComplianceVerdict } from "@/features/capture";
import { getPose } from "@/engine/spatial-store";
import { createLogger } from "@/core/logger";
import { config } from "@/core/config";

const log = createLogger("capture-screen");
const VIEWFINDER_HEIGHT = 240;

export const CaptureScreen = () => {
  const tokens = useThemeTokens();
  const verdict = useComplianceVerdict();
  const [windowOpen, setWindowOpen] = useState(false);

  const onScan = useCallback(() => {
    setWindowOpen(true);
    const pose = getPose();
    const protocol: Protocol = createProtocol({
      id: `scan-${Date.now().toString()}`,
      capturedAt: new Date().toISOString(),
      confidence: pose.confidence === 0 ? 0.75 : pose.confidence,
      data: {
        distanceToPropertyLine: 5,
        slopeDegree: Math.abs(pose.pitchDeg),
        waterTableDepth: 4
      }
    });
    log.info("scan triggered", { protocolId: protocol.id, windowMs: config.CAPTURE_WINDOW_MS });
    verdict.mutate(protocol, { onSettled: () => setWindowOpen(false) });
  }, [verdict]);

  const captionText = verdict.isPending || windowOpen
    ? "Scanning…"
    : verdict.data
    ? verdict.data.message
    : "Ready to scan.";

  return (
    <Screen accessibilityLabel="Capture screen">
      <Heading>Scan the slope</Heading>
      <Body muted>Point the camera at the slope. Pan slowly for three seconds.</Body>
      <Card accessibilityLabel="Viewfinder placeholder">
        <View
          style={{
            height: VIEWFINDER_HEIGHT,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: tokens.colors.primary,
            borderStyle: "dashed",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.colors.muted
          }}
        >
          <Body muted>Viewfinder</Body>
        </View>
      </Card>
      <Button onPress={onScan} accessibilityLabel="Start capture">
        {verdict.isPending ? "Scanning…" : "Scan"}
      </Button>
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
