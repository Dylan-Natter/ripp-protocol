---
layout: default
title: 'Glossary'
---

## Glossary

Definitions of key terms used in the RIPP Protocol.

---

### RIPP

**Regenerative Intent Prompting Protocol**. An open standard for structured feature specifications that preserve intent from concept to production.

---

### RIPP Packet

A single YAML or JSON file that fully describes one feature, API, or system change according to the RIPP specification. Contains metadata, purpose, UX flow, data contracts, and optionally API contracts, permissions, failure modes, audit events, NFRs, and acceptance tests.

---

### Level (Conformance Level)

The degree of rigor and completeness in a RIPP packet:

- **Level 1**: Purpose, UX Flow, Data Contracts (minimum viable)
- **Level 2**: Level 1 + API Contracts, Permissions, Failure Modes (production-grade)
- **Level 3**: Level 2 + Audit Events, NFRs, Acceptance Tests (full rigor)

---

### Regenerative

The quality of preserving and regenerating original intent throughout the development lifecycle. RIPP is "regenerative" because it keeps the "why" alive alongside the "what" and "how," preventing intent erosion.

---

### Intent Erosion

The degradation of feature clarity during implementation. Occurs when requirements scatter across tickets, docs, and conversations, leading to undocumented assumptions and production surprises. RIPP solves this by making the specification the primary artifact.

---

### Purpose

A required RIPP section that describes why a feature exists. Includes:

- **problem**: What problem is being solved
- **solution**: How it's being solved
- **value**: What value is delivered

---

### UX Flow

A required RIPP section that documents the step-by-step user or system interaction flow. Each step includes an actor, action, and at least one of: trigger, result, or condition.

---

### Data Contracts

A required RIPP section that defines all data structures consumed (inputs) or produced (outputs) by the feature. Each contract includes entity name, fields, types, and descriptions.

---

### API Contracts

A Level 2+ section that specifies all API endpoints or service interfaces. Includes endpoint paths, HTTP methods, request/response formats, and error codes.

---

### Permissions

A Level 2+ section that defines authorization requirements. Documents who can perform which actions on which resources.

---

### Failure Modes

A Level 2+ section that documents what can go wrong and how the system should respond. Each failure mode includes scenario, impact, handling, and user message.

---

### Audit Events

A Level 3 section that specifies what events must be logged for compliance, debugging, and security monitoring. Includes event name, severity, included data fields, and purpose.

---

### NFRs (Non-Functional Requirements)

A Level 3 section that defines performance, scalability, availability, security, and compliance requirements. Examples: response time targets, uptime SLAs, encryption requirements.

---

### Acceptance Tests

A Level 3 section that describes how to verify the feature works correctly. Written in Given-When-Then format with specific verification steps.

---

### packet_id

A required metadata field. A unique identifier for the RIPP packet, typically in kebab-case (e.g., "user-authentication", "payment-processing").

---

### status

A required metadata field indicating the lifecycle stage of the feature:

- **draft**: Work in progress, not yet reviewed
- **approved**: Reviewed and ready for implementation
- **implemented**: Code is in production
- **deprecated**: Feature is being phased out

---

### ripp_version

A required metadata field indicating which version of the RIPP specification the packet conforms to. For v1.0, this must be the string "1.0".

---

### Spec-First

A development approach where the specification (RIPP packet) is written and reviewed before any code is written. Contrasts with "code-first" or "documentation-last" approaches.

---

### Schema Validation

The process of checking a RIPP packet against the JSON Schema to ensure structural correctness. Performed by the `ripp validate` CLI or JSON Schema validators.

---

### Conformance

The degree to which a RIPP packet adheres to the specification requirements for its declared level. A conformant packet includes all required sections and passes schema validation.

---

### Entity

A data structure defined in the data_contracts section. Has a name and a list of fields. Examples: "CreateItemRequest", "UserProfile", "OrderResponse".

---

### Field

A property of an entity in a data contract. Must specify name, type, whether it's required, and a description. May include additional validation rules (format, min, max, pattern).

---

### Actor

In a UX flow step, the person or system that performs an action. Examples: "User", "System", "Payment Service", "Admin".

---

### Trigger

In a UX flow step, what initiates the action. Example: "User clicks 'Submit' button".

---

### Result

In a UX flow step, what the actor sees or receives as an outcome. Example: "User sees success message".

---

### Condition

In a UX flow step, conditional logic that determines whether or how the step executes. Example: "If user is authenticated".

---

### schema_ref

A reference to an entity name defined in data_contracts. Used in API contracts to link request/response bodies to data structures. Example: `schema_ref: "CreateItemRequest"`.

---

### RBAC (Role-Based Access Control)

An authorization model where permissions are assigned to roles, and users are assigned roles. Commonly documented in the permissions section of Level 2+ RIPP packets.

---

### Tenant

