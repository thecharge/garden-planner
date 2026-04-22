/** Jest config for the mobile app.
 *
 * Only tests files that DON'T require the RN runtime (pure core/engine/feature
 * logic). Component tests require a jest-expo preset and real RN; those are
 * run in the device CI pipeline, not here.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  displayName: "apps-mobile",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
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
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  clearMocks: true,
  restoreMocks: true
};
