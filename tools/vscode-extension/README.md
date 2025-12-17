# RIPP™ Protocol - VS Code Extension vNext

**World-class protocol companion for RIPP™** — A guided 5-step workflow that makes RIPP effortless, trustworthy, and enterprise-ready.

## What's New in vNext

### 🎯 5-Step Guided Workflow

The extension now features an intuitive workflow sidebar that guides you through the complete RIPP process:

1. **Initialize** - Set up RIPP in your repository with `.ripp/` structure
2. **Build Evidence Pack** - Extract repository signals (routes, schemas, auth, CI, deps)
3. **Discover Intent (AI)** - Use AI to infer candidate intent from evidence
4. **Confirm Intent** - Review and approve AI-discovered intent
5. **Build + Validate + Package** - Generate canonical RIPP artifacts and handoff packages

Each step shows:

- ✓ Status (Not Started / Ready / In Progress / Done / Error)
- ⏱ Last run timestamp
- 📄 Generated output files with quick-open links
- ▶️ Action buttons with prerequisite checking

### 🤖 AI Integration (Optional)

- **Secure Secrets Management** - API keys stored in VS Code SecretStorage (never in repo)
- **Multiple Providers** - OpenAI, Azure OpenAI, or Ollama (local)
- **Trust-First Policy** - AI must be enabled in both repo config AND locally
- **Clear State Visibility** - See exactly why AI is enabled/disabled

### ⚙️ Configuration Management

- **Config Editor** - Edit `.ripp/config.yaml` directly or via UI
- **Connections Manager** - Set up AI providers securely
- **YAML Validation** - Config validated before saving

### 🔧 Enhanced Developer Experience

- **CLI Version Gating** - Automatic detection and upgrade prompts
- **Streaming Output** - Real-time command feedback
- **Better Error Messages** - Actionable guidance when things go wrong
- **Workspace Trust** - Respects VS Code security model

## What This Extension Does

This extension integrates the official RIPP CLI into VS Code. It is a **thin wrapper** around the CLI—no reimplementation of validation or linting logic. All operations are read-only with respect to RIPP packet files, and no data is transmitted externally. Processing happens locally via the RIPP CLI.

**What RIPP is:**

- A structured specification format for capturing feature requirements
- A handoff artifact between prototyping and production teams
- A contract that preserves decisions, constraints, and outcomes

**What RIPP is not:**

- Not a code migration tool or code generator
- Not a refactoring assistant or production hardening helper
- See [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md) for full details

## Commands

### Workflow Commands (5-Step Process)

All workflow commands are available from the RIPP sidebar or Command Palette:

- **RIPP: Initialize Repository** - Create `.ripp/` structure and config
- **RIPP: Build Evidence Pack** - Extract repository signals for AI discovery
- **RIPP: Discover Intent (AI)** - Use AI to infer candidate intent (requires AI setup)
- **RIPP: Confirm Intent** - Review and approve discovered intent
- **RIPP: Build Canonical Artifacts** - Generate final RIPP packets

### Utility Commands

- **RIPP: Edit Configuration** - Edit `.ripp/config.yaml`
- **RIPP: Manage AI Connections** - Configure API keys securely
- **RIPP: Validate Packet(s)** - Validate all RIPP packets against schema
- **RIPP: Package Handoff** - Package RIPP into handoff document
- **RIPP: Refresh Status** - Refresh workflow status
- **RIPP: Open Documentation** - Open RIPP protocol docs
- **RIPP: Open CI / GitHub Actions** - Quick link to GitHub Actions

### Legacy Commands

- **RIPP: Lint Packet(s)** - Run quality checks (legacy)
- **RIPP: Analyze Project** - Redirects to new workflow

## Features

### RIPP Activity Bar & Sidebar

The extension adds a dedicated RIPP view in the VS Code Activity Bar (left sidebar). The RIPP sidebar shows:

- **Initialization Status**: Whether RIPP is initialized in your workspace
- **Last Validation Result**: Pass/fail status with timestamp from the last validation run
- **Quick Actions**: Buttons to initialize, validate, open docs, and access CI

Click the RIPP icon in the Activity Bar to open the sidebar.

