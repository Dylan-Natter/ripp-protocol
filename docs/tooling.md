---
layout: default
title: 'Tooling'
---

## RIPP Tooling

Tools and integrations for working with RIPP packets.

---

## Official CLI: ripp-cli

The official RIPP validator CLI validates packets against the JSON Schema and checks structural conventions.

> **Note**: As of v1.2.1, the CLI bundles schema files internally for reliable global installation. No external schema dependencies required.

### Installation

**Via npm (recommended):**

```bash
npm install -g ripp-cli
```

**As a dev dependency in your project:**

```bash
npm install -D ripp-cli
```

**From source:**

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/tools/ripp-cli
npm install
npm link
```

### Usage

**Initialize RIPP in your repository:**

```bash
# Create scaffolding for RIPP
ripp init

# Force overwrite existing files
ripp init --force
```

This creates:

- `ripp/` - Main directory for RIPP artifacts
- `ripp/README.md` - Documentation about RIPP
- `ripp/features/` - Work-in-progress RIPP packets
- `ripp/handoffs/` - Validated, ready-to-deliver RIPP packets
- `ripp/packages/` - Generated output formats (gitignored)
- `ripp/.gitignore` - Excludes generated packages
- `.github/workflows/ripp-validate.yml` - GitHub Action for CI/CD

The `init` command is:

- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Non-destructive** - Preserves existing files by default
- ✅ **Complete** - Sets up everything you need in one command

**Validate a single file:**

```bash
ripp validate my-feature.ripp.yaml
```

**Validate a directory:**

```bash
ripp validate features/
```

**Validate with minimum level enforcement:**

```bash
ripp validate --min-level 2 api/
```

**Validate with verbose output:**

```bash
ripp validate features/ --verbose
```

When validating 4 or more files, the validator shows a summary table by default. Use `--verbose` to see detailed error messages for each file.

**Exit codes:**

- `0`: All packets valid
- `1`: Validation failures found

### What the Validator Checks

✓ **Schema Conformance**: Validates against JSON Schema  
✓ **Required Sections**: Ensures all required sections for declared level are present  
✓ **File Naming**: Checks `.ripp.yaml` or `.ripp.json` extension  
✓ **Data Integrity**: Validates packet_id format, date formats, status values  
✓ **Level Conformance**: Ensures Level 2/3 sections are present when declared

### Example Output

**Success:**

```
✓ item-creation.ripp.yaml is valid (Level 3)
✓ webhook-feature.ripp.yaml is valid (Level 2)

All 2 RIPP packets are valid.
```

**Failure:**

```
✗ user-registration.ripp.yaml (Level 2)
  • Level 2 requires 'api_contracts' (missing)
  • Level 2 requires 'permissions' (missing)

  💡 Tip: Use level: 1 for basic contracts, or add missing sections for Level 2
  📖 Docs: https://dylan-natter.github.io/ripp-protocol/ripp-levels.html

1 of 1 RIPP packets failed validation.
```

**Bulk validation with summary table:**

```
┌──────────────────────────────────────────┬───────┬────────┬────────┐
│ File                                     │ Level │ Status │ Issues │
├──────────────────────────────────────────┼───────┼────────┼────────┤
│ sample.ripp.yaml                         │ 1     │ ✓      │ 0      │
│ ui-components.ripp.yaml                  │ 2     │ ✗      │ 12     │
│ features.ripp.yaml                       │ 2     │ ✗      │ 4      │
└──────────────────────────────────────────┴───────┴────────┴────────┘

✗ 2 of 3 failed. Run with --verbose for details.
```

---

## Linting RIPP Packets

The linter checks for best practices and common issues that aren't caught by schema validation.

### Basic Usage

```bash
# Lint all packets in a directory
ripp lint ripp/features/

# Strict mode - treat warnings as errors
ripp lint ripp/features/ --strict

# Custom output directory
ripp lint ripp/features/ --output custom-reports/
```

### Reports

The linter generates two types of reports:

- `reports/lint.json` - Machine-readable JSON format
- `reports/lint.md` - Human-readable Markdown format

**Example output:**

```
✗ features.ripp.yaml - 1 error(s), 2 warning(s)

✗ Found 1 error(s) and 2 warning(s)

📊 Reports generated:
  • reports/lint.json (machine-readable)
  • reports/lint.md (human-readable)

View: cat reports/lint.md
```

### What the Linter Checks

- Missing critical optional sections (e.g., `purpose.out_of_scope`, `purpose.assumptions`)
- Placeholder text (TODO, TBD, FIXME)
- Undefined schema references
- Vague verification steps in acceptance tests
- Security NFRs for Level 2+ packets

---

## Analyzing Existing Code

Generate DRAFT RIPP packets from existing code or schemas.

### Supported Formats

- OpenAPI/Swagger specifications (.json, .yaml)
- JSON Schema (.json)

### Basic Usage

```bash
# Generate Level 1 packet (default)
ripp analyze openapi.json --output draft-api.ripp.yaml

