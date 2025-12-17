---
layout: default
title: 'RIPP Category and Positioning'
---

# RIPP Category and Positioning

This section clarifies RIPP's place in the software development ecosystem and helps new adopters understand what RIPP is, what it is not, and who should use it.

---

## Core Category Documents

### [Intent as Protocol](INTENT-AS-PROTOCOL.md)

**Why intent must be a first-class protocol artifact**

Explains the philosophy behind treating intent as infrastructure. Compares RIPP to state-based systems (IaC), policy-based systems, and prompt-based workflows. Defines what makes intent "executable."

**Read this to understand**: Why RIPP is a protocol, not just documentation.

---

### [What RIPP Is and Is Not](WHAT-RIPP-IS-AND-IS-NOT.md)

**Explicit boundaries and common misconceptions**

Comprehensive lists of what RIPP is (specification format, intent preservation protocol, contract) and what it is not (code generator, IaC tool, runtime enforcement engine). Addresses common misconceptions.

**Read this to understand**: RIPP's scope and limitations.

---

### [RIPP vs Existing Paradigms](RIPP-VS-EXISTING-PARADIGMS.md)

**How RIPP relates to IaC, GitOps, Policy-as-Code, and AI frameworks**

Side-by-side comparisons showing how RIPP complements—not replaces—Infrastructure-as-Code (Terraform), GitOps (ArgoCD), Policy-as-Code (OPA), and AI code generation tools. Includes workflow examples.

**Read this to understand**: Where RIPP fits in your existing stack.

---

### [Who RIPP Is For](WHO-RIPP-IS-FOR.md)

**Ideal adopters, use cases, and team readiness criteria**

Identifies specific audiences (AI-assisted teams, platform teams, compliance-driven orgs) and use cases. Includes "not for" guidance to prevent misuse. Provides team readiness criteria.

**Read this to understand**: Whether RIPP is right for your team.

---

## Quick Decision Guide

**Should you use RIPP?**

| You Should Use RIPP If                      | You Should NOT Use RIPP If            |
| ------------------------------------------- | ------------------------------------- |
| You need durable, structured specifications | You're building throwaway prototypes  |
| You're using AI to generate code            | You already have mature, stable specs |
| You're building APIs for other teams        | You're in pure research mode          |
| You operate in a regulated industry         | Your team resists all documentation   |
| You've experienced intent erosion           | You're in crisis/firefighting mode    |

---

## Common Questions

**Is RIPP an IaC tool like Terraform?**

No. RIPP documents intent; IaC provisions infrastructure. They coexist.

**Does RIPP replace GitOps?**

No. RIPP defines what to deploy and why; GitOps handles deployment.

**Is RIPP a code generator?**

No. RIPP is a specification format. Code generation is optional tooling.

**Does RIPP enforce policies at runtime?**

No. RIPP documents permissions; policy engines (OPA, etc.) enforce them.

**Who should NOT use RIPP?**

Teams building one-off scripts, throwaway prototypes, or operating in pure research mode.

---

## Summary

RIPP is an **intent specification protocol layer** that sits above implementation and deployment tools. It:

- **Complements** IaC, GitOps, Policy-as-Code, and AI code generation
- **Does NOT replace** any of these tools
- **Occupies** the "why" and "what" layer
- **Enables** other tools to execute, deploy, and enforce

**Key insight**: RIPP makes intent durable. Other tools make implementation operational.

---

## Next Steps

- **[Getting Started](../getting-started)** — Create your first RIPP packet
- **[RIPP Specification](../spec)** — Full protocol reference
- **[FAQ](../faq)** — Common questions and answers
- **[Design Philosophy](../../wiki/Design-Philosophy)** — Core principles and design decisions

---

**Remember**: RIPP is for teams who value clarity, durability, and rigor. If that's you, RIPP will help. If not, it won't.
