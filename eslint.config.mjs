import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import formatjs from "eslint-plugin-formatjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const formatjsLiteralInJsxRule = [
  "error",
  {
    props: {
      // Placeholders are often technical / mirror labels; do not require i18n here.
      exclude: [["*", "placeholder"]],
    },
  },
];

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [".cursor/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      formatjs,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "prefer-const": "error",
      "no-var": "warn",
      "react/no-deprecated": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "formatjs/no-literal-string-in-jsx": formatjsLiteralInJsxRule,
    },
  },
  // Dev-only / internal test routes — not user-facing product UI.
  {
    files: ["src/app/test-*/**/*.{ts,tsx}"],
    rules: {
      "formatjs/no-literal-string-in-jsx": "off",
    },
  },
];
