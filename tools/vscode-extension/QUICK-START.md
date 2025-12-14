# Quick Start - VS Code Extension Marketplace Publication

## For Maintainers: Build & Publish in 5 Steps

### Step 1: Navigate to Extension Directory
```bash
cd tools/vscode-extension
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

Expected output:
```
added 302 packages, and audited 303 packages in 6s
found 0 vulnerabilities
```

### Step 3: Build the Extension
```bash
npm run compile
```

Expected output:
```
> ripp-protocol@0.1.0 compile
> tsc -p ./
```

### Step 4: Package for Marketplace
```bash
npm run package
```

Expected output:
```
Packaged: /path/to/ripp-protocol-0.1.0.vsix (8 files, 12.28 KB)
```

### Step 5: Publish to Marketplace

**First, update the publisher in package.json:**
```json
{
  "publisher": "your-publisher-id"
}
```

**Then publish:**
```bash
# Login (first time only)
npx vsce login your-publisher-id

# Publish
npx vsce publish
```

**OR** upload the `.vsix` file manually at:
https://marketplace.visualstudio.com/manage

---

## Testing Locally Before Publishing

```bash
# Install the extension
code --install-extension ripp-protocol-0.1.0.vsix

# Open VS Code and test
# Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# Type "RIPP:" to see all commands
```

---

## What Gets Packaged?

✅ **Included (8 files, 12.28 KB):**
- CHANGELOG.md
- LICENSE
- README.md
- icon.png
- package.json
- out/extension.js

❌ **Excluded:**
- Source TypeScript files (src/**)
- Node modules (node_modules/**)
- Build configuration files
- Development documentation

---

## Troubleshooting

**Q: Package command fails?**
```bash
# Ensure dependencies are installed
npm install

# Ensure TypeScript is compiled
npm run compile

# Then try again
npm run package
```

**Q: Extension doesn't activate?**
- Check that `main` field in package.json points to `./out/extension.js`
- Ensure TypeScript compiled successfully (`out/extension.js` exists)

**Q: Commands don't appear?**
- Verify `activationEvents` in package.json
- Check Developer Tools console (Help → Toggle Developer Tools)

---

## Documentation

- **BUILD.md** - Comprehensive build and packaging guide
- **RELEASE-CHECKLIST.md** - Detailed marketplace publication checklist
- **MARKETPLACE-READY.md** - Validation summary and status

---

## Status: ✅ Ready for Publication

All validation checks passed. The extension is production-ready.
