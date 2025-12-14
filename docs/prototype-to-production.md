---
layout: default
title: 'From Prototype to Production: RIPP as an Intent Compiler'
---

# Prototype Repo → Production is the Hard Problem

## Overview

Modern AI prototyping has fundamentally changed software delivery. Tools like GitHub Spark can transform ideas into working applications in minutes. This unprecedented speed has created a new software artifact: the **Prototype Repo**—a repository containing functional, demonstrable, but non-production-grade code.

**The current state of the industry:**

✅ **Spark → Repo is solved.** AI prototyping tools excel at rapid generation and repository export.

❌ **Prototype Repo → Production is the hard problem.** This is where teams consistently get stuck.

RIPP exists to solve this specific transition. It is the missing bridge between rapid prototyping and production-ready systems.

---

## The Prototype Repo Dilemma: You Have a Working Prototype. Now What?

**The scenario:**

You've built a prototype using an AI tool or rapid development environment. It works. Users like it. Stakeholders are impressed. The demo went well. Leadership wants it in production next quarter.

**The question:** How do you get from here to a production-ready system?

**The false assumption:** "It's already built. We just need to deploy it."

**The reality:** Prototype code and production code have fundamentally different requirements. What works in a prototype often cannot—and should not—go directly to production.

### Why This Is a Trap

Prototype Repos create a dangerous illusion of completeness:

- **It looks done** (functional UI, working API endpoints)
- **It feels done** (users can interact with it, data flows through the system)
- **But it's not production-ready** (security, scale, compliance, observability are missing or incomplete)

Teams face pressure to "just ship it" because the feature appears finished. This pressure leads to one of several failed approaches.

---

## Common Failed Approaches (And Why They Fail)

### Failed Approach 1: Hardening Prototype Code

**The plan:** Take the existing prototype code and add production features (auth, logging, error handling, tests).

**Why it fails:**

- **Security bolted on is weaker than security designed in**: Retrofitting auth and authorization is error-prone
- **Prototype assumptions are baked in**: Single-user, trusted environment assumptions permeate the codebase
- **Technical debt accumulates**: Each "quick fix" adds complexity without addressing root architectural issues
- **Scalability problems emerge late**: In-memory state, synchronous operations, and monolithic structure don't scale
- **Incomplete mental model**: Original author's intent exists only in prompt history, not durable documentation

**Typical outcome:** Production incidents, security vulnerabilities discovered post-launch, costly rewrites within 6-12 months.

### Failed Approach 2: Copying Code Into Production Repos

**The plan:** Copy prototype code into the production repository and refactor it to meet standards.

**Why it fails:**

- **Prototype patterns contaminate production**: Copy-paste spreads anti-patterns throughout the codebase
- **Different architectural requirements**: Production may require microservices, event-driven patterns, or distributed state
- **Framework and tooling mismatches**: Prototype may use different languages, libraries, or frameworks than production standards allow
- **Compliance violations**: Prototype code lacks audit trails, data retention policies, and regulatory controls
- **Maintenance burden**: Code that "works but is messy" becomes unmaintainable technical debt

**Typical outcome:** Code that passes initial review but becomes a maintenance nightmare. High defect rates. Difficulty onboarding new engineers.

### Failed Approach 3: Bolting Security On Later

**The plan:** Ship the prototype to production, then add security features incrementally as time allows.

**Why it fails:**

- **Security is not additive**: Permission models, input validation, and threat mitigation must be designed into the architecture
- **Attack surface is exposed immediately**: Unsecured endpoints, missing rate limiting, and weak authentication create vulnerabilities
- **Retrofit is expensive**: Adding auth to a system designed without it requires rewriting data access, API contracts, and frontend flows
- **Compliance risk**: Shipping without audit logging or data protection violates SOC 2, GDPR, HIPAA requirements
- **Incident response**: Security gaps discovered in production require emergency patches, not planned work

**Typical outcome:** Security incidents, compliance failures, expensive emergency remediation, loss of customer trust.

### Failed Approach 4: "We'll Rewrite It Later"

