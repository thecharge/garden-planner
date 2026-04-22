/** Shared Jest preset. Each package extends this via its own jest.config.ts. */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  moduleNameMapper: {
    "^@garden/config$": "<rootDir>/../config/src/index.ts",
    "^@garden/config/(.*)$": "<rootDir>/../config/src/$1",
    "^@garden/core$": "<rootDir>/../core/src/index.ts",
    "^@garden/core/(.*)$": "<rootDir>/../core/src/$1",
    "^@garden/memory$": "<rootDir>/../memory/src/index.ts",
    "^@garden/memory/(.*)$": "<rootDir>/../memory/src/$1",
    "^@garden/engine$": "<rootDir>/../engine/src/index.ts",
    "^@garden/engine/(.*)$": "<rootDir>/../engine/src/$1"
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  coverageReporters: ["text", "lcov"],
  clearMocks: true,
  restoreMocks: true
};
