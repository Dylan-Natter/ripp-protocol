---
layout: default
title: 'What RIPP Is and Is Not'
---

# What RIPP Is and Is Not

**Category**: Protocol Boundaries and Positioning

---

## What RIPP™ Is

### Core Identity

✅ **A structured specification format**

- RIPP is a schema-defined format (YAML/JSON) for documenting feature requirements
- Validated against JSON Schema in CI/CD pipelines
- Human-readable, machine-validatable

✅ **An intent preservation protocol**

- Captures the "why," "what," and "how" of features in durable format
- Prevents intent erosion through structured documentation
- Versioned alongside code in Git

✅ **A contract between concept and implementation**

- Defines what a feature does before code is written
- Serves as the specification that implementations must satisfy
- Enables code review against an approved specification

✅ **A handoff artifact for prototype-to-production workflows**

- Bridges rapid prototyping and production-grade implementation
- Preserves learnings from prototypes without requiring code reuse
- Documents decisions, constraints, and outcomes

✅ **A review-first development framework**

- Enables spec review before code is written
- Catches security gaps, edge cases, and permission issues early
- Provides single source of truth for approval processes

✅ **Language and platform agnostic**

- Not tied to any programming language, framework, or cloud provider
- Same RIPP packet can guide implementations in Python, Go, JavaScript, etc.
- Focus on contracts, not implementation details

---

## What RIPP Is Not

### Clear Boundaries

❌ **Not a code generator**

- RIPP does not synthesize code from specifications
- RIPP is a specification format; code generation is optional tooling
- While tools MAY generate code from RIPP packets, this is not part of the core protocol
- RIPP preserves intent; humans or AI still write implementations

❌ **Not a refactoring or migration tool**

- RIPP does not transform prototype code into production code
- RIPP does not provide automated code modernization
- RIPP does not perform lift-and-shift operations between codebases
- RIPP documents desired state; refactoring is separate work

❌ **Not a runtime enforcement engine**

- RIPP does not execute policies at runtime
- RIPP does not validate requests or enforce permissions
- RIPP documents authorization rules; code or policy engines enforce them
- RIPP is specification, not execution

❌ **Not an Infrastructure-as-Code (IaC) tool**

- RIPP does not provision cloud resources
- RIPP does not manage deployment state
- RIPP documents intent; IaC tools (Terraform, CloudFormation) manage infrastructure
- RIPP and IaC coexist: RIPP captures "why," IaC declares "what"

❌ **Not a GitOps deployment system**

- RIPP does not orchestrate deployments
- RIPP does not reconcile desired vs actual state
- RIPP documents features; GitOps tools (ArgoCD, Flux) deploy them
- RIPP defines the contract; GitOps ensures it's running

❌ **Not a project management tool**

- RIPP does not track tasks, timelines, or assignments
- RIPP does not replace Jira, Linear, or GitHub Issues
- RIPP documents feature specifications, not project plans
- RIPP complements project management, not replaces it

❌ **Not a testing framework**

- RIPP does not execute tests or run assertions
- RIPP defines acceptance criteria; test frameworks (Jest, pytest) validate them
- RIPP's `acceptance_tests` section describes what to test, not how to run tests
- RIPP is specification; test code is implementation

❌ **Not a production hardening service**

- RIPP does not scan code for vulnerabilities
- RIPP does not inject security controls into existing code
- RIPP does not automatically make prototypes production-ready
- RIPP documents security requirements; engineers implement them

❌ **Not a prompt engineering framework**

- RIPP is not a tool for optimizing AI prompts
- RIPP is not a prompt template library
- RIPP provides the specification; prompts may reference it
- RIPP complements AI workflows; it doesn't manage prompts

---

## Common Misconceptions

### Misconception 1: "RIPP generates production code from prototypes"

**Reality**: RIPP is a specification format, not a code transformation tool. When transitioning from prototype to production:

- **RIPP captures**: The intent, contracts, and requirements learned from the prototype
- **Engineers implement**: Production code that satisfies the RIPP specification
- **Code may differ**: Different languages, architectures, frameworks—RIPP preserves intent, not code

**What RIPP actually does**: Documents what the feature should do. Engineers build it.

---

### Misconception 2: "RIPP replaces user stories"

**Reality**: RIPP complements user stories, not replaces them.

- **User stories**: Define the problem and business value ("As a user, I want...")
- **RIPP**: Adds implementation contracts, permissions, failure modes, and verification criteria
- **Together**: User story provides "why" and "for whom"; RIPP provides "how" and "under what conditions"

**Workflow**: Start with user story → Translate to RIPP packet → Implement to RIPP spec

---

### Misconception 3: "RIPP enforces permissions at runtime"

**Reality**: RIPP documents authorization rules; it does not enforce them.

- **RIPP's role**: Specifies "who can do what" in the `permissions` section
- **Code's role**: Implements permission checks (e.g., `if (user.hasRole('admin'))`)
- **Policy engines' role** (optional): Enforce policies at runtime (OPA, Cedar, etc.)

**RIPP is specification. Enforcement happens in code or policy engines.**

---

### Misconception 4: "RIPP is only for AI-generated code"

**Reality**: RIPP solves intent erosion for all development workflows.

