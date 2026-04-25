module.exports = {
  ...require("../../jest.preset.cjs"),
  displayName: "@garden/config",
  // Config package contains only type declarations, pure `as const` objects, and
  // error factory functions. Only the errors module has runnable logic worth measuring.
  collectCoverageFrom: ["src/errors.ts"],
  coverageThreshold: {
    global: { lines: 90, functions: 90 }
  }
};
