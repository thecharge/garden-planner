import { useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Body, Button, ButtonMode, Card, Heading, TextInput } from "@garden/ui";
import type { Protocol } from "@garden/config";

export type CreateSectorSheetProps = {
  readonly protocol: Protocol | null;
  readonly onConfirm: (name: string, protocol: Protocol) => void;
  readonly onCancel: () => void;
};

const formatDate = (iso: string): string => iso.slice(0, 10);

export const CreateSectorSheet = ({ protocol, onConfirm, onCancel }: CreateSectorSheetProps) => {
  const defaultName = protocol ? `Scan ${formatDate(protocol.capturedAt)}` : "";
  const [name, setName] = useState(defaultName);

  if (!protocol) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(name.trim().length > 0 ? name.trim() : defaultName, protocol);
  };

  const slopeText = protocol.data.slopeDegree.toFixed(1);
  const orientationText =
    protocol.data.orientationDegrees !== undefined
      ? `${protocol.data.orientationDegrees.toFixed(0)}°`
      : "Unknown";

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      accessibilityLabel="Create sector sheet"
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <Card accessibilityLabel="Create sector form">
          <Heading>Create sector</Heading>
          <Body muted>Save this scan as a new sector in your plot.</Body>

          <TextInput
            label="Sector name"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Sector name input"
          />

          <Body>Slope: {slopeText}°</Body>
          <Body>Orientation: {orientationText}</Body>

          <Button onPress={handleConfirm} accessibilityLabel="Confirm create sector">
            Create sector
          </Button>
          <Button
            mode={ButtonMode.Secondary}
            onPress={onCancel}
            accessibilityLabel="Cancel create sector"
          >
            Cancel
          </Button>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16
  }
});
