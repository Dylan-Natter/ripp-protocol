# VS Code Extension vNext

**World-class protocol companion for RIPP™** — A guided 5-step workflow that makes RIPP effortless, trustworthy, and enterprise-ready.

## What's New in vNext

The RIPP VS Code Extension has been completely redesigned to provide a guided workflow experience while maintaining its core philosophy: **a thin UI layer over the deterministic RIPP CLI**.

### Key Features

- 🎯 **5-Step Guided Workflow** - From initialization to artifact generation
- 🤖 **Optional AI Integration** - Secure intent discovery with OpenAI, Azure OpenAI, or Ollama
- ⚙️ **Configuration Management** - Safe `.ripp/config.yaml` editing with YAML validation
- 🔐 **Secrets Management** - API keys stored in VS Code SecretStorage (never in repo)
- 📊 **Status Tracking** - Visual workflow progress with prerequisites and outputs
- 🔄 **Real-time Feedback** - Streaming command output and progress notifications

## Philosophy

The extension is a **thin wrapper** around the official RIPP CLI:

- ✅ Orchestrates CLI commands
- ✅ Provides guided UX and visualization
- ✅ Edits repo config safely
- ✅ Stores secrets securely
- ❌ **NEVER** reimplements RIPP parsing/validation/business logic
- ❌ **NEVER** writes secrets to the repository
- ❌ **NEVER** modifies canonical RIPP artifacts without explicit user action

**All core logic lives in the CLI. The extension provides UX only.**

## Installation

### Prerequisites

- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 18+ (for RIPP CLI)
- **RIPP CLI**: Extension will prompt to install if missing

### From Marketplace (Coming Soon)

1. Open VS Code Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Search for "RIPP Protocol"
3. Click Install

### From Source (Development)

```bash
cd tools/vscode-extension
npm install
npm run compile
npm run package
code --install-extension ripp-protocol-*.vsix
```

## Getting Started

### 1. Open the RIPP Sidebar

Click the RIPP icon in the Activity Bar (left sidebar) to access the workflow view.

### 2. Follow the 5-Step Workflow

The sidebar guides you through the complete RIPP process:

1. **Initialize** → Set up `.ripp/` structure
2. **Build Evidence** → Extract repository signals
3. **Discover Intent (AI)** → Optional AI-assisted intent discovery
4. **Confirm Intent** → Review and approve candidate intent
5. **Build Artifacts** → Generate canonical RIPP packets

Each step shows its status, prerequisites, and outputs.

## 5-Step Workflow

### Step 1: Initialize

**Command**: `RIPP: Initialize Repository`

**What it does**:

- Creates `.ripp/` directory structure
- Generates `config.yaml` with sensible defaults
- Sets up directories for evidence, intent, and artifacts

**Prerequisites**: None

**Outputs**:

- `.ripp/config.yaml`
- `.ripp/evidence/` (empty)
- `.ripp/intent/` (empty)

**Status transitions**: Not Started → In Progress → Done

---

### Step 2: Build Evidence Pack

**Command**: `RIPP: Build Evidence Pack`

**What it does**:

- Scans repository for routes, schemas, auth patterns, CI configs, dependencies
- Creates structured evidence index
- Generates evidence files

**Prerequisites**:

- Step 1 completed (RIPP initialized)

**Outputs**:

- `.ripp/evidence/evidence.index.json`
- `.ripp/evidence/routes.json` (if routes detected)
- `.ripp/evidence/schemas.json` (if schemas detected)
- `.ripp/evidence/auth.json` (if auth patterns detected)
- `.ripp/evidence/ci.json` (if CI config detected)
- `.ripp/evidence/dependencies.json` (if dependencies detected)

**Status transitions**: Not Started → Ready → In Progress → Done

**What to check**: Click on output files to view extracted evidence

---

### Step 3: Discover Intent (AI)

**Command**: `RIPP: Discover Intent (AI)`

**What it does**:

- Sends evidence to configured AI provider
- Generates candidate intent documents
- Creates `.ripp/intent.candidates.*` files with AI-discovered intent

**Prerequisites**:

- Step 2 completed (evidence built)
- `ai.enabled: true` in `.ripp/config.yaml`
- AI secrets configured in SecretStorage (via Connections manager)
- Local AI policy enabled (`ripp.ai.enabledLocally` setting)

**Outputs**:

- `.ripp/intent.candidates.purpose.md`
- `.ripp/intent.candidates.data_contracts.md`
- `.ripp/intent.candidates.ux_flow.md`
- Other candidate files based on evidence

**Status transitions**: Not Started → Ready → In Progress → Done / Error

**AI Policy**: Step shows clear messaging when AI is disabled:

- If repo policy disables AI: "AI disabled by repository policy"
- If secrets missing: "Configure AI connection in Utilities"
- If local policy disabled: "Enable AI in extension settings"

---

### Step 4: Confirm Intent

**Command**: `RIPP: Confirm Intent`

**What it does**:

