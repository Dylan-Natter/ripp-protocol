---
layout: default
title: 'RIPP - Regenerative Intent Prompting Protocol'
---

<div class="hero">
  <h1>Regenerative Intent Prompting Protocol</h1>
  <p>An open standard for structured feature specifications that preserve intent from concept to production.</p>
  <span class="status-badge">v1.0 Stable</span>
  <br>
  <a href="{{ '/getting-started' | relative_url }}" class="hero-cta">Get Started</a>
</div>

## RIPP in 60 Seconds

RIPP is a specification format for documenting features before you build them. A RIPP packet is a single YAML or JSON file that captures:

- **Why** the feature exists (Purpose)
- **How** users interact with it (UX Flow)
- **What** data it handles (Data Contracts)
- **What** can go wrong (Failure Modes)
- **How** to verify it works (Acceptance Tests)

Teams write RIPP packets first, review them, approve them, then build the feature. The specification becomes the source of truth, the documentation, and the validation checklist.

**RIPP is the production-grade, AI-executable evolution of the user story.**

In an era where AI can generate features from prompts, specifications must be precise enough to guide autonomous execution while remaining human-reviewable. RIPP fills the gap between "as a user, I want" and production-ready implementation.

**Build fast. Ship safely. Regenerate always.**

**New to RIPP?** Understand its category and position: **[What RIPP Is (and Is Not)]({{ '/category/WHAT-RIPP-IS-AND-IS-NOT' | relative_url }})** | **[RIPP vs IaC/GitOps/Policy-as-Code]({{ '/category/RIPP-VS-EXISTING-PARADIGMS' | relative_url }})** | **[Who Should Use RIPP]({{ '/category/WHO-RIPP-IS-FOR' | relative_url }})**

---

## Before RIPP vs After RIPP

<div class="comparison">
  <div class="comparison-column before">
    <h3>Before RIPP</h3>
    <ul>
      <li>Requirements scattered across tickets, docs, and Slack</li>
      <li>Security and edge cases discovered in code review</li>
      <li>No single source of truth</li>
      <li>Intent erodes during implementation</li>
      <li>Production issues reveal undocumented assumptions</li>
      <li>New engineers struggle to understand feature rationale</li>
      <li>AI-generated prototypes lack durable specifications</li>
      <li>User stories optimize for conversation, not execution</li>
    </ul>
  </div>
  <div class="comparison-column after">
    <h3>After RIPP</h3>
    <ul>
      <li>All requirements in one reviewable packet</li>
      <li>Security and edge cases defined upfront</li>
      <li>RIPP packet is the single source of truth</li>
      <li>Intent is preserved and versioned</li>
      <li>Failure modes documented before code is written</li>
      <li>Onboarding clarity through structured specs</li>
      <li>AI-assisted delivery governed by explicit contracts</li>
      <li>RIPP optimizes for delegation to autonomous systems</li>
    </ul>
  </div>
</div>

---

## The Evolution from User Story to RIPP

**User stories were revolutionary.** They transformed software development by making requirements conversational, collaborative, and customer-focused. "As a [user], I want [feature] so that [value]" became the lingua franca of Agile teams.

**But the world changed.**

AI coding assistants can now generate entire features from natural language prompts. Prototypes appear in minutes. The bottleneck is no longer writing code—it's preserving intent, defining boundaries, and ensuring what ships to production is safe, secure, and maintainable.

**User stories were designed for a human-paced world.** They excel at facilitating dialogue between product and engineering. But when machines participate in delivery, conversation alone isn't enough. You need contracts.

**This is where RIPP enters.**

RIPP doesn't replace user stories—it extends them. Where user stories capture "what" and "why," RIPP adds "how," "who can," "what if," and "how to verify." Where user stories optimize for discussion, RIPP optimizes for execution.

**The relationship:**

- **User stories** define the problem space and business value
- **RIPP packets** define the solution space and implementation contract
- **Together** they provide both alignment (user story) and rigor (RIPP)

**For AI-assisted teams:** RIPP provides the specification layer that prevents "fast prototype, slow production" disasters.  
**For traditional teams:** RIPP provides the clarity that prevents intent erosion and undocumented assumptions.

**The promise:** Build with the speed of AI, ship with the confidence of complete specifications.

## How RIPP Works

### Traditional RIPP Workflow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Concept   │─────▶│ RIPP Packet │─────▶│ Production  │
│             │      │  (Reviewed) │      │   Feature   │
└─────────────┘      └─────────────┘      └─────────────┘
     Idea              Specification         Implementation

                     Single source of truth
                     preserves original intent
