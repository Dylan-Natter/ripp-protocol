# Design Philosophy

This page explains the principles and design decisions behind RIPP™.

<!-- // Added for clarity: The Role of AI in RIPP -->
## The Role of AI in RIPP

RIPP embraces AI as a powerful tool for interpreting, validating, and regenerating intent—but AI is **subordinate to human-authored intent**, never a decision authority.

### AI as Interpreter, Validator, and Regenerator

In the RIPP workflow, AI functions in three specific capacities:

1. **Interpreter**: AI assists in extracting structured intent from prototypes, natural language requirements, or existing code
2. **Validator**: AI helps verify that implementations match approved RIPP specifications
3. **Regenerator**: AI can regenerate implementations from RIPP packets when code needs to be rewritten

**Critical principle**: In all three roles, AI serves the specification. It does not invent, modify, or override human intent.

### Human Authority Over Intent

- **Intent is human-authored**: All purpose, permissions, failure modes, and acceptance criteria must be explicitly defined by humans
- **Intent is human-approved**: AI may propose candidate specifications, but humans must review and ratify before they become authoritative
- **Intent is immutable by AI**: AI tools cannot modify approved RIPP packets without explicit human direction

**Example workflow (AI-assisted intent extraction):**

```
1. AI analyzes prototype code and requirements
   ↓
2. AI proposes candidate RIPP packet
   ↓
3. Human reviews, corrects, and approves
   ↓
4. RIPP packet becomes authoritative
   ↓
5. Production implementation follows approved spec
```

**At no point does AI output become authoritative without human review.**

### What AI May Do

✅ **Permitted AI activities:**

- Extract observable behavior from prototype code (data flows, API patterns, UX interactions)
- Propose candidate intent based on stated requirements and code analysis
- Validate that code implementations match approved RIPP specifications
- Generate production code scaffolding from approved RIPP packets
- Identify gaps or inconsistencies in draft specifications
- Suggest failure modes based on code analysis (marked as "proposed")
- Flag security or permission issues for human review

### What AI Must Never Do

❌ **Prohibited AI activities:**

- Invent or modify intent without human approval
- Mark proposed content as "verified" or "authoritative"
- Silently resolve conflicts between requirements and code (must flag for human decision)
- Guess permissions, tenancy, or security boundaries (must mark as "unknown" or "proposed")
- Approve or merge RIPP packets into production workflows
- Override human decisions about feature scope or design
- Generate "final" specifications without human review and sign-off

### AI and the Intent Extraction Lifecycle Phase

When AI assists in intent extraction (see "Intent Extraction" section below), specific guardrails apply:

- **Read-only analysis**: AI reads code and requirements but never modifies source files
- **Conservative inference**: When uncertain, AI marks sections as "proposed" or "unknown" rather than guessing
- **Transparent sourcing**: AI indicates which parts come from code, requirements, or inference
- **Human-in-the-loop**: Every extracted specification requires explicit human review before production use

**Mental model**: Think of AI as a skilled analyst who drafts reports for your approval, not an autonomous agent making final decisions.

---

<!-- // Added for clarity: Intent Extraction Lifecycle Phase -->
## Intent Extraction (AI-Assisted, Human-Approved)

RIPP recognizes **Intent Extraction** as a formally named lifecycle phase, distinct from traditional spec-first workflows.

### What Is Intent Extraction?

**Intent Extraction** is the process of creating a formal RIPP specification from existing artifacts (prototypes, code, or legacy systems) rather than writing the specification before implementation.

**When to use Intent Extraction:**

- ✅ Prototype-first workflows: Rapid MVP built to prove feasibility, then formalized for production
- ✅ Legacy system documentation: Capturing intent from existing undocumented systems
- ✅ AI-generated prototypes: Extracting durable specifications from AI-created proof-of-concept code

**When NOT to use Intent Extraction:**

- ❌ New greenfield features (prefer spec-first workflow)
- ❌ High-security or compliance-critical features (require upfront specification)
- ❌ When prototype code quality is too poor to extract meaningful patterns

### The Intent Extraction Workflow

