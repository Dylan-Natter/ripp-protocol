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

RIPP's scope and boundaries must be clearly understood to prevent misuse and misinterpretation.

**RIPP is not a code migration tool:**

- RIPP does not transform prototype code into production code
- RIPP does not provide refactoring or modernization capabilities
- RIPP does not attempt lift-and-shift operations from Prototype Repos to production

**RIPP is not a code generator:**

- RIPP is a specification format, not a code generation framework
- While tools MAY generate code from RIPP packets, this is optional and not part of the core protocol
- RIPP does not prescribe implementation details or enforce specific architectures

**RIPP is not a refactoring assistant:**

- RIPP does not analyze existing code for improvement opportunities
- RIPP does not provide automated code transformation or modernization
- RIPP does not suggest architectural changes to existing systems

**RIPP is not a production hardening helper:**

- RIPP does not scan code for vulnerabilities
- RIPP does not inject security controls into existing code
- RIPP does not automatically make prototype code production-ready

**RIPP does not guarantee identical implementations:**

- Production implementations guided by RIPP may use different:
  - Programming languages
  - Frameworks and libraries
  - Architectures (microservices vs. monolith)
  - Databases and storage systems
  - Deployment platforms
- RIPP preserves intent and contracts, not implementation choices

**RIPP does not eliminate the need for engineering judgment:**

- RIPP provides structure and clarity, not automated decision-making
- Engineers must still make architectural choices
- Trade-offs between performance, cost, and complexity remain human decisions
- RIPP facilitates better decisions by making requirements explicit

**What RIPP actually is:**

- A specification format for capturing feature intent
- A handoff artifact between prototyping and production teams
- A contract that preserves decisions, constraints, and outcomes
- A bridge that enables discarding prototype code while retaining prototype learnings

**Scope boundaries:**

- RIPP documents features, not timelines or assignments (not a project management tool)
- RIPP complements, not replaces, architectural documentation
- RIPP is language and platform agnostic (not tied to any framework or stack)

### 1.3 Why RIPP Exists

Modern software development faces a critical problem: **intent erosion**. Ideas conceived with clear purpose and constraints often degrade during implementation as:

- Requirements scatter across tickets, docs, and conversations
- Security and edge cases are discovered too late
- Code review lacks a single source of truth
- Production issues reveal undocumented assumptions

RIPP solves this by making the feature specification the **primary artifact**. Teams write RIPP packets before writing code, creating a reviewable, versioned contract that survives implementation.

### 1.4 Why RIPP Exists: The Prototype Repo → Production Gap

Modern AI prototyping tools (such as GitHub Spark and similar platforms) have created a new class of artifact: the **Prototype Repo**—a repository containing functional but non-production-grade code.

**A Prototype Repo is:**

- A working application demonstrating core functionality
- Generated rapidly through AI-assisted prototyping tools
- Suitable for validation, demos, and early user feedback
- **NOT production-ready** due to missing security, scalability, compliance, and operational requirements

**The current state:**

- **Spark → Repo is a solved problem**: AI tools excel at rapid prototyping and repository export
- **Prototype Repo → Production is the hard problem**: Teams consistently get stuck at this transition point

**Why Prototype Repos create a false sense of readiness:**

Prototype code proves that a feature **can** be built. It does not prove that it **should** be shipped to production. Prototype Repos often lack:

- Production-grade security assumptions (authentication, authorization, input validation)
- Multi-tenancy and data isolation guarantees
- Audit trails and compliance logging
- Error handling and graceful degradation
- Performance and scalability architecture
- Operational monitoring and alerting
- Documentation of decisions and constraints

**Why most prototype code should NOT go to production:**

Production environments impose requirements that prototypes deliberately skip to maximize speed:

- Security boundaries must be explicit, not assumed
- Failure modes must be anticipated and handled
- Permissions must be enforced consistently
- Audit events must be captured for compliance
- Non-functional requirements (NFRs) must be met

Attempting to "harden" prototype code retroactively is expensive and error-prone. Security bolted on after the fact is rarely as robust as security designed in from the start.

**Why intent survives environment changes while code does not:**

Code is coupled to its environment:

- Prototype code assumes a single-user, trusted environment
- Production code must assume adversarial, multi-tenant, distributed environments
- Architectures that work in prototypes (monoliths, in-memory state) often fail at production scale
- Languages and frameworks chosen for prototyping speed may differ from production standards

**Intent is portable:**

- The purpose of a feature (what problem it solves, what value it delivers) remains constant
- The data contracts (what inputs are consumed, what outputs are produced) remain constant
- The user experience flow (how users interact with the feature) remains constant
- The permissions model (who can do what) can be formalized and preserved
- The failure modes (what can go wrong, how to handle it) can be documented and reused

**RIPP's definitive role:**

> **RIPP enables teams to discard prototype code without discarding the intent, constraints, and decisions that made the prototype successful.**

RIPP acts as the bridge between Prototype Repo and Production. It is:

- The **extraction** process: capturing what the prototype proves
- The **formalization** process: defining what production requires
- The **handoff artifact**: enabling production teams to rebuild with confidence

RIPP does NOT attempt to migrate code. RIPP preserves intent so production systems can be correctly rebuilt, reimplemented, or regenerated using proper production standards.

### 1.5 The Three Worlds of Modern Software Delivery

Understanding where RIPP fits requires distinguishing between three distinct environments in the modern software lifecycle:

#### World 1: Prototype World

**Environment:** AI prototyping tools (Spark, Bolt, v0, Replit, etc.)

**Primary goals:**

- Prove feasibility rapidly
- Validate user experience concepts
- Demonstrate core functionality
- Enable fast iteration on ideas

**Valid assumptions:**

- Single user or small trusted team
- No adversarial actors
- Ephemeral data (loss is acceptable)
- Direct access to all resources
- Failures are tolerable (just restart)

