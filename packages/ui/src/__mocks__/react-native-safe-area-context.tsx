import { createElement } from "react";
import type { ReactNode } from "react";

type Children = { children?: ReactNode };

export const SafeAreaProvider = ({ children }: Children) =>
  createElement("SafeAreaProvider", null, children);

export const SafeAreaView = ({ children }: Children) =>
  createElement("SafeAreaView", null, children);

export const useSafeAreaInsets = () => ({ top: 24, bottom: 0, left: 0, right: 0 });