# Generate Level 2 packet
ripp analyze openapi.json --output draft-api.ripp.yaml --target-level 2

# Custom packet ID
ripp analyze schema.json --output draft.ripp.yaml --packet-id my-api
```

### Understanding the Output

**Important:** Generated packets are DRAFTS that require human review:

- Status is always set to `draft`
- Contains TODO placeholders for human input
- Level 1 by default (simpler, fewer required fields)
- Extracts only observable facts from code/schemas
- Does NOT invent intent or business logic

**Example output:**

```
Analyzing input...
⚠ Generated packets are DRAFTS and require human review

✓ DRAFT packet generated: draft-api.ripp.yaml
  Status: draft (requires human review)
  Level: 1

⚠ IMPORTANT:
  This is a DRAFT generated from observable code/schema facts.
  Review and refine all TODO items before use.
  Pay special attention to:
    - Purpose (problem, solution, value)
    - UX Flow (user-facing steps)
```

### Workflow

1. **Analyze** existing code to generate a draft
2. **Review** and fill in TODO items with actual intent
3. **Validate** the refined packet
4. **Move** to `ripp/handoffs/` when ready

---

## Packaging RIPP Packets

Package RIPP packets into normalized artifacts for distribution.

### Basic Usage

```bash
# Package to Markdown (default)
ripp package --in feature.ripp.yaml --out handoff.md

# Package to JSON
ripp package --in feature.ripp.yaml --out packaged.json --format json

# Package to YAML
ripp package --in feature.ripp.yaml --out packaged.yaml --format yaml
```

The packager:

- Validates the packet before packaging (configurable)
- Normalizes the structure
- Adds packaging metadata with versioning information
- Generates clean, distribution-ready output
- Automatically versions output files to prevent overwrites

### Versioning Features

Prevent accidental overwrites with automatic versioning:

```bash
# First run - creates handoff.md
ripp package --in feature.ripp.yaml --out handoff.md

# Second run - detects existing file, creates handoff-v2.md
ripp package --in feature.ripp.yaml --out handoff.md
# ℹ Output file exists. Versioning applied: handoff-v2.md

# Explicit semantic versioning
ripp package --in feature.ripp.yaml --out handoff.md --package-version 1.0.0
# Creates: handoff-v1.0.0.md

# Force overwrite without versioning (useful in CI/CD)
ripp package --in feature.ripp.yaml --out handoff.md --force
# Overwrites: handoff.md
```

**Benefits:**

- Maintains history of handoff packages
- Clear audit trail of deliveries
- Easy rollback to previous versions
- Safe by default (prevents accidental data loss)

### Validation Control

Control validation behavior during packaging:

```bash
# Skip validation entirely (useful for WIP drafts)
ripp package --in draft.ripp.yaml --out draft.md --skip-validation

# Validate but package anyway on errors (show warnings)
ripp package --in wip.ripp.yaml --out wip.md --warn-on-invalid
# ⚠ Warning: Input packet has validation errors
# ✓ Packaged successfully: wip.md

# Default: validation failures block packaging
ripp package --in feature.ripp.yaml --out handoff.md
# ✗ Validation failed. Package was NOT created.
# 💡 Tip: Use --warn-on-invalid to package anyway, or --skip-validation to skip validation
```

**Use cases for flexible validation:**

- Delivering WIP handoffs for review/feedback
- Partial implementations (Level 1 → Level 2 transition)
- Documentation-only packages
- Archiving historical snapshots

### Enhanced Metadata

Packaged files include comprehensive metadata for traceability:

```json
{
  "_meta": {
    "packaged_at": "2025-12-15T21:00:00.000Z",
    "packaged_by": "ripp-cli",
    "ripp_cli_version": "1.0.0",
    "ripp_version": "1.0",
    "source_level": 2,
    "package_version": "1.0.0",
    "git_commit": "e0a127f",
    "git_branch": "main",
    "source_files": ["feature.ripp.yaml"],
    "validation_status": "valid"
  }
}
```

**Metadata fields:**

- `packaged_at` - ISO 8601 timestamp
- `ripp_cli_version` - CLI version used for packaging
- `package_version` - Explicit version (when `--package-version` used)
- `git_commit` - Git commit hash (when in git repository)
- `git_branch` - Git branch name (when in git repository)
- `source_files` - Array of source file names
- `validation_status` - `valid`, `invalid`, or `unvalidated`
- `validation_errors` - Count of errors (when status is `invalid`)

---

## GitHub Actions Integration

Automate RIPP validation in your CI/CD pipeline.

### Workflow File

The `ripp init` command automatically generates `.github/workflows/ripp-validate.yml` with the recommended configuration:

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - 'ripp/**/*.ripp.yaml'
      - 'ripp/**/*.ripp.json'
  workflow_dispatch:

jobs:
  validate:
    name: Validate RIPP Packets
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Validate RIPP packets
        run: npm run ripp:validate

      - name: Summary
        if: always()
        run: echo "✅ RIPP validation complete"
```