**The plan:** Ship the prototype code as-is, knowing it's not ideal, with the intention to rewrite it "when we have time."

**Why it fails:**

- **Rewrites rarely happen**: Production code accumulates dependencies, integrations, and tribal knowledge
- **Opportunity cost**: Engineering time goes to new features, not technical debt repayment
- **Intent is lost**: Six months later, no one remembers why the prototype worked the way it did
- **Risk aversion**: "Don't touch working code" mentality prevents improvement
- **Compounding problems**: Each new feature built on the prototype foundation amplifies the technical debt

**Typical outcome:** Prototype code becomes legacy code. Performance degrades. Maintenance becomes increasingly expensive. Eventually requires a complete rewrite under time pressure.

---

## Why These Approaches Fail Consistently

The root cause is the same across all failed approaches: **treating code as the primary artifact**.

Prototype code is evidence of feasibility. It is not a production implementation plan. Attempts to migrate, harden, or incrementally improve prototype code fail because they start from the wrong foundation.

**The insight:**

- **Prototypes prove that a problem CAN be solved**
- **Production systems must define HOW it SHOULD be solved at scale, securely, and reliably**

These are fundamentally different goals requiring different artifacts.

---

## RIPP as the Intentional Handoff Mechanism

RIPP solves the Prototype Repo → Production problem by changing the artifact that transitions between environments.

**Instead of:** "Here's the prototype code. Make it production-ready."

**RIPP enables:** "Here's the formal specification of what the prototype proves. Build production to this contract."

### RIPP as the Contract Between Prototyping and Production Teams

**What RIPP captures from the Prototype Repo:**

- **Purpose and value**: Why this feature exists, what problem it solves
- **Data contracts**: What inputs are consumed, what outputs are produced
- **UX flows**: How users interact with the feature
- **Observable behavior**: What the prototype demonstrates as working
- **Stated requirements**: What was intended (from prompts, README, design notes)

**What RIPP adds for Production:**

- **Permissions model**: Who can do what, under which conditions
- **Failure modes**: What can go wrong, how to handle it gracefully
- **Audit requirements**: What events must be logged for compliance
- **Non-functional requirements**: Performance, scalability, availability targets
- **Acceptance criteria**: How to verify the production implementation is correct

**What RIPP explicitly does NOT carry over:**

- Prototype implementation code (disposable)
- Simplified security assumptions (must be redesigned)
- Development-only tooling choices (production may differ)
- Single-user or single-tenant architecture (production requires multi-tenancy)
- Hardcoded secrets or configuration (production uses secure vaults)

### RIPP as the Artifact AI Agents and Engineers Can Safely Reason From

**For production engineers:**

RIPP provides a complete, reviewable specification that answers:

- What are we building and why?
- What are the data structures and API contracts?
- Who is allowed to access this feature?
- What can go wrong and how should we handle it?
- How do we verify correctness?

**For AI coding agents:**

RIPP provides structured, machine-readable context that enables:

- Accurate code generation aligned with requirements
- Consistent implementation of permissions and error handling
- Verification that generated code matches the specification
- Regeneration or refactoring without context loss

**For security and compliance reviewers:**

RIPP provides explicit documentation of:

- Authorization model and permission boundaries
- Audit events and logging requirements
- Failure modes and their impact
- Data handling and privacy considerations

### The RIPP Workflow: Prototype → Extract → Review → Rebuild

