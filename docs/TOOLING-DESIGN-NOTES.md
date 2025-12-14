# RIPP Tooling Design Notes

**Date**: 2025-12-14  
**Purpose**: Internal design document for adding tooling extensions to RIPP

---

## Phase 0: Discovery Summary

### What Exists Today

#### 1. Core CLI (`tools/ripp-cli/index.js`)

**Current Commands:**
- `ripp validate <path>` — Schema validation against `ripp-1.0.schema.json`
- `ripp validate <path> --min-level <1|2|3>` — Level enforcement
- `ripp --help` — Help output
- `ripp --version` — Version display

**Current Functionality:**
- Loads RIPP packets from YAML or JSON
- Validates against JSON Schema using AJV
- Checks file naming conventions (`.ripp.yaml`, `.ripp.json`)
- Validates `packet_id` format (kebab-case)
- Enforces minimum RIPP levels
- Outputs color-coded results with errors and warnings
- Returns exit codes (0 = success, 1 = failure)

**Key Implementation Details:**
- Uses `glob` to find files recursively
- Uses `js-yaml` for YAML parsing
- Uses `ajv` + `ajv-formats` for schema validation
- Relative path display in results
- Template file detection (allows placeholders)

#### 2. Schema (`schema/ripp-1.0.schema.json`)

**Purpose:** Authoritative structure definition for RIPP packets

**Key Validations:**
- Required metadata fields (ripp_version, packet_id, title, etc.)
- Level 1 requirements: purpose, ux_flow, data_contracts
- Level 2 requirements: + api_contracts, permissions, failure_modes
- Level 3 requirements: + audit_events, nfrs, acceptance_tests
- Field types, formats, patterns
- Conditional schema validation based on level

**Must NOT be modified** — Schema changes require new version (e.g., ripp-2.0.schema.json)

#### 3. Existing Workflows

**GitHub Actions:**
- `.github/workflows/ripp-validate.yml` — Validates example packets on PR/push
- `.github/workflows/code-quality.yml` — ESLint and Prettier checks

**npm Scripts (package.json):**
- `npm test` — Validates examples using ripp-cli
- `npm run lint` — ESLint on ripp-cli
- `npm run format` — Prettier formatting

#### 4. Documentation Structure

**Authoritative Documents (MUST NOT CHANGE SEMANTICS):**
- `SPEC.md` — Protocol specification and behavior
- `schema/ripp-1.0.schema.json` — Packet structure
- `README.md` — Public API and usage guide
- `docs/EXTENSIONS.md` — Extension guardrails

**Supporting Documentation:**
- `docs/` — User-facing guides
- `wiki/` — Design decision log (non-authoritative)
- `tools/ripp-cli/README.md` — CLI documentation

#### 5. Example Packets

**Location:** `examples/`
- `item-creation.ripp.yaml` — Level 3 example
- `api-only-feature.ripp.yaml` — API-focused example
- `multi-tenant-feature.ripp.yaml` — Multi-tenancy example

These serve as test fixtures and documentation.

---

## Where Each Extension Will Attach

### 1. RIPP Linter

**Attachment Point:** New command in `tools/ripp-cli/index.js`

**Integration Strategy:**
- Add new command: `ripp lint <path>`
- **Runs AFTER schema validation** (calls existing `validatePacket()`)
- Only lints packets that pass schema validation
- Separate linting logic in new function/module
- Does NOT modify existing validation logic
- Outputs to `reports/` directory (gitignored)

**What It Uses:**
- Existing `loadPacket()` function
- Existing `validatePacket()` function
- Existing `findRippFiles()` function
- New linting rules (separate from schema validation)

**What It Does NOT Touch:**
- Schema validation logic
- Existing `validate` command
- Schema files
- Packet structure definitions

### 2. RIPP Packager

**Attachment Point:** New command in `tools/ripp-cli/index.js`

**Integration Strategy:**
- Add new command: `ripp package --in <file> --out <file>`
- Read-only operation (never modifies source)
- Validates input before packaging
- Generates normalized output artifacts
- Supports multiple formats (JSON, YAML, Markdown)

**What It Uses:**
- Existing `loadPacket()` function
- Existing `validatePacket()` function
- New formatting/export logic

**What It Does NOT Touch:**
- Source RIPP files
- Validation logic
- Schema definitions

### 3. RIPP Analyzer

**Attachment Point:** New command in `tools/ripp-cli/index.js`

**Integration Strategy:**
- Add new command: `ripp analyze <input> --output <file>`
- Extractive-only (no intent guessing)
- Generates DRAFT packets (clearly marked)
- Requires human review before use
- Analyzes code/API/schema to extract observable facts

**What It Uses:**
- Existing schema as template structure
- New analysis/extraction logic
- File system readers (read-only)

**What It Does NOT Touch:**
- Existing RIPP packets
- Validation logic
- Schema definitions

---

## What MUST Remain Untouched

### 1. Core Protocol Files (Zero Changes Allowed)

- `schema/ripp-1.0.schema.json` — Schema is authoritative
- `SPEC.md` — Specification defines protocol behavior
- Schema validation semantics in `validatePacket()`

### 2. Existing CLI Behavior (Backward Compatible Only)

**MUST NOT CHANGE:**
- `ripp validate` command behavior
- Exit codes for existing commands
- Output format for existing commands (can add options)
- Error/warning messages (can add new ones)
- File discovery logic

**CAN ADD:**
- New optional flags (e.g., `--format json`)
- New commands (lint, package, analyze)
- New output destinations (reports/)

### 3. Existing Workflows