```
┌─────────────────────────────────────────────────────┐
│ Phase 1: Prototype                                  │
│ • Build rapid MVP (AI-assisted or manual)           │
│ • Prove core functionality works                    │
│ • Validate with early users                         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ Phase 2: Intent Extraction (AI-Assisted)            │
│ • AI analyzes prototype code + stated requirements  │
│ • AI proposes candidate RIPP packet                 │
│ • AI flags gaps, conflicts, and uncertainties       │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ Phase 3: Human Review and Approval                  │
│ • Human reviews proposed RIPP packet                │
│ • Human resolves flagged conflicts                  │
│ • Human fills gaps (permissions, audit, NFRs)       │
│ • Human approves specification                      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ Phase 4: Production Implementation                  │
│ • Build production system from approved RIPP        │
│ • May discard prototype code entirely               │
│ • May use different language/architecture           │
│ • Validate against RIPP acceptance tests            │
└─────────────────────────────────────────────────────┘
```

### AI's Role in Each Phase

| Phase                   | AI Participation                                     | Human Responsibility                    |
| ----------------------- | ---------------------------------------------------- | --------------------------------------- |
| **Prototype**           | Optional (AI may generate prototype code)            | Validate prototype meets user needs     |
| **Intent Extraction**   | AI proposes RIPP packet from code + requirements     | Review, correct, approve specification  |
| **Human Review**        | AI flags issues, suggests improvements               | Make final decisions, fill gaps         |
| **Production**          | AI may generate production code from approved RIPP   | Validate, test, deploy to production    |

### Guardrails for AI-Assisted Extraction

To ensure trust in extracted specifications:

1. **Code is evidence, not authority**: AI extracts what EXISTS in prototype, not what SHOULD exist in production
2. **Conflicts must be flagged**: Never silently choose between conflicting requirements and code behavior
3. **Never infer security**: Permissions, tenancy, and audit requirements must be marked "proposed" or "unknown" if not explicit
4. **Confidence levels**: AI indicates certainty (high/medium/low/unknown) for each extracted section
5. **Human approval required**: Extracted RIPP packets are always "draft" until human-approved

**Example: AI marks uncertain content**

```yaml
permissions: # CONFIDENCE: LOW (inferred from code, requires human review)
  - action: 'create:item'
    required_roles: ['unknown'] # AI: No explicit auth found in prototype
    description: 'PROPOSED: Prototype has no auth; production requirements unknown'
```

**Human must explicitly resolve before approval:**

```yaml
permissions: # CONFIDENCE: HIGH (human-reviewed and approved)
  - action: 'create:item'
    required_roles: ['authenticated_user']
    description: 'Any authenticated user can create items in their own workspace'
```

### Intent Extraction vs Spec-First: When to Use Each

| Workflow              | Best For                                                 | Trade-offs                               |
| --------------------- | -------------------------------------------------------- | ---------------------------------------- |
| **Spec-First**        | New features, high-security systems, compliance-critical | Slower to prototype, more upfront work   |
| **Intent Extraction** | Prototypes, legacy systems, AI-generated MVPs            | Requires careful review, risk of gaps    |

**Both workflows result in the same artifact**: An approved, human-reviewed RIPP packet that serves as the authoritative specification.

---

<!-- // Added for clarity: Conceptual Mental Model -->
## Mental Model: The Intent → Code → AI Triangle

Understanding the relationship between intent, code, and AI is critical to using RIPP effectively.

```
         INTENT (Human-Owned)
              ▲
              │
              │ Preserves "why" and "what"
              │ Survives rewrites
              │ Authoritative
              │
      ┌───────┴───────┐
      │               │
      │               │
  Guides         Extracts from
  (spec-first)   (prototype-first)
      │               │
      │               │
      ▼               ▼
    CODE ◄─────────► AI
  (Ephemeral)    (Assistant)

  Implements      Proposes,
  intent          validates,
                  regenerates
```

**Key relationships:**

1. **Intent → Code**: Approved RIPP specification guides implementation (spec-first workflow)
2. **Code → Intent**: AI extracts candidate specification from prototype (intent extraction workflow)
3. **Intent → AI → Code**: AI regenerates implementation from approved specification (regeneration workflow)
4. **Code ← AI**: AI validates implementation matches approved intent (validation workflow)

**Core principle**: Intent is the stable, durable artifact. Code and AI are tools that serve intent, not replace it.

**What this means in practice:**

- Code can be rewritten in different languages; intent remains constant
- AI models can be swapped; intent remains constant
- Architectures can change (monolith → microservices); intent remains constant
- Frameworks can be upgraded; intent remains constant

