# RIPP CLI

Official command-line tool for working with Regenerative Intent Prompting Protocol (RIPP) packets.

## Installation

### Global Install (Recommended)

```bash
npm install -g ripp-cli
```

### From Source

```bash
git clone https://github.com/Dylan-Natter/ripp-protocol.git
cd ripp-protocol/tools/ripp-cli
npm install
npm link
```

## Commands

### Validate

Validate RIPP packets against the JSON Schema.

```bash
# Validate a single file
ripp validate my-feature.ripp.yaml

# Validate a directory
ripp validate features/

# Enforce minimum RIPP level
ripp validate api/ --min-level 2

# Suppress warnings
ripp validate . --quiet
```

**Options:**

- `--min-level <1|2|3>` - Enforce minimum conformance level
- `--quiet` - Suppress warnings

### Lint

Check RIPP packets for best practices beyond schema validation.

```bash
# Lint files in a directory
ripp lint examples/

# Treat warnings as errors
ripp lint examples/ --strict

# Custom output directory
ripp lint specs/ --output ./build/reports/
```

**Options:**

- `--strict` - Treat warnings as errors (fail on warnings)
- `--output <dir>` - Output directory for reports (default: `reports/`)

**Output:**

- `reports/lint.json` - Machine-readable report
- `reports/lint.md` - Human-readable Markdown report

**Lint Rules:**

- Missing critical sections (out_of_scope, assumptions, security NFRs)
- Undefined ID references in schema_ref
- Placeholder text (TODO, TBD, example.com)
- Missing or vague verification steps

### Package

Package a RIPP packet into a normalized handoff artifact.

```bash
# Package to Markdown (handoff doc)
ripp package --in feature.ripp.yaml --out handoff.md

# Package to JSON
ripp package --in feature.ripp.yaml --out packaged.json

# Package to YAML
ripp package --in feature.ripp.yaml --out normalized.yaml

# Explicit format specification
ripp package --in feature.ripp.yaml --out artifact --format json
```

**Options:**

- `--in <file>` - Input RIPP packet file (required)
- `--out <file>` - Output file path (required)
- `--format <json|yaml|md>` - Output format (auto-detected from extension)

**Features:**

- Validates input before packaging
- Normalizes packet structure
- Removes empty optional fields
- Adds packaging metadata
- Read-only (never modifies source)

### Analyze

Generate a DRAFT RIPP packet from existing code or schemas.

```bash
# Analyze OpenAPI specification
ripp analyze openapi.json --output draft-api.ripp.yaml

# Analyze JSON Schema
ripp analyze schema.json --output draft.ripp.yaml --packet-id my-feature
```

**Options:**

- `<input>` - Input file (OpenAPI spec or JSON Schema)
- `--output <file>` - Output DRAFT RIPP packet file (required)
- `--packet-id <id>` - Packet ID for generated RIPP (default: `analyzed`)

**⚠️ Important:**

- Generated packets are always **DRAFT** (status: 'draft')
- Output contains TODO markers requiring human review
- Extracts only observable facts from code/schemas
- **Never guesses** intent, business logic, or failure modes
- **Requires human review** before use

**Supported Inputs:**

- OpenAPI 3.0 specifications
- Swagger 2.0 specifications
- JSON Schema

## Exit Codes

- `0` - All checks passed
- `1` - Validation or lint failures found

## What It Validates

✓ **Schema Conformance**: Validates against JSON Schema  
✓ **Required Sections**: Ensures all required sections for declared level are present  
✓ **File Naming**: Checks `.ripp.yaml` or `.ripp.json` extension  
✓ **Data Integrity**: Validates packet_id format, date formats, status values  
✓ **Level Conformance**: Ensures Level 2/3 sections are present when declared

## Example Output

**Validation Success:**

```
✓ item-creation.ripp.yaml is valid (Level 3)
✓ webhook-feature.ripp.yaml is valid (Level 2)

✓ All 2 RIPP packets are valid.
```

**Validation Failure:**

```
✗ user-registration.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values
  • Packet is Level 2, but missing section: permissions

✗ 1 of 1 RIPP packets failed validation.
```

**Linting:**

```
Linting RIPP packets...
✗ draft-api.ripp.yaml - 2 error(s), 5 warning(s)
✓ feature.ripp.yaml - No issues

📄 JSON report: reports/lint.json
📄 Markdown report: reports/lint.md

✗ Found 2 error(s) and 5 warning(s)
```

## CI Integration

### GitHub Actions

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'

- name: Install RIPP CLI
  run: npm install -g ripp-cli

- name: Validate RIPP Packets
  run: ripp validate .

- name: Lint RIPP Packets (strict)
  run: ripp lint specs/ --strict
```

### GitLab CI

```yaml
validate-ripp:
  image: node:18
  script:
    - npm install -g ripp-cli
    - ripp validate .
    - ripp lint specs/ --strict
```

## Development

### Install Dependencies

```bash
npm install
```

### Test Locally

```bash
./index.js validate ../../examples/
./index.js lint ../../examples/
./index.js package --in ../../examples/item-creation.ripp.yaml --out /tmp/test.md
```

### Link for Development

```bash
npm link
ripp validate ../../examples/
```

## Dependencies

- **ajv**: JSON Schema validator
- **ajv-formats**: Format validators for ajv
- **js-yaml**: YAML parser
- **glob**: File pattern matching

## License

MIT

## Links

- **Documentation**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **Repository**: [https://github.com/Dylan-Natter/ripp-protocol](https://github.com/Dylan-Natter/ripp-protocol)
- **Issues**: [https://github.com/Dylan-Natter/ripp-protocol/issues](https://github.com/Dylan-Natter/ripp-protocol/issues)
