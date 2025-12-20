# Change Log

All notable changes to the RIPP Protocol VS Code extension will be documented in this file.

## [0.4.1](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.4.0...v0.4.1) (2025-12-20)


### Documentation

* move marketplace compliance fix to architecture directory ([674a019](https://github.com/Dylan-Natter/ripp-protocol/commit/674a019d90f39abdee811ca33cae73b077cab369))

## [0.4.0](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.3.0...v0.4.0) (2025-12-19)


### Features

* Add Copilot-backed intent discovery and VS Code integration:
  * Copilot-assisted suggestions to help infer RIPP packet intent from existing project files and packets, including candidate values for fields like `purpose`, `data_contracts`, and `ux_flow`
  * Surface intent discovery inside VS Code through new RIPP extension commands and editor-level actions so authors can review and apply suggestions without leaving their workflow


## [0.3.0](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.2.2...v0.3.0) (2025-12-19)


### Features

* Add workspace map service and enhance CLI runner ([bd60a6f](https://github.com/Dylan-Natter/ripp-protocol/commit/bd60a6f5416c41fbd35ff4b7f99f3545ff8ed059))

## [0.2.2] - 2025-12-19

### Changed

- Version bump to 0.2.2

## [0.1.1] - 2025-12-16

### Fixed

- Marketplace compliance: Fixed versioning to comply with VS Code Marketplace requirements
- Build process now uses numeric-only versions (no prerelease identifiers)
- Added automatic changelog generation in build workflow

## [0.1.0] - 2025-12-14

### Initial Release

- **RIPP: Validate Packet(s)** - Validate RIPP packets against the schema
- **RIPP: Lint Packet(s)** - Run quality checks and best practice linting
- **RIPP: Package Handoff** - Package RIPP packets into handoff documents (Markdown, JSON, or YAML)
- **RIPP: Analyze Project (Draft Packet)** - Generate draft RIPP packets from existing documentation
- **RIPP: Initialize Repository** - Set up RIPP structure in your repository
- Configuration support for CLI mode, strict mode, and file path patterns
- Cross-platform support (Windows, macOS, Linux)
- GitHub Codespaces and Remote Container support
- Prefers local `node_modules/.bin/ripp` over `npx` for better performance