```
┌─────────────────────────────────────────────────────────────────────┐
│            RIPP: The Intentional Handoff Workflow                   │
└─────────────────────────────────────────────────────────────────────┘

  PHASE 1: RAPID PROTOTYPING (Spark / AI Tools)
  ┌──────────────────────────────┐
  │  Idea → Working Prototype    │
  │  (Functional, disposable)    │
  └──────────────┬───────────────┘
                 │
                 │ Export to Prototype Repo
                 ▼
  ┌──────────────────────────────┐
  │  Prototype Repo              │
  │  • Demonstrates feasibility  │
  │  • Early user validation     │
  │  • NOT production-ready      │
  └──────────────┬───────────────┘
                 │
                 │ Extract intent (not code)
                 ▼
  PHASE 2: RIPP EXTRACTION
  ┌──────────────────────────────┐
  │  RIPP Packet (Draft)         │
  │  • Extracted from prototype  │
  │  • Stated requirements added │
  │  • Gaps and conflicts flagged│
  └──────────────┬───────────────┘
                 │
                 │ Human review and approval
                 ▼
  PHASE 3: FORMALIZATION
  ┌──────────────────────────────┐
  │  RIPP Packet (Approved)      │
  │  • Complete specification    │
  │  • Production requirements   │
  │  • Reviewed and signed off   │
  └──────────────┬───────────────┘
                 │
                 │ Specification for production build
                 ▼
  PHASE 4: PRODUCTION IMPLEMENTATION
  ┌──────────────────────────────┐
  │  Production System           │
  │  ✓ Built to RIPP spec        │
  │  ✓ Secure, scalable          │
  │  ✓ Compliant, observable     │
  │  ✓ MAY share no code with    │
  │    prototype                 │
  └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  The Prototype Proves It CAN Work                                   │
│  The RIPP Packet Defines How It SHOULD Work in Production           │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principles:**

1. **Prototype code is disposable**: Its value is in proving feasibility, not in being reused
2. **Intent is the asset**: Decisions, constraints, and learnings are what carry forward
3. **Production is rebuilt, not migrated**: Implementation may differ completely from prototype
4. **RIPP is the bridge**: It preserves what matters (intent) without carrying over what doesn't (code)

### The Canonical RIPP Flow

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

---

## What RIPP Is NOT

To prevent misuse and misinterpretation, it's critical to understand what RIPP does NOT do:

**RIPP is not a code migration tool:**

- RIPP does not transform prototype code into production code
- RIPP does not provide lift-and-shift capabilities
- RIPP does not attempt to automatically migrate implementations

**RIPP is not a code generator:**

- RIPP is a specification format, not a code generation framework
- While tools MAY generate code from RIPP packets, this is optional and not part of the core protocol
- RIPP does not prescribe specific implementation details or architectures

**RIPP is not a refactoring assistant:**

- RIPP does not analyze code for improvement opportunities
- RIPP does not suggest architectural changes to existing systems
- RIPP does not provide automated code transformation

**RIPP is not a production hardening helper:**

- RIPP does not scan code for vulnerabilities
- RIPP does not inject security controls into existing code
- RIPP does not automatically make prototype code production-ready

**RIPP does not guarantee identical implementations:**

- Production implementations guided by RIPP may use completely different:
  - Programming languages (prototype in JavaScript, production in Go)
  - Frameworks and libraries (prototype in Next.js, production in Java Spring)
  - Architectures (prototype as monolith, production as microservices)
  - Databases and storage (prototype with SQLite, production with PostgreSQL)
  - Deployment platforms (prototype on Vercel, production on Kubernetes)

**RIPP does not eliminate the need for engineering judgment:**

- Engineers must still make architectural decisions
- Trade-offs between performance, cost, and complexity remain human choices
- RIPP facilitates better decisions by making requirements explicit, not by automating them

**What RIPP actually is:**

- A specification format that captures feature intent
- A handoff artifact between prototyping and production teams
- A contract that preserves decisions, constraints, and outcomes—not code
- A bridge that enables discarding prototype code while retaining prototype learnings

---

## RIPP Serves a Critical Role in Modern AI-Assisted Development

RIPP serves a critical role in modern AI-assisted development: transforming rapid prototypes into durable, production-grade specifications. This document explains how RIPP acts as an "intent compiler" that bridges the gap between fast prototyping and safe production deployment.

---

## The Prototype Problem

### Why Rapid Prototypes Are Incomplete

AI coding assistants have made prototyping nearly frictionless. Ideas become running code in minutes. A developer can describe a feature in natural language, and within moments, have a working demonstration.

**But prototypes are not production systems.**

A prototype proves feasibility. It demonstrates that an idea can work. What a prototype does NOT provide:

- **Durable intent**: The "why" behind decisions exists only in prompt history
- **Security boundaries**: Permissions and authorization are often omitted or simplified
- **Failure handling**: Edge cases are discovered reactively, not designed upfront
- **Verification criteria**: No formal definition of "done" or "correct"
- **Production readiness**: Missing audit trails, performance requirements, compliance needs

**The gap**: Prototypes answer "can we build this?" Production systems must answer "should we ship this, and how do we maintain it?"

### AI Accelerates Risk When Intent Is Underspecified

Speed without structure creates technical debt:

- Security vulnerabilities slip through because permissions weren't specified
- Edge cases cause production incidents because failure modes weren't documented
- Features become unmaintainable because the original intent was never captured
- Regeneration or modification requires re-prompting from scratch with context loss

**The paradox**: AI makes code cheap, but underspecified intent makes systems expensive to maintain.

---

## RIPP as the Intent Compiler

### What an Intent Compiler Does

An intent compiler transforms an informal, incomplete prototype into a formal, complete specification that can guide production implementation.

**Input**: Prototype code + stated requirements + usage notes  
**Process**: Extract, validate, reconcile, formalize  
**Output**: Production-grade RIPP Feature Packet

RIPP performs this transformation by:

1. **Extracting observable behavior** from prototype code
2. **Capturing stated intent** from inputs, prompts, and documentation
3. **Identifying gaps and conflicts** between what exists and what should exist
4. **Formalizing contracts** for data, APIs, permissions, and failure modes
5. **Generating a reviewable specification** that dev teams or AI can implement safely

### Why This Matters

**Traditional flow (high risk)**:

```
Idea → Prototype → "Looks good, ship it" → Production incidents
```

**RIPP flow (controlled)**:

```
Idea → Prototype → RIPP Extraction → Review → Production Implementation
         ↓                                         ↑
    Proves feasibility                    Guided by spec