**Only intent is authoritative. Everything else is regenerable.**

---

## Why RIPP Is Intentionally Minimal

RIPP is designed to be **just enough structure, no more**.

### Minimal Required Fields

RIPP Level 1 requires only:

- Metadata (id, title, dates, status, level)
- Purpose (problem, solution, value)
- UX Flow (actors and actions)
- Data Contracts (inputs/outputs)

**Why minimal matters:**

- ✅ **Low barrier to entry** — Can write a Level 1 packet in 30-60 minutes
- ✅ **Progressive disclosure** — Start simple (Level 1), add rigor as needed (Level 2, 3)
- ✅ **Focus on intent** — No extraneous fields that dilute focus
- ❌ **Not verbose** — No redundant or ceremonial sections

### What RIPP Does Not Require

| Common in other specs  | Required in RIPP? | Why not?                           |
| ---------------------- | ----------------- | ---------------------------------- |
| Authors / Contributors | ❌ No             | Git history tracks this            |
| Change log             | ❌ No             | Git commit messages track this     |
| Approval signatures    | ❌ No             | PR approval process tracks this    |
| Implementation details | ❌ No             | Code is separate from intent       |
| Project timelines      | ❌ No             | RIPP is a spec, not a project plan |

**Philosophy:** If Git, GitHub, or code already tracks it, RIPP doesn't duplicate it.

---

## Why Auto-Fix Is Avoided

RIPP validators **never** automatically fix errors.

### The Problem with Auto-Fix

**Example: Missing required field**

```yaml
# Invalid RIPP packet
purpose:
  problem: 'Users cannot do X'
  # Missing: solution, value
```

**Bad auto-fix approach:**

```yaml
# Auto-fixed (syntactically valid, semantically useless)
purpose:
  problem: 'Users cannot do X'
  solution: 'TODO' # Validator guessed
  value: 'TODO' # Validator guessed
```

**Result:**

- ✅ Packet is now valid (passes schema validation)
- ❌ Packet is useless (no actual solution or value defined)
- ❌ Intent is unclear
- ❌ Team might approve it thinking it's complete

### RIPP's Approach

**Validator output:**

```
✗ my-feature.ripp.yaml
  • /purpose: must have required property 'solution'
  • /purpose: must have required property 'value'

✗ 1 of 1 RIPP packets failed validation.
```

**Human fixes it:**

```yaml
purpose:
  problem: 'Users cannot do X'
  solution: 'Provide feature Y that enables users to do X directly'
  value: 'Saves time, reduces errors, improves user satisfaction'
```

**Result:**

- ✅ Packet is valid
- ✅ Packet is meaningful
- ✅ Intent is clear
- ✅ Human reviewed and approved

---

### Why This Matters

| Approach      | Outcome                                        |
| ------------- | ---------------------------------------------- |
| **Auto-fix**  | Syntactically valid, semantically questionable |
| **Human fix** | Syntactically valid, semantically correct      |

**RIPP principle:** Validators report problems. Humans solve them deliberately.

---

## Human Intent as the Control Plane

RIPP's core philosophy: **Humans own intent. Automation executes it.**

### Division of Responsibilities

| Responsibility                        | Owner    |
| ------------------------------------- | -------- |
| Define what the feature does          | Human    |
| Specify who can use it                | Human    |
| Document what can go wrong            | Human    |
| Decide when it's ready for production | Human    |
| **Validate schema conformance**       | **Tool** |
| **Check best practices**              | **Tool** |
| **Enforce CI/CD gates**               | **Tool** |
| **Package for handoff**               | **Tool** |

### What This Prevents

- ❌ AI "guessing" what a feature should do
- ❌ Tools inventing intent from incomplete specifications
- ❌ Auto-generated specs with placeholder TODOs
- ❌ Features approved without human review

### What This Enables

- ✅ Clear accountability (humans own decisions)
- ✅ Reviewable specifications (before code is written)
- ✅ Durable documentation (intent survives rewrites)
- ✅ Confidence in production (specs reflect real intent)

---

## Comparison to Traditional Policy-as-Code Tools

RIPP is **not** a policy-as-code tool. Here's how it differs:

### Policy-as-Code (e.g., Open Policy Agent, Cedar)

**Purpose:** Enforce runtime authorization and access control.

**Characteristics:**

