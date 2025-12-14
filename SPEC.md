# RIPP v1.0 Specification

**Regenerative Intent Prompting Protocol**

**Version**: 1.0.0  
**Status**: Stable  
**Date**: 2025-12-13

---

## Abstract

The Regenerative Intent Prompting Protocol (RIPP) is a structured format for capturing feature requirements, system design decisions, and implementation contracts in a machine-readable, human-reviewable format. RIPP packets serve as executable specifications that preserve original intent while enabling rapid iteration, automated validation, and safe production deployment.

---

## 1. Introduction

### 1.1 What RIPP Is

RIPP is a **specification format** for documenting features, APIs, and system changes. A RIPP packet is a structured document (YAML or JSON) that describes:

- What a feature does and why it exists (Purpose)
- How users interact with it (UX Flow)
- What data it produces and consumes (Data Contracts)
- How systems communicate (API Contracts)
- Who can do what (Permissions)
- What gets logged (Audit Events)
- What can go wrong and how to handle it (Failure Modes)
- Non-functional requirements (NFRs)
- How to verify correctness (Acceptance Tests)

### 1.2 What RIPP Is Not

- **Not a project management tool**: RIPP documents features, not timelines or assignments
- **Not a code generator**: RIPP is a specification; code generation is optional
- **Not a replacement for design documents**: RIPP complements, not replaces, architectural documentation
- **Not specific to any framework**: RIPP is language and platform agnostic

### 1.3 Why RIPP Exists

Modern software development faces a critical problem: **intent erosion**. Ideas conceived with clear purpose and constraints often degrade during implementation as:

- Requirements scatter across tickets, docs, and conversations
- Security and edge cases are discovered too late
- Code review lacks a single source of truth
- Production issues reveal undocumented assumptions

RIPP solves this by making the feature specification the **primary artifact**. Teams write RIPP packets before writing code, creating a reviewable, versioned contract that survives implementation.

---

## 2. Core Concepts

### 2.1 RIPP Packet

A **RIPP packet** is a single YAML or JSON file that fully describes one feature, API, or system change.

**Key properties:**

- **Self-contained**: All information needed to implement and test the feature is in one file
- **Reviewable**: Can be reviewed before any code is written
- **Versioned**: Tracked in version control alongside code
- **Validatable**: Conforms to the RIPP JSON Schema

### 2.2 Conformance Levels (RIPP Levels)

RIPP defines four conformance levels:

- **Level 0**: No RIPP (ad-hoc documentation)
- **Level 1**: Purpose, UX Flow, and Data Contracts defined
- **Level 2**: Level 1 + API Contracts, Permissions, and Failure Modes
- **Level 3**: Level 2 + Audit Events, NFRs, and Acceptance Tests (full RIPP)

Teams choose the level appropriate for their feature's risk and complexity.

### 2.3 Regenerative Intent

RIPP is "regenerative" because it:

1. **Preserves intent**: Captures the "why" alongside the "what"
2. **Enables iteration**: Specifications can be updated as understanding evolves
3. **Supports review**: Makes requirements explicit and debatable
4. **Facilitates safety**: Forces consideration of failure modes and permissions upfront

---

## 3. Packet Structure

### 3.1 Required Metadata

Every RIPP packet **must** include:

```yaml
ripp_version: '1.0'
packet_id: 'unique-feature-identifier'
title: 'Brief feature title'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft | approved | implemented | deprecated'
level: 1 | 2 | 3
```

**Field Definitions:**

- `ripp_version`: The RIPP specification version (currently "1.0")
- `packet_id`: Unique identifier (lowercase, kebab-case recommended)
- `title`: Human-readable feature name
- `created`: ISO 8601 date when packet was created
- `updated`: ISO 8601 date of last update
- `status`: Lifecycle stage of the feature
- `level`: RIPP conformance level (1, 2, or 3)

### 3.2 Required Sections

The following sections are **required** for all RIPP packets (minimum Level 1):

#### 3.2.1 Purpose