**Note:** This workflow uses `npm ci` and `npm run ripp:validate` to work with the submodule + `file:` dependency pattern. Add this script to your `package.json`:

```json
{
  "scripts": {
    "ripp:validate": "ripp validate ripp/features/"
  }
}
```

### Enforce Minimum Levels

```yaml
- name: Validate API Packets (Level 2+)
  run: ripp validate --min-level 2 src/api/

- name: Validate Auth Packets (Level 3)
  run: ripp validate --min-level 3 src/auth/
```

---

## Pre-Commit Hook

Validate RIPP packets before committing.

### Using Git Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Find changed RIPP files
RIPP_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ripp\.\(yaml\|json\)$')

if [ -n "$RIPP_FILES" ]; then
  echo "Validating RIPP packets..."
  ripp validate $RIPP_FILES
  if [ $? -ne 0 ]; then
    echo "RIPP validation failed. Fix errors before committing."
    exit 1
  fi
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

### Using pre-commit Framework

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: ripp-validate
        name: Validate RIPP Packets
        entry: ripp validate
        language: system
        files: \\.ripp\\.(yaml|json)$
```

---

## Editor Integration

### VS Code

#### RIPP VS Code Extension (Recommended)

The official RIPP VS Code extension provides a complete UI-driven workflow for managing RIPP packets.

**Features:**

- **Activity Bar Integration**: Dedicated RIPP sidebar with status, validation results, and quick actions
- **Problems Panel**: Validation errors appear as native VS Code diagnostics with click-to-navigate
- **Validation Report Viewer**: Webview panel with detailed results and export options (JSON/Markdown)
- **GitHub CI Integration**: One-click access to GitHub Actions workflows
- **Initialize RIPP**: Safe repository initialization with file preview and confirmation
- **Workspace Trust**: Respects VS Code security model - no CLI execution in untrusted workspaces

**Installation:**

Search for "RIPP Protocol" in the VS Code Extensions Marketplace, or install from VSIX.

**Documentation:**

- [User Guide](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/docs/UI-FEATURES.md) - How to use all UI features
- [Implementation Details](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/docs/IMPLEMENTATION.md) - Architecture and design
- [Visual Mockups](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/docs/UI-MOCKUP.md) - UI element reference

**Quick Start:**

1. Install the extension
2. Open a workspace with RIPP packets (or create one)
3. Click the RIPP icon in the Activity Bar
4. Use sidebar actions to initialize, validate, and manage packets

**Versioning and Releases:**

The VS Code extension uses semantic versioning (e.g., `0.1.0`, `0.2.0`) defined in `package.json`. Each VSIX build includes the version number in its filename (e.g., `ripp-protocol-0.1.0.vsix`).

The VS Code Marketplace requires numeric-only versions (1-4 dot-separated integers, no suffixes). The CI workflow automatically increments the patch version on each push to `main`:

- **Automatic patch increments**: `0.1.0` → `0.1.1` → `0.1.2` (on push to `main`)
- **Manual version bumps**: Edit `package.json` for minor/major releases (e.g., `0.2.0` or `1.0.0`)
- **CI commits back**: Version bump commits include `[skip ci]` to prevent loops
- **Safety features**: Concurrency control, git pull with rebase, force-with-lease pushes

For complete build and release instructions, see [BUILD.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/BUILD.md), [VERSIONING.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/VERSIONING.md), and [RELEASE-CHECKLIST.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/tools/vscode-extension/RELEASE-CHECKLIST.md) in the extension directory.

The repository includes a CI/CD workflow (`.github/workflows/vscode-extension-build.yml`) that automatically increments versions and builds VSIX packages on every push to `main`. Build artifacts are available in the GitHub Actions workflow runs.

#### JSON Schema IntelliSense (Alternative)

For basic schema validation without the extension, add to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json": ["**/*.ripp.yaml"]
  },
  "json.schemas": [
    {
      "fileMatch": ["*.ripp.json"],
      "url": "https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json"
    }
  ]
}
```

**YAML Extension:**

Install [YAML extension by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) for validation and autocomplete.

### JetBrains IDEs (IntelliJ, WebStorm, etc.)

