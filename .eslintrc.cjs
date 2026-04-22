/** Root ESLint config — enforces the project rulebook.
 *
 * Rules here apply to every package. Package-level .eslintrc.cjs files
 * add package-specific constraints (e.g. forbidding expo-* inside pure packages).
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: false
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  ignorePatterns: [
    "node_modules",
    "dist",
    "coverage",
    ".turbo",
    ".expo",
    "android",
    "ios",
    "*.config.js",
    "*.config.cjs"
  ],
  rules: {
    // --- Structural rules (from the project rulebook) ---
    "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    "max-depth": ["error", 2],
    "max-nested-callbacks": ["error", 2],

    // No function declarations — const arrow only.
    // No switch statements.
    // No else-if; use early return.
    // No .js extensions on relative imports.
    // No `new Error(...)` anywhere (overridden only in @garden/config).
    "no-restricted-syntax": [
      "error",
      {
        selector: "FunctionDeclaration",
        message: "Use const arrow functions: `export const fn = () => {}`."
      },
      {
        selector: "SwitchStatement",
        message: "No switch/case. Use early returns with if."
      },
      {
        selector: "IfStatement > IfStatement.alternate",
        message: "No else-if. Use early return / continue instead."
      },
      {
        selector: "ImportDeclaration[source.value=/\\.js$/]",
        message: "No `.js` extensions on imports."
      },
      {
        selector: "NewExpression[callee.name='Error']",
        message: "No `new Error(...)`. Throw via SmepErrors factory from @garden/config."
      },
      {
        // Ban string-literal unions. Matches TSUnionType whose every member is
        // a TSLiteralType whose literal is a string (e.g., `"a" | "b" | "c"`).
        // Discriminated unions (objects with a string-typed tag) are unaffected
        // because each member is a TSTypeLiteral, not a TSLiteralType.
        selector:
          "TSUnionType:not(:has(> :not(TSLiteralType[literal.type='Literal'][literal.value=/^[a-zA-Z_-]/])))",
        message:
          "String-literal unions are forbidden. Define `const X = {...} as const; type X = typeof X[keyof typeof X]` and use `X.Member`."
      }
    ],

    // Prefer const arrow and early return.
    "func-style": ["error", "expression", { allowArrowFunctions: true }],
    "prefer-const": "error",
    "no-var": "error",

    // Import hygiene — package names, not relative cross-package paths.
    "import/no-relative-packages": "error",

    // TypeScript specifics.
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error"
  },
  overrides: [
    {
      // The config package is the one place `new Error(...)` is allowed
      // (SmepErrors factory needs to construct them).
      files: ["packages/config/src/**/*.ts"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "FunctionDeclaration",
            message: "Use const arrow functions."
          },
          {
            selector: "SwitchStatement",
            message: "No switch/case."
          },
          {
            selector: "IfStatement > IfStatement.alternate",
            message: "No else-if."
          },
          {
            selector: "ImportDeclaration[source.value=/\\.js$/]",
            message: "No `.js` extensions on imports."
          }
        ]
      }
    },
    {
      // Pure packages (config, core, memory, engine) MUST NOT import Expo / RN / @garden/ui.
      files: [
        "packages/config/src/**/*.ts",
        "packages/core/src/**/*.ts",
        "packages/memory/src/**/*.ts",
        "packages/engine/src/**/*.ts"
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["expo", "expo-*", "react-native", "react-native-*"],
                message: "Pure packages cannot import Expo or React Native."
              },
              {
                group: ["@garden/ui", "@garden/ui/*"],
                message: "Pure packages cannot import @garden/ui (UI-only code)."
              }
            ]
          }
        ]
      }
    },
    {
      // Expo Router files must stay thin glue.
      files: ["apps/mobile/app/**/*.{ts,tsx}"],
      rules: {
        "max-lines": ["error", { max: 30, skipBlankLines: true, skipComments: true }],
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@garden/memory", "@garden/engine", "@tanstack/react-query"],
                message: "app/ files must be thin glue — move business logic into src/features/."
              }
            ]
          }
        ]
      }
    },
    {
      // Mobile code outside @garden/ui may not import react-native-paper directly.
      files: ["apps/mobile/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["react-native-paper", "react-native-paper/*"],
                message: "Import accessible primitives from @garden/ui, not react-native-paper."
              }
            ]
          }
        ]
      }
    },
    {
      // Tests relax a few rules to keep it.each tables readable, and exempt
      // narrow tuple types like `"sector" | "pin"` that are test-local.
      files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "max-lines": "off",
        "max-nested-callbacks": ["error", 4],
        // Re-declare `no-restricted-syntax` WITHOUT the union-ban for tests.
        "no-restricted-syntax": [
          "error",
          {
            selector: "FunctionDeclaration",
            message: "Use const arrow functions: `export const fn = () => {}`."
          },
          {
            selector: "SwitchStatement",
            message: "No switch/case. Use early returns with if."
          },
          {
            selector: "IfStatement > IfStatement.alternate",
            message: "No else-if. Use early return / continue instead."
          },
          {
            selector: "ImportDeclaration[source.value=/\\.js$/]",
            message: "No `.js` extensions on imports."
          },
          {
            selector: "NewExpression[callee.name='Error']",
            message: "No `new Error(...)`. Throw via SmepErrors factory from @garden/config."
          }
        ]
      }
    }
  ]
};