```

The prototype proves it CAN be done. The RIPP packet defines HOW it SHOULD be done.

---

## The Two Distinct Stages of Modern Delivery

### Stage 1: Spark → Prototype Repo (Solved Problem)

This stage is now **frictionless** thanks to modern AI prototyping tools:

**Tools:** GitHub Spark, Bolt, v0, Replit, Cursor, Windsurf, etc.

**Process:**

1. Describe feature in natural language
2. AI generates working prototype code
3. Iterate rapidly based on visual feedback
4. Export to GitHub repository

**Duration:** Minutes to hours

**Output:** Prototype Repo containing:

- Working code demonstrating core functionality
- Basic README or usage notes
- Minimal configuration and dependencies

**This stage is NOT the problem.** AI prototyping tools have made rapid ideation and proof-of-concept development extremely efficient.

### Stage 2: Prototype Repo → Production (The Hard Problem)

This stage is where teams consistently get stuck:

**The challenge:** Prototype code proves feasibility but lacks production requirements.

**What's missing:**

- Security boundaries (authentication, authorization, input validation)
- Multi-tenancy and data isolation
- Audit trails and compliance logging
- Error handling and graceful degradation
- Performance and scalability architecture
- Operational monitoring and alerting
- Durable documentation of intent and decisions

**Why traditional approaches fail:**

- **Hardening prototype code** is expensive and error-prone (security retrofitting rarely works)
- **Copying code into production** spreads anti-patterns and technical debt
- **Bolting on security later** exposes vulnerabilities and violates compliance
- **Planning to "rewrite it later"** never happens (production code becomes legacy code)

**Duration without RIPP:** Weeks to months (often with production incidents)

**Duration with RIPP:** Days to weeks (with explicit contracts and reduced risk)

### Where RIPP Fits

RIPP is the bridge between these two stages:

```
┌──────────────────────┐         ┌──────────────────────┐
│  Stage 1: SOLVED     │         │  Stage 2: HARD       │
│  Spark → Repo        │         │  Repo → Production   │
│                      │         │                      │
│  AI Prototyping      │         │  RIPP Extraction     │
│  (Minutes to Hours)  │         │  + Production Build  │
│                      │         │  (Days to Weeks)     │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           │ Working prototype code         │ Formal specification
           │ (disposable)                   │ (durable intent)
           ▼                                ▼
     Prototype Repo     ─────RIPP────▶  Production System