```

1. **Draft**: Author creates a RIPP packet describing the feature
2. **Review**: Team reviews the packet, suggests changes
3. **Approve**: Packet status changes to "approved"
4. **Implement**: Code is written to fulfill the RIPP spec
5. **Validate**: Acceptance tests from RIPP are executed
6. **Ship**: Feature goes to production with full clarity

### Prototype-First Workflow

RIPP also supports starting with a rapid prototype and extracting the specification:

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

1. **Build rapid prototype**: Use AI or rapid tools to prove feasibility
2. **Extract RIPP**: Generate draft specification from code + stated intent
3. **Review and refine**: Fill gaps, resolve conflicts, answer open questions
4. **Approve**: RIPP packet becomes the authoritative contract
5. **Rebuild for production**: Implement guided by formal specification
6. **Ship**: With confidence that intent is preserved and complete

**Key insight**: Prototypes prove it CAN work. RIPP defines how it SHOULD work in production.

---

## Who RIPP Is For

<div class="feature-grid">
  <div class="feature-card">
    <h3>Concept Designers</h3>
    <p>Capture AI-generated ideas in structured format before they degrade</p>
  </div>
  <div class="feature-card">
    <h3>Engineers</h3>
    <p>Review specs before writing code; avoid rework from unclear requirements</p>
  </div>
  <div class="feature-card">
    <h3>Platform Teams</h3>
    <p>Enforce standards across features with automated validation</p>
  </div>
  <div class="feature-card">
    <h3>Executives</h3>
    <p>Verify alignment between idea and implementation without reading code</p>
  </div>
</div>

---

## 7 Canonical Statements About RIPP

1. **User stories optimize for conversation. RIPP optimizes for delegation.**  
   In an AI-assisted world, requirements must guide autonomous execution, not just human discussion.

2. **User stories describe what humans should discuss. RIPP defines what machines are allowed to build.**  
   The shift from collaborative exploration to bounded autonomy requires explicit, enforceable contracts.

3. **AI made code cheap. RIPP makes intent durable.**  
   Generating implementations is fast. Preserving why they exist and how they should behave is the new challenge.

4. **RIPP is not a replacement for user stories—it's their specification layer.**  
   User stories capture problem and value. RIPP adds contracts, permissions, failure modes, and verification.

5. **The best code review happens before the code exists.**  
   Reviewing a RIPP packet catches security gaps, edge cases, and design issues before implementation begins.

6. **Intent erosion is the silent killer of production systems.**  
   RIPP preserves the "why" alongside the "what" and "how," versioned with the code it governs.

7. **In an AI-assisted world, specifications are the new source code.**  
   If machines generate implementation, humans must govern intent. RIPP is that governance layer.

---

## One-Paragraph Boilerplate

**Regenerative Intent Prompting Protocol (RIPP)** is an open standard for capturing feature requirements as structured, machine-readable, human-reviewable specifications. RIPP packets are single YAML or JSON files that describe purpose, user flows, data contracts, API contracts, permissions, failure modes, and acceptance criteria. By making the specification the primary artifact, RIPP enables teams to review features before writing code, preserve original intent throughout development, and ship production systems with clarity and confidence. RIPP is open source, MIT licensed, and designed for AI-augmented workflows where ideas move fast but quality cannot degrade.

---

## What Makes RIPP Different?

**Not another documentation format.** RIPP is designed for the AI era. Ideas are generated in seconds. Prototypes appear in minutes. But turning prototypes into production requires rigor. RIPP bridges the gap.

**Structured, not freeform.** RIPP packets have required sections. You cannot skip failure modes or permissions. This forces teams to think critically before building.

**Validated automatically.** RIPP includes a JSON Schema and CLI tool. CI pipelines can validate every packet on every commit.

**Levels of rigor.** Simple features get Level 1 (Purpose, UX, Data). High-risk features get Level 3 (full audit, NFRs, acceptance tests). You choose.

---

## Get Started in 5 Minutes

1. Read the [Getting Started]({{ '/getting-started' | relative_url }}) guide
2. Copy the [template](https://github.com/Dylan-Natter/ripp-protocol/blob/main/templates/feature-packet.ripp.template.yaml)
3. Write your first RIPP packet
4. Validate it: `ripp validate your-feature.ripp.yaml`
5. Review, approve, build

**Working with prototypes?** See [From Prototype to Production: RIPP as an Intent Compiler]({{ '/prototype-to-production' | relative_url }})

---

## Open Standard

RIPP is MIT licensed. No vendor lock-in. No external dependencies. GitHub is the source of truth. All decisions are public. All contributions are welcome.

**[Read the Full Specification →]({{ '/spec' | relative_url }})**

**[View Examples →]({{ '/examples' | relative_url }})**

**[Understand RIPP Levels →]({{ '/ripp-levels' | relative_url }})**
