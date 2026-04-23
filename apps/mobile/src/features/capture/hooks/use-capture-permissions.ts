import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { createLogger } from "@/core/logger";

const log = createLogger("capture-permissions");

export type CapturePermissions = {
  readonly camera: boolean;
  readonly location: boolean;
  readonly motion: boolean;
  readonly allGranted: boolean;
  readonly refresh: () => Promise<void>;
  readonly request: () => Promise<void>;
};

const asGranted = (value: { status?: string; granted?: boolean }): boolean => {
  if (typeof value.granted === "boolean") {
    return value.granted;
  }
  return value.status === "granted";
};

const readOnce = async () => {
  const [camera, location, motion] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    DeviceMotion.getPermissionsAsync()
  ]);
  return {
    camera: asGranted(camera),
    location: asGranted(location),
    motion: asGranted(motion)
  };
};

export const useCapturePermissions = (): CapturePermissions => {
  const [state, setState] = useState({ camera: false, location: false, motion: false });

  const refresh = useCallback(async () => {
    try {
      const next = await readOnce();
      setState(next);
    } catch (err) {
      log.warn("permissions read failed", {
        name: err instanceof Error ? err.name : "unknown"
      });
    }
  }, []);

  const request = useCallback(async () => {
    try {
      await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        Location.requestForegroundPermissionsAsync(),
        DeviceMotion.requestPermissionsAsync()
      ]);
      await refresh();
    } catch (err) {
      log.warn("permissions request failed", {
        name: err instanceof Error ? err.name : "unknown"
      });
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        void refresh();
      }
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    camera: state.camera,
    location: state.location,
    motion: state.motion,
    allGranted: state.camera && state.location && state.motion,
    refresh,
    request
  };
};
