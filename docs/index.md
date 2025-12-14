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

**Build fast. Ship safely. Regenerate always.**

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
    </ul>
  </div>
</div>

---

## How RIPP Works

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

1. **RIPP is a specification format, not a project management tool.** It documents features, not timelines or assignments.

2. **A RIPP packet is reviewed before code is written.** The specification is the first artifact, not the last.

3. **RIPP preserves intent.** The "why" is captured alongside the "what" and versioned with the code.

4. **RIPP is progressive.** Level 1 is simple; Level 3 is comprehensive. Choose based on risk and complexity.

5. **RIPP is language agnostic.** It describes behavior, not implementation. Use any stack.

6. **RIPP makes failure modes explicit.** Teams think about edge cases and error handling before they ship.

7. **RIPP packets are validated automatically.** CI checks ensure specifications are complete and conformant.

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

---

## Open Standard

RIPP is MIT licensed. No vendor lock-in. No external dependencies. GitHub is the source of truth. All decisions are public. All contributions are welcome.

**[Read the Full Specification →]({{ '/spec' | relative_url }})**

**[View Examples →]({{ '/examples' | relative_url }})**

**[Understand RIPP Levels →]({{ '/ripp-levels' | relative_url }})**
