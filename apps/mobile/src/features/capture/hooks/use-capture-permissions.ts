import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
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

const asGranted = (value: { status?: string; granted?: boolean } | undefined | null): boolean => {
  if (!value) {
    return false;
  }
  if (typeof value.granted === "boolean") {
    return value.granted;
  }
  return value.status === "granted";
};

/** DeviceMotion has no Android runtime permission — it's always accessible via
 * the standard sensor API. On iOS + Web the user prompt is required; we detect
 * those and call the async getter only there.
 */
const readMotionGranted = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    return true;
  }
  try {
    const getter = (
      DeviceMotion as unknown as {
        getPermissionsAsync?: () => Promise<{ status?: string; granted?: boolean }>;
      }
    ).getPermissionsAsync;
    if (!getter) {
      return true;
    }
    const res = await getter();
    return asGranted(res);
  } catch {
    return true;
  }
};

const readOnce = async () => {
  const [camera, location, motion] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    readMotionGranted()
  ]);
  return {
    camera: asGranted(camera),
    location: asGranted(location),
    motion
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

  const requestMotion = useCallback(async (): Promise<void> => {
    if (Platform.OS === "android") {
      return;
    }
    try {
      const requester = (
        DeviceMotion as unknown as {
          requestPermissionsAsync?: () => Promise<unknown>;
        }
      ).requestPermissionsAsync;
      if (requester) {
        await requester();
      }
    } catch {
      // no-op
    }
  }, []);

  const request = useCallback(async () => {
    try {
      await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        Location.requestForegroundPermissionsAsync(),
        requestMotion()
      ]);
      await refresh();
    } catch (err) {
      log.warn("permissions request failed", {
        name: err instanceof Error ? err.name : "unknown"
      });
    }
  }, [refresh, requestMotion]);

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
