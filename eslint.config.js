import js from '@eslint/js'
import globals from 'globals'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*.js', 'src/**/*.jsx'],
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain' },
        { type: 'application', pattern: 'src/application' },
        { type: 'ui', pattern: 'src/ui' },
        { type: 'effects', pattern: 'src/effects' },
        { type: 'infrastructure', pattern: 'src/infrastructure' },
        { type: 'shared', pattern: 'src/shared' },
        { type: 'bootstrap', pattern: 'src/main.jsx' },
      ],
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['domain'],
              allow: ['domain', 'shared'],
            },
            {
              from: ['application'],
              allow: ['application', 'domain', 'shared'],
            },
            {
              from: ['ui'],
              allow: ['ui', 'application', 'shared', 'effects'],
            },
            {
              from: ['effects'],
              allow: ['effects', 'shared'],
            },
            {
              from: ['infrastructure'],
              allow: ['infrastructure', 'domain', 'shared'],
            },
            {
              from: ['shared'],
              allow: ['shared'],
            },
            {
              from: ['bootstrap'],
              allow: ['ui', 'application', 'infrastructure', 'effects', 'domain', 'shared', 'bootstrap'],
            },
          ],
        },
      ],
    },
  },
])