- Opens interactive confirmation UI
- Shows candidate intent with evidence links
- Allows accept/reject/edit for each section
- Creates confirmed intent files after review

**Prerequisites**:

- Step 3 completed (intent discovered)

**Outputs**:

- `.ripp/intent.confirmed.purpose.md`
- `.ripp/intent.confirmed.data_contracts.md`
- `.ripp/intent.confirmed.ux_flow.md`
- Other confirmed files based on accepted candidates

**Status transitions**: Not Started → Ready → In Progress → Done

**Human-in-the-loop**: This step ensures all AI-discovered intent is reviewed before proceeding

---

### Step 5: Build + Validate + Package

**Command**: `RIPP: Build Canonical Artifacts`

**What it does**:

- Builds final RIPP packet from confirmed intent
- Validates against RIPP schema
- Packages into handoff artifact
- Runs all quality checks

**Prerequisites**:

- Step 4 completed (intent confirmed)

**Outputs**:

- `.ripp/*.ripp.yaml` (canonical RIPP packet)
- `.ripp/handoff/` directory with packaged artifacts
- Validation report in Output panel

**Status transitions**: Not Started → Ready → In Progress → Done / Error

**Final validation**: Extension shows validation errors in Problems panel if schema violations detected

---

## Configuration Management

### Editing Config

**Command**: `RIPP: Edit Configuration`

Opens `.ripp/config.yaml` in VS Code editor with YAML validation.

### Config Structure

```yaml
ai:
  enabled: true # Master switch for AI features
  provider: openai # Options: openai, azure-openai, ollama
  model: gpt-4 # Model or deployment name

evidence:
  include:
    - 'src/**'
    - 'lib/**'
  exclude:
    - 'node_modules/**'
    - 'dist/**'
    - '.git/**'
```

### Config Validation

- YAML syntax checked before saving
- Schema validation ensures valid structure
- Invalid config prevents workflow steps from running

---

## Secrets Management

### AI Provider Setup

**Command**: `RIPP: Manage AI Connections`

Opens secure connection manager for AI providers.

### Supported Providers

#### OpenAI

**Required**:

- API Key

**Environment variables set**:

- `OPENAI_API_KEY`
- `RIPP_AI_ENABLED=true`

**Test connection**: Validates API key with OpenAI

---

#### Azure OpenAI

**Required**:

- API Key
- Endpoint URL
- Deployment Name
- API Version

**Environment variables set**:

- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`
- `RIPP_AI_ENABLED=true`

**Test connection**: Validates configuration with Azure endpoint

---

#### Ollama (Local)

**Optional**:

- Base URL (defaults to `http://localhost:11434`)

**Environment variables set**:

- `OLLAMA_BASE_URL` (if custom)
- `RIPP_AI_ENABLED=true`

**Test connection**: Verifies Ollama server is reachable

---

### Secret Storage Security

- **VS Code SecretStorage**: All secrets stored in encrypted VS Code storage
- **Never in repository**: Secrets never written to disk or committed
- **Workspace-scoped**: Each workspace has separate secrets
- **Clear secrets**: Use "Clear Secrets" button to remove all stored credentials

---

## AI Policy (Trust-First)

AI features require **three conditions** to be enabled:

1. **Repository Policy**: `.ripp/config.yaml` has `ai.enabled: true`
2. **Local Policy**: VS Code setting `ripp.ai.enabledLocally: true`
3. **Secrets Configured**: Required secrets in SecretStorage

### AI State Visibility

The extension shows clear AI status:

- ❌ **Disabled by repo policy** - Config has `ai.enabled: false` (cannot override in UI)
- ⚠️ **Repo allows AI, but disabled locally** - Missing secrets or local policy setting
- ✅ **Enabled** - All three conditions met, AI will run

### Environment Variable Filtering

When AI is enabled, only these environment variables are passed to CLI:

- `RIPP_*`
- `OPENAI_*`
- `AZURE_OPENAI_*`
- `OLLAMA_*`

All other environment variables are filtered out for security.

---

## CLI Integration

### CLI Detection

Extension automatically detects RIPP CLI in this order:

1. Workspace devDependency (`node_modules/.bin/ripp`)
2. Global installation (`npx ripp`)
3. Shows installation help if not found

### Version Gating

**Minimum required version**: Configurable in settings (default: `0.1.0`)

If installed CLI version is insufficient:

- Warning notification with version mismatch
- Upgrade instructions with copy-paste commands
- Links to release notes

### CLI Execution

All workflow steps execute via unified CLI runner:

- **Streaming output**: Real-time progress in "RIPP" Output channel
- **Cancellation support**: Stop long-running commands (Ctrl+C)
- **Exit code handling**: Detects success/failure automatically
- **Structured output**: Parses JSON output when available

**View logs**: View → Output → Select "RIPP"

---

## Utility Commands

### Validate Packet(s)

**Command**: `RIPP: Validate Packet(s)`

Validates all `.ripp.yaml` files against RIPP schema.

**Output**:

