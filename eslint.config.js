var js = require('@eslint/js');
var globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: Object.assign({}, globals.browser),
      sourceType: 'script',
    },
    rules: {
      eqeqeq: 'error',
      'no-console': 'error',
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
