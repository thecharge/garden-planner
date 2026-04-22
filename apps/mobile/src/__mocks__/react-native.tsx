/** Minimal react-native stub shared with @garden/ui mocks. Tests can assert
 * against host types by name (View, Text, Pressable, TextInput, ScrollView).
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
