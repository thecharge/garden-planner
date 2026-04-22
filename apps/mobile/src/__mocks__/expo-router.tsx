import { createElement } from "react";
import type { ReactNode } from "react";

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn()
};

export const useLocalSearchParams = <T extends Record<string, string>>(): T => ({}) as T;

export const Stack = ({ children }: { children?: ReactNode }) =>
  createElement("Stack", null, children);

export const Tabs = ({ children }: { children?: ReactNode }) =>
  createElement("Tabs", null, children);

(Tabs as unknown as { Screen: typeof Tabs }).Screen = (({ children }: { children?: ReactNode }) =>
  createElement("TabsScreen", null, children)) as typeof Tabs;
