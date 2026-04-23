import "@/core/i18n";
import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { RootGate } from "@/core/root-gate";

const RootLayout = () => (
  <RootGate>
    <Stack screenOptions={{ headerShown: false }} />
  </RootGate>
);

export default RootLayout;
