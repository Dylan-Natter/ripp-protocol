---
layout: default
title: 'Intent as Protocol'
---

# Intent as Protocol

**Category**: Protocol Design Philosophy

---

## Definition

**Intent as protocol** is the practice of treating intent—the "why" and "what" of a feature—as a first-class protocol artifact that is structured, versioned, and machine-validatable, rather than embedded in conversations, code comments, or tribal knowledge.

RIPP™ is a protocol for capturing and preserving intent in a durable, executable format that survives implementation, deployment, and maintenance.

---

## Why Intent Must Be a Protocol

### The Traditional Approach (Intent as Artifact)

In traditional software development, intent exists in various forms:

- User stories ("As a user, I want...")
- Product requirement documents (PRDs)
- Design documents
- Code comments
- Conversation logs (Slack, email, meetings)

**Problem**: These artifacts are disconnected from execution. They describe intent but provide no mechanism for:

- Machine validation
- Automated verification
- Version control alongside implementation
- Regeneration or refactoring with confidence

**Result**: Intent erodes. The "why" gets lost. Features ship with assumptions that were never documented.

---

### The RIPP Approach (Intent as Protocol)

RIPP treats intent as a **protocol specification**:

- **Structured**: Defined by a formal schema (JSON Schema)
- **Versioned**: Lives in Git alongside code
- **Validated**: Checked automatically in CI/CD
- **Executable**: Serves as the contract for implementation
- **Durable**: Survives code rewrites and platform migrations

**Key insight**: When intent is a protocol, it becomes infrastructure. You can't ship code without it, just like you can't ship without tests or builds.

---

## Why State, Policy, and Prompts Are Insufficient Alone

RIPP exists because other paradigms solve related but different problems:

### State-Based Systems (IaC, GitOps)

**What they solve**: "What is the desired state of infrastructure?"

**Example**: Terraform, Kubernetes manifests

**Strength**: Declarative resource definitions, idempotent deployments

**Limitation**: State describes "what exists," not "why it exists" or "who can use it"

```yaml
# IaC: Describes state
resource "aws_instance" "web" {
  instance_type = "t2.micro"
  # No intent: Why t2.micro? Who decided? What value does it provide?
}
```

**RIPP complements IaC**: RIPP captures the intent (why this instance size, for what workload, with what assumptions). IaC implements the state.

---

### Policy-Based Systems (Policy-as-Code)

**What they solve**: "Who can do what, under which conditions?"

**Example**: Open Policy Agent (OPA), AWS IAM policies

**Strength**: Runtime enforcement of authorization rules

**Limitation**: Policies enforce boundaries but don't capture the feature's purpose, UX flow, or data contracts

```rego
# Policy: Enforces rules
allow {
  input.user.role == "admin"
  input.action == "delete"
  # No intent: Why only admins? What are they deleting? What's the value?
}
```

**RIPP complements policy-as-code**: RIPP defines why the permission exists and what it protects. Policy engines enforce it at runtime.

---

### Prompt-Based Systems (AI Coding Assistants)

**What they solve**: "Generate code from natural language"

**Example**: GitHub Copilot, ChatGPT code generation

**Strength**: Rapid prototyping, code synthesis from descriptions

**Limitation**: Prompts are ephemeral. Intent exists only in the conversation log, not in a durable, versioned specification

```
# Prompt: Describes intent informally
"Build a user registration endpoint with email validation"
# No contract: What fields are required? What error codes? Who can register?
```

**RIPP complements prompt-based workflows**: RIPP provides the specification that makes AI-generated code production-ready. Prompt to prototype, RIPP to production.

---

## Why a Protocol, Not a Tool?

RIPP is a **protocol**, not a **tool** or **framework**.

### Protocol Characteristics

- **Specification-first**: Defines a contract (schema, validation rules)
- **Implementation-agnostic**: Works with any language, framework, or platform
- **Tooling-independent**: The protocol exists whether tools exist or not
- **Versioned and stable**: Breaking changes require new protocol versions

### Tool Characteristics

- **Implementation-specific**: Tied to a particular runtime or ecosystem
- **Opinionated**: Makes choices on behalf of users
- **Replaceable**: Tools come and go; protocols endure

**Why this matters**: RIPP packets are durable. Even if RIPP tooling disappears, the packets remain valid, human-readable YAML/JSON that preserves intent.

---

## Intent as Protocol in Practice

### Traditional Workflow (Intent Erosion)

```
Idea (in someone's head)
  ↓
User story (high-level, conversational)
  ↓
Code implementation (intent embedded in comments)
  ↓
Production deployment (original "why" lost)
  ↓
6 months later: "Why does it work this way?" (archaeology through Git/Slack)
```

**Result**: Intent erodes. The "why" is lost. Refactoring is risky.

---

### RIPP Workflow (Intent Preservation)

```
Idea (in someone's head)
  ↓
RIPP packet (structured, validated specification)
  ↓
Review and approval (intent explicit and reviewable)
  ↓
Code implementation (guided by RIPP contract)
  ↓
Production deployment (RIPP packet versioned alongside code)
  ↓
6 months later: Read the RIPP packet (intent is preserved)
```

**Result**: Intent is durable. The "why" and "how" are always available. Refactoring references the spec.

---

## What Makes Intent "Executable"?

RIPP packets are **executable** in the sense that they:

1. **Define contracts**: Data structures, API endpoints, permissions
2. **Enable validation**: Automated schema checks, conformance testing
3. **Guide implementation**: Developers build to the spec, not guesses
4. **Support regeneration**: Features can be rebuilt from the RIPP packet

**Executable does NOT mean**:

- Code generation (RIPP is a spec, not a code generator)
- Runtime enforcement (RIPP documents; code enforces)
- Automated implementation (humans or AI still write code)

**Executable DOES mean**:

- Machine-validatable (CI can check completeness)
- Implementation-verifiable (code can be compared to spec)
- Regeneration-safe (RIPP preserves enough detail to rebuild)

---

## Summary: Why Intent as Protocol Matters

| Without Intent as Protocol               | With RIPP (Intent as Protocol)        |
| ---------------------------------------- | ------------------------------------- |
| Intent scattered across docs and code    | Intent in one versioned specification |
| No machine validation of completeness    | Automated schema validation           |
| "Why" lost after 6 months                | "Why" preserved in RIPP packet        |
| Refactoring requires archaeology         | Refactoring references the RIPP spec  |
| Code review lacks authoritative spec     | Code review compares to approved RIPP |
| AI-generated code has no durable spec    | RIPP governs what AI is allowed to do |
| Prototypes ship without production rigor | RIPP bridges prototype to production  |

---

## Relationship to Other Paradigms

RIPP **coexists with** and **complements**:

- **Infrastructure as Code**: RIPP defines intent; IaC defines state
- **GitOps**: RIPP captures why; GitOps deploys what
- **Policy-as-Code**: RIPP documents permissions; policies enforce them
- **Prompt-as-Code**: RIPP provides the spec; prompts generate implementations

**RIPP is not a replacement. It's a layer above.**

---

## Next Steps

- **[What RIPP Is and Is Not](WHAT-RIPP-IS-AND-IS-NOT.md)** — Explicit boundaries and misconceptions
- **[RIPP vs Existing Paradigms](RIPP-VS-EXISTING-PARADIGMS.md)** — Detailed comparisons
- **[Who RIPP Is For](WHO-RIPP-IS-FOR.md)** — Ideal adopters and use cases

---

**Key Principle**: Intent is infrastructure. If you can't version it, validate it, and review it, it will erode.
