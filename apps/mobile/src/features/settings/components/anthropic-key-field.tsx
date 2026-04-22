import { useState } from "react";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { AutoCapitalize, Body, Button, ButtonMode, Caption, Card, TextInput } from "@garden/ui";
import { SummaryType } from "@garden/config";
import { useAnthropicKey } from "@/features/settings/hooks/use-anthropic-key";

export const AnthropicKeyField = () => {
  const { keyMasked, hasKey, saveKey, clearKey, isLoading } = useAnthropicKey();
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onPaste = async () => {
    const text = await Clipboard.getStringAsync();
    setDraft(text.trim());
    setError(null);
  };

  const onSave = async () => {
    const plain = draft.trim();
    if (!plain) {
      setError("Paste a key first");
      return;
    }
    setError(null);
    try {
      await saveKey(plain);
      setDraft("");
    } catch {
      setError("Could not save key. Secure store unavailable.");
    }
  };

  const onClear = async () => {
    try {
      await clearKey();
      setDraft("");
      setError(null);
    } catch {
      setError("Could not clear key.");
    }
  };

  if (hasKey) {
    return (
      <Card accessibilityLabel="Anthropic key">
        <Body>Anthropic API key</Body>
        <Body muted>{keyMasked ?? "***…***"}</Body>
        <Body muted>Stored in the device secure store.</Body>
        <View style={{ marginTop: 8 }}>
          <Button
            mode={ButtonMode.Secondary}
            onPress={() => {
              void onClear();
            }}
            disabled={isLoading}
            accessibilityLabel="Clear Anthropic key"
          >
            {isLoading ? "Working…" : "Clear key"}
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card accessibilityLabel="Anthropic key">
      <Body>Anthropic API key</Body>
      <Body muted>Bring your own key. Nothing leaves your device until you save.</Body>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        label="Anthropic API key"
        placeholder="sk-ant-…"
        secureTextEntry
        autoCapitalize={AutoCapitalize.None}
        accessibilityLabel="Anthropic API key"
      />
      {error ? <Caption variant={SummaryType.ActionRequired}>{error}</Caption> : null}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        <Button
          mode={ButtonMode.Secondary}
          onPress={() => {
            void onPaste();
          }}
          accessibilityLabel="Paste from clipboard"
        >
          Paste from clipboard
        </Button>
        <Button
          mode={ButtonMode.Primary}
          onPress={() => {
            void onSave();
          }}
          disabled={isLoading}
          accessibilityLabel="Save Anthropic key"
        >
          {isLoading ? "Saving…" : "Save key"}
        </Button>
      </View>
    </Card>
  );
};
