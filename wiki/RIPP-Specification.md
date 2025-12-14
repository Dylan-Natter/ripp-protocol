# RIPP™ Specification Overview

This page provides an overview of the RIPP v1.0 specification. For the authoritative, complete specification, see [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md).

## What the Spec Defines

The RIPP specification defines:

- **Packet structure** — Required metadata and sections
- **Conformance levels** — Level 1, 2, and 3 requirements
- **Data types and formats** — Field types, validation rules, naming conventions
- **Versioning rules** — How RIPP evolves over time
- **Backward compatibility guarantees** — What changes break vs. extend the spec

---

## Artifact Types and Roles

### RIPP Packet

A **RIPP packet** is a single YAML or JSON file that fully describes one feature, API, or system change.

**Key characteristics:**

- **Self-contained:** All information needed to implement and verify the feature is in one file
- **Reviewable:** Can be reviewed and approved before writing code
- **Versioned:** Tracked in version control alongside code
- **Validatable:** Conforms to JSON Schema

**File naming convention:**

```
<feature-identifier>.ripp.{yaml|json}
```

Examples:
- `user-authentication.ripp.yaml`
- `payment-processing.ripp.json`
- `item-creation.ripp.yaml`

### Supporting Artifacts

| Artifact | Purpose | Created By |
|----------|---------|------------|
| RIPP Packet | Source of truth for feature intent | Humans |
| Packaged Artifact | Normalized handoff document (Markdown/JSON/YAML) | `ripp package` |
| Lint Report | Best practices compliance report | `ripp lint` |
| Draft Packet | Generated from existing code/schemas (requires review) | `ripp analyze` |

---

## Required vs Optional Fields

### Required Metadata (All Levels)

Every RIPP packet **MUST** include:

```yaml
ripp_version: '1.0'
packet_id: 'unique-identifier'
title: 'Human-readable feature title'
created: '2025-12-14'
updated: '2025-12-14'
status: 'draft | approved | implemented | deprecated'
level: 1 | 2 | 3
```

### Required Sections (Level 1)

All RIPP packets **MUST** include:

- **purpose** — Problem, solution, value
- **ux_flow** — User/system interaction steps
- **data_contracts** — Input/output data structures

### Additional Required Sections (Level 2)

Level 2 packets **MUST** include Level 1 sections plus:

- **api_contracts** — API endpoints or service interfaces
- **permissions** — Authorization requirements
- **failure_modes** — What can go wrong and how to handle it

### Additional Required Sections (Level 3)

Level 3 packets **MUST** include Level 1 and 2 sections plus:

- **audit_events** — What events must be logged
- **nfrs** — Non-functional requirements (performance, security, etc.)
- **acceptance_tests** — How to verify correctness

### Optional Fields

All levels **MAY** include:

- `version` — Packet version (semver recommended)
- `purpose.out_of_scope` — What the feature explicitly does NOT do
- `purpose.assumptions` — Known constraints or assumptions
- `purpose.references` — Links to related docs, issues, designs
- Custom sections (forward compatibility)

---

## Conformance Levels

RIPP defines three conformance levels. Teams choose the level appropriate for their feature's risk and complexity.

### Level 1: Basic Intent

**Required sections:**
- Metadata
- Purpose
- UX Flow
- Data Contracts

**Use for:**
- Simple, low-risk features
- Internal tools
- Prototypes being formalized

**Time to write:** 30-60 minutes

---

### Level 2: Production-Ready

**Required sections:**
- Level 1 sections
- API Contracts
- Permissions
- Failure Modes

**Use for:**
- Customer-facing features
- Public APIs
- Features with security implications

**Time to write:** 1-2 hours

---

### Level 3: High-Assurance

**Required sections:**
- Level 1 and 2 sections
- Audit Events
- Non-Functional Requirements
- Acceptance Tests

**Use for:**
- Payment processing
- Authentication/authorization
- Handling PII or sensitive data
- Multi-tenant features
- Compliance-critical features

**Time to write:** 2-4 hours

---

## Versioning Rules

### RIPP Specification Versions

RIPP uses **semantic versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR (1.x → 2.x):** Breaking changes to required sections or validation rules
- **MINOR (1.0 → 1.1):** New optional sections or backward-compatible additions
- **PATCH (1.0.0 → 1.0.1):** Clarifications, documentation fixes, non-normative updates

