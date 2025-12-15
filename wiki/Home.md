# RIPP™ Protocol Wiki

Welcome to the official documentation for the **Regenerative Intent Prompting Protocol (RIPP™)**.

## What is RIPP?

RIPP™ is a structured format for capturing feature requirements as machine-readable, human-reviewable specifications. A RIPP packet is a single YAML or JSON file that describes what a feature does, how it works, what can go wrong, and how to verify correctness—before any code is written.

RIPP solves **intent erosion**: the problem where clear ideas degrade into fragmented requirements, undocumented edge cases, and production surprises. By making the specification the primary artifact, RIPP enables teams to review, validate, and ship features with confidence.

## The Problem RIPP Solves

Modern software development faces a critical challenge:

- Requirements scatter across tickets, docs, and conversations
- Security and edge cases are discovered too late
- Code review lacks a single source of truth
- Production issues reveal undocumented assumptions
- AI-generated code ships without durable specifications

RIPP fixes this by making the feature specification the **primary artifact**—reviewable, versioned, and validated before code is written.

## Understanding RIPP's Category

**RIPP is an intent specification protocol layer**—not an IaC tool, not a policy engine, not a code generator. It complements existing tools by documenting the "why" and "what" that other systems execute and enforce.

**Category documentation** (in the main repository):

- **[Intent as Protocol](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/INTENT-AS-PROTOCOL.md)** — Why intent must be a first-class protocol artifact
- **[What RIPP Is and Is Not](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/WHAT-RIPP-IS-AND-IS-NOT.md)** — Explicit boundaries and common misconceptions
- **[RIPP vs Existing Paradigms](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/RIPP-VS-EXISTING-PARADIGMS.md)** — How RIPP relates to IaC, GitOps, Policy-as-Code, and AI
- **[Who RIPP Is For](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/WHO-RIPP-IS-FOR.md)** — Ideal adopters and use cases

## Core Principles

- **Intent is the source of truth** — Code is regenerable; intent must be preserved
- **GitHub-first and repo-native** — RIPP packets live in version control alongside code
- **Validation is always read-only** — Validators never modify source files
- **Scaffolding is always explicit** — Initialization requires deliberate human action
- **Humans own intent; automation executes it** — Tools serve the specification, not the other way around
- **Precise, not verbose** — RIPP documents decisions, not marketing fluff

<!-- // Added for clarity: AI's role in RIPP -->

<!-- // Added for clarity: Why RIPP Works Without AI -->

## Why RIPP Works Without AI

**RIPP is deterministic by default—AI is optional and additive.**

When a system's intent is already structurally encoded (through data models, UI components, workflows, and contracts), RIPP acts as an **intent compiler**, not an inference engine. It normalizes and packages declared structure into a standardized handoff format—no semantic interpretation required.

### How RIPP Generates Complete Handoffs Without AI

Real-world use has demonstrated that RIPP CLI can produce production-ready handoff packages without invoking AI when:

1. **Intent is structurally encoded**: Data models, UI components, and workflows explicitly declare behavior
2. **Contracts are already defined**: Type definitions, API schemas, and validation rules exist in code
3. **Structure is observable**: The prototype or system exposes its architecture through standard patterns

In this mode, RIPP operates as a **structure extractor and normalizer**:

- Reads declared types, routes, and components
- Maps them to RIPP's standardized schema
- Packages them into a reviewable, machine-readable specification

**No guessing. No inference. Just normalization of explicitly declared structure.**

### When AI Adds Value

AI becomes useful when:

- ❌ **Intent is implicit**: Requirements exist only in conversation logs or tribal knowledge
- ❌ **Intent is ambiguous**: Multiple interpretations are possible
- ❌ **Intent is lost**: Legacy systems with no documentation

In these cases, AI can **assist** (not decide) by:

- Proposing candidate specifications from incomplete information
- Identifying patterns in undocumented code
- Flagging inconsistencies for human review

**Key distinction**:

- **Deterministic extraction** (structure-driven): RIPP compiles what is already declared
- **AI-assisted recovery** (semantic inference): AI helps when intent must be reconstructed

## The Role of AI in RIPP

**AI functions as an interpreter, validator, and regenerator of intent—but is subordinate to human-authored specifications.**

### What AI Does in RIPP

