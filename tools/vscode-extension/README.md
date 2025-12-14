# RIPP Protocol - VS Code Extension

VS Code integration for validating, linting, packaging, and analyzing RIPP packets.

## What This Extension Does

This extension integrates the official RIPP CLI into VS Code. It is a **thin wrapper** around the CLI—no reimplementation of validation or linting logic. All operations are read-only with respect to RIPP packet files, and no data is transmitted externally. Processing happens locally via the RIPP CLI.

## Commands

All commands are available via the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- **RIPP: Validate Packet(s)** - Validate all RIPP packets in your workspace against the schema
- **RIPP: Lint Packet(s)** - Run quality checks and best practice linting on your packets
- **RIPP: Package Handoff** - Package a RIPP packet into a handoff document (Markdown, JSON, or YAML)
- **RIPP: Analyze Project (Draft Packet)** - Generate a draft RIPP packet from existing documentation

## Requirements

This extension requires the RIPP CLI to be available via:

- `npx ripp ...` (default mode), or
- Workspace npm scripts (e.g., `npm run ripp:validate`)

**Note:** The extension does not install dependencies automatically. When using the default `npx` mode, the RIPP CLI will be fetched on first use if not already cached.

## Codespaces & Remote Environments

**Codespaces note:** This extension works in GitHub Codespaces and other VS Code remote environments. Ensure the RIPP CLI is available via `npx ripp` or workspace npm scripts (for example, `npm run ripp:validate`).

## Security Notes

- **Read-only:** The extension does not mutate RIPP packet files (_.ripp.yaml, _.ripp.json)
- **Local processing:** All validation, linting, and analysis happens locally via the RIPP CLI
- **No credentials collected:** No secrets, tokens, or environment variables are collected or stored

## Installation

Install from the VS Code Marketplace:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "RIPP Protocol"
4. Click Install

## Quick Start

1. Open a workspace containing RIPP packets (or create a new `.ripp.yaml` file)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run **RIPP: Validate Packet(s)** to validate your packets
4. View results in the Output panel (View → Output, select "RIPP")

## Configuration

Configure the extension via VS Code settings (File → Preferences → Settings):

### `ripp.cliMode`

How to execute the RIPP CLI:

- `"npx"` (default): Runs `npx ripp` commands
- `"npmScript"`: Uses workspace npm scripts (requires scripts like `ripp:validate`, `ripp:lint`, etc.)

```json
{
  "ripp.cliMode": "npx"
}
```

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

### 0.1.0

Initial release:

- Validate command
- Lint command
- Package command
- Analyze command
- Configuration support for CLI mode, strict mode, and file paths
