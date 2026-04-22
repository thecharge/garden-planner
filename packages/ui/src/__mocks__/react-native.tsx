/** Minimal react-native stub for Node-side unit tests.
 *
 * RN's real entry point uses Flow syntax Jest can't parse. The real components
 * also rely on a native renderer. For unit tests of our primitives we only
 * need a component identity we can assert against in the rendered tree —
 * react-test-renderer is happy with any function/class component.
 */
import { createElement } from "react";
import type { ReactNode, CSSProperties } from "react";

type AnyProps = { children?: ReactNode; style?: CSSProperties; [k: string]: unknown };

const makeHost = (name: string) => (props: AnyProps) => createElement(name, props, props.children);

export const View = makeHost("View");
export const Text = makeHost("Text");
export const ScrollView = makeHost("ScrollView");
export const Pressable = ({ children, ...props }: AnyProps) => {
  const resolvedChildren =
    typeof children === "function"
      ? (children as (s: { pressed: boolean }) => ReactNode)({ pressed: false })
      : children;
  return createElement("Pressable", props, resolvedChildren);
};
export const TextInput = makeHost("TextInput");
export const StatusBar = { currentHeight: 24 };

export default { View, Text, ScrollView, Pressable, TextInput, StatusBar };