### Problems Panel Integration

Validation errors and warnings appear directly in VS Code's Problems panel. Click on any issue to jump to the relevant file and line.

### Validation Report Viewer

After running validation, view detailed results in the RIPP Report webview panel. The report includes:

- Summary (pass/fail status, issue count, timestamp)
- Filterable table of all findings
- Export options (copy to clipboard, export as JSON or Markdown)

### Workspace Trust

The extension respects VS Code's Workspace Trust feature. Commands that execute the RIPP CLI will only run in trusted workspaces, protecting you from potentially malicious code in untrusted repositories.

## Requirements

This extension requires the RIPP CLI to be available. For best performance and offline support, install it as a dev dependency:

```bash
npm install -D ripp-cli
```

Alternatively, the extension can use `npx ripp` (fetches on demand, slower).

**Recommended setup:**

1. Install RIPP CLI locally: `npm install -D ripp-cli`
2. Run **RIPP: Initialize Repository** to set up your project structure
3. Start creating RIPP packets in `ripp/features/`

## Platform Support

This extension works on:

- ✅ **Windows** (uses `ripp.cmd` from node_modules)
- ✅ **macOS** (uses `ripp` binary)
- ✅ **Linux** (uses `ripp` binary)

It also works in:

- ✅ **VS Code Desktop**
- ✅ **GitHub Codespaces** (install `ripp-cli` in your devcontainer or via `npm install -D ripp-cli`)
- ✅ **VS Code Remote Containers**
- ⚠️ **VS Code Web** (requires Node.js environment with RIPP CLI available)

## Codespaces & Remote Environments

**GitHub Codespaces:** This extension works in Codespaces. For best results:

1. Add `ripp-cli` to your `devDependencies` in `package.json`
2. Or run `npm install -D ripp-cli` in your Codespace
3. The extension will automatically prefer the local CLI binary

The extension falls back to `npx ripp` if no local installation is found, but this is slower and requires network access.

## Security Notes

- **Secrets in SecretStorage Only:** API keys stored securely in VS Code SecretStorage, never in repository files
- **Read-only validation:** The extension never modifies RIPP packet files (`*.ripp.yaml`, `*.ripp.json`) during validation
- **Local processing:** All validation, linting, and AI processing happens locally via the RIPP CLI
- **AI Policy Enforcement:** AI must be enabled in repo config AND locally with secrets configured
- **Workspace Trust:** Respects VS Code Workspace Trust to prevent untrusted code execution
- **Explicit writes only:** Commands like `init`, `build`, and `package` only write files when you explicitly invoke them
- **No telemetry:** No usage data sent externally (local-only in future versions)

## Installation

Install from the VS Code Marketplace:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "RIPP Protocol"
4. Click Install

## Quick Start

### 5-Minute Workflow (With AI)

1. **Install RIPP CLI**

   ```bash
   npm install -D ripp-cli
   ```

2. **Open RIPP Sidebar**
   - Click the RIPP icon in Activity Bar (left sidebar)

3. **Follow the 5-Step Workflow**
   - **Step 1: Initialize** - Click "Run 1. Initialize"
   - **Step 2: Build Evidence** - Click "Run 2. Build Evidence Pack"
   - **Step 3: Configure AI** (optional)
     - Click "Connections" → Configure your AI provider
     - Edit `.ripp/config.yaml` → Set `ai.enabled: true`
   - **Step 3: Discover Intent** - Click "Run 3. Discover Intent (AI)"
   - **Step 4: Confirm Intent** - Review and click "Run 4. Confirm Intent"
   - **Step 5: Build & Package** - Click "Run 5. Build + Validate + Package"

4. **View Results**
   - Check Problems panel for validation issues
   - Open `.ripp/` folder to see generated artifacts
   - Use "Package Handoff" to create final deliverable

### Without AI (Manual Mode)

1. **Initialize**

   ```bash
   npm install -D ripp-cli
   ```

2. **Create Structure**
   - Run **RIPP: Initialize Repository**

3. **Create RIPP Packet Manually**
   - Create `.ripp/my-feature.ripp.yaml`
   - Follow RIPP schema (see docs)

