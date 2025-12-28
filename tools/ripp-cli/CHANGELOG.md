# Changelog

All notable changes to the RIPP CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0](https://github.com/Dylan-Natter/ripp-protocol/compare/ripp-cli-v1.2.1...ripp-cli-v1.3.0) (2025-12-27)


### Features

* **ai:** add GitHub Copilot auto-detection and Models API support ([74ea285](https://github.com/Dylan-Natter/ripp-protocol/commit/74ea285256f99da099072191b11e9fb1eb27a486))


### Bug Fixes

* **cli:** load schema before validation in go command ([61c5c3e](https://github.com/Dylan-Natter/ripp-protocol/commit/61c5c3e5bba4f7ed8c8beeff348efda304ae8120))
* sync ripp-cli package-lock.json version to 1.2.1 ([e9f2f6c](https://github.com/Dylan-Natter/ripp-protocol/commit/e9f2f6ceac9be5e027a7f6d1073b7888f88edddb))

## [1.2.1] (2025-12-24)

### Bug Fixes

* **cli:** bundle schema files in npm package to fix validation when installed globally ([ed94409](https://github.com/Dylan-Natter/ripp-protocol/commit/ed94409))
  - Schema files are now included in the npm package under `schema/` directory
  - Updated schema loading paths to use bundled schemas instead of parent directory
  - Fixes post-publish smoke test failures from version 1.2.0
* **cli:** fix checklist generation and parsing bugs in `ripp confirm` command
  - Fixed extraction of content fields (purpose, ux_flow, data_contracts, etc.) from candidates
  - Use 'purpose' or 'full-packet' as section name instead of 'unknown'
  - Add 'full-packet' to valid section types in checklist parser
  - Fixes empty YAML blocks in generated checklists
  - Fixes 'Unknown section type' error when building from checklist

## [1.2.0](https://github.com/Dylan-Natter/ripp-protocol/compare/ripp-cli-v1.1.0...ripp-cli-v1.2.0) (2025-12-23)


### Features

* **cli:** enhance CLI description to include tooling capabilities ([8f97965](https://github.com/Dylan-Natter/ripp-protocol/commit/8f97965379bbb24287b8d69bb9d4e5af16bca1df))

## [1.1.0](https://github.com/Dylan-Natter/ripp-protocol/compare/ripp-cli-v1.0.1...ripp-cli-v1.1.0) (2025-12-23)


### Features

* **cli:** add metrics, doctor, and enhanced workflow commands ([b5c413d](https://github.com/Dylan-Natter/ripp-protocol/commit/b5c413d335088350527e6e9aa8cd6fa1f0debf9f))
* **vscode:** add metrics command and enhanced workflow integration ([24a3cd0](https://github.com/Dylan-Natter/ripp-protocol/commit/24a3cd02f3657958321cc8f04ca55f487853205c))


### Documentation

* upgrade reference implementation to Level 2 ([a4b18e3](https://github.com/Dylan-Natter/ripp-protocol/commit/a4b18e320d95fbb2754d4eb07dafc8da00eef673))

## [1.0.1] - 2025-12-22

### Changed

- Version bump to enable npm publishing of updates

### Fixed

- Synchronized package-lock.json Node.js engine requirement (>=20.0.0) with package.json

## [1.0.0] - Initial Release

### Features

- RIPP packet validation against JSON schema
- Support for YAML and JSON input formats
- Multi-file validation with glob patterns
- Linting with severity levels (error, warning, info)
- Strict mode for enhanced validation
- Evidence package generation for handoffs
- Portable binary distributions for macOS (ARM64 and x64)
