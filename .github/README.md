# GitHub Workflows

This directory contains GitHub Actions workflows for automated checks and validation.

## Workflows

### `ripp-validate.yml`
Validates all RIPP packet files in the repository using the RIPP CLI tool.

- **Triggers**: Pull requests and pushes to main affecting `*.ripp.yaml` or `*.ripp.json` files, or manual trigger
- **Purpose**: Ensures all RIPP packets conform to the v1.0 specification
- **Exit**: Fails if any RIPP packet is invalid

### `code-quality.yml`
Runs linting and code formatting checks on JavaScript files.

- **Triggers**: Pull requests and pushes to main and copilot branches
- **Purpose**: Ensures code quality and consistent formatting
- **Checks**:
  - ESLint for JavaScript code quality
  - Prettier for code formatting

## Running Locally

You can run the same checks locally:

```bash
# Validate RIPP packets
npm test

# Run linting
npm run lint

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix

# Auto-format code
npm run format
```
