# CLI Reference

Complete reference for the RIPP CLI (`ripp-cli`).

## Installation

### As Dev Dependency (Recommended)

```bash
npm install -D ripp-cli
```

### Global Install

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

---

## Command Overview

| Command | Purpose | Read-Only? |
|---------|---------|-----------|
| `ripp init` | Initialize RIPP in your repository | ❌ Creates files |
| `ripp validate` | Validate RIPP packets against schema | ✅ Yes |
| `ripp lint` | Check best practices | ✅ Yes |
| `ripp package` | Package RIPP packet into handoff artifact | ✅ Yes (creates new file) |
| `ripp analyze` | Generate DRAFT packet from code/schemas | ✅ Yes (creates new file) |

---

## `ripp init`

Initialize RIPP structure in your repository.

### Purpose

Sets up the recommended directory structure and GitHub Actions workflow for RIPP.

### What It Does

Creates:
- `ripp/` — Main directory for RIPP artifacts
- `ripp/features/` — Directory for feature RIPP packets
- `ripp/intent-packages/` — Directory for packaged artifacts
- `ripp/README.md` — Documentation about RIPP in your repo
- `ripp/intent-packages/README.md` — Intent package documentation
- `.github/workflows/ripp-validate.yml` — GitHub Action for validation

### What It Writes

| File | Content | Overwrite Behavior |
|------|---------|-------------------|
| `ripp/` | Empty directory | Always created if missing |
| `ripp/features/` | Empty directory | Always created if missing |
| `ripp/intent-packages/` | Empty directory | Always created if missing |
| `ripp/README.md` | Documentation template | **Skipped** if exists (unless `--force`) |
| `ripp/intent-packages/README.md` | Documentation template | **Skipped** if exists (unless `--force`) |
| `.github/workflows/ripp-validate.yml` | GitHub Action YAML | **Skipped** if exists (unless `--force`) |

### When to Run It

- ✅ When adopting RIPP in a new or existing repository
- ✅ To regenerate default files (with `--force`)
- ❌ Not needed if you already have RIPP structure set up

### Usage

```bash
# Initialize with default behavior (skip existing files)
ripp init

# Force overwrite existing files
ripp init --force
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--force` | Overwrite existing files | `false` |

### Example Output

```
Initializing RIPP in your repository...

✓ Created ripp/
✓ Created ripp/features/
✓ Created ripp/intent-packages/
✓ Created ripp/README.md
✓ Created ripp/intent-packages/README.md
✓ Created .github/workflows/ripp-validate.yml

RIPP initialization complete!

Next steps:
1. Create your first RIPP packet in ripp/features/
2. Run 'ripp validate ripp/features/' to validate
3. Commit and push to enable CI/CD validation
```

### Exit Codes

- `0` — Initialization successful
- `1` — Error occurred (e.g., file write failure)

---

## `ripp validate`

Validate RIPP packets against the JSON Schema.

### Purpose

Ensures RIPP packets conform to the specification and include all required sections for their declared level.

### What It Checks

- ✅ **Schema conformance** — Validates against JSON Schema
- ✅ **Required sections** — Ensures all required sections for declared level are present
- ✅ **File naming** — Checks `.ripp.yaml` or `.ripp.json` extension
- ✅ **Data integrity** — Validates `packet_id` format, date formats, status values
- ✅ **Level conformance** — Ensures Level 2/3 sections are present when declared

### What It Never Does

- ❌ Modifies source RIPP packet files
- ❌ Auto-fixes validation errors
- ❌ Generates code or creates files
- ❌ Commits changes to git

### Usage

```bash
# Validate a single file
ripp validate my-feature.ripp.yaml

# Validate all files in a directory
ripp validate ripp/features/

# Validate current directory
ripp validate .

# Enforce minimum RIPP level
ripp validate . --min-level 2

# Suppress warnings (errors only)
ripp validate . --quiet
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--min-level <1\|2\|3>` | Enforce minimum conformance level | None |
| `--quiet` | Suppress warnings | `false` |

### Example Output (Success)

```
✓ item-creation.ripp.yaml is valid (Level 3)
✓ webhook-feature.ripp.yaml is valid (Level 2)
✓ user-auth.ripp.yaml is valid (Level 1)

✓ All 3 RIPP packets are valid.
```

### Example Output (Failure)

```
✗ user-registration.ripp.yaml
  • /purpose: must have required property 'problem'
  • /status: must be equal to one of the allowed values
  • Packet is Level 2, but missing section: permissions

✗ payment-processing.ripp.yaml
  • /data_contracts/inputs/0/fields/2: must have required property 'description'

✗ 2 of 3 RIPP packets failed validation.
```

