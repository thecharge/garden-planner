import { View } from "react-native";
import type { ReactNode } from "react";

export const CameraView = ({
  children
}: {
  children?: ReactNode;
  style?: unknown;
  active?: boolean;
}) => <View>{children}</View>;

export const useCameraPermissions = jest.fn(() => [
  { status: "granted", granted: true },
  jest.fn(async () => ({ status: "granted", granted: true }))
]);

export const requestCameraPermissionsAsync = jest.fn(async () => ({
  status: "granted",
  granted: true
}));
export const getCameraPermissionsAsync = jest.fn(async () => ({
  status: "granted",
  granted: true
}));
