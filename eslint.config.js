import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "build/**", "coverage/**"],
  },
  // JavaScript files
  {
    files: ["**/*.js"],
    ...eslint.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
    },
  },
  // TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs["recommended"].rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,

      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        {
          selector: "class",
          format: ["PascalCase", "snake_case"],
        },
      ],

      // Best practices and error prevention
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-return-await": "error",
      "no-throw-literal": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
    },
  },
];
