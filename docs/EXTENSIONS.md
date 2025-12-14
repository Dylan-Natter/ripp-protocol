# RIPP Extension Guardrails

**RIPP is a PROTOCOL first, tooling second.**

This document establishes clear rules for extending RIPP with tooling while preserving the protocol as a stable, trusted specification.

---

## Core Principle

RIPP tooling must be **additive**. Extensions enhance workflows but **never** redefine protocol behavior, semantics, or scope.

**Additive extension** means:
- No rewrites of existing specifications or schemas
- No changes to protocol behavior or semantics
- New features must be backward-compatible
- Existing RIPP packets remain valid

---

## Tooling Definitions

### Validator (Required)
Schema-based verification that ensures RIPP packets conform to the JSON Schema specification.

**Characteristics:**
- Validates structure against `ripp-1.0.schema.json`
- Checks required fields and data types
- Enforces level conformance (Level 1, 2, or 3)
- **Must** reject invalid packets
- **Must not** modify packets

### Linter (Optional)
Best-practice checker that identifies style issues, warnings, or recommendations beyond schema validation.

**Characteristics:**
- Checks for conventions (naming, formatting, completeness)
- Issues warnings, not errors
- **Must** be optional (can be disabled)
- **Must not** enforce organization-specific rules in core tooling
- **Must not** reject structurally valid packets

### Packager (Read-Only)
Artifact generator that transforms RIPP packets into other formats (Markdown, HTML, PDF, etc.).

**Characteristics:**
- Reads RIPP packets without modification
- Generates derived artifacts
- **Must** be read-only (never writes back to source)
- **Must** preserve original intent
- **Must not** introduce new semantics

### Analyzer (Extractive-Only)
Tool that examines existing code, APIs, or documentation to generate **draft** RIPP packets.

**Characteristics:**
- Extracts observable behavior from existing systems
- Generates draft packets for human review
- **Must never** guess or invent intent
- **Must never** claim generated packets are authoritative
- **Must** clearly mark output as "draft" or "generated"
- **Must** require human approval before use

---

## Absolute Rules

### 1. Tooling Must Never Mutate Source RIPP Packets
All tools that read RIPP packets must be **read-only**. Validation, linting, packaging, and analysis tools **must not** modify the source files.

### 2. Analyzers Must Never Guess Intent
Analyzers may extract observable facts (API signatures, database schemas) but **must not**:
- Infer business purpose or rationale
- Generate failure modes or edge cases without evidence
- Make assumptions about user behavior or security requirements

### 3. Backward Compatibility is Mandatory
All tooling updates must maintain compatibility with existing RIPP packets. Schema changes must be versioned (e.g., `ripp-2.0.schema.json`).

### 4. Documentation is a Public API
Documentation (README, SPEC, schema) is treated as a public contract. Changes must be **additive only**:
- New sections may be added
- Clarifications may be made without changing meaning
- **No rewrites** of existing content
- **No changes** to protocol semantics

---

## Extension Approval Criteria

Proposed tooling extensions must:
1. **Preserve protocol stability**: No breaking changes to schema or semantics
2. **Be strictly additive**: Enhance, don't replace
3. **Maintain backward compatibility**: Existing packets remain valid
4. **Follow these guardrails**: Read-only, extractive-only, or strictly validating
5. **Avoid feature creep**: Tools serve RIPP; RIPP does not serve tools

---

## Examples

### ✅ Acceptable Extensions
- Adding a `--format json` flag to the validator
- Creating a Markdown generator that reads RIPP packets
- Building an analyzer that extracts API contracts from OpenAPI specs (as drafts)
- Adding a linter rule to check for common typos (optional, warning-only)

### ❌ Unacceptable Extensions
- Modifying the validator to "fix" invalid packets automatically
- Adding new required fields to the schema without versioning
- Creating an analyzer that invents failure modes not present in the code
- Changing the definition of "purpose" or "data_contracts"

---

## Enforcement

- All tooling contributions must reference this document
- Pull requests that violate these guardrails will be rejected
- Schema changes require community review and RFC process
- Documentation changes are reviewed for additive-only compliance

---

**Summary**: RIPP tooling exists to serve the protocol. The protocol does not bend to serve tooling.
