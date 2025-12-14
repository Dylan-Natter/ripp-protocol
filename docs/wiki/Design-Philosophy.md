# Design Philosophy

This page explains the principles and design decisions behind RIPP™.

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

## Next Steps

- Read [Core Concepts](Core-Concepts) for foundational principles
- See [Validation Rules](Validation-Rules) for validation behavior
- Check [FAQ](FAQ) for common questions
