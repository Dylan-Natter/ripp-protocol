# Testing the RIPP VS Code Extension

This guide explains how to test the RIPP VS Code extension during development.

---

## Prerequisites

- VS Code 1.85.0 or higher
- Node.js 16 or higher
- Git

---

## Setup for Local Testing

### 1. Clone and Navigate to Extension Directory

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/tools/vscode-extension
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- TypeScript compiler
- VS Code extension API types
- Development dependencies

### 3. Compile the Extension

```bash
npm run compile
```

This compiles `src/extension.ts` to `out/extension.js`.

For continuous compilation during development:

```bash
npm run watch
```

---

## Running the Extension in Development Mode

### Method 1: Using F5 (Recommended)

1. Open the `tools/vscode-extension` folder in VS Code
2. Press **F5** to launch the Extension Development Host
3. A new VS Code window will open with the extension loaded
4. Test the commands in the new window

### Method 2: Using Command Palette

1. Open the `tools/vscode-extension` folder in VS Code
2. Open Command Palette: **Ctrl+Shift+P** / **Cmd+Shift+P**
3. Run: **Debug: Start Debugging**
4. Select **VS Code Extension Development**

---

## Testing Commands

### Test Setup

Create a test workspace with RIPP packets:

```bash
mkdir -p /tmp/ripp-test
cd /tmp/ripp-test
npm init -y
npm install ripp-cli
```

Create a test packet `test-feature.ripp.yaml`:

```yaml
ripp_version: '1.0'
packet_id: 'test-feature'
title: 'Test Feature'
created: '2025-12-14'
updated: '2025-12-14'
status: 'draft'
level: 1

purpose:
  problem: 'Test problem'
  solution: 'Test solution'
  value: 'Test value'

ux_flow:
  - step: 1
    actor: 'User'
    action: 'Test action'
    trigger: 'Test trigger'

data_contracts:
  inputs:
    - name: 'TestInput'
      fields:
        - name: 'testField'
          type: 'string'
          required: true
  outputs:
    - name: 'TestOutput'
      fields:
        - name: 'result'
          type: 'string'
```

### Test: RIPP: Validate Packet(s)

1. Open the test workspace in the Extension Development Host
2. Open Command Palette: **Ctrl+Shift+P** / **Cmd+Shift+P**
3. Run: **RIPP: Validate Packet(s)**
4. Check Output panel (View → Output, select "RIPP")
5. Verify validation results

Expected: ✓ Success message with packet count

### Test: RIPP: Lint Packet(s)

1. Open Command Palette
2. Run: **RIPP: Lint Packet(s)**
3. Check Output panel for linting results
4. Verify report files created in `reports/`

Expected: Linting report with suggestions

### Test: RIPP: Package Handoff

1. Open Command Palette
2. Run: **RIPP: Package Handoff**
3. Select a packet from the quick pick menu
4. Choose output location and format (e.g., `handoff.md`)
5. Verify the packaged file opens

Expected: Markdown/JSON/YAML handoff document created

### Test: RIPP: Analyze Project (Draft Packet)

1. Create a test document to analyze (e.g., `feature-spec.txt`)
2. Open Command Palette
3. Run: **RIPP: Analyze Project (Draft Packet)**
4. Select the input file
5. Choose output location (e.g., `analyzed.ripp.yaml`)
6. Verify draft packet is created and opens

Expected: Draft RIPP packet generated with warning to review

---

## Testing Configuration

### Test: CLI Mode (npx)

1. Open Settings: **File → Preferences → Settings**
2. Search for "RIPP"
3. Set **RIPP: Cli Mode** to `npx`
4. Run any command
5. Verify it executes via `npx ripp`

### Test: CLI Mode (npm script)

1. Add npm scripts to workspace `package.json`:

```json
{
  "scripts": {
    "ripp:validate": "ripp validate",
    "ripp:lint": "ripp lint",
    "ripp:package": "ripp package",
    "ripp:analyze": "ripp analyze"
  }
}
```

2. Set **RIPP: Cli Mode** to `npmScript`
3. Run any command
4. Verify it executes via `npm run ripp:*`

### Test: Strict Mode

1. Create a packet with warnings (e.g., missing optional fields)
2. Set **RIPP: Strict** to `true`
3. Run **RIPP: Lint Packet(s)**
4. Verify warnings are treated as errors (exit code 1)

### Test: Custom Paths

1. Set **RIPP: Paths** to custom glob patterns:

```json
{
  "ripp.paths": ["specs/*.ripp.yaml"]
}
```

2. Run **RIPP: Validate Packet(s)**
3. Verify only matching files are discovered

---

## Debugging

### Enable Extension Host Logs

1. In Extension Development Host, open Output panel
2. Select "Extension Host" from dropdown
3. View extension activation and execution logs

### Add Breakpoints

1. Open `src/extension.ts` in VS Code
2. Set breakpoints by clicking left of line numbers
3. Press **F5** to start debugging
4. Trigger commands in Extension Development Host
5. Debugger will pause at breakpoints

### View Console Output

Extension logs appear in:

- **Output** panel → **RIPP** channel (user-facing output)
- **Debug Console** (when debugging)