- **For AI-assisted teams**: RIPP provides durable specs when prompts are ephemeral
- **For traditional teams**: RIPP prevents scattered requirements and undocumented assumptions
- **Key insight**: Intent erosion happens whether code is written by humans or AI

**RIPP is for anyone who wants to preserve the "why" alongside the "what."**

---

### Misconception 5: "RIPP requires Level 3 for everything"

**Reality**: RIPP has progressive conformance levels (1, 2, 3).

- **Level 1**: Simple features (30-60 minutes to write)
- **Level 2**: Production features (1-2 hours)
- **Level 3**: High-risk features (2-4 hours)

**Choose the level that matches your feature's risk.** Not everything needs audit events and NFRs.

---

### Misconception 6: "RIPP forces specific implementation choices"

**Reality**: RIPP is implementation-agnostic.

- **RIPP defines**: Data contracts, API endpoints, permissions, failure modes
- **RIPP does NOT define**: Which language, framework, database, or architecture to use
- **Example**: Same RIPP packet can guide:
  - A Python microservice with PostgreSQL
  - A Go monolith with SQLite
  - A Node.js serverless function with DynamoDB

**RIPP preserves contracts, not implementation details.**

---

## What RIPP Explicitly Does NOT Attempt

### Does NOT Attempt: Automated Production Deployment

RIPP packets describe features. They do not:

- Deploy code to production environments
- Manage infrastructure provisioning
- Reconcile running state with desired state
- Handle rollback or blue-green deployments

**Use GitOps tools for deployment orchestration. RIPP provides the specification.**

---

### Does NOT Attempt: Static Code Analysis or Vulnerability Scanning

RIPP packets document security requirements. They do not:

- Scan code for SQL injection or XSS vulnerabilities
- Analyze dependencies for known CVEs
- Perform static analysis or linting
- Inject security controls into existing code

**Use SAST/DAST tools for security scanning. RIPP documents security intent.**

---

### Does NOT Attempt: Real-Time Monitoring or Observability

RIPP defines what should be logged (audit events). It does not:

- Collect logs or metrics from running systems
- Provide dashboards or alerting
- Trace requests across services
- Analyze performance bottlenecks

**Use observability platforms (Datadog, New Relic) for monitoring. RIPP specifies what to log.**

---

### Does NOT Attempt: Replacing Architectural Documentation

RIPP documents individual features. It does not:

- Describe system-wide architecture (C4 diagrams, ADRs)
- Document cross-service communication patterns
- Define microservice boundaries
- Specify infrastructure topology

**RIPP complements architectural docs. Use ADRs and architecture diagrams for system-wide design.**

---

## When NOT to Use RIPP

RIPP is not suitable for all scenarios. **Do NOT use RIPP for**:

❌ **One-off scripts or throwaway prototypes**

- If the code will never reach production, RIPP is overhead
- RIPP is for durable features, not temporary experiments

❌ **Configuration-only changes**

- Changing a timeout value or feature flag doesn't need a RIPP packet
- RIPP is for behavioral changes, not config tweaks

❌ **Purely internal refactorings with no contract changes**

- If external behavior is identical, RIPP may not add value
- RIPP shines when contracts, permissions, or UX change

❌ **Emergency hotfixes**

- During production incidents, fix first, document later
- RIPP can be written retroactively to capture learnings

❌ **Projects that already have mature, stable specifications**

- If you have comprehensive ADRs, API docs, and test coverage, RIPP may be redundant
- RIPP is most valuable when specifications are scattered or missing

---

## When TO Use RIPP

RIPP is ideal for:

✅ **New features with unclear requirements**

- RIPP forces clarity before implementation

✅ **AI-assisted prototypes moving to production**

- RIPP bridges rapid iteration and production rigor

✅ **Features with security or compliance requirements**

- RIPP ensures permissions, audit, and failure modes are documented

✅ **APIs consumed by external teams or customers**

- RIPP provides a contract that consumers can rely on

✅ **High-risk features (payments, auth, PII, multi-tenant)**

- RIPP Level 3 captures audit events, NFRs, and edge cases

✅ **Onboarding new engineers**

- RIPP packets serve as authoritative feature documentation

---

## Summary: RIPP's Scope

| RIPP DOES                            | RIPP DOES NOT                     |
| ------------------------------------ | --------------------------------- |
| Document intent and contracts        | Generate code automatically       |
| Define permissions and failure modes | Enforce policies at runtime       |
| Validate schema conformance          | Deploy to production              |
| Serve as specification for review    | Replace architectural docs        |
| Preserve "why" alongside "what"      | Scan code for vulnerabilities     |
| Bridge prototype to production       | Manage project timelines          |
| Enable regeneration with confidence  | Force specific tech stack choices |

---

## Next Steps

- **[Intent as Protocol](INTENT-AS-PROTOCOL.md)** — Why RIPP exists and what problem it solves
- **[RIPP vs Existing Paradigms](RIPP-VS-EXISTING-PARADIGMS.md)** — Detailed comparisons to IaC, GitOps, Policy-as-Code
- **[Who RIPP Is For](WHO-RIPP-IS-FOR.md)** — Ideal use cases and team readiness

---

**Key Principle**: RIPP is a specification protocol, not an automation framework. It documents intent; humans and tools implement it.
