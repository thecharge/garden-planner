import "@/core/i18n";
import { Stack } from "expo-router";
import { QueryProvider } from "@/core/query/provider";

const RootLayout = () => (
  <QueryProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </QueryProvider>
);

export default RootLayout;
