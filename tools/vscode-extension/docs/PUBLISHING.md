# Publishing the RIPP VS Code Extension

This guide explains how to publish the RIPP VS Code extension to the Microsoft VS Code Marketplace.

---

## Prerequisites

### 1. Microsoft Account & Azure DevOps

- Create a Microsoft account (or use existing)
- Sign in to [Azure DevOps](https://dev.azure.com/)
- Create an organization if you don't have one

### 2. Personal Access Token (PAT)

Create a PAT for publishing:

1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Click **New Token**
3. Configure:
   - **Name**: "VS Code Marketplace Publishing"
   - **Organization**: Select your organization
   - **Expiration**: Set appropriate duration
   - **Scopes**: Select **Marketplace** → **Manage** (full access)
4. Click **Create**
5. **IMPORTANT**: Copy and save the token securely (you won't see it again)

### 3. Publisher Registration

Register the "RIPP" publisher:

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Click **Create Publisher**
4. Enter:
   - **Publisher ID**: `RIPP` (must match exactly)
   - **Publisher Name**: `RIPP Protocol`
   - **Email**: Your contact email
5. Click **Create**

**CRITICAL**: The Publisher ID must be exactly `RIPP` to match `package.json`.

---

## Setup for Publishing

### 1. Install vsce

Install the VS Code Extension Manager CLI:

```bash
npm install -g @vscode/vsce
```

### 2. Authenticate

Login with your PAT:

```bash
vsce login RIPP
```

When prompted, paste your Personal Access Token.

### 3. Prepare Extension Files

Ensure all required files are present:

```
tools/vscode-extension/
├── package.json          # Publisher must be "RIPP"
├── README.md             # Marketplace description
├── icon.png              # 128x128 PNG icon
├── LICENSE               # MIT license (copy from repo root)
├── src/extension.ts      # Compiled to out/extension.js
├── out/extension.js      # Compiled output
├── .vscodeignore         # Files to exclude from package
└── docs/
    ├── TESTING.md
    └── PUBLISHING.md
```

### 4. Verify Package Metadata

Check `package.json`:

```json
{
  "name": "ripp-protocol",
  "displayName": "RIPP Protocol",
  "publisher": "RIPP",          ← Must be exactly "RIPP"
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"         ← Minimum VS Code version
  },
  "icon": "icon.png",           ← Must exist
  "repository": {               ← Must be public repo
    "type": "git",
    "url": "https://github.com/Dylan-Natter/ripp-protocol"
  }
}
```

### 5. Create Icon

Replace the placeholder `icon.png` with a real 128x128 PNG image:

- Dimensions: 128x128 pixels
- Format: PNG
- Represents RIPP Protocol branding
- Clear and recognizable at small sizes

### 6. Copy License

Copy the MIT license from the repository root:

```bash
cp ../../LICENSE ./LICENSE
```

---

## Pre-Publishing Validation

### 1. Compile TypeScript

```bash
npm run compile
```

Verify `out/extension.js` is created and has no errors.

### 2. Test Locally

Follow [TESTING.md](./TESTING.md) to test all features.

### 3. Package Extension

Create a `.vsix` file (local package):

```bash
vsce package
```

This creates `ripp-protocol-0.1.0.vsix`.

### 4. Install Locally

Test the packaged extension:

```bash
code --install-extension ripp-protocol-0.1.0.vsix
```

Verify all commands work as expected.

### 5. Validate Metadata

Check the package:

```bash
vsce ls
```

This lists all files included in the package. Verify:
- No source files (`src/`, `*.ts`)
- No dev files (`node_modules`, `.git`)
- Includes `out/`, `README.md`, `icon.png`, `LICENSE`

---

## Publishing to Marketplace

### Initial Publish

```bash
vsce publish
```

This:
1. Compiles the extension (runs `vscode:prepublish` script)
2. Packages the extension
3. Uploads to VS Code Marketplace
4. Makes it available for installation

### Verify Publication

1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Search for "RIPP Protocol"
3. Verify listing appears correctly:
   - Icon displays
   - README renders properly
   - Version is correct
   - Publisher is "RIPP"

### Install from Marketplace

Test the published version:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "RIPP Protocol"
4. Click **Install**
5. Verify installation and functionality

---

## Updating the Extension

### Version Management

Follow semantic versioning (semver):
- **Patch**: Bug fixes, minor changes (0.1.0 → 0.1.1)
- **Minor**: New features, backward-compatible (0.1.0 → 0.2.0)
- **Major**: Breaking changes (0.1.0 → 1.0.0)

### Update Workflow

1. **Make changes** to `src/extension.ts` or other files

2. **Update version** in `package.json`:

   ```json
   {
     "version": "0.2.0"
   }
   ```

3. **Update README** release notes:

   ```markdown
   ### 0.2.0
   - Added feature X
   - Fixed bug Y
   ```

4. **Test thoroughly** following [TESTING.md](./TESTING.md)

5. **Publish update**:

   ```bash
   # Patch version (0.1.0 → 0.1.1)
   vsce publish patch

   # Minor version (0.1.0 → 0.2.0)
   vsce publish minor

   # Major version (0.1.0 → 1.0.0)
   vsce publish major

   # Or specific version
   vsce publish 0.2.0
   ```

---

## Marketplace Best Practices

### README Quality

The `README.md` is your Marketplace listing:
- Clear feature list
- Screenshots/GIFs of commands in action
- Installation instructions
- Configuration examples
- Troubleshooting section

### Icon Design

- Professional appearance
- Recognizable at small sizes
- Consistent with RIPP branding
- PNG format, 128x128 pixels

### Categories

Set appropriate categories in `package.json`:

```json
{
  "categories": [
    "Linters",
    "Formatters",
    "Other"
  ]
}
```

### Keywords

Include searchable keywords:

```json
{
  "keywords": [
    "ripp",
    "protocol",
    "specification",
    "validation",
    "yaml",
    "json"
  ]
}
```

---

## Unpublishing (Emergency Only)

To remove the extension from Marketplace:

```bash
vsce unpublish RIPP.ripp-protocol
```

**WARNING**: Unpublishing affects all users. Only use for:
- Critical security issues
- Legal/compliance problems
- Permanent discontinuation

For bugs, publish a patched version instead.

---

## CI/CD Integration

### Automated Publishing

For automated publishing via CI/CD (GitHub Actions, etc.):

1. Store PAT as secret (e.g., `VSCE_PAT`)

2. Create workflow to publish on tags:

```yaml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd tools/vscode-extension
          npm install
      
      - name: Publish to Marketplace
        run: |
          cd tools/vscode-extension
          npx vsce publish -p ${{ secrets.VSCE_PAT }}
```

**IMPORTANT**: Never commit PATs to source control. Use CI/CD secrets.

---

## Monitoring

### Download Statistics

View extension metrics:
1. Go to [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Select "RIPP" publisher
3. View statistics:
   - Total installs
   - Daily downloads
   - Version breakdown
   - Rating/reviews

### User Feedback

Monitor:
- Marketplace reviews and ratings
- [GitHub Issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
- User questions in discussions

---

## Security Considerations

### Never Log Secrets

The extension must never:
- Log environment variables
- Display sensitive file contents
- Transmit user data externally

### Secure CLI Execution

The extension uses safe execution:
- `shell: false` (no shell injection)
- Args array (no command string parsing)
- `cwd` set to workspace root
- No arbitrary user input execution

### Dependency Management

Regularly update dependencies:

```bash
npm audit
npm update
```

---

## Support & Maintenance

### User Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Marketplace Q&A**: Quick questions
- **Repository Discussions**: General discussions

### Maintenance Checklist

Regular tasks:
- [ ] Update dependencies quarterly
- [ ] Test with latest VS Code versions
- [ ] Review and respond to user issues
- [ ] Monitor for security vulnerabilities
- [ ] Update documentation as needed

---

## Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace Management](https://marketplace.visualstudio.com/manage)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)

---

## Troubleshooting

### "Publisher 'RIPP' not found"

**Solution**: Create publisher at [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)

### "Personal Access Token verification failed"

**Solution**: 
- Ensure PAT has **Marketplace → Manage** scope
- Token not expired
- Correct organization selected

### "Missing LICENSE file"

**Solution**: Copy from repository root:

```bash
cp ../../LICENSE ./LICENSE
```

### "Icon not found"

**Solution**: Ensure `icon.png` exists and is a valid 128x128 PNG file

### "Package validation failed"

**Solution**: Run `vsce ls` to check included files, ensure no sensitive data

---

## Contact

For publishing issues:
- Open a GitHub Issue: https://github.com/Dylan-Natter/ripp-protocol/issues
- Tag with `vscode-extension` label