1. Go to **Settings** → **Languages & Frameworks** → **Schemas and DTDs** → **JSON Schema Mappings**
2. Add new mapping:
   - **Schema file or URL**: `https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json`
   - **Schema version**: JSON Schema version 7
   - **File path pattern**: `*.ripp.yaml` or `*.ripp.json`

---

## Schema Validation Libraries

Use RIPP schema with standard JSON Schema validators:

### Node.js (Ajv)

```javascript
const Ajv = require('ajv');
const yaml = require('js-yaml');
const fs = require('fs');

const ajv = new Ajv();
const schema = require('./schema/ripp-1.0.schema.json');
const validate = ajv.compile(schema);

const packet = yaml.load(fs.readFileSync('my-feature.ripp.yaml', 'utf8'));
const valid = validate(packet);

if (!valid) {
  console.error(validate.errors);
}
```

### Python (jsonschema)

```python
import json
import yaml
from jsonschema import validate

with open('schema/ripp-1.0.schema.json') as f:
    schema = json.load(f)

with open('my-feature.ripp.yaml') as f:
    packet = yaml.safe_load(f)

validate(instance=packet, schema=schema)
```

### Go (gojsonschema)

```go
package main

import (
    "github.com/xeipuuv/gojsonschema"
    "gopkg.in/yaml.v3"
    "io/ioutil"
)

func main() {
    schemaLoader := gojsonschema.NewReferenceLoader("file://./schema/ripp-1.0.schema.json")

    data, _ := ioutil.ReadFile("my-feature.ripp.yaml")
    var packet map[string]interface{}
    yaml.Unmarshal(data, &packet)

    documentLoader := gojsonschema.NewGoLoader(packet)
    result, _ := gojsonschema.Validate(schemaLoader, documentLoader)

    if !result.Valid() {
        for _, err := range result.Errors() {
            println(err.String())
        }
    }
}
```

---

## Community Tools

### RIPP Extractor (Conceptual)

Generate draft RIPP packets from existing prototype code and requirements.

**Status**: Documented as a concept, not yet fully implemented.

**Conceptual usage**:

```bash
# Extract RIPP from prototype code and requirements
ripp extract --code ./src --input ./README.md --output feature.ripp.yaml

# Review generated draft
cat feature.ripp.yaml

# Validate the draft
ripp validate feature.ripp.yaml
```

**What it would generate**:

- Draft RIPP packet with all extractable sections
- Evidence map showing which code files support each section
- Confidence ratings (high/medium/low/unknown) per section
- Open questions flagging conflicts and gaps

**Learn more**: See [From Prototype to Production]({{ '/prototype-to-production' | relative_url }}) for the complete prototype extraction workflow.

### RIPP Packet Generator (Planned)

Generate RIPP packet templates from OpenAPI specs.

### RIPP to Markdown Converter (Planned)

Convert RIPP packets to human-readable Markdown documentation.

### RIPP Diff Tool (Planned)

Show semantic differences between RIPP packet versions.

---

## Build Your Own Tools

RIPP is an open standard. You can build tools on top of it:

**Ideas:**

- Code generators (scaffolding from RIPP packets)
- Test generators (from acceptance_tests section)
- Documentation generators (from RIPP to HTML/PDF)
- Linters (custom organizational rules)
- Dashboards (visualize RIPP packet status across repos)

**Start here:**

- Use the [JSON Schema](https://github.com/Dylan-Natter/ripp-protocol/blob/main/schema/ripp-1.0.schema.json)
- Parse YAML/JSON packets
- Validate with standard libraries
- Build your features on top

---

## API Reference

### CLI Commands

```
ripp validate <path>         Validate RIPP packets
  --min-level <1|2|3>        Enforce minimum conformance level
  --format <text|json>       Output format (default: text)
  --strict                   Fail on warnings, not just errors
  --help                     Show help
  --version                  Show version
```

---

## Troubleshooting

### Validation Fails But File Looks Correct

- Check YAML indentation (use spaces, not tabs)
- Ensure all required fields are present
- Verify field types match schema (string vs number)
- Check for typos in enum values (status, severity, etc.)

### Schema Not Found in Editor

- Ensure you have internet access (schema is hosted on GitHub Pages)
- Check the schema URL is correct
- Try reloading the editor/IDE

### CLI Not Found After Install

- Ensure npm global bin directory is in your PATH
- Try `npx ripp validate` instead
- Check installation: `npm list -g ripp-cli`

---

## Contributing to Tooling

Want to improve the CLI or add new tools?

1. Fork the [ripp-protocol repository](https://github.com/Dylan-Natter/ripp-protocol)
2. Make your changes in `tools/ripp-cli/`
3. Add tests
4. Submit a pull request

See [CONTRIBUTING.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/CONTRIBUTING.md).

---

**Automate validation. Enforce standards. Ship with confidence.**
