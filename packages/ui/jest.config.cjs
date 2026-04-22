const base = require("../../jest.preset.cjs");

module.exports = {
  ...base,
  displayName: "@garden/ui",
  testEnvironment: "node",
  moduleNameMapper: {
    ...base.moduleNameMapper,
    "^react-native$": "<rootDir>/src/__mocks__/react-native.tsx",
    "^react-native-safe-area-context$": "<rootDir>/src/__mocks__/react-native-safe-area-context.tsx"
  }
};
