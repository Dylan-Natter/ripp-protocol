# RIPP Protocol - VS Code Extension

VS Code integration for validating, linting, packaging, and analyzing RIPP packets.

## Features

This extension provides seamless integration with the RIPP CLI directly from VS Code:

- **Validate Packet(s)**: Validate all RIPP packets in your workspace against the schema
- **Lint Packet(s)**: Run quality checks and best practice linting on your packets
- **Package Handoff**: Package a RIPP packet into a handoff document (Markdown, JSON, or YAML)
- **Analyze Project (Draft Packet)**: Generate a draft RIPP packet from existing documentation

## Requirements

This extension requires:
- Node.js 16 or higher
- The RIPP CLI to be available via `npx ripp` or npm scripts

The RIPP CLI will be automatically installed via `npx` if using the default configuration.

## Installation

Install from the VS Code Marketplace:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "RIPP Protocol"
4. Click Install

## Usage

### Commands

All commands are available via the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- **RIPP: Validate Packet(s)** - Validates all `*.ripp.yaml` and `*.ripp.json` files in your workspace
- **RIPP: Lint Packet(s)** - Runs linting checks on all RIPP packets
- **RIPP: Package Handoff** - Select a packet and output format to create a handoff document
- **RIPP: Analyze Project (Draft Packet)** - Analyze documentation to generate a draft RIPP packet

### Configuration

Configure the extension via VS Code settings (File → Preferences → Settings):

#### `ripp.cliMode`

How to execute the RIPP CLI:
- `"npx"` (default): Runs `npx ripp` commands
- `"npmScript"`: Uses workspace npm scripts (requires scripts like `ripp:validate`, `ripp:lint`, etc.)

```json
{
  "ripp.cliMode": "npx"
}
```

#### `ripp.strict`

Enable strict mode for linting (treat warnings as errors):

```json
{
  "ripp.strict": false
}
```

#### `ripp.paths`

Glob patterns for discovering RIPP packet files:

```json
{
  "ripp.paths": [
    "**/*.ripp.yaml",
    "**/*.ripp.json"
  ]
}
```

## Quick Start

1. Open a workspace containing RIPP packets (or create a new `.ripp.yaml` file)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run **RIPP: Validate Packet(s)** to validate your packets
4. View results in the Output panel (View → Output, select "RIPP")

## File Naming Convention

RIPP packet files must follow the naming convention:
- `*.ripp.yaml` or `*.ripp.yml`
- `*.ripp.json`

Examples:
- `user-registration.ripp.yaml`
- `api-feature.ripp.json`

## Architecture

This extension is a **thin wrapper** around the RIPP CLI. It:
- Discovers RIPP packets using `vscode.workspace.findFiles`
- Executes CLI commands via `child_process.execFile` with security constraints:
  - `shell: false` (no shell injection)
  - Args array only (no command strings)
  - `cwd` set to workspace root
- Never mutates RIPP packet files
- Never executes arbitrary user input

## Security

This extension follows strict security practices:
- No arbitrary code execution
- No file mutation (read-only operations on RIPP packets)
- No secret or environment variable logging
- All CLI commands use safe execution methods

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

### 0.1.0

Initial release:
- Validate command
- Lint command
- Package command
- Analyze command
- Configuration support for CLI mode, strict mode, and file paths