**Why code portability breaks down:**

- Security is often implicit or absent
- State management is simplified (in-memory, no persistence guarantees)
- Error handling is minimal (happy path only)
- Scalability is not considered
- Compliance and audit requirements are ignored

**Why intent portability does not:**

- The problem being solved is still valid
- The user value proposition remains constant
- The core data flows and transformations are reusable
- The UX patterns and interaction models can be preserved

#### World 2: Prototype Repo World

**Environment:** Shared GitHub repository exported from prototyping tool

**Primary goals:**

- Enable collaboration on the prototype
- Facilitate code review and feedback
- Provide a sharable demo environment
- Serve as proof of concept for stakeholders

**Valid assumptions:**

- Development environment only
- Trusted contributors
- Limited scale (tens of users, not thousands)
- Relaxed security posture
- Fast iteration over reliability

**Why code portability breaks down:**

- Hardcoded secrets and configuration
- Missing authentication and authorization layers
- No data isolation between users or tenants
- Lack of operational monitoring and logging
- Architecture may be monolithic or tightly coupled

**Why intent portability does not:**

- Feature purpose and value remain clear
- User flows and interaction patterns are observable
- Data contracts can be extracted and formalized
- Decisions about what the feature does (and doesn't do) are documented

#### World 3: Production World

**Environment:** Secure, scalable, compliant production infrastructure

**Primary goals:**

- Serve real users reliably
- Protect sensitive data
- Meet compliance requirements
- Scale to handle load
- Maintain uptime and performance SLAs

**Valid assumptions:**

- Adversarial environment (assume bad actors)
- Multi-tenant data isolation required
- Audit and compliance logging mandatory
- Failures must be graceful and recoverable
- Security must be defense-in-depth

**Why code portability breaks down:**

- Production code must be defensive (validate all inputs, handle all errors)
- Architecture must be distributed and stateless for scalability
- Observability and monitoring must be built-in
- Deployment and rollback procedures must be automated
- Dependencies must be vetted and updated for security

**Why intent portability does not:**

- The problem being solved is still the same
- The value delivered to users is still the same
- The data contracts (inputs, outputs, transformations) are still applicable
- The UX patterns can be reimplemented with production-grade infrastructure

#### Summary: The Three Worlds

| Dimension              | Prototype World       | Prototype Repo World     | Production World                    |
| ---------------------- | --------------------- | ------------------------ | ----------------------------------- |
| **Goal**               | Prove feasibility     | Collaborate on proof     | Serve real users reliably           |
| **Scale**              | Single user           | Small team               | Thousands to millions of users      |
| **Security Posture**   | Trusted environment   | Development only         | Adversarial, defense-in-depth       |
| **Data Sensitivity**   | Fake/test data        | Development data         | Real customer data, PII, secrets    |
| **Failure Tolerance**  | High (just restart)   | Medium (dev frustration) | Low (SLAs, uptime requirements)     |
| **Compliance**         | Not applicable        | Not applicable           | Mandatory (SOC 2, GDPR, HIPAA, etc) |
| **Code Reusability**   | Disposable            | Reference implementation | Must be rebuilt for production      |
| **Intent Reusability** | Core concept portable | Formalizable via RIPP    | Preserved through RIPP handoff      |
| **RIPP's Role**        | Not yet applicable    | Extraction source        | Implementation target               |

**Key insight:** Code portability degrades as you move from World 1 → World 2 → World 3. Intent portability, when captured through RIPP, remains constant.

### 1.6 The RIPP Bridge: Canonical Flow Diagram

The following diagram illustrates RIPP's role as the bridge between rapid prototyping and production deployment:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Modern Software Delivery Flow                    │
└─────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────┐
  │  Spark / AI Prototyping   │
  │       Tool                │
  │                           │
  │  • Rapid ideation         │
  │  • Prove feasibility      │
  │  • Core functionality     │
  └─────────────┬─────────────┘
                │
                │ (working code exported)
                ▼
  ┌───────────────────────────┐
  │    Prototype Repo         │
  │  (disposable code)        │
  │                           │
  │  • Functional demo        │
  │  • Early validation       │
  │  • NOT production-ready   │
  │  • Missing: security,     │
  │    scale, compliance      │
  └─────────────┬─────────────┘
                │
                │ (extract intent, not code)
                ▼
  ┌───────────────────────────┐
  │    RIPP Packet            │
  │  (intent contract)        │
  │                           │
  │  • Purpose & value        │
  │  • Data contracts         │
  │  • UX flows               │
  │  • Permissions            │
  │  • Failure modes          │
  │  • Audit requirements     │
  │  • NFRs                   │
  └─────────────┬─────────────┘
                │
                │ (specification for production build)
                ▼
  ┌───────────────────────────┐
  │    Production System      │
  │                           │
  │  ✓ Secure                 │
  │  ✓ Scalable               │
  │  ✓ Compliant              │
  │  ✓ Observable             │
  │  ✓ Resilient              │
  │  ✓ Maintainable           │
  │                           │
  │  MAY share no code with   │
  │  prototype                │
  │  MAY use different        │
  │  architecture             │
  │  MAY use different        │
  │  language/platform        │
  └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Key Principle: Intent is preserved. Code is optional.              │
└─────────────────────────────────────────────────────────────────────┘
```

**What crosses the bridge:**

- Problem definition and user value
- Data contracts (inputs, outputs, transformations)
- User experience patterns and flows
- Business rules and constraints
- Permission and authorization requirements
- Known failure modes and error scenarios

**What does NOT cross the bridge:**

- Prototype implementation code
- Simplified security assumptions
- Single-user or single-tenant architecture
- Hardcoded configuration or secrets
- Development-only tooling choices

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