### Exit Codes

- `0` — All packets valid
- `1` — Validation failures found

### CI Usage

Recommended for GitHub Actions, GitLab CI, etc.:

```yaml
- name: Validate RIPP Packets
  run: ripp validate .
```

If validation fails, the CI build fails.

---

## `ripp lint`

Check RIPP packets for best practices beyond schema validation.

### Purpose

Identifies issues that are syntactically valid but violate best practices.

### What It Checks

- ⚠️ Missing critical sections (`out_of_scope`, `assumptions`, security NFRs)
- ⚠️ Undefined ID references in `schema_ref`
- ⚠️ Placeholder text (TODO, TBD, `example.com`)
- ⚠️ Missing or vague verification steps in acceptance tests
- ⚠️ Short or uninformative descriptions

### What It Never Does

- ❌ Modifies source RIPP packet files
- ❌ Auto-fixes lint warnings
- ❌ Fails builds (unless `--strict` is used)

### Usage

```bash
# Lint files in a directory
ripp lint ripp/features/

# Treat warnings as errors (fail on warnings)
ripp lint ripp/features/ --strict

# Custom output directory
ripp lint ripp/features/ --output ./build/reports/
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--strict` | Treat warnings as errors (fail on warnings) | `false` |
| `--output <dir>` | Output directory for reports | `reports/` |

### Output Files

| File | Format | Purpose |
|------|--------|---------|
| `reports/lint.json` | JSON | Machine-readable report |
| `reports/lint.md` | Markdown | Human-readable report |

### Example Output

```
Linting RIPP packets...

✗ draft-api.ripp.yaml - 2 error(s), 5 warning(s)
  Errors:
    • purpose.out_of_scope is missing (recommended for clarity)
    • acceptance_tests[0].verification is too vague
  Warnings:
    • Contains placeholder text: "TODO"
    • api_contracts[0].response.errors has only 1 error case (recommend at least 2)
    • nfrs.security.encryption_at_rest not specified
    • Short description in data_contracts.inputs[0].fields[1]
    • No assumptions documented

✓ feature.ripp.yaml - No issues
✓ item-creation.ripp.yaml - No issues

📄 JSON report: reports/lint.json
📄 Markdown report: reports/lint.md

✗ Found 2 error(s) and 5 warning(s)
```

### Lint Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `missing-out-of-scope` | Warning | `purpose.out_of_scope` not defined |
| `missing-assumptions` | Warning | `purpose.assumptions` not defined |
| `placeholder-text` | Error | Contains TODO, TBD, or placeholder URLs |
| `undefined-schema-ref` | Error | `schema_ref` references non-existent entity |
| `vague-verification` | Error | Acceptance test verification is too generic |
| `missing-security-nfr` | Warning | Level 3 packet missing `nfrs.security` |
| `short-description` | Warning | Description field is less than 10 characters |

### Exit Codes

- `0` — No errors (warnings allowed unless `--strict`)
- `1` — Errors found, or warnings found with `--strict`

### CI Usage

```yaml
- name: Lint RIPP Packets (strict)
  run: ripp lint ripp/features/ --strict
```

---

## `ripp package`

Package a RIPP packet into a normalized handoff artifact.

### Purpose

Creates a standalone, normalized version of a RIPP packet for handoff to production teams or external stakeholders.

### What It Does

- ✅ Validates input before packaging
- ✅ Normalizes packet structure
- ✅ Removes empty optional fields
- ✅ Adds packaging metadata (timestamp, tool version)
- ✅ Outputs in Markdown, JSON, or YAML format

### What It Never Does

- ❌ Modifies the source RIPP packet file (read-only operation)

### Usage

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

### Options

| Option | Description | Required |
|--------|-------------|----------|
| `--in <file>` | Input RIPP packet file | ✅ Yes |
| `--out <file>` | Output file path | ✅ Yes |
| `--format <json\|yaml\|md>` | Output format (auto-detected from extension) | ❌ No |

### Output Formats

#### Markdown (`--format md`)

Creates a human-readable handoff document with:
- Feature overview
- All sections formatted for readability
- Metadata footer (packaged timestamp, tool version)

**Use for:** Handoff to teams that prefer documentation over structured data.

#### JSON (`--format json`)

Creates a normalized JSON artifact with:
- All fields from source packet
- Empty optional fields removed
- Packaging metadata added

**Use for:** Machine processing, API integrations, archival.

#### YAML (`--format yaml`)

Creates a normalized YAML artifact (same as JSON but YAML syntax).

**Use for:** Human-readable structured data, config management.

