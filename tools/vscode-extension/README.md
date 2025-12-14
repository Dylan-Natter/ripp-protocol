# RIPP™ Protocol - VS Code Extension

VS Code integration for the Regenerative Intent Prompting Protocol (RIPP™).

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

All commands are available via the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- **RIPP: Initialize Repository** - Set up RIPP structure in your repository (creates `ripp/`, GitHub Actions, etc.)
- **RIPP: Validate Packet(s)** - Validate all RIPP packets in your workspace against the schema
- **RIPP: Lint Packet(s)** - Run quality checks and best practice linting on your packets
- **RIPP: Package Handoff** - Package a RIPP packet into a handoff document (Markdown, JSON, or YAML)
- **RIPP: Analyze Project (Draft Packet)** - Generate a draft RIPP packet from existing documentation

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

- **Read-only validation:** The extension never modifies RIPP packet files (`*.ripp.yaml`, `*.ripp.json`) during validation
- **Local processing:** All validation, linting, and analysis happens locally via the RIPP CLI
- **No credentials collected:** No secrets, tokens, or environment variables are collected or stored
- **Explicit writes only:** Commands like `init`, `package`, and `analyze` only write files when you explicitly invoke them and choose output locations

## Installation

Install from the VS Code Marketplace:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "RIPP Protocol"
4. Click Install

## Quick Start

### For New Users

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

RIPP uses a standard repository structure (created by `ripp init`):

```
your-repo/
├── ripp/                        # RIPP artifacts
│   ├── README.md                # Documentation
│   ├── features/                # Feature RIPP packets
│   │   ├── auth-login.ripp.yaml
│   │   └── user-profile.ripp.yaml
│   └── intent-packages/         # Packaged artifacts
│       ├── README.md
│       └── latest.tar.gz
├── .github/
│   └── workflows/
│       └── ripp-validate.yml    # CI validation
└── (your project files)
```

The extension will discover RIPP packets anywhere in your workspace, but following this structure is recommended for consistency.

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

## License

MIT

## Release Notes

### 0.2.0 (Upcoming)

New features:

- **RIPP: Initialize Repository** command for easy project setup
- Prefer local `node_modules/.bin/ripp` over `npx` for better performance
- Improved error messages with install guidance
- Cross-platform binary detection (Windows `.cmd` support)
- Updated documentation for RIPP v1.0 alignment

### 0.1.0

Initial release:

- Validate command
- Lint command
- Package command
- Analyze command
- Configuration support for CLI mode, strict mode, and file paths