- Defines "who can do what" at runtime
- Evaluated by policy engine during requests
- Focused on enforcement, not specification

**Example:**

```rego
# OPA policy
allow {
  input.user.role == "admin"
  input.action == "delete"
}
```

---

### RIPP

**Purpose:** Capture feature intent as a reviewable specification.

**Characteristics:**

- Defines "what the feature does and why"
- Reviewed before code is written
- Focused on specification, not enforcement

**Example:**

```yaml
# RIPP packet
permissions:
  - action: 'delete:item'
    required_roles: ['admin']
    description: 'Only admins can delete items'
```

---

### Key Differences

| Dimension        | Policy-as-Code                         | RIPP                                          |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| **Purpose**      | Runtime enforcement                    | Specification and documentation               |
| **Evaluated by** | Policy engine (OPA, Cedar, etc.)       | Humans (review) and validators (schema)       |
| **When used**    | During request execution               | Before and during development                 |
| **Format**       | Domain-specific language (Rego, Cedar) | YAML/JSON (human-readable)                    |
| **Scope**        | Authorization and access control       | Full feature specification                    |
| **Enforcement**  | Blocks unauthorized actions            | Prevents incomplete specs from being approved |

---

### Can RIPP and Policy-as-Code Coexist?

**Yes.** They serve different purposes:

1. **RIPP** defines the intent: "Admins can delete items."
2. **Code** implements it: `if (user.role === 'admin') { deleteItem(); }`
3. **Policy-as-Code** enforces it: `allow { input.user.role == "admin" }`

**Workflow:**

```
RIPP packet (specification)
   ↓
Code implementation
   ↓
Policy-as-code (runtime enforcement)
```

**RIPP specifies. Code implements. Policy enforces.**

---

## Why RIPP Is GitHub-First

RIPP is designed for **Git-based workflows**, not external tools.

### What "GitHub-First" Means

- ✅ RIPP packets live in Git repositories
- ✅ They are versioned alongside code
- ✅ They are reviewed in pull requests
- ✅ They are validated in CI/CD
- ❌ No separate documentation tool (Confluence, Notion, etc.)
- ❌ No external ticket system (Jira, Asana, etc.)

### Benefits

| Benefit                    | Explanation                         |
| -------------------------- | ----------------------------------- |
| **Single source of truth** | Specs and code are in the same repo |
| **Version control**        | RIPP packets are versioned with Git |
| **Review workflow**        | Same PR process as code             |
| **CI/CD integration**      | Automated validation on every PR    |
| **Accessibility**          | No separate login or tool required  |

### Example Workflow

```
1. Developer creates RIPP packet in Git
   ↓
2. Developer opens pull request
   ↓
3. GitHub Action validates RIPP packet
   ↓
4. Team reviews specification in PR
   ↓
5. PR approved and merged
   ↓
6. Implementation begins
```

**No external tools. No context switching. One workflow.**

---

## Why Validation Is Read-Only

RIPP validators **never modify source files**. This is a deliberate design choice.

### Philosophy

- **Humans own intent** — Only humans can decide what a feature should do
- **Tools validate intent** — Tools check correctness and completeness
- **No surprises** — Validation never changes files unexpectedly

### What This Prevents

| Anti-Pattern                      | Risk                                      |
| --------------------------------- | ----------------------------------------- |
| **Auto-fix errors**               | Introduces semantically incorrect "fixes" |
| **Normalize formatting**          | Overwrites human-chosen structure         |
| **Remove "unnecessary" sections** | Deletes context humans intended to keep   |
| **Inject defaults**               | Adds fields humans didn't approve         |

### RIPP's Approach

```bash
# Validation never modifies files
ripp validate my-feature.ripp.yaml

# Linting never modifies files
ripp lint my-feature.ripp.yaml

# Packaging creates new file, never modifies source
ripp package --in source.ripp.yaml --out packaged.md
```

**Result:** You can trust validation. It reports issues but never changes your work.

---

## Why Scaffolding Is Explicit

RIPP never initializes automatically. Initialization requires deliberate human action.

### What This Means

```bash
# Explicit initialization (human must run this)
ripp init
```

**This does NOT happen automatically:**

- ❌ When installing `ripp-cli`
- ❌ When running `ripp validate`
- ❌ As a side effect of any command

### Why This Matters