```

**Key insight:**

- **Stage 1 outputs code** (which is disposable)
- **RIPP extracts intent** (which is durable)
- **Stage 2 rebuilds implementation** (using production standards)

**Production implementations may:**

- Share no code with the prototype (complete rewrite in different language)
- Use different architectures (microservices instead of monolith)
- Use different frameworks (production framework instead of prototype framework)
- Use different platforms (Kubernetes instead of Vercel)

**What remains constant across stages:**

- The problem being solved
- The value delivered to users
- The data contracts (inputs, outputs, transformations)
- The user experience patterns
- The business rules and constraints

---

## The Prototype → RIPP Extraction Workflow

### Standard 4-Step Process

```
┌────────────────────────────────────────────────────────────────────┐
│                    RIPP Prototype → Production Flow                │
└────────────────────────────────────────────────────────────────────┘

  STEP 1: BUILD PROTOTYPE
  ┌──────────────────┐
  │  AI Prompt or    │──→ ┌─────────────┐
  │  Rapid Dev       │    │ Working     │
  │                  │    │ Prototype   │
  │ • Core features  │    │             │
  │ • Quick & dirty  │    │ + README    │
  │ • Prove concept  │    │ + Notes     │
  └──────────────────┘    └─────────────┘
                                 ↓
  STEP 2: EXTRACT RIPP
                          ┌──────────────┐
                          │ RIPP         │
                          │ Extractor    │
                          │ (Conceptual) │
                          └──────────────┘
                                 ↓
                          ┌──────────────────────────┐
                          │ Draft RIPP Packet        │
                          │ • Extracted sections     │
                          │ • Evidence map           │
                          │ • Confidence ratings     │
                          │ • Open questions         │
                          └──────────────────────────┘
                                 ↓
  STEP 3: REVIEW & REFINE
                          ┌──────────────────────────┐
                          │ Human Review             │
                          │ • Validate extracted     │
                          │ • Resolve conflicts      │
                          │ • Fill gaps (perms, etc) │
                          │ • Answer open questions  │
                          └──────────────────────────┘
                                 ↓
                          ┌──────────────────────────┐
                          │ Approved RIPP Packet     │
                          │ status: "approved"       │
                          └──────────────────────────┘
                                 ↓
  STEP 4: PRODUCTION BUILD
                          ┌──────────────────────────┐
                          │ Production Implement     │
                          │ • Guided by RIPP         │
                          │ • Dev team or AI agent   │
                          │ • Validated against spec │
                          └──────────────────────────┘
                                 ↓
                          ┌──────────────────────────┐
                          │ Production-Ready Feature │
                          │ ✓ Intent preserved       │
                          │ ✓ Security defined       │
                          │ ✓ Failure modes handled  │
                          └──────────────────────────┘
```

#### Step 1: Build Rapid MVP / Micro App

Use AI assistants or rapid prototyping tools to create a working demonstration:

- Generate code from natural language prompts
- Focus on proving core functionality
- Skip edge cases, security, and production concerns (for now)
- Capture inputs: prompts, requirements, constraints, notes

**Output**: Working prototype code + stated requirements

#### Step 2: Run RIPP Extraction Process

Analyze the prototype to generate a RIPP packet:

- **Extract from code**: API endpoints, data structures, user flows
- **Extract from inputs**: Purpose, problem statement, intended value
- **Identify gaps**: Missing permissions, unhandled errors, unclear boundaries
- **Flag conflicts**: Where code behavior differs from stated intent
- **Generate draft**: RIPP packet with confidence levels and open questions

**Output**: Draft RIPP packet with evidence map and confidence annotations

#### Step 3: Review and Resolve Gaps

Human review and refinement:

- **Validate extracted behavior**: Does the RIPP accurately reflect the prototype?
- **Resolve conflicts**: Where code and intent disagree, which is correct?
- **Fill gaps**: Add missing permissions, failure modes, NFRs
- **Answer open questions**: Make explicit decisions about ambiguities
- **Approve**: Mark RIPP packet as ready for production implementation

**Output**: Approved RIPP packet

#### Step 4: Hand Off to Dev Teams or AI

Use the RIPP packet as the authoritative specification:

- **For dev teams**: Implement according to RIPP contracts
- **For AI agents**: Use RIPP as context for production code generation
- **Validation**: Compare implementation against RIPP acceptance tests
- **Confidence**: Ship knowing requirements are explicit and complete

**Output**: Production-ready implementation

---

## Optional Metadata for Prototype-Generated RIPP

When a RIPP packet is generated from a prototype, the following **optional** metadata fields may be included. These fields provide traceability and transparency but are NOT required for RIPP v1.0 conformance.

### `source_prototype`

Links the RIPP packet back to its prototype origin.

```yaml
source_prototype:
  repo_url: 'https://github.com/org/prototype-repo'
  commit_hash: 'a1b2c3d4e5f6'
  generation_date: '2025-12-14'
  tool_used: 'Spark'
  notes: 'Generated from rapid MVP built in 2 hours'
