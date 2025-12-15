# Building and Packaging the RIPP VS Code Extension

This guide covers how to build and package the RIPP Protocol VS Code extension for marketplace publication.

## Prerequisites

- Node.js 18+
- npm 8+
- VS Code 1.85.0 or higher (for testing)

## Quick Start

```bash
# Navigate to extension directory
cd tools/vscode-extension

# Install dependencies
npm install

# Build the extension
npm run compile

# Package for marketplace
npm run package
```

This will create `ripp-protocol-{version}.vsix` in the current directory (e.g., `ripp-protocol-0.1.0.vsix`).

## Build Commands

### Install Dependencies

```bash
npm install
```

Installs all required dependencies including:

- TypeScript compiler
- VS Code extension API types
- ESLint and related packages
- VSCE (VS Code Extension) packaging tool

### Compile TypeScript

```bash
npm run compile
```

Compiles TypeScript source files from `src/` to JavaScript in `out/`. The compiled output includes:

- `out/extension.js` - Main extension code
- `out/extension.js.map` - Source maps for debugging

### Watch Mode (Development)

```bash
npm run watch
```

Runs TypeScript compiler in watch mode. Files are automatically recompiled when you save changes.

### Lint Code

```bash
npm run lint
```

Runs ESLint on TypeScript source files to check for code quality issues.

## Packaging

### Create .vsix Package

```bash
npm run package
```

This command:

1. Runs `vscode:prepublish` script (compiles TypeScript)
2. Packages the extension using `vsce package`
3. Creates `ripp-protocol-0.1.0.vsix`

The package includes:

- `CHANGELOG.md` - Release notes
- `LICENSE` - MIT license
- `README.md` - Extension documentation
- `icon.png` - Extension icon
- `package.json` - Extension manifest
- `out/extension.js` - Compiled extension code

### Verify Package Contents

```bash
npx vsce ls
```

Lists all files that will be included in the package.

## Local Testing

### Install Extension Locally

```bash
# Install from .vsix file (replace {version} with actual version)
code --install-extension ripp-protocol-{version}.vsix

# Verify installation
code --list-extensions | grep ripp-protocol
```

### Uninstall Extension

```bash
# Replace {publisher} with actual publisher ID
code --uninstall-extension {publisher}.ripp-protocol
```

### Test in Extension Development Host

1. Open the extension directory in VS Code
2. Press F5 or Run → Start Debugging
3. A new VS Code window opens with the extension loaded
4. Test commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P)

## Publishing to Marketplace

### Prerequisites

1. Create a publisher account at https://marketplace.visualstudio.com/manage
2. Generate a Personal Access Token (PAT) from Azure DevOps:
   - Go to https://dev.azure.com
   - User Settings → Personal Access Tokens
   - Create new token with "Marketplace (Manage)" scope
3. Update `publisher` field in `package.json` to match your publisher ID

### Publish

```bash
# Login to publisher account
npx vsce login <publisher-name>

# Publish extension
npx vsce publish
```

Or upload the `.vsix` file manually via the marketplace web interface.

### Publish Specific Version

```bash
# Patch version (0.1.0 → 0.1.1)
npx vsce publish patch

# Minor version (0.1.0 → 0.2.0)
npx vsce publish minor

# Major version (0.1.0 → 1.0.0)
npx vsce publish major

# Specific version
npx vsce publish 1.2.3
```

## Troubleshooting

### "Cannot find module 'vscode'"

Run `npm install` to install dependencies.

### "Error: Command failed: tsc -p ./"

Ensure TypeScript is installed: `npm install`

### Package is too large

Check `.vscodeignore` to ensure unnecessary files are excluded:

- Source TypeScript files (`src/**`, `**/*.ts`)
- Development dependencies (`node_modules/**`)
- Test files (`.vscode-test/**`)
- Documentation files (`docs/**`)

### Extension doesn't activate

1. Check `activationEvents` in `package.json`
2. Verify `main` field points to `./out/extension.js`
3. Check Developer Tools console (Help → Toggle Developer Tools)

## File Structure

```
tools/vscode-extension/
├── src/
│   └── extension.ts          # Extension source code
├── out/                       # Compiled output (generated)
│   ├── extension.js
│   └── extension.js.map
├── node_modules/              # Dependencies (generated)
├── package.json               # Extension manifest
├── package-lock.json
├── tsconfig.json              # TypeScript configuration
├── .vscodeignore              # Files to exclude from package
├── .gitignore
├── README.md                  # Extension documentation
├── CHANGELOG.md               # Release notes
├── LICENSE                    # MIT license
├── icon.png                   # Extension icon
└── BUILD.md                   # This file
```

## CI/CD Integration

The repository includes a GitHub Actions workflow (`.github/workflows/vscode-extension-build.yml`) that automatically builds and packages the extension when changes are pushed to the `tools/vscode-extension` directory.

The workflow:

1. Runs on pushes to `main` and `copilot/**` branches
2. Installs dependencies with `npm ci`
3. Compiles TypeScript with `npm run compile`
4. Lints code with `npm run lint`
5. Packages extension with `npm run package`
6. Uploads the `.vsix` file as a build artifact

You can download the packaged extension from the Actions tab in the repository after a successful build.

## Support

For issues or questions:

- GitHub Issues: https://github.com/Dylan-Natter/ripp-protocol/issues
- Repository: https://github.com/Dylan-Natter/ripp-protocol
