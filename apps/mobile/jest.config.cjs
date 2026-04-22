/** Jest config for the mobile app.
 *
 * Runs pure Node tests (core/engine/feature logic) AND Node-side render tests
 * (`*.test.tsx`) using react-test-renderer with RN / expo shims in
 * `src/__mocks__/`. Device-integration tests still live in the device CI pipe.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  displayName: "apps-mobile",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.ts",
    "<rootDir>/src/**/__tests__/**/*.test.tsx"
  ],
  moduleNameMapper: {
    "^@garden/config$": "<rootDir>/../../packages/config/src/index.ts",
    "^@garden/config/(.*)$": "<rootDir>/../../packages/config/src/$1",
    "^@garden/core$": "<rootDir>/../../packages/core/src/index.ts",
    "^@garden/core/(.*)$": "<rootDir>/../../packages/core/src/$1",
    "^@garden/memory$": "<rootDir>/../../packages/memory/src/index.ts",
    "^@garden/memory/(.*)$": "<rootDir>/../../packages/memory/src/$1",
    "^@garden/engine$": "<rootDir>/../../packages/engine/src/index.ts",
    "^@garden/engine/(.*)$": "<rootDir>/../../packages/engine/src/$1",
    "^@garden/ui$": "<rootDir>/../../packages/ui/src/index.ts",
    "^@garden/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native$": "<rootDir>/src/__mocks__/react-native.tsx",
    "^react-native-safe-area-context$": "<rootDir>/src/__mocks__/react-native-safe-area-context.tsx",
    "^expo-router$": "<rootDir>/src/__mocks__/expo-router.tsx",
    "^expo-secure-store$": "<rootDir>/src/__mocks__/expo-secure-store.ts",
    "^expo-clipboard$": "<rootDir>/src/__mocks__/expo-clipboard.ts",
    "^@expo/vector-icons$": "<rootDir>/src/__mocks__/@expo/vector-icons.tsx"
  },
  clearMocks: true,
  restoreMocks: true
};
