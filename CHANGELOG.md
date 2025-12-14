# Changelog

All notable changes to the Regenerative Intent Prompting Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ESLint configuration for JavaScript code quality
- Prettier configuration for code formatting
- EditorConfig for consistent cross-editor formatting
- `.npmrc` for reproducible npm builds
- Code Quality GitHub Actions workflow for automated linting and formatting checks
- `SUPPORT.md` with community support guidelines
- `AUTHORS.md` to acknowledge contributors
- `CITATION.cff` for research citation support
- `.github/README.md` documenting GitHub workflows
- npm scripts: `lint`, `lint:fix`, `format`, `format:check`

### Changed

- Enhanced `CONTRIBUTING.md` with code quality and formatting guidelines
- Updated `package.json` with proper metadata, repository URLs, and devDependencies
- Fixed `package.json` license from ISC to MIT (matching LICENSE file)
- Updated root `package.json` test script to use RIPP CLI validator

### Fixed

- Removed conflicting `package-lock.json` entry from `.gitignore`
- Fixed ESLint quote-style violations in CLI tool
- Consolidated duplicate GitHub Actions workflows (removed `validate-ripp-packets.yml`)

## [1.0.0] - 2025-12-13

### Added

- Initial release of RIPP v1.0 specification
- Core specification document (SPEC.md) defining all required sections
- JSON Schema for RIPP v1.0 packets (ripp-1.0.schema.json)
- Three example RIPP packets demonstrating real-world use cases
- Feature packet template for quick starts
- RIPP checklist template for definition-of-done workflows
- CLI validator tool for RIPP packet validation
- Complete documentation site powered by Jekyll and GitHub Pages
- GitHub Actions workflow for automated RIPP validation
- Issue templates for bug reports, feature requests, and spec changes
- Pull request template for consistent contributions
- Comprehensive governance and contribution guidelines
- MIT License

### Documentation

- Getting Started guide
- RIPP Levels (0–3) explanation
- FAQ covering common questions
- Glossary of RIPP terminology
- Press kit with boilerplate and messaging
- Adoption guide for teams and organizations

### Protocol Status

**v1.0 Stable** - The RIPP v1.0 specification is stable and ready for production use.

[1.0.0]: https://github.com/Dylan-Natter/ripp-protocol/releases/tag/v1.0.0
