import { createElement } from "react";
import { act } from "react-test-renderer";
import { findByAccessibilityLabel, flush, renderWithProviders } from "@/__tests__/test-utils";
import { AnthropicKeyField } from "@/features/settings/components/anthropic-key-field";
import { settingsStore } from "@/features/settings";
import * as SecureStore from "expo-secure-store";
import * as Clipboard from "expo-clipboard";

declare module "expo-secure-store" {
  export const __reset: () => void;
}
declare module "expo-clipboard" {
  export const __setClipboard: (value: string) => void;
}

describe("AnthropicKeyField", () => {
  beforeEach(() => {
    SecureStore.__reset();
    Clipboard.__setClipboard("");
    settingsStore.getState().setAnthropicKeyConfigured(false);
  });

  it("rejects save when no key has been pasted", async () => {
    const tree = renderWithProviders(createElement(AnthropicKeyField));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Save Anthropic key").props.onPress();
    });
    await flush();
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("Paste a key first");
    expect(settingsStore.getState().anthropicKeyConfigured).toBe(false);
  });

  it("pastes and saves a key, flips configured flag, shows masked", async () => {
    Clipboard.__setClipboard("sk-ant-abc123defGHIJ4567");
    const tree = renderWithProviders(createElement(AnthropicKeyField));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Paste from clipboard").props.onPress();
    });
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Save Anthropic key").props.onPress();
    });
    await flush();

    expect(settingsStore.getState().anthropicKeyConfigured).toBe(true);
    expect(await SecureStore.getItemAsync("anthropic_api_key")).toBe("sk-ant-abc123defGHIJ4567");
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts.some((t) => t.includes("***…***4567"))).toBe(true);
  });

  it("clears the stored key and flips configured flag back", async () => {
    await SecureStore.setItemAsync("anthropic_api_key", "sk-ant-xxxxxxxxxxxxxxxx9999");
    settingsStore.getState().setAnthropicKeyConfigured(true);

    const tree = renderWithProviders(createElement(AnthropicKeyField));
    await flush();
    await act(async () => {
      findByAccessibilityLabel(tree, "Clear Anthropic key").props.onPress();
    });
    await flush();

    expect(await SecureStore.getItemAsync("anthropic_api_key")).toBeNull();
    expect(settingsStore.getState().anthropicKeyConfigured).toBe(false);
  });
});
