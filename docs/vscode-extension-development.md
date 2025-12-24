---
layout: default
title: 'VS Code Extension Development'
---

## VS Code Extension Development

This guide covers development workflow for contributors working on the RIPP VS Code extension.

---

## Development Workflow

### Quick Iteration Cycle

The `npm run dev` script provides a streamlined workflow for active development:

```bash
# Navigate to extension directory
cd tools/vscode-extension

# Install dependencies (first time only)
npm install

# Compile, package, and install in one command
npm run dev

# Reload VS Code window to see changes
# Press: Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (macOS)
# Select: "Developer: Reload Window"
```

**What `npm run dev` does:**

1. Compiles TypeScript sources (`npm run compile`)
2. Packages the extension into a `.vsix` file (`npm run package`)
3. Installs the packaged extension in VS Code
4. Displays installation confirmation

This eliminates the need to manually run multiple commands and ensures you're always testing the latest code changes.

### Debugging Extension Activation

The extension logs version information to the OUTPUT channel on activation to help troubleshoot stale installations:

```
RIPP Extension v0.1.0 activated
Extension path: /home/user/.vscode/extensions/ripp-protocol-0.1.0
```

**To view activation logs:**

1. Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Select "View: Toggle Output"
3. Select "RIPP" from the output channel dropdown

If commands aren't working after code changes, check the OUTPUT channel to verify:

- The expected version is loaded
- The extension path points to the latest installation

### Manual Build Process

For CI/CD or manual builds without installation:

```bash
# Compile TypeScript
npm run compile

# Package to .vsix
npm run package

# Install manually
code --install-extension ripp-protocol-<version>.vsix
```

---

## Troubleshooting

### Commands Not Working After Code Changes

**Symptom:** Extension commands return errors or don't reflect recent code changes.

**Cause:** VS Code is using a stale extension installation.

**Solution:**

1. Run `npm run dev` to rebuild and reinstall
2. Reload the VS Code window (Ctrl+Shift+P → "Developer: Reload Window")
3. Check OUTPUT channel (select "RIPP") to verify the correct version loaded

### Extension Not Found in Extensions Panel

After running `npm run dev`, the extension should appear in the Extensions panel. If it doesn't:

1. Verify installation: `code --list-extensions | grep ripp`
2. Check for installation errors in the terminal output
3. Try manual installation: `code --install-extension *.vsix`

### Version Mismatch

If the OUTPUT channel shows an older version than expected:

1. Uninstall all RIPP extension versions: `code --uninstall-extension ripp-protocol`
2. Run `npm run dev` again
3. Reload VS Code window

---

## Related Documentation

- [BUILD.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/BUILD.md) - Complete build and packaging instructions
- [User Guide](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/docs/UI-FEATURES.md) - Extension features for end users
- [Implementation Details](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/docs/IMPLEMENTATION.md) - Architecture and design decisions

---

**For more information**, see the [VS Code Extension API documentation](https://code.visualstudio.com/api).
