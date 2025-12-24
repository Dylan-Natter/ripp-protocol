# Change Log

All notable changes to the RIPP Protocol VS Code extension will be documented in this file.

## [0.5.2](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.5.1...v0.5.2) (2025-12-24)


### Bug Fixes

* **vscode:** improve development workflow and debugging ([141377e](https://github.com/Dylan-Natter/ripp-protocol/commit/141377e9ac2c5c14ca67b088a7ff46ffb754094f))
* **vscode:** improve development workflow and debugging ([668d6ed](https://github.com/Dylan-Natter/ripp-protocol/commit/668d6ed5b1a4fb8ead28be5d7bf2cb5889ffef81))

## [0.5.1](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.5.0...v0.5.1) (2025-12-23)


### Bug Fixes

* **vscode:** improve extension discoverability with enhanced metadata ([23b01ac](https://github.com/Dylan-Natter/ripp-protocol/commit/23b01ace0fc6adf8f98dd57773b3f01ed402dbf7))

## [0.5.0](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.4.2...v0.5.0) (2025-12-23)


### Features

* **cli:** add metrics, doctor, and enhanced workflow commands ([b5c413d](https://github.com/Dylan-Natter/ripp-protocol/commit/b5c413d335088350527e6e9aa8cd6fa1f0debf9f))
* **vscode:** add metrics command and enhanced workflow integration ([24a3cd0](https://github.com/Dylan-Natter/ripp-protocol/commit/24a3cd02f3657958321cc8f04ca55f487853205c))


### Documentation

* upgrade reference implementation to Level 2 ([a4b18e3](https://github.com/Dylan-Natter/ripp-protocol/commit/a4b18e320d95fbb2754d4eb07dafc8da00eef673))

## [0.4.2](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.4.1...v0.4.2) (2025-12-21)


### Documentation

* Split CHANGELOG line and add comprehensive bug fix documentation ([3b3a7e2](https://github.com/Dylan-Natter/ripp-protocol/commit/3b3a7e2b8b407557c33ad950487e51b95f2537bc))
* Update CHANGELOG with bug fix entry ([ca19750](https://github.com/Dylan-Natter/ripp-protocol/commit/ca197501f5bb6838ec76b352eb291c02f496e0c7))

## [Unreleased]

### Fixed

- Fixed stuck status message bug where "RIPP: Building evidence pack..." and other workflow progress notifications never cleared after CLI command completion.
  Progress notifications now clear immediately when the CLI process finishes, before showing user interaction dialogs.

## [0.4.1](https://github.com/Dylan-Natter/ripp-protocol/compare/v0.4.0...v0.4.1) (2025-12-20)


### Documentation

* move marketplace compliance fix to architecture directory ([674a019](https://github.com/Dylan-Natter/ripp-protocol/commit/674a019d90f39abdee811ca33cae73b077cab369))

### Infrastructure

* Migrate to ESLint 9 flat config format (eslint.config.mjs)
* Update dev dependencies:
  * @types/node: 18.19.130 → 25.0.3
  * @typescript-eslint/eslint-plugin: 6.21.0 → 8.50.0
  * @typescript-eslint/parser: 6.21.0 → 8.50.0
  * eslint: 8.57.1 → 9.39.2
  * Added globals: 16.5.0 for ESLint configuration
* Remove legacy .eslintrc.json file
* Fix npm dependency tree errors

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
