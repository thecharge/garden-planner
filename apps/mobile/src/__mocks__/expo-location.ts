export const requestForegroundPermissionsAsync = jest.fn(async () => ({
  status: "granted",
  granted: true
}));

export const getForegroundPermissionsAsync = jest.fn(async () => ({
  status: "granted",
  granted: true
}));

export const getLastKnownPositionAsync = jest.fn(async () => ({
  coords: { latitude: 42.64, longitude: 23.5, accuracy: 8 },
  timestamp: Date.now()
}));

export const getCurrentPositionAsync = jest.fn(async () => ({
  coords: { latitude: 42.64, longitude: 23.5, accuracy: 8 },
  timestamp: Date.now()
}));

export const Accuracy = {
  Balanced: 3,
  High: 4
} as const;
