# Glossary

Definitions of key terms used in RIPP™ and this documentation.

---

## A

### Acceptance Tests

Specifications in a RIPP packet (Level 3) that define how to verify the feature works correctly. Includes preconditions, actions, expected outcomes, and specific verification steps.

**Example:**

```yaml
acceptance_tests:
  - test_id: 'TC-001'
    title: 'User can create item'
    given: 'User is authenticated with editor role'
    when: 'User submits valid item data'
    then: 'Item is created and ID is returned'
    verification:
      - 'HTTP 201 response received'
      - 'Item ID is present in response'
```

---

### API Contracts

Specifications in a RIPP packet (Level 2+) that define API endpoints or service interfaces, including HTTP methods, request/response schemas, and error cases.

**Example:**

```yaml
api_contracts:
  - endpoint: '/api/v1/items'
    method: 'POST'
    purpose: 'Create a new inventory item'
    response:
      success:
        status: 201
        schema_ref: 'CreateItemResponse'
      errors:
        - status: 400
          description: 'Invalid input'
```

---

### Artifact

A file or document that captures information about a feature or system. In RIPP, the primary artifact is the **RIPP packet**.

---

### Audit Events

Specifications in a RIPP packet (Level 3) that define what events must be logged for compliance, security, and debugging.

**Example:**

```yaml
audit_events:
  - event: 'item.created'
    severity: 'info'
    includes: ['user_id', 'item_id', 'timestamp']
    purpose: 'Track item creation for compliance'
```

---

## C

### Conformance Level

The level of rigor and completeness in a RIPP packet. RIPP defines three levels:

- **Level 1:** Purpose, UX Flow, Data Contracts
- **Level 2:** Level 1 + API Contracts, Permissions, Failure Modes
- **Level 3:** Level 2 + Audit Events, NFRs, Acceptance Tests

---

## D

### Data Contracts

Specifications in a RIPP packet that define all data structures consumed (inputs) or produced (outputs) by a feature.

**Example:**

```yaml
data_contracts:
  inputs:
    - name: 'CreateItemRequest'
      fields:
        - name: 'name'
          type: 'string'
          required: true
          description: 'Item display name'
```

---

### Deterministic Output

Output that is consistent and predictable given the same input. RIPP specifications are deterministic: given the same RIPP packet, implementations should produce consistent behavior.

---

## F

### Failure Modes

Specifications in a RIPP packet (Level 2+) that document what can go wrong, the impact, how the system handles it, and what users are told.

**Example:**

```yaml
failure_modes:
  - scenario: 'Database is unavailable'
    impact: 'Users cannot save items'
    handling: 'Return 503, retry with exponential backoff'
    user_message: 'Service temporarily unavailable. Please try again.'
```

---

## I

### Intent

The purpose, reasoning, and requirements behind a feature. RIPP captures intent in a structured, reviewable format.

**Components of intent:**

- Why the feature exists (problem being solved)
- What the feature does (solution and value)
- How it works (data flows, UX patterns, API contracts)
- Who can use it (permissions)
- What can go wrong (failure modes)
- How to verify it (acceptance tests)

---

### Intent Erosion

The problem where clear ideas and requirements degrade over time due to:

- Requirements scattered across tickets, docs, and conversations
- Security and edge cases discovered too late
- Lack of single source of truth
- Production issues revealing undocumented assumptions

**RIPP solves intent erosion** by making the specification the primary artifact.

---

## L

### Level 1

Basic RIPP conformance. Requires: Purpose, UX Flow, Data Contracts. Time to write: 30-60 minutes.

**Use for:** Simple features, prototypes, low-risk changes.

---

### Level 2

Production-ready RIPP conformance. Requires Level 1 + API Contracts, Permissions, Failure Modes. Time to write: 1-2 hours.

**Use for:** Customer-facing features, public APIs, features with security implications.

---

### Level 3

High-assurance RIPP conformance. Requires Level 2 + Audit Events, NFRs, Acceptance Tests. Time to write: 2-4 hours.

**Use for:** Payment processing, authentication, PII handling, multi-tenant features, compliance-critical features.

---

### Linting

Best-practice validation beyond schema conformance. Checks for placeholder text, missing recommended sections, inconsistent references, and vague descriptions.

**Command:**

```bash
ripp lint my-feature.ripp.yaml
```

---

## N

### NFRs (Non-Functional Requirements)

Specifications in a RIPP packet (Level 3) that define performance, scalability, availability, security, and compliance requirements.

**Example:**

```yaml
nfrs:
  performance:
    response_time_p95: '200ms'
  security:
    encryption_at_rest: true
    encryption_in_transit: true
```

---

## P

### Packet ID

A unique identifier for a RIPP packet. Must be lowercase with hyphens (kebab-case).

**Example:**

```yaml
packet_id: 'user-authentication'
```

---

### Permissions

