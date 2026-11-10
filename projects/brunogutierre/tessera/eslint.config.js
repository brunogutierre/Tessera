// @ts-check
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const rootConfig = require('../../../eslint.config.js');

/**
 * The library is held to a stricter standard than application code: every rule that needs type
 * information is enabled, and the component conventions (prefix, OnPush, signals) are enforced
 * here instead of in code review.
 */
module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.lib.json',
          './tsconfig.spec.json',
          '../../../.storybook/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // Elements (<tes-select>) and attributes on native elements (button[tes-button]).
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'tes', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'tes', style: 'camelCase' },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      // Classes are named TesButton, TesSelect: the prefix already marks them as components.
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]);
