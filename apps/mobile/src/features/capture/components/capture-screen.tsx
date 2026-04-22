import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import type { Protocol } from "@garden/config";
import { createProtocol } from "@garden/core";
import { useComplianceVerdict } from "@/features/capture";
import { getPose } from "@/engine/spatial-store";
import { createLogger } from "@/core/logger";
import { config } from "@/core/config";

const log = createLogger("capture-screen");

/** The one primary screen. Camera preview + green/red overlay chrome + live caption.
 *
 * The screen itself is thin: it builds a Protocol from the live pose and runs
 * the TanStack Query mutation. Heavy math lives in @garden/core and @garden/engine.
 */
export const CaptureScreen = () => {
  const verdict = useComplianceVerdict();

  const onScan = useCallback(() => {
    const pose = getPose();
    const protocol: Protocol = createProtocol({
      id: `scan-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      confidence: pose.confidence,
      data: {
        distanceToPropertyLine: 5,
        slopeDegree: Math.abs(pose.pitchDeg),
        waterTableDepth: 4
      }
    });
    log.info("scan triggered", { protocolId: protocol.id, windowMs: config.CAPTURE_WINDOW_MS });
    verdict.mutate(protocol);
  }, [verdict]);

  return (
    <View accessibilityLabel="Capture screen" style={{ flex: 1 }}>
      <Text accessibilityRole="header">Scan the slope</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Start capture" onPress={onScan}>
        <Text>Scan</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite">
        {verdict.isPending
          ? "Scanning…"
          : verdict.data
          ? verdict.data.message
          : "Ready to scan."}
      </Text>
    </View>
  );
};