- Validation results in Problems panel
- Summary in RIPP Output channel

**When to use**: After creating or editing RIPP packets

---

### Package Handoff

**Command**: `RIPP: Package Handoff`

Creates handoff artifact from validated RIPP packets.

**Output**:

- `.ripp/handoff/*.md` files
- Ready for sharing with production team

**When to use**: After completing Step 5 and validating packets

---

### Refresh Status

**Command**: `RIPP: Refresh Status`

Refreshes workflow step status indicators in sidebar.

**When to use**: If status seems out of sync with actual file state

---

### Open Documentation

**Command**: `RIPP: Open Documentation`

Opens RIPP protocol documentation in browser.

---

### Open CI / GitHub Actions

**Command**: `RIPP: Open CI / GitHub Actions`

Quick link to GitHub Actions for current repository.

---

## Extension Settings

### `ripp.ai.enabledLocally`

**Type**: Boolean  
**Default**: `false`

Local policy for AI features. Must be `true` for AI to run, even if repo policy allows it.

### `ripp.cli.minVersion`

**Type**: String  
**Default**: `"0.1.0"`

Minimum required RIPP CLI version. Extension shows upgrade prompt if version is lower.

### `ripp.cli.customPath`

**Type**: String  
**Default**: `""`

Custom path to RIPP CLI executable. Leave empty for automatic detection.

---

## Troubleshooting

### CLI Not Found

**Error**: "RIPP CLI not found"

**Solutions**:

1. Install as devDependency: `npm install -D ripp-cli`
2. Install globally: `npm install -g ripp-cli`
3. Set custom path in settings: `ripp.cli.customPath`

---

### Version Mismatch

**Warning**: "CLI version X.Y.Z is insufficient"

**Solutions**:

1. Update devDependency: `npm update ripp-cli`
2. Update global: `npm update -g ripp-cli`
3. Check release notes for breaking changes

---

### AI Not Running

**Symptoms**: Step 3 shows error or disabled state

**Checklist**:

1. ✅ Is `ai.enabled: true` in `.ripp/config.yaml`?
2. ✅ Is `ripp.ai.enabledLocally` setting enabled in VS Code?
3. ✅ Are secrets configured in Connections manager?
4. ✅ Does "Test Connection" succeed?

---

### Validation Errors

**Symptoms**: Step 5 fails with schema validation errors

**Solutions**:

1. Review error messages in Problems panel
2. Check RIPP packet structure matches schema
3. See [Validation Rules](./Validation-Rules.md) for common issues
4. Ensure all required fields are present

---

### Permission Errors

**Error**: "Cannot write to `.ripp/` directory"

**Solutions**:

1. Check file permissions
2. Ensure workspace is trusted (VS Code prompt)
3. Close any open files in `.ripp/` directory before running commands

---

## Architecture

### Services Layer

**cliRunner.ts**:

- Unified CLI execution
- Version gating with upgrade prompts
- Streaming output handling
- Cancellation support

**configService.ts**:

- `.ripp/config.yaml` CRUD operations
- YAML validation
- Safe file writing

**secretService.ts**:

- VS Code SecretStorage integration
- API key management (OpenAI, Azure OpenAI, Ollama)
- Environment variable generation

### Views Layer

**workflowProvider.ts**:

- 5-step workflow sidebar
- Status tracking (not-started/ready/in-progress/done/error)
- Prerequisites checking
- Output file links with quick-open

### Extension Layer

**extension.ts**:

- Orchestration only
- Command registration
- Delegates to services

**commands/**:

- Individual command implementations
- Workflow step handlers
- Utility command handlers

**utils/**:

- Shared utilities
- Type definitions

---

## Security

- ✅ **CodeQL**: 0 vulnerabilities detected
- ✅ **Secrets Isolation**: API keys only in SecretStorage
- ✅ **Environment Filtering**: Only RIPP-related variables passed to CLI
- ✅ **Workspace Trust**: Respects VS Code security model
- ✅ **Read-Only Operations**: Extension never modifies RIPP packets directly (CLI does)

---

## Migration from Legacy Extension

### Breaking Changes

- **Directory structure**: `ripp/features/` → `.ripp/` (legacy path still supported)
- **Analyze command**: Deprecated (use 5-step workflow instead)

### What's Preserved

- All validation and linting logic (CLI-based)
- Configuration format (`.ripp/config.yaml`)
- Output file formats
- Schema compatibility

---

## Related Documentation

- [CLI Reference](./CLI-Reference.md) - Complete RIPP CLI command reference
- [Schema Reference](./Schema-Reference.md) - RIPP packet schema documentation
- [Validation Rules](./Validation-Rules.md) - Common validation errors and fixes
- [SPEC.md](../../SPEC.md) - RIPP protocol specification

---

## Support

- **GitHub Issues**: [ripp-protocol/issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
- **Documentation**: [docs/](../../docs/)
- **Discussions**: [ripp-protocol/discussions](https://github.com/Dylan-Natter/ripp-protocol/discussions)
