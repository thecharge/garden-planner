import { createElement } from "react";
import type { ReactNode } from "react";

export const SafeAreaProvider = ({ children }: { children?: ReactNode }) =>
  createElement("SafeAreaProvider", null, children);

export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