**Field:** `purpose`  
**Type:** Object

Describes why the feature exists and what problem it solves.

**Required fields:**

```yaml
purpose:
  problem: 'Clear statement of the problem being solved'
  solution: 'High-level approach to solving it'
  value: 'Business or user value delivered'
```

**Optional fields:**

- `out_of_scope`: What this feature explicitly does NOT do
- `assumptions`: Known assumptions or constraints
- `references`: Links to related docs, issues, or designs

#### 3.2.2 UX Flow

**Field:** `ux_flow`  
**Type:** Array of steps

Describes the user or system interaction flow.

**Required structure:**

```yaml
ux_flow:
  - step: 1
    actor: 'User | System | Service Name'
    action: 'What happens in this step'
    trigger: 'What initiates this step'
  - step: 2
    actor: 'System'
    action: 'System responds'
    result: 'What the user sees or receives'
```

**Required fields per step:**

- `step`: Numeric order
- `actor`: Who or what performs the action
- `action`: What happens
- At least one of: `trigger`, `result`, or `condition`

#### 3.2.3 Data Contracts

**Field:** `data_contracts`  
**Type:** Object

Defines all data structures consumed or produced by the feature.

**Required structure:**

```yaml
data_contracts:
  inputs:
    - name: 'InputEntityName'
      fields:
        - name: 'fieldName'
          type: 'string | number | boolean | object | array'
          required: true | false
          description: 'What this field represents'
  outputs:
    - name: 'OutputEntityName'
      fields:
        - name: 'fieldName'
          type: 'string'
          required: true
          description: 'What this field represents'
```

**Required fields:**

- At least one of `inputs` or `outputs`
- Each entity must have `name` and `fields`
- Each field must have `name`, `type`, `required`, and `description`

### 3.3 Level 2 Sections

Level 2 RIPP packets **must** include all Level 1 sections plus:

#### 3.3.1 API Contracts

**Field:** `api_contracts`  
**Type:** Array

Defines all API endpoints or service interfaces.

**Required structure:**

```yaml
api_contracts:
  - endpoint: '/api/v1/resource'
    method: 'GET | POST | PUT | DELETE | PATCH'
    purpose: 'What this endpoint does'
    request:
      content_type: 'application/json'
      schema_ref: 'InputEntityName'
    response:
      success:
        status: 200
        schema_ref: 'OutputEntityName'
      errors:
        - status: 400
          description: 'Invalid input'
        - status: 401
          description: 'Unauthorized'
```

**Required fields:**

- `endpoint`: URL path or RPC method name
- `method`: HTTP method or protocol operation
- `purpose`: What the API does
- `response.success`: At least one success case
- `response.errors`: At least one error case

#### 3.3.2 Permissions

**Field:** `permissions`  
**Type:** Array

Defines all permission requirements for the feature.

**Required structure:**

```yaml
permissions:
  - action: 'create:resource'
    required_roles: ['admin', 'editor']
    resource_scope: 'organization | project | global'
    description: 'Who can create resources and under what conditions'
```

**Required fields:**

- `action`: The permission being checked (verb:noun format recommended)
- `required_roles`: Roles that can perform this action
- `description`: When and why this permission is checked

#### 3.3.3 Failure Modes

**Field:** `failure_modes`  
**Type:** Array

Documents what can go wrong and how to handle it.

**Required structure:**

```yaml
failure_modes:
  - scenario: 'Database is unavailable'
    impact: 'Users cannot save data'
    handling: 'Return 503, retry with exponential backoff'
    user_message: 'Service temporarily unavailable. Please try again.'
  - scenario: 'Invalid input data'
    impact: 'Request fails validation'
    handling: 'Return 400 with detailed error messages'
    user_message: 'Please check your input and try again.'
```

**Required fields:**

- `scenario`: What goes wrong
- `impact`: Effect on users or system
- `handling`: How the system responds
- `user_message`: What users see or are told

### 3.4 Level 3 Sections