```

**Fields**:

- `repo_url`: Git repository where prototype code lives
- `commit_hash`: Specific commit representing the prototype state
- `generation_date`: When RIPP extraction occurred (ISO 8601)
- `tool_used`: Name of prototyping tool or AI assistant
- `notes`: Free-form context about prototype origin

### `evidence_map`

Maps each RIPP section to specific files, routes, or functions in the prototype code.

```yaml
evidence_map:
  purpose:
    source: 'stated'
    location: 'README.md, initial prompt'
  ux_flow:
    source: 'extracted'
    location: 'src/routes/profile.js, lines 45-89'
  api_contracts:
    source: 'extracted'
    location: 'src/api/users.js, src/api/auth.js'
  permissions:
    source: 'proposed'
    location: 'Not implemented in prototype'
    notes: 'Inferred from UX flow, needs validation'
  failure_modes:
    source: 'partial'
    location: 'Error handlers in src/middleware/errors.js'
    notes: 'Only covers database errors, missing validation errors'
```

**Per-section fields**:

- `source`: How this section was derived (stated | extracted | proposed | unknown)
- `location`: File paths, line numbers, or route names
- `notes`: Additional context or caveats

### `confidence`

Indicates how confident the extraction process is about each section.

```yaml
confidence:
  purpose: 'high'
  ux_flow: 'high'
  data_contracts: 'high'
  api_contracts: 'medium'
  permissions: 'low'
  failure_modes: 'medium'
  audit_events: 'unknown'
  nfrs: 'unknown'
```

**Levels**:

- `high`: Directly observable in code or explicitly stated
- `medium`: Inferred with reasonable certainty
- `low`: Proposed based on patterns, needs review
- `unknown`: Not present in prototype, requires specification

### `open_questions`

Captures unresolved decisions that must be addressed before production.

```yaml
open_questions:
  - question: 'Should users be able to update other users profiles in the same org?'
    section: 'permissions'
    impact: 'Affects authorization logic'
  - question: 'What happens if email update fails after profile save succeeds?'
    section: 'failure_modes'
    impact: 'Data consistency concern'
  - question: 'Do we need to log profile changes for compliance?'
    section: 'audit_events'
    impact: 'May be required for SOC 2'