- ✅ **Assists extraction**: AI can propose candidate specifications from prototype code and requirements
- ✅ **Validates implementations**: AI helps verify that code matches approved RIPP specifications
- ✅ **Regenerates code**: AI can generate implementation scaffolding from approved RIPP packets
- ✅ **Flags gaps**: AI identifies missing permissions, failure modes, or inconsistencies

### What AI Cannot Do

- ❌ **Invent intent**: AI cannot create authoritative specifications without human review and approval
- ❌ **Modify approved specs**: AI cannot change RIPP packets without explicit human direction
- ❌ **Make final decisions**: AI proposes; humans approve. Always.

**See [Design Philosophy: The Role of AI in RIPP](Design-Philosophy#the-role-of-ai-in-ripp) for complete details.**

**Mental model**: AI is a skilled analyst who drafts reports for your approval, not an autonomous decision-maker.

---

## High-Level Workflow

<!-- // Added for clarity: AI participation points and human approval handoffs -->

**Spec-First Workflow (Human-Authored Intent):**

```
1. Write RIPP Packet (Human)
   ↓
2. Review & Approve Specification (Human)
   ↓
3. Validate Against Schema (Automated)
   ↓
4. Implement Code to Match RIPP (Human or AI-Assisted)
   ↓
5. Verify Against Acceptance Tests (Automated)
   ↓
6. Ship with Confidence (Human Approval)
```

**Alternative: Prototype-First Workflow (AI-Assisted Intent Extraction):**

```
1. Build Prototype (Human or AI-Assisted)
   ↓
   [Proves feasibility, validates UX]
   ↓
2. Extract Intent into RIPP Packet (AI-Assisted)
   ↓
   [AI proposes specification from prototype + requirements]
   ↓
3. Review & Refine Specification (Human)
   ├─ Resolve conflicts flagged by AI
   ├─ Fill gaps (permissions, NFRs, audit)
   └─ Approve final specification
   ↓
4. Rebuild for Production Using RIPP (Human or AI-Assisted)
   └─ May discard prototype code entirely
```

**AI participation is explicit at these stages:**

- **Prototype building**: AI may generate rapid MVP code (human validates UX/feasibility)
- **Intent extraction**: AI proposes RIPP packet from code and requirements (human reviews and approves)
- **Code implementation**: AI may generate production code from approved RIPP (human validates and tests)
- **Validation**: AI verifies implementation matches RIPP specification (human reviews failures)

**Human approval handoff points** (AI cannot proceed without human sign-off):

- ✋ **Before RIPP approval**: Human must review and approve proposed specification
- ✋ **Before production deployment**: Human must approve implementation and test results
- ✋ **When conflicts arise**: AI flags issues; human makes final decision

**Key principle**: AI accelerates work. Humans maintain control and accountability.

## Quick Links

- **[Getting Started](Getting-Started)** — Install tooling and create your first RIPP packet
- **[CLI Reference](CLI-Reference)** — Complete command documentation
- **[RIPP Specification](RIPP-Specification)** — Protocol structure and requirements
- **[Validation Rules](Validation-Rules)** — What validation enforces and how to fix errors
- **[Core Concepts](Core-Concepts)** — Understanding regenerative intent and repo-native artifacts
- **[Schema Reference](Schema-Reference)** — Field-by-field schema documentation
- **[GitHub Integration](GitHub-Integration)** — Automated validation in CI/CD
- **[VS Code Extension](VS-Code-Extension)** — IDE integration and commands
- **[FAQ](FAQ)** — Common questions and answers
- **[Glossary](Glossary)** — Key term definitions

## RIPP in Three Sentences

1. RIPP is a specification format that captures feature intent, data contracts, UX flows, permissions, and failure modes in a single structured file.
2. It enables teams to review and validate requirements before writing code, preventing intent erosion and production surprises.
3. RIPP makes code regenerable by preserving the "why" and "how" alongside the "what."

## Where to Start

- **New to RIPP?** → Start with [Getting Started](Getting-Started)
- **Setting up CI/CD?** → See [GitHub Integration](GitHub-Integration)
- **Using the CLI?** → Check [CLI Reference](CLI-Reference)
- **Questions?** → Read the [FAQ](FAQ)
- **Contributing?** → See [Contributing to RIPP](Contributing-to-RIPP)

---

**RIPP™ is an open standard.** See [GOVERNANCE.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/GOVERNANCE.md) for protocol evolution details.
