---
layout: default
title: 'VS Code Extension - ESLint 9 Update'
---

# VS Code Extension ESLint 9 Update (December 2024)

## Overview

The RIPP VS Code extension has been updated to use ESLint 9 with the new flat config format. This document describes the changes and their impact on development.

## Changes Made

### 1. ESLint Configuration Migration

**Old format (`.eslintrc.json`):**

- JSON-based configuration
- Implicit environment and plugin loading
- Used `extends` for shared configs

**New format (`eslint.config.mjs`):**

- ES Module-based configuration
- Explicit imports for all plugins and configs
- Array-based flat config structure

### 2. Dependency Updates

All ESLint-related dependencies have been updated to their latest versions:

| Package                            | Previous | Current |
| ---------------------------------- | -------- | ------- |
| `eslint`                           | 8.57.1   | 9.39.2  |
| `@typescript-eslint/eslint-plugin` | 6.21.0   | 8.50.0  |
| `@typescript-eslint/parser`        | 6.21.0   | 8.50.0  |
| `@types/node`                      | 18.x     | 25.0.3  |
| `globals` (new)                    | -        | 16.5.0  |

### 3. Configuration Changes

- Added `globals` package for Node.js and Mocha environment variables
- Disabled `no-undef` rule for TypeScript files (TypeScript compiler handles this)
- Updated lint script to remove `--ext ts` flag (no longer needed with flat config)

## Impact on Development

### For Extension Developers

If you're working on the VS Code extension:

1. **Linting** works the same as before:

   ```bash
   cd tools/vscode-extension
   npm run lint
   ```

2. **Building** is unchanged:

   ```bash
   npm run compile
   npm run package
   ```

3. **Configuration** is now in `eslint.config.mjs` instead of `.eslintrc.json`

### For Contributors

No action required. The changes are internal to the extension build process and don't affect:

- Extension functionality
- RIPP packet validation
- CLI behavior
- Extension commands or features

## Breaking Changes

### ESLint 9 Flat Config

The most significant change is the migration to ESLint 9's flat config format:

- Configuration is now in `eslint.config.mjs` (ES Module)
- Plugins must be explicitly imported
- The `--ext` flag is no longer supported
- Globals come from the `globals` package instead of `env` property

### Compatibility

- ✅ Node.js 18+ (as specified in repository requirements)
- ✅ VS Code 1.85.0+ (as specified in extension manifest)
- ✅ TypeScript 5.9.3
- ✅ All existing GitHub Actions workflows

## Migration Details

For detailed migration information, see:

- [Extension-specific migration guide](../tools/vscode-extension/docs/ESLINT-9-MIGRATION.md)
- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)

## Verification

All changes have been verified:

- ✅ Extension compiles without errors
- ✅ Extension packages successfully
- ✅ No npm dependency conflicts
- ✅ No security vulnerabilities
- ✅ GitHub Actions workflows pass

## Related Documentation

- [VS Code Extension Manual Steps](vscode-extension-manual-steps.md)
- [VS Code Extension Versioning](vscode-extension-pr-based-versioning.md)
- [Tooling Overview](tooling.md)

## Questions?

If you encounter issues related to this update:

1. Check the [extension-specific migration guide](../tools/vscode-extension/docs/ESLINT-9-MIGRATION.md)
2. Review the [ESLint 9 changelog](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)
3. Open an issue on GitHub

---

_Last updated: December 2024_
