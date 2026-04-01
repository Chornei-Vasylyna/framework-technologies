import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_" }],
      "no-undef": "warn",
      semi: ["warn", "always"],
      "no-process-env": ["error"],
    },
  },
]);