4. **Validate & Package**
   - Run **RIPP: Validate Packet(s)**
   - Run **RIPP: Package Handoff**

### For New Users (Detailed)

1. Open your project in VS Code
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run **RIPP: Initialize Repository**
4. This creates:
   - `ripp/` directory for RIPP packets
   - `ripp/features/` for feature specifications
   - `ripp/intent-packages/` for packaged artifacts
   - `.github/workflows/ripp-validate.yml` for CI validation
5. Create your first RIPP packet in `ripp/features/my-feature.ripp.yaml`
6. Run **RIPP: Validate Packet(s)** to validate
7. View results in the Output panel (View → Output, select "RIPP")

### For Existing RIPP Users

1. Open a workspace containing RIPP packets
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run **RIPP: Validate Packet(s)** to validate your packets
4. View results in the Output panel (View → Output, select "RIPP")

## Standard Repository Layout

RIPP vNext uses this structure (created by `ripp init`):

```
your-repo/
├── .ripp/                          # RIPP workspace
│   ├── config.yaml                 # Repository RIPP configuration
│   ├── README.md                   # RIPP documentation
│   ├── evidence/                   # Evidence pack (step 2)
│   │   ├── evidence.index.json
│   │   ├── routes.json
│   │   ├── schemas.json
│   │   ├── auth.json
│   │   └── dependencies.json
│   ├── candidates/                 # AI-discovered intent (step 3)
│   │   └── intent.candidates.*.json
│   ├── confirmed/                  # Confirmed intent (step 4)
│   │   └── intent.confirmed.*.json
│   └── *.ripp.yaml                 # Final RIPP packets (step 5)
├── .github/
│   └── workflows/
│       └── ripp-validate.yml       # CI validation
└── (your project files)
```

**Migration Note:** Legacy `ripp/features/` layout is still supported but new workflows use `.ripp/` at repo root.

## Configuration

Configure the extension via VS Code settings (File → Preferences → Settings):

### `ripp.cliMode`

How to execute the RIPP CLI:

- `"npx"` (default): Prefers local `node_modules/.bin/ripp`, falls back to `npx ripp`
- `"npmScript"`: Uses workspace npm scripts (requires scripts like `ripp:validate`, `ripp:lint`, etc.)

```json
{
  "ripp.cliMode": "npx"
}
```

**Recommendation:** Use the default `"npx"` mode and install `ripp-cli` as a dev dependency for best performance.

### `ripp.strict`

Enable strict mode for linting (treat warnings as errors):

```json
{
  "ripp.strict": false
}
```

### `ripp.paths`

Glob patterns for discovering RIPP packet files:

```json
{
  "ripp.paths": ["**/*.ripp.yaml", "**/*.ripp.json"]
}
```

### `ripp.ai.enabledLocally`

Enable AI features locally (only works if repo config allows AI):

```json
{
  "ripp.ai.enabledLocally": false
}
```

**Note:** This setting works in conjunction with `.ripp/config.yaml`. Both must be true for AI to work.

### `ripp.validateOnSave`

Automatically validate RIPP files when saved:

```json
{
  "ripp.validateOnSave": false
}
```

## AI Configuration

### Repository Config (`.ripp/config.yaml`)

Controls whether AI is allowed in the repository:

```yaml
rippVersion: '1.0'
ai:
  enabled: true # Repo policy: allow AI
  provider: openai
  model: gpt-4o-mini
  maxRetries: 3
  timeout: 30000
evidencePack:
  includeGlobs:
    - 'src/**'
    - 'app/**'
    - 'api/**'
  excludeGlobs:
    - '**/node_modules/**'
    - '**/dist/**'
```

### Local Secrets (VS Code SecretStorage)

Use **RIPP: Manage AI Connections** to configure:

- **OpenAI**: API key
- **Azure OpenAI**: Endpoint, API key, deployment, API version
- **Ollama**: Base URL (for local models)

Secrets are stored securely in VS Code and never written to repository files.

## File Naming Convention

RIPP packet files must follow the naming convention:

- `*.ripp.yaml` or `*.ripp.yml`
- `*.ripp.json`

Examples:

- `user-registration.ripp.yaml`
- `api-feature.ripp.json`

