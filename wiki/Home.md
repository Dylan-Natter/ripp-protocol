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

## Core Principles

- **Intent is the source of truth** — Code is regenerable; intent must be preserved
- **GitHub-first and repo-native** — RIPP packets live in version control alongside code
- **Validation is always read-only** — Validators never modify source files
- **Scaffolding is always explicit** — Initialization requires deliberate human action
- **Humans own intent; automation executes it** — Tools serve the specification, not the other way around
- **Precise, not verbose** — RIPP documents decisions, not marketing fluff

## High-Level Workflow

```
1. Write RIPP Packet
   ↓
2. Review & Approve Specification
   ↓
3. Validate Against Schema
   ↓
4. Implement Code to Match RIPP
   ↓
5. Verify Against Acceptance Tests
   ↓
6. Ship with Confidence
```

**Alternative (Prototype-First):**

```
1. Build Prototype (AI-assisted or rapid dev)
   ↓
2. Extract Intent into RIPP Packet
   ↓
3. Review & Refine Specification
   ↓
4. Rebuild for Production Using RIPP
```

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
