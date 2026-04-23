export const DeviceMotion = {
  isAvailableAsync: jest.fn(async () => true),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted", granted: true })),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted", granted: true })),
  setUpdateInterval: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeAllListeners: jest.fn()
};