```

**Per-question fields**:

- `question`: The unresolved decision
- `section`: Which RIPP section it affects
- `impact`: Why this matters

---

## Evidence and Trust Rules

To ensure teams trust RIPP packets generated from prototypes, strict rules govern what can be extracted and how conflicts are handled.

### Code Is Evidence of What EXISTS

- Prototype code shows what was built, not necessarily what SHOULD be built
- Extractors may document observed behavior (API signatures, data flows, error handlers)
- Extractors must NOT invent intent beyond what code demonstrates

### Inputs and Notes Define What SHOULD Exist

- Prompts, requirements, and documentation state intended behavior
- These may describe features not yet implemented in the prototype
- Stated intent takes precedence over code when they align
- When they conflict, conflicts must be flagged

### Conflict Handling

When code behavior and stated intent disagree:

1. **Do NOT silently choose one over the other**
2. **Flag the conflict explicitly** in `open_questions` or `evidence_map`
3. **Require human review** to resolve the discrepancy
4. **Document the decision** once resolved

**Example conflict**:

- Code: Allows any authenticated user to update any profile
- Stated intent: Users should only update their own profile
- **Resolution**: Flag as open question, require security review

### Never Silently Infer

The following must NEVER be invented or assumed by extraction tools:

- **Permissions and authorization rules**: Code may lack auth; don't guess what it should be
- **Multi-tenancy boundaries**: Tenant isolation must be explicit, never assumed
- **Audit and compliance requirements**: Logging needs must be stated, not inferred
- **Security constraints**: Encryption, validation, rate limiting must be specified

If these are missing from both code and inputs, they must be marked as `unknown` or `proposed`, never as `verified`.

### Verification Labels

Each RIPP section should be labeled with its source of truth:

- **VERIFIED**: Directly extracted from code and confirmed accurate
- **STATED**: Derived from explicit requirements, prompts, or documentation
- **PROPOSED**: Inferred from patterns or best practices, requires review
- **UNKNOWN**: Not present in prototype, must be specified before production

These labels appear in the `evidence_map` metadata.

---

## The RIPP Extractor Concept

### What It Is

A RIPP Extractor is a tool or process that generates draft RIPP packets from existing prototypes or code.

**Not yet fully implemented**, the RIPP Extractor is documented here as a conceptual component that future tooling may provide.

### What It Consumes

**Inputs**:

1. **Prototype code**: Source files, API definitions, database schemas
2. **Stated requirements**: Prompts, README files, design notes
3. **Runtime observations**: Logs, API calls, user interactions (optional)

### What It Produces

**Outputs**:

1. **Draft RIPP packet**: Generated RIPP file marked as `status: "draft"`
2. **Evidence map**: Links each section to its source (code, inputs, or proposed)
3. **Confidence ratings**: Indicates certainty about each section
4. **Open questions**: Flags conflicts, gaps, and unresolved decisions
5. **Validation report**: Lists required sections that need human input

### How It Works (Conceptual)

1. **Code analysis**: Parse source files to extract API contracts, data structures, flows
2. **Input parsing**: Extract purpose and value from README, prompts, or docs
3. **Reconciliation**: Compare code behavior with stated intent
4. **Gap identification**: Detect missing permissions, failure modes, NFRs
5. **Draft generation**: Output RIPP packet with metadata and confidence labels
6. **Human review required**: Flag for approval before use in production

### Integration with Existing Tooling

The RIPP Extractor would integrate with existing RIPP CLI commands:

```bash
# Generate draft RIPP from prototype (conceptual)
ripp extract --code ./src --input ./README.md --output feature.ripp.yaml

# Validate the generated draft
ripp validate feature.ripp.yaml

# Check for missing sections
ripp lint feature.ripp.yaml --strict
```

**Design principles**:

- Extractors are **read-only**: Never modify prototype code
- Extractors are **conservative**: When uncertain, mark as `proposed` or `unknown`
- Extractors are **transparent**: Provide evidence map showing how each section was derived
- Extractors require **human approval**: Generated packets are drafts, not authoritative

---

## Integration with RIPP Lifecycle

### Where Prototype Extraction Fits

```
Traditional RIPP workflow:
Concept → Draft RIPP → Review → Approve → Implement → Validate → Ship

Prototype-first workflow:
Concept → Prototype → Extract RIPP → Review → Approve → Rebuild for Production → Validate → Ship
            ↓                                                      ↑
       Proves feasibility                              Guided by formal spec