In multi-tenant systems, an isolated customer or organization. Multi-tenant features require careful documentation of tenant isolation in permissions, failure modes, and audit events.

---

### Backward Compatibility

The property of a new version being compatible with the old version. Within RIPP v1.x, all existing valid packets remain valid. Breaking changes require a major version bump (v2.0).

---

### Progressive Disclosure

A design principle where simple use cases are simple, and complexity is added only when needed. RIPP embodies this: Level 1 is simple, Level 3 is comprehensive.

---

### Source of Truth

The authoritative reference for a feature's requirements. In RIPP workflows, the RIPP packet is the single source of truth, not tickets, emails, or tribal knowledge.

---

### Definition of Done

A checklist of criteria that must be met before a feature is considered complete. RIPP adoption often includes "RIPP packet approved and implemented" in the DoD.

---

### Semantic Versioning (SemVer)

A versioning scheme (MAJOR.MINOR.PATCH) used by the RIPP specification. MAJOR = breaking changes, MINOR = backward-compatible additions, PATCH = fixes.

---

### JSON Schema

A vocabulary for annotating and validating JSON documents. RIPP uses JSON Schema Draft 07 to define the structure of valid RIPP packets.

---

### YAML (YAML Ain't Markup Language)

A human-readable data serialization format. RIPP packets are commonly written in YAML (`.ripp.yaml`) for readability.

---

### Kebab-Case

A naming convention where words are lowercase and separated by hyphens. Example: "multi-tenant-feature". Required for packet_id in RIPP.

---

### ISO 8601

An international standard for date and time formats. RIPP requires ISO 8601 dates (YYYY-MM-DD) for `created` and `updated` fields.

---

### OpenAPI

A specification for describing REST APIs (formerly Swagger). RIPP's api_contracts section is similar but includes additional context like purpose, failure modes, and permissions.

---

### BDD (Behavior-Driven Development)

A development approach using Given-When-Then syntax for tests. RIPP's acceptance_tests section follows BDD format.

---

### CI/CD (Continuous Integration/Continuous Deployment)

Automated pipelines for building, testing, and deploying code. RIPP validation is typically integrated into CI to ensure all packets are valid before merging.

---

### PII (Personally Identifiable Information)

Data that can identify an individual (e.g., name, email, SSN). Features handling PII should use Level 3 RIPP packets with audit events and compliance NFRs.

---

### Fail-Safe

A design principle where systems default to a secure or safe state when errors occur. RIPP encourages fail-safe defaults in the failure_modes section.

---

### At-Least-Once Delivery

A messaging guarantee where a message is delivered one or more times, but may be duplicated. Relevant for webhook and event-driven features documented in RIPP.

---

### Exponential Backoff

A retry strategy where wait time increases exponentially between attempts. Commonly documented in failure_modes for network errors.

---

### Row-Level Security (RLS)

A database security feature that restricts which rows a user can access. Relevant for multi-tenant features documented in RIPP.

---

### Idempotency

The property where an operation can be safely repeated without changing the result. Important for API design, often documented in api_contracts.

---

### User Story

A high-level description of a software requirement from the user's perspective, typically in the format "As a [user], I want [feature] so that [value]." User stories focus on problem and value, while RIPP packets add implementation contracts, security, and verification. RIPP complements user stories by providing the specification layer needed for production delivery.

---

### Intent Preservation

The practice of maintaining the original purpose and reasoning for a feature throughout its lifecycle. RIPP preserves intent by capturing the "why" in the `purpose` section and versioning it with the code, preventing the degradation of clarity that occurs when requirements exist only in conversations or tickets.

---

### Executable Specification

A specification that is precise and structured enough to guide automated implementation or validation. RIPP packets are executable specifications—they're machine-readable, validatable, and can serve as contracts for AI-assisted code generation or automated testing.

---

### Spec-First Development

A development approach where the specification is written and reviewed before implementation begins. Contrast with "code-first" or "documentation-last" approaches. RIPP enables spec-first workflows by making specifications reviewable, validatable, and versioned artifacts.

---

### AI-Assisted Development

Software development where AI tools (like coding assistants or code generators) participate in creating implementations from natural language prompts or specifications. RIPP provides the governance layer for AI-assisted development by defining explicit contracts, permissions, and boundaries.

---

### Bounded Autonomy

The principle of allowing autonomous systems (including AI) to operate independently within explicitly defined constraints. RIPP enables bounded autonomy by specifying exactly what can be built, who can access it, what can go wrong, and how to verify correctness.

---

### Contract-Driven Development

A development methodology where interfaces, data structures, and behavior are defined as formal contracts before implementation. RIPP packets serve as contracts that both humans and AI systems can use to validate implementations.

---

**New terms?** [Open an issue](https://github.com/Dylan-Natter/ripp-protocol/issues) to request additions to this glossary.
