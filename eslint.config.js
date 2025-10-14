import globals from "globals";
import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import jsdoc from "eslint-plugin-jsdoc";
import pluginN from "eslint-plugin-n";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    plugins: {
      unicorn,
      jsdoc,
      n: pluginN,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      semi: ["error", "always"],
      "no-unused-vars": ["warn"],
      "no-console": "off",

      "unicorn/prefer-includes": "error",
      "unicorn/prefer-optional-catch-binding": "warn",
      "unicorn/no-array-callback-reference": "warn",
      "unicorn/consistent-function-scoping": "warn",
      "unicorn/no-unreadable-array-destructuring": "warn",
      "unicorn/prefer-number-properties": "warn",

      "n/no-missing-import": "error",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-process-exit": "off",

      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-tag-names": "warn",
    },
  },
];