Level 3 RIPP packets **must** include all Level 1 and 2 sections plus:

#### 3.4.1 Audit Events

**Field:** `audit_events`  
**Type:** Array

Specifies what events must be logged for compliance and debugging.

**Required structure:**

```yaml
audit_events:
  - event: 'resource.created'
    severity: 'info | warn | error'
    includes:
      - 'user_id'
      - 'resource_id'
      - 'timestamp'
      - 'ip_address'
    retention: '90 days'
    purpose: 'Track resource creation for compliance'
```

**Required fields:**

- `event`: Event name (dot-notation recommended)
- `severity`: Log level
- `includes`: Data fields captured in the event
- `purpose`: Why this event is logged

#### 3.4.2 Non-Functional Requirements

**Field:** `nfrs`  
**Type:** Object

Defines performance, scalability, and operational requirements.

**Required structure:**

```yaml
nfrs:
  performance:
    response_time_p95: '200ms'
    throughput: '1000 requests/second'
  scalability:
    max_concurrent_users: 10000
    data_growth: '1TB/year'
  availability:
    uptime_target: '99.9%'
    rpo: '1 hour'
    rto: '4 hours'
  security:
    encryption_at_rest: true
    encryption_in_transit: true
```

**Required fields:**

At least one of: `performance`, `scalability`, `availability`, `security`, or `compliance`

#### 3.4.3 Acceptance Tests

**Field:** `acceptance_tests`  
**Type:** Array

Defines how to verify the feature works correctly.

**Required structure:**

```yaml
acceptance_tests:
  - test_id: 'TC-001'
    title: 'User can create a new resource'
    given: 'User is authenticated with editor role'
    when: 'User submits valid resource data'
    then: 'Resource is created and ID is returned'
    verification:
      - 'HTTP 201 response received'
      - 'Resource ID is present in response'
      - 'Resource is retrievable via GET'
```

**Required fields:**

- `test_id`: Unique test identifier
- `title`: What is being tested
- `given`: Preconditions
- `when`: Action taken
- `then`: Expected outcome
- `verification`: Specific checks to perform

---

## 4. File Naming and Location Conventions

### 4.1 File Naming

RIPP packet files **must** follow this naming convention:

```
<feature-identifier>.ripp.{yaml|json}
```

**Examples:**

- `user-authentication.ripp.yaml`
- `payment-processing.ripp.json`
- `multi-tenant-data-isolation.ripp.yaml`

### 4.2 File Location

RIPP packets **should** be stored in a discoverable location:

**Recommended:**

- `/ripp/` - Root level RIPP directory
- `/features/` - Alongside feature code
- `/specs/` - Centralized specifications directory

**Discouraged:**

- Scattered across unrelated directories
- Mixed with build artifacts or temporary files

### 4.3 Organization

For larger projects, organize by domain or module:

```
/ripp/
  auth/
    login.ripp.yaml
    registration.ripp.yaml
  billing/
    subscription.ripp.yaml
    invoice.ripp.yaml
```

---

## 5. Versioning and Compatibility

### 5.1 RIPP Specification Versioning

RIPP uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to required sections or validation rules
- **MINOR**: New optional sections or backward-compatible additions
- **PATCH**: Clarifications, documentation, non-normative updates

### 5.2 Packet Versioning

Individual RIPP packets are versioned through:

1. The `updated` field in metadata
2. Git commit history
3. Optional `version` field in metadata

### 5.3 Backward Compatibility

Within a MAJOR version:

- All existing valid packets remain valid
- Validators must accept packets with unknown optional fields
- New required sections trigger a MAJOR version bump

### 5.4 Migration

When RIPP spec versions change:

- **PATCH/MINOR**: No action required; packets remain valid
- **MAJOR**: Migration guide provided; validators may warn or fail on old packets

---

## 6. Validation

### 6.1 Schema Validation

All RIPP packets **must** validate against the JSON Schema:

- `schema/ripp-1.0.schema.json`

Use a JSON Schema validator to check conformance.

