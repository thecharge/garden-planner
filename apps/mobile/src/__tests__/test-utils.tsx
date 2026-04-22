/** Shared test helpers for apps-mobile component tests. */
import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@garden/ui";
import { ThemeId } from "@garden/config";

// Tell React to treat this as an "act" environment so useEffect-triggered
// updates (React Query's query subscription) flush synchronously inside act().
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false }
    }
  });

export const wrap = (children: ReactNode): ReactElement => {
  const qc = makeQueryClient();
  return createElement(
    QueryClientProvider,
    { client: qc },
    createElement(ThemeProvider, { themeId: ThemeId.LightPastel, children })
  );
};

export const renderWithProviders = (children: ReactNode): TestRenderer.ReactTestRenderer => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(wrap(children));
  });
  return tree;
};

export const flush = async (ticks = 6): Promise<void> => {
  for (let i = 0; i < ticks; i += 1) {
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
  }
};

export const findByAccessibilityLabel = (
  tree: TestRenderer.ReactTestRenderer,
  label: string
): TestRenderer.ReactTestInstance => {
  const matches = tree.root.findAll((n) => n.props?.accessibilityLabel === label);
  const pressable = matches.find((m) => typeof m.props.onPress === "function");
  const input = matches.find((m) => typeof m.props.onChangeText === "function");
  return (pressable ?? input ?? matches[0]) as TestRenderer.ReactTestInstance;
};