---

## Common Issues

### "Command not found: ripp"

**Cause**: RIPP CLI not installed or not in PATH

**Solution**:

- Ensure `npx ripp` works in workspace terminal
- Or install globally: `npm install -g ripp-cli`
- Or use npm scripts mode with local install

### "No RIPP packets found in workspace"

**Cause**: No `*.ripp.yaml` or `*.ripp.json` files match configured paths

**Solution**:

- Check file naming convention
- Verify `ripp.paths` configuration
- Ensure files are in workspace (not excluded by `.gitignore`)

### Extension Doesn't Activate

**Cause**: Compilation errors or activation event not triggered

**Solution**:

- Run `npm run compile` and check for errors
- Ensure a workspace is open
- Try running a command manually to trigger activation

---

## Testing in GitHub Codespaces

### Setup Codespaces Test Environment

1. **Create a test repository** with RIPP packets or use the main RIPP protocol repository

2. **Open in Codespaces:**
   - Go to repository on GitHub
   - Click **Code** → **Codespaces** → **Create codespace on main**

3. **Install RIPP CLI** in Codespace:
   ```bash
   npm install -D ripp-cli
   ```

4. **Install the extension** (if not pre-installed):
   - Open Extensions panel (Ctrl+Shift+X)
   - Search for "RIPP Protocol"
   - Click Install

### Test: RIPP Init Command

1. Open Command Palette
2. Run **RIPP: Initialize Repository**
3. Select **Standard** initialization
4. Verify output shows created files:
   - `ripp/`
   - `ripp/features/`
   - `ripp/intent-packages/`
   - `.github/workflows/ripp-validate.yml`

### Test: Local Binary Detection

1. Verify `node_modules/.bin/ripp` exists (from `npm install -D ripp-cli`)
2. Open Command Palette
3. Run **RIPP: Validate Packet(s)**
4. Check Output panel for "Using local RIPP CLI from node_modules"
5. Verify it does NOT say "Using npx"

### Test: Validate in Codespaces

1. Create a test RIPP packet in `ripp/features/test.ripp.yaml`
2. Run **RIPP: Validate Packet(s)**
3. Verify validation completes successfully
4. Check Output panel for validation results

### Test: Without Local Install (npx fallback)

1. Remove local RIPP CLI:
   ```bash
   npm uninstall ripp-cli
   rm -rf node_modules/.bin/ripp*
   ```

2. Run **RIPP: Validate Packet(s)**
3. Check Output panel for "Using npx (no local RIPP CLI found)"
4. Verify validation works via npx (may be slower)

### Test: Platform-Specific (Codespaces uses Linux)

1. Verify binary detection uses Unix binary name (`ripp`, not `ripp.cmd`)
2. Test all commands work correctly in Linux environment

### Expected Results

✅ **All commands should work** in Codespaces  
✅ **Local binary should be preferred** when installed  
✅ **npx fallback should work** when no local install  
✅ **Performance should be good** with local install  
✅ **No network errors** when using local binary

---

## Platform-Specific Testing

### Windows Testing

**Binary Detection:**
- Verify uses `ripp.cmd` from `node_modules/.bin/`
- Test in PowerShell, Command Prompt, and Git Bash

**Path Handling:**
- Verify backslash paths work correctly
- Test with spaces in workspace path

**Commands:**
- [ ] RIPP: Initialize Repository
- [ ] RIPP: Validate Packet(s)
- [ ] RIPP: Lint Packet(s)
- [ ] RIPP: Package Handoff
- [ ] RIPP: Analyze Project

### macOS Testing

**Binary Detection:**
- Verify uses `ripp` (Unix binary) from `node_modules/.bin/`

**Commands:**
- [ ] All commands (same as Windows)

### Linux Testing

**Binary Detection:**
- Verify uses `ripp` (Unix binary) from `node_modules/.bin/`

**Commands:**
- [ ] All commands (same as Windows)

**Distribution Testing:**
- [ ] Ubuntu (common in Codespaces)
- [ ] Debian
- [ ] Fedora (optional)

---

## Automated Testing

Currently, this extension uses manual testing. Future versions may include:

- Unit tests for command logic
- Integration tests for CLI execution
- End-to-end tests using `@vscode/test-electron`

---

## Pre-Publishing Checklist

Before publishing to the Marketplace, verify:

- [ ] All commands work correctly (validate, lint, package, analyze, **init**)
- [ ] Init command creates proper scaffolding
- [ ] Local binary detection works on Windows/macOS/Linux
- [ ] npx fallback works when no local install
- [ ] Configuration settings apply properly
- [ ] Error messages are user-friendly and include install guidance
- [ ] Output panel shows helpful information
- [ ] No secrets or sensitive data logged
- [ ] Extension respects security constraints (validate is read-only)
- [ ] README is accurate and complete
- [ ] Icon is present (128x128 PNG)
- [ ] Version is correct in `package.json`
- [ ] Publisher name is exactly "RIPP"
- [ ] Tested in Codespaces
- [ ] Tested on Windows, macOS, and Linux

---

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [RIPP CLI Documentation](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/ripp-cli/README.md)
