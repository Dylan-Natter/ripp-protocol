# Changelog

All notable changes to the RIPP CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] (2025-12-24)

### Bug Fixes

* **cli:** bundle schema files in npm package to fix validation when installed globally ([ed94409](https://github.com/Dylan-Natter/ripp-protocol/commit/ed94409))
  - Schema files are now included in the npm package under `schema/` directory
  - Updated schema loading paths to use bundled schemas instead of parent directory
  - Fixes post-publish smoke test failures from version 1.2.0

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
