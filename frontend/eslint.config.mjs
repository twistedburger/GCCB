import js from "@eslint/js"
import globals from "globals"
import pluginReact from "eslint-plugin-react"
import reactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from "eslint-config-prettier"
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
  {
    languageOptions: { 
      globals: globals.browser 
    }
  },

  {
    files: ["frontend/src/**/*.{js,jsx}"], // Target your source folder specifically
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        vite: {
          viteConfigPath: path.resolve(__dirname, './vite.config.js'),
        },
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    }
  },

  ...compat.extends('airbnb').map(config => ({
    ...config,
    files: ["frontend/src/**/*.{js,jsx}"], // Only run strict Airbnb on source code
  })),

  eslintConfigPrettier,

  {
    files: ["frontend/vite.config.js", "frontend/eslint.config.mjs"],
    rules: {
      "import/no-unresolved": "off", // Vite config can handle itself
      "import/no-extraneous-dependencies": "off"
    }
  }
];