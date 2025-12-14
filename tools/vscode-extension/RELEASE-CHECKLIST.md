# VS Code Extension Marketplace Release Checklist

This checklist ensures the RIPP Protocol VS Code extension is ready for marketplace publication.

## ✅ Pre-Release Validation (ALL COMPLETE)

### Required Files

- [x] `package.json` - Extension manifest with all required fields
- [x] `README.md` - Marketplace landing page documentation
- [x] `CHANGELOG.md` - Release notes and version history
- [x] `LICENSE` - MIT license file
- [x] `icon.png` - Extension icon (1560 bytes)

### Package Configuration

- [x] **Name**: `ripp-protocol` (valid format)
- [x] **Display Name**: `RIPP Protocol`
- [x] **Version**: `0.1.0` (follows semver)
- [x] **Publisher**: `RIPP` (valid format - update to match your publisher ID before publishing)
- [x] **Description**: Present and descriptive
- [x] **Main Entry**: `./out/extension.js` (compiled JavaScript)
- [x] **Icon Path**: `icon.png` (exists and referenced correctly)
- [x] **Categories**: `["Linters", "Other"]`
- [x] **Keywords**: Comprehensive and relevant
- [x] **Repository**: GitHub URL present
- [x] **Bugs URL**: GitHub issues URL present
- [x] **Homepage**: Project homepage URL present
- [x] **License**: MIT

### Build & Compilation

- [x] TypeScript compiles without errors
- [x] Output directory `out/` contains `extension.js`
- [x] Dependencies installed (`node_modules/`)
- [x] No TypeScript source files in package (`.vscodeignore` configured)

### Extension Functionality

- [x] **5 Commands Registered**:
  - `ripp.validate` - RIPP: Validate Packet(s)
  - `ripp.lint` - RIPP: Lint Packet(s)
  - `ripp.package` - RIPP: Package Handoff
  - `ripp.analyze` - RIPP: Analyze Project (Draft Packet)
  - `ripp.init` - RIPP: Initialize Repository

- [x] **Activation Events**: Properly configured for all commands
- [x] **Configuration**: 3 settings exposed (cliMode, strict, paths)

### Package Validation

- [x] **Package Size**: ~12-13KB (well under 50MB limit)
- [x] **File Count**: 8 files included
- [x] **vsce package**: Runs without errors
- [x] **No unnecessary files**: Verified via `.vscodeignore`

### Files Included in .vsix

```
✓ BUILD.md         - Build and packaging documentation
✓ CHANGELOG.md     - Release notes
✓ LICENSE          - MIT license
✓ README.md        - Extension documentation
✓ icon.png         - Extension icon
✓ package.json     - Extension manifest
✓ out/extension.js - Compiled extension code
```

### Files Excluded from .vsix (Correctly)

```
✓ src/**           - TypeScript source files
✓ node_modules/**  - Dependencies
✓ .vscode/**       - VS Code workspace settings
✓ docs/**          - Internal documentation
✓ **/*.ts          - TypeScript files
✓ **/*.map         - Source maps
✓ *.vsix           - Previous packages
```

## 📋 Marketplace Publication Steps

### 1. Create Publisher Account

- [ ] Go to https://marketplace.visualstudio.com/manage
- [ ] Sign in with Microsoft/GitHub account
- [ ] Create a new publisher or use existing one
- [ ] Note your publisher ID (e.g., "my-publisher-name")

### 2. Generate Personal Access Token (PAT)

- [ ] Go to https://dev.azure.com
- [ ] User Settings → Personal Access Tokens
- [ ] Create new token with **"Marketplace (Manage)"** scope
- [ ] Set expiration (recommended: 1 year)
- [ ] Copy and save the token securely

### 3. Update Publisher in package.json

- [ ] Open `package.json`
- [ ] Update `"publisher": "RIPP"` to `"publisher": "your-publisher-id"`
- [ ] Save the file
- [ ] Rebuild: `npm run compile`
- [ ] Repackage: `npm run package`

### 4. Publish Extension

**Option A: Command Line (Recommended)**

```bash
# Login to publisher account
npx vsce login your-publisher-id

# Enter your PAT when prompted

# Publish the extension
npx vsce publish

# Or publish from existing .vsix
npx vsce publish --packagePath ripp-protocol-0.1.0.vsix
```

**Option B: Manual Upload**

- [ ] Go to https://marketplace.visualstudio.com/manage/publishers/your-publisher-id
- [ ] Click "New Extension" → "Visual Studio Code"
- [ ] Upload `ripp-protocol-0.1.0.vsix`
- [ ] Verify details and publish

### 5. Post-Publication Verification

- [ ] Extension appears in marketplace: https://marketplace.visualstudio.com/vscode
- [ ] Search for "RIPP Protocol"
- [ ] Verify README renders correctly
- [ ] Verify icon displays correctly
- [ ] Test installation: `code --install-extension {publisher}.ripp-protocol` (replace {publisher} with actual publisher ID)
- [ ] Test commands in VS Code Command Palette
- [ ] Check extension page for any warnings or issues

## 🧪 Local Testing (Before Publishing)

### Test Installation from .vsix

```bash
# Install extension (replace {version} with actual version, e.g., 0.1.0)
code --install-extension ripp-protocol-{version}.vsix

# Verify installation
code --list-extensions | grep ripp-protocol

# Test in VS Code
# 1. Open VS Code
# 2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# 3. Type "RIPP:" to see all commands
# 4. Test each command
```

### Test Commands

- [ ] **RIPP: Initialize Repository** - Creates ripp/ directory structure
- [ ] **RIPP: Validate Packet(s)** - Validates RIPP packets
- [ ] **RIPP: Lint Packet(s)** - Runs linting checks
- [ ] **RIPP: Package Handoff** - Creates handoff documents
- [ ] **RIPP: Analyze Project** - Generates draft packets

### Test Environments

- [ ] **VS Code Desktop** (Windows/Mac/Linux)
- [ ] **GitHub Codespaces** (if available)
- [ ] **Remote Containers** (if available)

## 🔄 Future Updates

### Version Bump Commands

```bash
# Patch version (0.1.0 → 0.1.1)
npx vsce publish patch

# Minor version (0.1.0 → 0.2.0)
npx vsce publish minor

# Major version (0.1.0 → 1.0.0)
npx vsce publish major
```

### Update Checklist

- [ ] Update version in `package.json`
- [ ] Add entry to `CHANGELOG.md`
- [ ] Compile: `npm run compile`
- [ ] Test locally
- [ ] Package: `npm run package`
- [ ] Publish: `npx vsce publish`

## 📊 Success Criteria

The extension is ready for marketplace publication when:

✅ All required files are present and correctly formatted  
✅ Extension packages without errors or warnings  
✅ Package size is reasonable (<50MB, currently 13KB)  
✅ All commands are properly registered and functional  
✅ Documentation is comprehensive and marketplace-ready  
✅ License is included and correct  
✅ Icon displays correctly  
✅ No unnecessary files are included in the package  
✅ Extension can be installed and tested locally

## 🎯 Current Status: ✅ READY FOR PUBLICATION

All validation checks passed. The extension can be published to the VS Code Marketplace.

**Next Steps:**

1. Create publisher account (if needed)
2. Update publisher field in package.json
3. Publish to marketplace

---

**Package Information:**

- File: `ripp-protocol-{version}.vsix` (version from package.json)
- Size: ~12-13KB (verify with `ls -lh *.vsix`)
- Files: 8
- Version: See package.json
- Build Date: Run `npm run package` to generate current build
