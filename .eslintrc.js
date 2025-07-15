module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'playwright'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};