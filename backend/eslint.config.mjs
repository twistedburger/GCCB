import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});
export default [
  js.configs.recommended,
      ...compat.config({
    plugins: ["jest"],
    env: {
      "jest/globals" : true
    },
  }),
  {
    files: ["**/*.js"],
    languageOptions: { 
      globals: globals.node
    }
  },
  eslintConfigPrettier
];