# RIPP VS Code Extension - Manual Testing Checklist

**Version**: 0.2.0 (pending)  
**Status**: Ready for Manual Testing  
**Date**: 2025-12-14

---

## Pre-Test Setup

### 1. Install Dependencies

```bash
cd tools/vscode-extension
npm install
npm run compile
```

**Expected**: Clean compilation, no errors

### 2. Package Extension (Optional)

```bash
npm run package  # Creates .vsix file
```

**Expected**: `ripp-protocol-0.1.0.vsix` created

### 3. Install Extension Locally

**Option A: F5 Debug Mode**

- Open `tools/vscode-extension` in VS Code
- Press F5
- New VS Code window opens with extension loaded

**Option B: Install from VSIX**

```bash
code --install-extension ripp-protocol-0.1.0.vsix
```

---

## Test Environment Setup

### Create Test Workspace

```bash
mkdir /tmp/ripp-extension-test
cd /tmp/ripp-extension-test
npm init -y
```

### Create Test RIPP Packet

Create `test-feature.ripp.yaml`:

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
          required: true
```

---

## Functional Tests

### Test 1: RIPP Init Command ✅

**Steps**:

1. Open test workspace in VS Code
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: **RIPP: Initialize Repository**
4. Select "Standard"
5. Check Output panel (RIPP channel)

**Expected Results**:

- [ ] Command appears in palette
- [ ] Quick pick shows "Standard" and "Force" options
- [ ] Progress notification appears
- [ ] Success message: "RIPP initialized successfully!"
- [ ] Output shows created files
- [ ] Files created:
  - [ ] `ripp/README.md`
  - [ ] `ripp/features/.gitkeep`
  - [ ] `ripp/intent-packages/README.md`
  - [ ] `.github/workflows/ripp-validate.yml`

**Test Force Mode**:

1. Run **RIPP: Initialize Repository** again
2. Select "Force"
3. Verify files are overwritten

**Expected**:

- [ ] Force mode overwrites existing files
- [ ] Success message shown

---

### Test 2: Local Binary Detection ✅

**Setup**: Install RIPP CLI locally

```bash
npm install -D ripp-cli
```

**Steps**:

1. Run **RIPP: Validate Packet(s)**
2. Check Output panel

**Expected**:

- [ ] Output shows: "Using local RIPP CLI from node_modules"
- [ ] Does NOT show: "Using npx"
- [ ] Validation completes successfully

**Test npx Fallback**:

1. Remove local install: `npm uninstall ripp-cli`
2. Run **RIPP: Validate Packet(s)** again

**Expected**:

- [ ] Output shows: "Using npx (no local RIPP CLI found)"
- [ ] Validation still works (via npx)

---

### Test 3: Validate Command ✅

**Setup**: Ensure test RIPP packet exists

**Steps**:

1. Run **RIPP: Validate Packet(s)**
2. Check Output panel

**Expected**:

- [ ] Finds test packet
- [ ] Shows validation progress
- [ ] Shows: "✓ test-feature.ripp.yaml is valid (Level 1)"
- [ ] Shows: "✓ All 1 RIPP packets are valid"
- [ ] Success notification appears
- [ ] **CRITICAL**: No files modified (check git status)

**Test Invalid Packet**:

1. Break the RIPP packet (remove required field)
2. Run validate again

**Expected**:

- [ ] Shows validation errors
- [ ] Lists specific issues
- [ ] No success notification

---

### Test 4: Lint Command ✅

**Steps**:

1. Run **RIPP: Lint Packet(s)**
2. Check Output panel
3. Check for `reports/` directory

**Expected**:

- [ ] Linting completes
- [ ] Shows lint results in output
- [ ] Creates `reports/lint.json`
- [ ] Creates `reports/lint.md`
- [ ] Success notification appears
- [ ] **CRITICAL**: Source RIPP files NOT modified

---

### Test 5: Package Command ✅

**Steps**:

1. Run **RIPP: Package Handoff**
2. Select test packet from quick pick
3. Choose output location (e.g., `handoff.md`)
4. Choose format: Markdown

**Expected**:

- [ ] Quick pick shows available packets
- [ ] Save dialog appears
- [ ] Output file created at chosen location
- [ ] File opens automatically
- [ ] Contains packaged RIPP content
- [ ] Source packet NOT modified

**Test Other Formats**:

- [ ] Package to JSON works
- [ ] Package to YAML works

---

### Test 6: Analyze Command ✅

**Setup**: Create test input file `feature-spec.txt`

**Steps**:

1. Run **RIPP: Analyze Project (Draft Packet)**
2. Select input file
3. Choose output location (e.g., `analyzed.ripp.yaml`)

**Expected**:

- [ ] Open dialog appears
- [ ] Save dialog appears
- [ ] Draft RIPP packet created
- [ ] File opens automatically
- [ ] Warning message about reviewing draft
- [ ] Input file NOT modified

---

### Test 7: CLI Not Found Error ✅

**Setup**: Ensure ripp-cli not installed and npx unavailable (mock if needed)

**Steps**:

1. Run any RIPP command
2. Observe error message

**Expected**:

- [ ] Error message: "RIPP CLI not found. Install it with: npm install -D ripp-cli"
- [ ] Two buttons: "Install Locally" and "Open Terminal"
- [ ] Click "Install Locally":
  - [ ] Terminal opens
  - [ ] Info message shows: "Run: npm install -D ripp-cli"
- [ ] Click "Open Terminal":
  - [ ] Terminal opens

---

## Platform-Specific Tests

### Windows Testing

**Binary Detection**:

- [ ] Install `ripp-cli` locally
- [ ] Verify binary at `node_modules/.bin/ripp.cmd` is used
- [ ] Check Output for "Using local RIPP CLI from node_modules"

**Path Handling**:

- [ ] Test with workspace path containing spaces
- [ ] Test with backslash paths
- [ ] All commands work correctly

**Terminals**:

- [ ] Test in PowerShell
- [ ] Test in Command Prompt
- [ ] Test in Git Bash

---

### macOS Testing

**Binary Detection**:

- [ ] Install `ripp-cli` locally
- [ ] Verify binary at `node_modules/.bin/ripp` is used
- [ ] Check Output for "Using local RIPP CLI from node_modules"

**All Commands**:

- [ ] Init works
- [ ] Validate works
- [ ] Lint works
- [ ] Package works
- [ ] Analyze works

---

### Linux Testing

**Binary Detection**:

- [ ] Install `ripp-cli` locally
- [ ] Verify binary at `node_modules/.bin/ripp` is used
- [ ] Check Output for "Using local RIPP CLI from node_modules"

**All Commands**:

- [ ] Init works
- [ ] Validate works
- [ ] Lint works
- [ ] Package works
- [ ] Analyze works

---

## Environment Tests

### VS Code Desktop

- [ ] All commands work
- [ ] Local binary detection works
- [ ] Output channel shows correctly
- [ ] Notifications appear
- [ ] File dialogs work

---

### GitHub Codespaces

**Setup**:

1. Open repository in Codespaces
2. Install extension (if not pre-installed)
3. Run `npm install -D ripp-cli` in terminal

**Tests**:

- [ ] Extension activates
- [ ] Init command creates files
- [ ] Local binary detected and used
- [ ] Validate works
- [ ] All commands functional
- [ ] Performance is acceptable

**Without Local Install**:

- [ ] Remove `ripp-cli`: `npm uninstall ripp-cli`
- [ ] Verify npx fallback works
- [ ] May be slower (expected)

---

## Security Tests

### Validate Never Writes

**Critical Test**:

1. Create test RIPP packet
2. Run validate
3. Check `git status`
4. Check file modification times

**Expected**:

- [ ] Git status shows NO modifications
- [ ] File timestamps unchanged
- [ ] No `.ripp.yaml.formatted` or similar files
- [ ] No hidden writes anywhere

---

### No Secrets Logged

**Test**:

1. Run any command
2. Check Output panel (RIPP channel)
3. Check Debug Console (if debugging)

**Expected**:

- [ ] No environment variables logged
- [ ] No file paths with sensitive info
- [ ] No credentials or tokens
- [ ] Only safe output visible

---

## Configuration Tests

### CLI Mode: npx (default)

**Test**:

1. Settings → RIPP: Cli Mode → "npx"
2. Install local `ripp-cli`
3. Run validate

**Expected**:

- [ ] Uses local binary (not npx)
- [ ] Falls back to npx if no local install

---

### CLI Mode: npmScript

**Setup**: Add to `package.json`:

```json
{
  "scripts": {
    "ripp:validate": "ripp validate",
    "ripp:lint": "ripp lint",
    "ripp:package": "ripp package",
    "ripp:analyze": "ripp analyze",
    "ripp:init": "ripp init"
  }
}
```

**Test**:

1. Settings → RIPP: Cli Mode → "npmScript"
2. Run any command

**Expected**:

- [ ] Uses npm scripts
- [ ] Commands work correctly

---

### Strict Mode

**Test**:

1. Settings → RIPP: Strict → true
2. Create packet with warnings (e.g., missing optional fields)
3. Run lint

**Expected**:

- [ ] Warnings treated as errors
- [ ] Exit code 1 (failure)

---

### Custom Paths

**Test**:

1. Settings → RIPP: Paths → `["specs/*.ripp.yaml"]`
2. Create packet in `specs/` directory
3. Run validate

**Expected**:

- [ ] Only finds packets matching custom pattern
- [ ] Ignores packets in other locations

---

## Edge Cases

### No RIPP Packets

**Test**:

1. Empty workspace (no .ripp.yaml files)
2. Run validate

**Expected**:

- [ ] Warning: "No RIPP packets found in workspace"
- [ ] No error, clean exit

---

### Invalid RIPP Packet

**Test**:

1. Create malformed YAML file
2. Run validate

**Expected**:

- [ ] Parse error shown
- [ ] Error message helpful
- [ ] No crash

---

### Multiple Packets

**Test**:

1. Create 5+ RIPP packets
2. Run validate

**Expected**:

- [ ] All packets discovered
- [ ] Each validated individually
- [ ] Summary shows total count

---

### Monorepo / Multi-Root Workspace

**Test**:

1. Open multi-root workspace
2. Add RIPP packets in different folders
3. Run validate

**Expected**:

- [ ] Uses first workspace folder
- [ ] Finds packets in that folder
- [ ] Behaves consistently

---

## Performance Tests

### Large Workspace

**Test**:

1. Workspace with 1000+ files
2. Run validate

**Expected**:

- [ ] Discovery completes in <5 seconds
- [ ] Validation completes reasonably
- [ ] No UI freezing

---

### Many RIPP Packets

**Test**:

1. Create 50+ RIPP packets
2. Run validate

**Expected**:

- [ ] All packets validated
- [ ] Progress visible
- [ ] Completes in reasonable time

---

## Post-Testing

### Cleanup

```bash
# Uninstall test extension
code --uninstall-extension RIPP.ripp-protocol

# Remove test workspace
rm -rf /tmp/ripp-extension-test
```

---

## Summary Checklist

**Core Functionality**:

- [ ] All 5 commands work (init, validate, lint, package, analyze)
- [ ] Local binary detection works
- [ ] npx fallback works
- [ ] Error messages are helpful

**Platform Support**:

- [ ] Windows tested and working
- [ ] macOS tested and working
- [ ] Linux tested and working

**Environments**:

- [ ] VS Code Desktop works
- [ ] Codespaces works
- [ ] Remote containers work (if tested)

**Security**:

- [ ] Validate is read-only
- [ ] No secrets logged
- [ ] No hidden file writes

**Documentation**:

- [ ] README is accurate
- [ ] TESTING.md is helpful
- [ ] All examples work

---

## Sign-Off

**Tester**: **\*\*\*\***\_**\*\*\*\***  
**Date**: **\*\*\*\***\_**\*\*\*\***  
**Version Tested**: **\*\*\*\***\_**\*\*\*\***  
**Result**: ☐ PASS ☐ FAIL  
**Notes**:

---

**If all tests pass**: Ready for release to VS Code Marketplace  
**If tests fail**: Document issues and address before release
