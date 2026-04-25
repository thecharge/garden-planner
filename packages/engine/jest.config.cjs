module.exports = {
  ...require("../../jest.preset.cjs"),
  displayName: "@garden/engine",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/__mocks__/**",
    "!src/__tests__/_test-utils.ts",
    "!src/**/audit-citations.ts"
  ]
};