**MUST NOT BREAK:**
- `.github/workflows/ripp-validate.yml` — Must continue to pass
- `.github/workflows/code-quality.yml` — Must continue to pass
- `npm test` — Must continue to pass

**CAN ADD:**
- New optional workflow steps
- New npm scripts
- New CI checks (non-blocking)

### 4. Documentation Semantics

**MUST NOT CHANGE:**
- Protocol definitions in SPEC.md
- Schema property meanings
- Extension guardrails in EXTENSIONS.md

**CAN ADD:**
- New sections documenting tooling
- New examples
- New guides

---

## Implementation Plan

### Phase 1: RIPP Linter

**Location:** `tools/ripp-cli/index.js` (extend existing file)

**New Components:**
- `lintPacket(packet, filePath)` — Linting logic
- `generateLintReport(results, format)` — Report generation
- Command handler for `ripp lint`

**Lint Rules:**
1. Missing critical sections (intent, security, verification)
2. Missing `non_goals` (best practice)
3. Undefined ID references (cross-references)
4. Placeholder text (TODO, TBD, lorem ipsum)
5. Missing `verification.done_when` (incomplete acceptance tests)

**Output:**
- `reports/lint.json` — Machine-readable
- `reports/lint.md` — Human-readable
- Severity: `error` | `warn`
- `--strict` flag promotes warnings to errors

**Exit Codes:**
- 0: No errors (warnings allowed unless --strict)
- 1: Errors found (or warnings in strict mode)

### Phase 2: RIPP Packager

**Location:** `tools/ripp-cli/index.js` (extend existing file)

**New Components:**
- `packagePacket(packet, options)` — Packaging logic
- Format generators (JSON, YAML, Markdown, HTML)
- Command handler for `ripp package`

**Features:**
- Normalize packet structure
- Remove optional empty fields
- Validate before packaging
- Include metadata (packaged date, version)
- Read-only operation (never modifies source)

**Output Formats:**
- JSON: Normalized, minified, or pretty
- YAML: Clean, normalized output
- Markdown: Human-readable handoff doc
- HTML: Styled documentation page (optional)

### Phase 3: RIPP Analyzer

**Location:** `tools/ripp-cli/index.js` (extend existing file)

**New Components:**
- `analyzeCode(input, options)` — Code analysis
- `extractDataContracts(schema)` — Schema extraction
- `extractApiContracts(openapi)` — OpenAPI extraction
- Command handler for `ripp analyze`

**Capabilities:**
- Extract API contracts from OpenAPI specs
- Extract data contracts from JSON schemas
- Extract UX flow from route definitions (basic)
- Generate DRAFT packet (clearly marked with status: 'draft')

**Guardrails:**
- Only extract observable facts
- Never invent intent or business logic
- Never guess failure modes beyond try/catch
- Output clearly marked as DRAFT
- Require human review

---

## Integration Points

### npm Scripts

Add new scripts to `package.json`:
```json
{
  "scripts": {
    "ripp:lint": "ripp lint examples/",
    "ripp:lint:strict": "ripp lint examples/ --strict",
    "ripp:package": "ripp package --help",
    "ripp:analyze": "ripp analyze --help"
  }
}
```

### Directory Structure

```
ripp-protocol/
├── tools/
│   └── ripp-cli/
│       ├── index.js          # Extended with new commands
│       ├── lib/              # NEW: Modular command logic
│       │   ├── linter.js     # Linting logic
│       │   ├── packager.js   # Packaging logic
│       │   └── analyzer.js   # Analysis logic
│       └── package.json
├── reports/                  # NEW: Gitignored output directory
│   ├── lint.json
│   └── lint.md
└── docs/
    └── TOOLING-DESIGN-NOTES.md  # This file
```

### gitignore Updates

Add to `.gitignore`:
```
reports/
*.ripp.packaged.*
```

---

## Testing Strategy

### Validation Tests

1. Ensure existing validation tests still pass
2. Test new commands don't break backward compatibility
3. Validate linter output format
4. Validate packager doesn't mutate source files
5. Validate analyzer output is clearly marked as DRAFT

### Example Workflows

```bash
# Validate (existing)
ripp validate examples/

# Lint (new)
ripp lint examples/
ripp lint examples/ --strict

# Package (new)
ripp package --in examples/item-creation.ripp.yaml --out packaged.yaml

# Analyze (new)
ripp analyze openapi.json --output draft-api.ripp.yaml
```

---

## Backward Compatibility Checklist

- [ ] Existing `ripp validate` behavior unchanged
- [ ] All example packets still validate successfully
- [ ] Existing workflows continue to pass
- [ ] Schema remains unmodified
- [ ] SPEC.md semantics unchanged
- [ ] No breaking changes to CLI interface
- [ ] Exit codes for existing commands unchanged
- [ ] New commands are optional (can be unused)

---

## Security Considerations

1. **No File Mutation**: Linter, packager, analyzer are read-only
2. **No Intent Guessing**: Analyzer extracts only observable facts
3. **Clear Draft Marking**: Generated packets marked as 'draft'
4. **Path Validation**: Prevent directory traversal in file operations
5. **Input Sanitization**: Validate all user inputs

---

## Summary

This design ensures:
- **Additive only**: New commands, no changes to existing ones
- **Backward compatible**: All existing workflows continue to function
- **Read-only tooling**: No mutation of source packets
- **Clear boundaries**: Linter != Validator, Analyzer != Inventor
- **Protocol preservation**: Schema and SPEC.md remain authoritative

Implementation will proceed in phases, testing backward compatibility at each step.