**Current version:** `1.0`

### Individual Packet Versions

RIPP packets are versioned through:

1. **Git commit history** — Primary versioning mechanism
2. **`updated` field** — ISO 8601 date of last modification
3. **Optional `version` field** — Semver or custom versioning

Example:

```yaml
ripp_version: '1.0'
packet_id: 'item-creation'
version: '2.1.0'  # Optional packet version
created: '2025-01-10'
updated: '2025-12-14'
```

---

## Backward Compatibility Expectations

### Within a Major Version (1.x)

RIPP guarantees backward compatibility:

- ✅ All existing valid packets remain valid
- ✅ Validators accept packets with unknown optional fields
- ✅ New optional sections can be added
- ❌ No new required sections without MAJOR version bump

### Across Major Versions (1.x → 2.x)

RIPP may introduce breaking changes:

- ⚠️ New required sections may be added
- ⚠️ Existing required sections may change structure
- ⚠️ Validation rules may become stricter
- ✅ Migration guide will be provided
- ✅ Tooling will support gradual migration

---

## How Spec Changes Should Be Handled by Tools

### Validators

Validators **MUST**:

- Validate against the schema version specified in `ripp_version`
- Accept packets with unknown optional fields (forward compatibility)
- Fail validation if required sections are missing
- Report errors clearly with field paths

Validators **SHOULD**:

- Support multiple RIPP versions (e.g., 1.0 and 2.0 simultaneously)
- Provide warnings for deprecated patterns
- Suggest upgrades when new RIPP versions are available

Validators **MUST NOT**:

- Modify source packet files
- Assume defaults for missing required fields
- Silently ignore validation errors

### Linters

Linters **MUST**:

- Operate independently of schema validation
- Check best practices beyond structural requirements
- Be optional (can be disabled without breaking workflows)

Linters **SHOULD**:

- Provide actionable suggestions
- Support `--strict` mode (treat warnings as errors)
- Generate machine-readable reports

Linters **MUST NOT**:

- Modify source packet files
- Auto-fix issues without human approval

### Packagers

Packagers **MUST**:

- Validate input packets before packaging
- Preserve all semantic information
- Be read-only (never modify source packets)

Packagers **SHOULD**:

- Normalize packet structure (remove empty optional fields)
- Add packaging metadata (timestamp, tool version)
- Support multiple output formats (JSON, YAML, Markdown)

### Analyzers

Analyzers **MUST**:

- Generate packets in **DRAFT** status only
- Extract only observable facts (no guessing)
- Include TODO markers for required human review
- Never modify existing packet files

Analyzers **SHOULD**:

- Support common input formats (OpenAPI, JSON Schema)
- Preserve as much source metadata as possible
- Generate valid Level 1 packets as baseline

---

## Status Lifecycle

RIPP packets progress through a defined lifecycle:

```
draft → approved → implemented → deprecated
```

| Status | Meaning | Actions Allowed |
|--------|---------|-----------------|
| `draft` | Specification being written | Active editing, not yet reviewed |
| `approved` | Reviewed and ready for implementation | Implementation can begin |
| `implemented` | Code has been written and deployed | May be updated if requirements change |
| `deprecated` | Feature is being phased out | No new development; maintained for legacy |

**Transitions:**

- `draft → approved` — After team review and approval
- `approved → implemented` — After code deployment
- `implemented → deprecated` — When feature is being sunset
- `deprecated → (removed)` — After sunset period ends

---

## Schema Location

The authoritative JSON Schema is located at:

```
schema/ripp-1.0.schema.json
```

**Online reference:**

```
https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json
```

---

## Validation Philosophy

RIPP validation is designed to:

- **Fail fast** — Catch errors before code is written
- **Fail clearly** — Provide actionable error messages
- **Never guess** — Explicit is better than implicit
- **Be deterministic** — Same packet always produces same validation result

---

## Next Steps

- See [Schema Reference](Schema-Reference) for field-by-field documentation
- Read [Validation Rules](Validation-Rules) for what validation enforces
- Check [Versioning and Compatibility](Versioning-and-Compatibility) for upgrade strategies
- Review the full [SPEC.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/SPEC.md)
