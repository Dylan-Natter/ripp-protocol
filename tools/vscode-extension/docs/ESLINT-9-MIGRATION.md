# ESLint 9 Migration Guide

## Overview

This document describes the migration from ESLint 8 with `.eslintrc.json` to ESLint 9 with the new flat config format (`eslint.config.mjs`).

## What Changed

### 1. Configuration Format

**Before (ESLint 8):** `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off"
  },
  "ignorePatterns": ["out", "node_modules", "*.js"]
}
```

**After (ESLint 9):** `eslint.config.mjs`

```javascript
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      // Disable no-undef for TypeScript files as TypeScript handles this
      'no-undef': 'off'
    }
  },
  {
    files: ['src/test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  },
  {
    ignores: ['out/**', 'node_modules/**', '*.js']
  }
];
```

### 2. Key Differences

1. **File Format**: ESLint 9 uses ES modules (`.mjs`) instead of JSON
2. **Flat Config**: Configuration is now an array of config objects instead of a single nested object
3. **Explicit Imports**: Plugins and configs must be explicitly imported
4. **Globals Package**: Node.js and Mocha globals come from the `globals` package
5. **File Patterns**: Use `files` property to specify which files each config applies to
6. **Ignores**: Use `ignores` array instead of `ignorePatterns`
7. **No-Undef Rule**: Disabled for TypeScript files since TypeScript compiler handles this

### 3. Dependencies Updated

| Package                            | Old Version | New Version |
| ---------------------------------- | ----------- | ----------- |
| `eslint`                           | 8.57.1      | 9.39.2      |
| `@typescript-eslint/eslint-plugin` | 6.21.0      | 8.50.0      |
| `@typescript-eslint/parser`        | 6.21.0      | 8.50.0      |
| `@types/node`                      | 18.19.130   | 25.0.3      |
| `globals` (new)                    | -           | 16.5.0      |

### 4. Package.json Script Changes

**Before:**

```json
{
  "lint": "eslint src --ext ts"
}
```

**After:**

```json
{
  "lint": "eslint src"
}
```

The `--ext` flag is no longer needed with flat config. File patterns are specified in the config file itself.

## Breaking Changes to Watch For

### 1. TypeScript Undefined Variable Warnings

With ESLint 8, the `no-undef` rule would sometimes incorrectly flag TypeScript types as undefined. In ESLint 9, we explicitly disable this rule for TypeScript files since the TypeScript compiler handles this check more accurately.

### 2. Mocha Test Globals

Test files need their own configuration block to access Mocha globals like `describe`, `it`, `suite`, `test`, etc.

## Migration Steps

If you need to migrate another project to ESLint 9:

1. **Update dependencies** in `package.json`:

   ```bash
   npm install --save-dev eslint@^9.39.2 \
     @typescript-eslint/eslint-plugin@^8.50.0 \
     @typescript-eslint/parser@^8.50.0 \
     globals@^16.5.0
   ```

2. **Create `eslint.config.mjs`** with the flat config format

3. **Remove `.eslintrc.json`** or `.eslintrc.js`

4. **Update lint script** in `package.json` to remove `--ext` flag

5. **Test the configuration**:

   ```bash
   npm run lint
   ```

6. **Verify compilation still works**:
   ```bash
   npm run compile
   ```

## References

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [TypeScript ESLint 8.x Documentation](https://typescript-eslint.io/)
- [Globals Package](https://github.com/sindresorhus/globals)

## Troubleshooting

### Error: Cannot find package 'typescript-eslint'

Use the individual packages instead of the unified `typescript-eslint` package:

```javascript
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
```

### Warning: no-undef errors for TypeScript types

Add this rule to your TypeScript config:

```javascript
{
  rules: {
    'no-undef': 'off', // TypeScript handles this
  }
}
```

### Test globals not recognized

Add a separate config block for test files:

```javascript
{
  files: ['src/test/**/*.ts'],
  languageOptions: {
    globals: {
      ...globals.mocha,
    },
  },
}
```

## Results

After migration:

- ✅ Compilation works without errors
- ✅ Linting runs successfully with only minor unused variable warnings
- ✅ Extension packages correctly (ripp-protocol-0.4.1.vsix, 174KB)
- ✅ No security vulnerabilities
- ✅ All dependencies up to date
- ✅ GitHub Actions workflow compatible
