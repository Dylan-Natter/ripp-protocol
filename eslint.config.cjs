const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.log',
      '.git/',
      '_site/',
      '.sass-cache/',
      '.jekyll-cache/',
    ],
  },
];
