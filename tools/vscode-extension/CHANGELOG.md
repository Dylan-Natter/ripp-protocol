# Change Log

All notable changes to the RIPP Protocol VS Code extension will be documented in this file.

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
