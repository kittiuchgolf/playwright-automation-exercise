import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'allure-report/**',
      'allure-results/**',
      'test-results/**',
      'blob-report/**',
      'results.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // Node globals for the plain-JS config + scripts.
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // Playwright fixtures use `async ({}, use) => {}`; the empty pattern is idiomatic.
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