## Documentation

- [RIPP Protocol Homepage](https://dylan-natter.github.io/ripp-protocol)
- [RIPP Specification](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md)
- [Getting Started Guide](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/getting-started.md)
- [Extension Testing Guide](./docs/TESTING.md)
- [Extension Publishing Guide](./docs/PUBLISHING.md)

## Support

- [GitHub Issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
- [GitHub Repository](https://github.com/Dylan-Natter/ripp-protocol)

## Troubleshooting

### CLI Not Found

**Problem:** "RIPP CLI was not found"

**Solutions:**

1. Install RIPP CLI locally: `npm install -D ripp-cli`
2. Check that `node_modules/.bin/ripp` exists
3. Restart VS Code after installation

### AI Not Working

**Problem:** "AI is disabled" or discovery fails

**Check:**

1. **Repo Config**: `.ripp/config.yaml` has `ai.enabled: true`
2. **Local Setting**: `ripp.ai.enabledLocally` is `true` in VS Code settings
3. **Secrets**: Run **RIPP: Manage AI Connections** to configure API keys
4. **Environment**: Check Output panel for error messages

### Version Mismatch

**Problem:** "RIPP CLI version X.X.X is installed, but Y.Y.Y or higher is required"

**Solution:**

```bash
npm install -D ripp-cli@latest
```

### Workflow Steps Disabled

**Problem:** Step shows "(prerequisites not met)"

**Solution:** Complete prerequisite steps in order:

1. Initialize → 2. Evidence → 3. Discover → 4. Confirm → 5. Build

### Codespaces Issues

**Problem:** Extension not working in GitHub Codespaces

**Solutions:**

1. Add `ripp-cli` to `devDependencies` in `package.json`
2. Run `npm install` in Codespace terminal
3. Check that Node.js >=18.0.0 is available

### Output Not Showing

**Problem:** Can't see command output

**Solution:**

1. View → Output
2. Select "RIPP" from dropdown
3. Check "Show Output" on command errors

## License

MIT

## Release Notes

### 0.2.0 - vNext (Current)

🎉 **Major Update: 5-Step Workflow & AI Integration**

**New Features:**

- **5-Step Guided Workflow**: Complete redesign with intuitive step-by-step process
  - Initialize → Build Evidence → Discover Intent → Confirm → Build & Package
  - Real-time status tracking with timestamps
  - Output file links for quick access
  - Prerequisite checking

- **AI Integration (Optional)**:
  - Secure secrets management via VS Code SecretStorage
  - Support for OpenAI, Azure OpenAI, and Ollama
  - Trust-first AI policy enforcement
  - Clear state visibility

- **Enhanced Services**:
  - Unified CLI runner with version gating
  - Configuration service for `.ripp/config.yaml`
  - Secrets service for secure API key storage

- **Improved UX**:
  - Better error messages with actionable guidance
  - Streaming command output
  - CLI installation helpers
  - Workspace trust integration

**Breaking Changes:**

- New `.ripp/` directory structure at repo root (legacy `ripp/features/` still supported)
- Analyze command deprecated in favor of workflow

### 0.1.0

New UI features:

- **RIPP Activity Bar**: Dedicated sidebar view showing initialization status, validation results, and quick actions
- **Problems Panel Integration**: Validation errors and warnings appear in the VS Code Problems panel
- **Validation Report Viewer**: Webview panel displaying detailed validation results with export capabilities
- **GitHub CI Integration**: Quick access to GitHub Actions workflows from the sidebar
- **Workspace Trust**: Respects VS Code Workspace Trust to prevent untrusted code execution
- **Enhanced Initialize Command**: Shows preview of files before creation and requires explicit confirmation
- **Improved Documentation**: Comprehensive feature documentation and screenshots

Improvements:

- **RIPP: Initialize Repository** command now shows file preview and requires confirmation before writing
- Validation output streams to dedicated "RIPP" output channel
- All CLI execution commands respect Workspace Trust settings
- Better error messages and user guidance throughout

### 0.1.0

Initial release:

- Validate command
- Lint command
- Package command
- Analyze command
- Configuration support for CLI mode, strict mode, and file paths
