export const NotificationFeedbackType = {
  Success: "success",
  Warning: "warning",
  Error: "error"
} as const;

export const ImpactFeedbackStyle = {
  Light: "light",
  Medium: "medium",
  Heavy: "heavy"
} as const;

export const notificationAsync = jest.fn(async (_t: unknown) => undefined);
export const impactAsync = jest.fn(async (_s: unknown) => undefined);
export const selectionAsync = jest.fn(async () => undefined);
