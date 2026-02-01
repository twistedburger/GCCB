import js from "@eslint/js"
import globals from "globals"
import pluginReact from "eslint-plugin-react"
import reactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from "eslint-config-prettier"
import airbnb from 'eslint-config-airbnb'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname
})


export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...compat.extends('airbnb'),
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      'react-hooks' : reactHooks,
    },
    languageOptions: { 
      globals: globals.browser 
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  eslintConfigPrettier,
];