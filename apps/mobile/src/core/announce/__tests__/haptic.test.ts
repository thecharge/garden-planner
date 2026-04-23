import * as Haptics from "expo-haptics";
import { mapToExpoFeedback } from "../haptic";

describe("mapToExpoFeedback", () => {
  it("maps a single short pulse to Success", () => {
    expect(mapToExpoFeedback([50])).toBe(Haptics.NotificationFeedbackType.Success);
  });

  it("maps three short pulses (warning) to Warning", () => {
    expect(mapToExpoFeedback([50, 80, 50])).toBe(Haptics.NotificationFeedbackType.Warning);
  });

  it("maps five short pulses (actionRequired) to Warning", () => {
    expect(mapToExpoFeedback([50, 80, 50, 80, 50])).toBe(Haptics.NotificationFeedbackType.Warning);
  });

  it("maps one long pulse (rejection) to Error", () => {
    expect(mapToExpoFeedback([400])).toBe(Haptics.NotificationFeedbackType.Error);
  });

  it("unknown shape falls back to Success (Light-equivalent)", () => {
    expect(mapToExpoFeedback([])).toBe(Haptics.NotificationFeedbackType.Success);
    expect(mapToExpoFeedback([50, 80])).toBe(Haptics.NotificationFeedbackType.Success);
  });
});