### Example Output (Markdown excerpt)

```markdown
# Create New Item in Inventory System

**Status:** approved  
**Level:** 3  
**Version:** 1.0  

---

## Purpose

**Problem:**  
Users cannot add new inventory items without manual database updates.

**Solution:**  
Provide a web form and API endpoint with validation and duplicate detection.

**Value:**  
Enables self-service item management, reduces support tickets.

---

## UX Flow

1. **User** navigates to Add Item page  
   _Trigger: Clicks "Add New Item" button_

2. **System** validates input  
   _Condition: If SKU already exists, show error_

...
```

### Exit Codes

- `0` — Packaging successful
- `1` — Validation failure or packaging error

---

## `ripp analyze`

Generate a DRAFT RIPP packet from existing code or schemas.

### Purpose

Extracts observable facts from OpenAPI specs or JSON Schemas to bootstrap a RIPP packet.

### What It Does

- ✅ Parses OpenAPI 3.0/Swagger 2.0 specifications
- ✅ Parses JSON Schema files
- ✅ Extracts data contracts, API endpoints, field types
- ✅ Generates a **DRAFT** RIPP packet with TODO markers

### What It Never Does

- ❌ Modifies existing RIPP packet files
- ❌ Guesses intent, business logic, or failure modes
- ❌ Produces production-ready packets (always DRAFT status)

### ⚠️ Important

Generated packets are **always DRAFT** and require human review:

- TODO markers indicate sections that need human input
- Extracted facts may be incomplete or inaccurate
- Business logic, purpose, and value cannot be inferred from code
- **Human review is mandatory** before approval

### Usage

```bash
# Analyze OpenAPI specification
ripp analyze openapi.json --output draft-api.ripp.yaml

# Analyze JSON Schema
ripp analyze schema.json --output draft.ripp.yaml --packet-id my-feature
```

### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `<input>` | Input file (OpenAPI spec or JSON Schema) | ✅ Yes | — |
| `--output <file>` | Output DRAFT RIPP packet file | ✅ Yes | — |
| `--packet-id <id>` | Packet ID for generated RIPP | ❌ No | `analyzed` |

### Supported Inputs

- ✅ OpenAPI 3.0 specifications
- ✅ Swagger 2.0 specifications
- ✅ JSON Schema (Draft 7)

### Example Output (YAML excerpt)

```yaml
ripp_version: '1.0'
packet_id: 'analyzed'
title: 'TODO: Add human-readable title'
created: '2025-12-14'
updated: '2025-12-14'
status: 'draft'
level: 1

purpose:
  problem: 'TODO: Define the problem being solved'
  solution: 'TODO: Describe the solution approach'
  value: 'TODO: Explain the business or user value'

# ...extracted data contracts...

# TODO: Add ux_flow (required for Level 1)
# TODO: Review all extracted fields for accuracy
# TODO: Add permissions, failure_modes (required for Level 2+)
```

### Exit Codes

- `0` — Analysis successful, draft created
- `1` — Analysis failed (invalid input, file write error)

---

## Expected Behavior in Monorepos

The RIPP CLI supports monorepo structures:

### Workspace Root Detection

The CLI searches upward from the current directory to find the repository root:

- ✅ Looks for `.git/` directory
- ✅ Looks for `package.json` with `workspaces` field
- ✅ Uses current directory if no root found

### Validation in Monorepos

```bash
# Validate all RIPP packets in the monorepo
ripp validate .

# Validate specific workspace
cd packages/auth
ripp validate .

# Validate all workspaces from root
ripp validate packages/*/ripp/
```

### GitHub Action in Monorepos

The generated `.github/workflows/ripp-validate.yml` works in monorepos:

```yaml
- name: Validate all RIPP packets
  run: ripp validate .
```

It finds all `*.ripp.yaml` and `*.ripp.json` files in the repository.

---

## Exit Codes Summary

| Command | Success | Failure |
|---------|---------|---------|
| `ripp init` | `0` | `1` (file write error) |
| `ripp validate` | `0` | `1` (validation failures) |
| `ripp lint` | `0` | `1` (errors, or warnings with `--strict`) |
| `ripp package` | `0` | `1` (validation or packaging error) |
| `ripp analyze` | `0` | `1` (analysis failure) |

---

## Environment Variables

None currently supported. Configuration is via command-line flags only.

---

## Next Steps

- See [Getting Started](Getting-Started) for installation guide
- Read [Validation Rules](Validation-Rules) for validation behavior
- Check [GitHub Integration](GitHub-Integration) for CI/CD setup
- Review [Schema Reference](Schema-Reference) for packet structure
