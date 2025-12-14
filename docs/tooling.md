---
layout: default
title: 'Tooling'
---

## RIPP Tooling

Tools and integrations for working with RIPP packets.

---

## Official CLI: ripp-cli

The official RIPP validator CLI validates packets against the JSON Schema and checks structural conventions.

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
- `ripp/features/` - Feature RIPP packets
- `ripp/intent-packages/` - Packaged artifacts for distribution
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
✗ user-registration.ripp.yaml
  - Missing required field: purpose.problem
  - Invalid status value: "pending" (must be draft|approved|implemented|deprecated)
  - Level 2 declared but missing section: permissions

1 of 1 RIPP packets failed validation.
```

---

## GitHub Actions Integration

Automate RIPP validation in your CI/CD pipeline.

### Workflow File

Create `.github/workflows/ripp-validate.yml`:

```yaml
name: Validate RIPP Packets

on:
  pull_request:
    paths:
      - '**.ripp.yaml'
      - '**.ripp.json'
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install RIPP CLI
        run: npm install -g ripp-cli

      - name: Validate RIPP Packets
        run: ripp validate .
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

**JSON Schema IntelliSense:**

Add to `.vscode/settings.json`:

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