- **Consent** — Humans decide when to adopt RIPP
- **Control** — Humans control where files are created
- **Clarity** — No hidden side effects or surprises

### Contrast with Other Tools

| Tool       | Behavior                     | RIPP's Approach       |
| ---------- | ---------------------------- | --------------------- |
| **npm**    | Auto-creates `node_modules/` | Explicit: `ripp init` |
| **Git**    | `git init` creates `.git/`   | Explicit: `ripp init` |
| **eslint** | `--init` prompts for config  | Explicit: `ripp init` |

**Philosophy:** Humans choose when to adopt. Tools don't assume.

---

## Why RIPP Levels Exist

RIPP has three conformance levels (1, 2, 3) to balance simplicity and rigor.

### Progressive Disclosure

| Level       | Sections Required                         | Time to Write | Use For                     |
| ----------- | ----------------------------------------- | ------------- | --------------------------- |
| **Level 1** | Purpose, UX Flow, Data Contracts          | 30-60 min     | Simple features, prototypes |
| **Level 2** | Level 1 + API, Permissions, Failure Modes | 1-2 hours     | Production features         |
| **Level 3** | Level 2 + Audit, NFRs, Tests              | 2-4 hours     | High-risk features          |

### Why Not One Level?

**Problem:** If RIPP required Level 3 for everything:

- ❌ Too much overhead for simple features
- ❌ Teams would skip RIPP entirely
- ❌ Barrier to adoption too high

**Problem:** If RIPP only had Level 1:

- ❌ Insufficient for production features
- ❌ No guidance on permissions or failure modes
- ❌ High-risk features underdocumented

**Solution:** Three levels. Teams choose based on risk.

---

## Why RIPP Separates Intent from Implementation

RIPP documents **what** should happen, not **how** it's coded.

### Example

**RIPP (Intent):**

```yaml
purpose:
  problem: 'Users cannot create items without admin access'
  solution: 'Allow editors to create items with validation'
  value: 'Enables self-service, reduces admin workload'
```

**Code (Implementation):**

```python
@app.route('/items', methods=['POST'])
@require_auth(['editor', 'admin'])
def create_item():
    validate_input(request.json)
    item = Item.create(request.json)
    return jsonify(item), 201
```

### Why Separate?

| Dimension           | Intent (RIPP)          | Implementation (Code)  |
| ------------------- | ---------------------- | ---------------------- |
| **Durability**      | Survives rewrites      | Gets rewritten         |
| **Portability**     | Language-agnostic      | Language-specific      |
| **Reviewability**   | Reviewed before coding | Reviewed during coding |
| **Source of truth** | RIPP packet            | Code must match RIPP   |

**Key insight:** Code is ephemeral. Intent is durable.

---

## Summary: Design Principles

| Principle                    | Rationale                                     |
| ---------------------------- | --------------------------------------------- |
| **Minimal required fields**  | Low barrier to entry, progressive disclosure  |
| **No auto-fix**              | Humans fix deliberately, no semantic guessing |
| **Human intent as control**  | Humans own decisions, tools execute           |
| **GitHub-first**             | Single source of truth, no external tools     |
| **Read-only validation**     | No surprises, no file modifications           |
| **Explicit scaffolding**     | Consent and control, no hidden side effects   |
| **Three levels**             | Balance simplicity and rigor                  |
| **Intent vs implementation** | Intent is durable, code is ephemeral          |

**Philosophy:** RIPP serves humans. Humans own intent. No surprises.

---

## Category and Positioning

For a deeper understanding of RIPP's position in the software development ecosystem:

- **[Intent as Protocol](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/INTENT-AS-PROTOCOL.md)** — Why intent must be a protocol, not just documentation
- **[What RIPP Is and Is Not](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/WHAT-RIPP-IS-AND-IS-NOT.md)** — Clear boundaries and misconceptions
- **[RIPP vs Existing Paradigms](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/RIPP-VS-EXISTING-PARADIGMS.md)** — Comparison to IaC, GitOps, Policy-as-Code
- **[Who RIPP Is For](https://github.com/Dylan-Natter/ripp-protocol/blob/main/docs/category/WHO-RIPP-IS-FOR.md)** — Ideal adopters and team readiness

---

## Next Steps

- Read [Core Concepts](Core-Concepts) for foundational principles
- See [Validation Rules](Validation-Rules) for validation behavior
- Check [FAQ](FAQ) for common questions