```

### Using RIPP with AI-Generated Prototypes

1. **Rapid ideation**: Prompt AI to build prototype
2. **Extract specification**: Run RIPP Extractor on prototype
3. **Review and refine**: Team reviews draft RIPP, fills gaps
4. **Approve RIPP**: Mark as approved specification
5. **Production implementation**: Use RIPP to guide production build (human or AI)
6. **Validation**: Verify implementation matches RIPP contracts
7. **Ship with confidence**: Intent is preserved, requirements are explicit

### Benefits

- **Preserves prototype speed**: Don't slow down ideation
- **Adds production rigor**: Formalize before deploying
- **Prevents intent loss**: Specification survives beyond prompt history
- **Enables safe regeneration**: RIPP packet can guide future iterations

---

## RIPP as the Next-Generation User Story

### The Evolution

**User stories revolutionized software development** by making requirements conversational. "As a [user], I want [feature] so that [value]" became the standard for capturing intent.

But user stories were designed for a human-paced world where requirements evolved through dialogue. In AI-assisted workflows, conversations happen in seconds, but the need for durable specifications remains.

**RIPP is the evolution, not the replacement.**

### What User Stories Provide

- High-level problem and value statement
- Conversational format for alignment
- Focus on user perspective and outcomes
- Lightweight and accessible to non-technical stakeholders

### What RIPP Adds

- Structured data and API contracts
- Explicit permissions and authorization model
- Documented failure modes and error handling
- Machine-readable format for validation
- Preserved intent that survives implementation

### The Relationship

| Dimension      | User Story                   | RIPP Packet                 |
| -------------- | ---------------------------- | --------------------------- |
| **Purpose**    | Facilitate discussion        | Guide execution             |
| **Audience**   | Product + Engineering        | Engineering + AI            |
| **Format**     | Natural language             | Structured YAML/JSON        |
| **Scope**      | What and why                 | How, who can, what if       |
| **Validation** | Manual review                | Automated schema validation |
| **Evolution**  | Changes through conversation | Versioned with code         |

### When to Use Both

1. Start with a **user story** to align on business value
2. Translate to a **RIPP packet** to define implementation contract
3. Review the RIPP packet before writing code
4. Reference the user story in RIPP's `purpose.references` field
5. Keep user story in your backlog tool (Jira, Linear, etc.)
6. Keep RIPP packet in version control with your code

**Example**:

```yaml
purpose:
  problem: 'Users cannot update their profile information after registration'
  solution: 'Provide a profile editing form with server-side validation'
  value: 'Improves user experience and data accuracy'
  references:
    - title: 'User Story US-4521: Profile Management'
      url: 'https://example.com/jira/US-4521'
```

### The AI-Assisted Shift

**Before RIPP**: AI generates code from prompts. Intent exists only in conversation history. Security and edge cases are discovered in production.

**With RIPP**: AI generates code from RIPP specifications. Intent is durable, reviewable, and versioned. Security and edge cases are defined before implementation.

**User stories** capture the problem space.  
**RIPP packets** define the solution space.  
**Together**, they enable AI-assisted delivery with human governance.

---

## Summary

### Key Takeaways

1. **Prototypes prove feasibility, RIPP enables production**
   - Prototypes answer "can we build this?"
   - RIPP answers "should we ship this, and how?"

2. **RIPP acts as an intent compiler**
   - Transforms informal prototypes into formal specifications
   - Extracts observable behavior, captures stated intent
   - Identifies gaps, flags conflicts, requires human review

3. **Extraction workflow is structured and repeatable**
   - Build prototype → Extract RIPP → Review → Implement for production
   - Optional metadata provides traceability and transparency

4. **Evidence and trust rules ensure safety**
   - Code is evidence of what exists
   - Inputs define what should exist
   - Conflicts must be flagged, never silently resolved
   - Permissions, tenancy, audit never silently inferred

5. **RIPP is the next-gen user story**
   - User stories facilitate conversation
   - RIPP facilitates execution
   - Together, they provide alignment and rigor

### RIPP's Role in AI-Assisted Development

**AI made code cheap. RIPP makes intent durable.**

In an era where features can be prototyped in minutes, the bottleneck is not writing code—it's preserving the "why," defining boundaries, and ensuring production safety.

RIPP bridges the gap between rapid prototyping and production-ready systems. It is the specification layer that makes AI-assisted delivery safe, governable, and maintainable.

---

**Build fast. Formalize completely. Ship safely.**