### 6.2 Structural Validation

Beyond schema, validators **should** check:

- File naming conventions
- Required sections for declared level
- Internal consistency (e.g., API schema_ref matches data_contracts)
- Uniqueness of IDs (packet_id, test_id, etc.)

### 6.3 Validation Tools

The official RIPP CLI provides:

```bash
ripp validate <file-or-directory>
```

Exit codes:

- `0`: All packets valid
- `1`: Validation failures found

---

## 7. Conformance

### 7.1 Level 1 Conformance

A RIPP packet is **Level 1 conformant** if it includes:

- Required metadata
- Purpose
- UX Flow
- Data Contracts

### 7.2 Level 2 Conformance

A RIPP packet is **Level 2 conformant** if it includes Level 1 plus:

- API Contracts
- Permissions
- Failure Modes

### 7.3 Level 3 Conformance

A RIPP packet is **Level 3 conformant** if it includes Level 2 plus:

- Audit Events
- Non-Functional Requirements (NFRs)
- Acceptance Tests

### 7.4 Custom Sections

RIPP packets **may** include additional custom sections beyond the specification. Validators **must** ignore unknown sections (forward compatibility).

---

## 8. Protocol Status

**v1.0 Stable**

The RIPP v1.0 specification is stable and ready for production use. Organizations may adopt RIPP with confidence that:

- No breaking changes will occur within v1.x
- Community feedback will be incorporated into future minor versions
- Migration paths will be provided for any future major versions

---

## 9. Design Principles

RIPP is guided by these principles:

1. **Explicit over implicit**: All requirements must be written down
2. **Reviewable before buildable**: Specs are reviewed before code
3. **Machine-readable, human-first**: Structure serves humans, not parsers
4. **Fail-safe defaults**: Encourage secure and resilient patterns
5. **Progressive disclosure**: Start simple (Level 1), add rigor as needed (Level 3)

---

## 10. Examples

See `/examples/` directory for complete, annotated RIPP packets demonstrating:

- Item creation feature (Level 3)
- Multi-tenant feature (Level 3)
- API-only feature (Level 2)

---

## 11. Tooling

Official tooling:

- **ripp-cli**: Validate RIPP packets against schema and conventions
- **GitHub Actions**: Automated validation in CI/CD

Community tooling:

- Contributions welcome! See CONTRIBUTING.md

---

## 12. Normative References

- **JSON Schema**: [https://json-schema.org](https://json-schema.org)
- **YAML 1.2**: [https://yaml.org](https://yaml.org)
- **Semantic Versioning**: [https://semver.org](https://semver.org)
- **ISO 8601**: Date and time format standard

---

## 13. Non-Normative Guidance

### When to Use RIPP

- **Always**: For features that touch permissions, payment, or PII
- **Usually**: For new APIs or significant UX changes
- **Sometimes**: For internal refactors or optimizations
- **Rarely**: For trivial bug fixes or documentation updates

### Workflow Integration

Typical RIPP workflow:

1. **Draft**: Author creates RIPP packet in `draft` status
2. **Review**: Team reviews packet, suggests changes
3. **Approve**: Packet status changes to `approved`
4. **Implement**: Code is written to fulfill the RIPP spec
5. **Validate**: Acceptance tests from RIPP are executed
6. **Complete**: Packet status changes to `implemented`

### RIPP and Agile

RIPP complements agile practices:

- **User stories**: High-level; RIPP adds technical depth
- **Acceptance criteria**: Captured in RIPP's acceptance_tests section
- **Definition of Done**: RIPP packet completion can be part of DoD

---

## Appendix A: Glossary

- **RIPP**: Regenerative Intent Prompting Protocol
- **Packet**: A single RIPP file describing one feature or API
- **Level**: Conformance tier (1, 2, or 3)
- **Regenerative**: Preserving and regenerating original intent throughout development
- **Intent Erosion**: The degradation of feature clarity during implementation

---

## Appendix B: Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-13  
**License**: MIT