Specifications in a RIPP packet (Level 2+) that define authorization requirements, including actions, required roles, and resource scopes.

**Example:**

```yaml
permissions:
  - action: 'create:item'
    required_roles: ['admin', 'editor']
    description: 'User must have editor role to create items'
```

---

### Purpose

A required section in all RIPP packets that describes why the feature exists (problem), what it does (solution), and the value it delivers.

**Example:**

```yaml
purpose:
  problem: 'Users cannot add items without manual database updates'
  solution: 'Provide a web form and API endpoint with validation'
  value: 'Enables self-service, reduces support tickets'
```

---

## R

### Read-Only Validation

Validation that checks correctness without modifying source files. RIPP validators are always read-only.

**What this means:**

- ✅ Validators report errors
- ✅ Humans fix errors deliberately
- ❌ Validators never modify RIPP packets
- ❌ No auto-fix

---

### Regenerable

The ability to recreate or rebuild a feature from its specification. RIPP enables regeneration by preserving intent, data contracts, and UX patterns.

**Example:** A feature implemented in Python can be regenerated in Go using the same RIPP packet.

---

### Regenerative Intent

The core principle of RIPP: intent must be preserved and regeneratable across the entire software lifecycle, even when code is rewritten.

**Why it matters:** Code is ephemeral (gets rewritten). Intent is durable (remains constant).

---

### Repo-Native

Artifacts that live in version control (Git) alongside code, rather than in external tools (Jira, Confluence, Notion).

**RIPP is repo-native:**

- ✅ RIPP packets stored in Git
- ✅ Versioned with code
- ✅ Reviewed in pull requests
- ✅ Validated in CI/CD

---

### RIPP

**Regenerative Intent Prompting Protocol**. A structured format for capturing feature requirements as machine-readable, human-reviewable specifications.

---

### RIPP CLI

The official command-line tool for working with RIPP packets. Provides commands for validation, linting, packaging, analysis, and initialization.

**Installation:**

```bash
npm install -g ripp-cli
```

---

### RIPP Packet

A single YAML or JSON file that fully describes one feature, API, or system change. Contains metadata, purpose, UX flow, data contracts, and (for Level 2/3) API contracts, permissions, failure modes, audit events, NFRs, and acceptance tests.

**File naming:**

```
<feature-identifier>.ripp.{yaml|json}
```

---

## S

### Scaffolding

The process of creating directory structure and boilerplate files for RIPP in a repository. RIPP scaffolding is **explicit** (requires running `ripp init`).

**What scaffolding creates:**

- `ripp/` directory structure
- `ripp/README.md` documentation
- `.github/workflows/ripp-validate.yml` GitHub Action

---

### Schema

The JSON Schema that defines the structure and validation rules for RIPP packets.

**Location:**

```
schema/ripp-1.0.schema.json
```

**Online reference:**

```
https://dylan-natter.github.io/ripp-protocol/schema/ripp-1.0.schema.json
```

---

### Semantic Validation

Validation that checks best practices, consistency, and completeness beyond structural conformance. Implemented via `ripp lint`.

**Example rules:**

- Check for placeholder text (TODO, TBD)
- Verify `schema_ref` consistency
- Warn on missing `out_of_scope`

---

### Structural Validation

Validation that checks schema conformance, required fields, data types, and formats. Implemented via `ripp validate`.

**Example checks:**

- All required metadata fields present
- Field types match schema
- Date formats are valid ISO 8601
- `packet_id` follows kebab-case pattern

---

## U

### UX Flow

A required section in all RIPP packets that describes the user or system interaction flow as a sequence of steps.

**Example:**

```yaml
ux_flow:
  - step: 1
    actor: 'User'
    action: 'Clicks "Add Item" button'
    trigger: 'Navigates to dashboard'
  - step: 2
    actor: 'System'
    action: 'Displays item creation form'
    result: 'User sees form with validation'
```

---

## V

### Validation

The process of checking that a RIPP packet conforms to the JSON Schema and includes all required sections for its declared level.

**Command:**

```bash
ripp validate my-feature.ripp.yaml
```

**What it checks:**

- Schema conformance
- Required sections for declared level
- File naming conventions
- Data integrity (dates, formats, enums)

**What it doesn't do:**

- Modify source files
- Auto-fix errors
- Generate code

---

### Validator

A tool that checks RIPP packets for correctness. The official validator is the RIPP CLI (`ripp validate`).

**Characteristics:**

- ✅ Read-only (never modifies files)
- ✅ Schema-based (validates against JSON Schema)
- ✅ Deterministic (same input → same output)
- ❌ Does not auto-fix

---

## See Also

- [Core Concepts](Core-Concepts) — Foundational RIPP principles
- [RIPP Specification](RIPP-Specification) — Protocol structure and requirements
- [Schema Reference](Schema-Reference) — Field-by-field documentation
- [FAQ](FAQ) — Common questions and answers
