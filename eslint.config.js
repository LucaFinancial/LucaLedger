import js from '@eslint/js';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactRedux from 'eslint-plugin-react-redux';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierPlugin, {
  configs as prettierConfigs,
} from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest', // or 2020, etc.
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },

    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: '19.0',
      },
    },

    plugins: {
      js,
      react,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      'react-redux': reactRedux,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...(react.configs['jsx-runtime']?.rules || {}),
      ...importPlugin.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...reactRedux.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfigs.recommended.rules,
      'no-undef': 'error',
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'react-refresh/only-export-components': 'warn',
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.js', '.jsx'] },
      ],
    },
  },
];
