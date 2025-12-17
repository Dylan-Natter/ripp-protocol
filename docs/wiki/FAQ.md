# FAQ - Frequently Asked Questions

Common questions about RIPP™ and their answers.

---

## General

### What does RIPP stand for?

**Regenerative Intent Prompting Protocol**. It's called "regenerative" because it preserves and regenerates the original intent of a feature throughout the development lifecycle.

---

### Why another documentation format?

RIPP isn't just documentation. It's a structured, machine-readable specification that can be validated, versioned, and reviewed before code is written. It solves **intent erosion**—the problem where clear ideas degrade into fragmented requirements and production surprises.

---

### Is RIPP only for AI-generated code?

No. While RIPP was designed for AI-augmented workflows (where ideas move fast), it works for any software development. If you write features, you can use RIPP.

**RIPP solves two related problems:**

1. **For AI-assisted teams:** When AI generates code from prompts, RIPP ensures the specification is durable, reviewable, and complete—not trapped in a conversation log.

2. **For all teams:** Intent erosion happens whether code is written by humans or AI. RIPP preserves the "why" and "how" regardless of who (or what) writes the implementation.

**The key insight:** AI made code cheap. The bottleneck is now preserving intent, defining boundaries, and ensuring production safety. RIPP addresses this bottleneck.

---

### Who created RIPP?

RIPP is an open standard maintained by the community. See [GOVERNANCE.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/GOVERNANCE.md) for how the protocol evolves.

---

### Is RIPP tied to a specific language or framework?

No. RIPP is **language and platform agnostic**. The same RIPP packet can describe a feature implemented in Python, Go, JavaScript, or any other language.

---

## Getting Started

### How long does it take to write a RIPP packet?

- **Level 1**: 30-60 minutes
- **Level 2**: 1-2 hours
- **Level 3**: 2-4 hours

Once you're familiar with the format, it gets faster.

---

### Do I need to use all three levels?

No. Choose the level that matches your feature's risk:

- **Level 1**: Simple, low-risk features
- **Level 2**: Production features, customer-facing APIs
- **Level 3**: High-risk features (payments, auth, PII, multi-tenant)

---

### Can I start with Level 1 and upgrade later?

Yes! Just add the required sections for Level 2 or 3, update the `level` field, and re-validate.

**Example:**

```yaml
# Before (Level 1)
level: 1
purpose: { ... }
ux_flow: [ ... ]
data_contracts: { ... }

# After (Level 2)
level: 2
purpose: { ... }
ux_flow: [ ... ]
data_contracts: { ... }
api_contracts: [ ... ]      # Added
permissions: [ ... ]        # Added
failure_modes: [ ... ]      # Added
```

---

### What if my team resists documentation?

RIPP is **reviewed before code is written**. It catches issues early, reduces rework, and speeds up development. Frame it as a tool for clarity, not bureaucracy. Start with Level 1 for simple features to build momentum.

---

## Technical

### YAML or JSON?

Both are supported. YAML is more human-friendly. JSON integrates better with tooling. Use `.ripp.yaml` or `.ripp.json` extension.

**Recommendation:** Use YAML for human authoring. Use JSON for machine generation or integration.

---

### Can I include custom sections beyond the spec?

Yes! RIPP allows additional properties for forward compatibility. Validators will ignore unknown sections. This lets you add organization-specific fields without breaking conformance.

**Example:**

```yaml
ripp_version: '1.0'
packet_id: 'my-feature'
# ... standard fields ...

# Custom section (ignored by validators)
internal:
  jira_ticket: 'PROJ-1234'
  team: 'Platform'
  cost_estimate: '$5000'
```

**Note:** Custom sections are not validated. Use at your own risk.

---

### How do I validate a RIPP packet?

Use the official CLI:

```bash
npm install -g ripp-cli
ripp validate my-feature.ripp.yaml
```

Or validate in your editor using the JSON Schema.

---

### Can I write RIPP packets in Markdown or other formats?

RIPP requires YAML or JSON for machine readability and automated validation. You **can** generate Markdown documentation **from** RIPP packets using:

```bash
ripp package --in feature.ripp.yaml --out handoff.md
```

But source RIPP packets must be YAML or JSON.

---

### What if the RIPP spec doesn't cover my use case?

Add custom sections (see above) or open a [spec change issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=spec_change.yml). RIPP is designed to be extensible.

---

## Validation

### Why doesn't validate fix things?

RIPP validators are **read-only** by design. Auto-fixing structural issues doesn't fix semantic issues. Only humans can determine correct intent.

**Example:**

```
✗ /purpose: must have required property 'solution'
```

**Bad auto-fix:** Add `solution: "TODO"` (syntactically valid, semantically useless)

**Good human fix:** Add `solution: "Provide web form and API endpoint with validation"`

**Philosophy:** Validators report issues. Humans fix them deliberately.

---

### Can RIPP regenerate code?

No. RIPP is a **specification format**, not a code generator. While tools **may** generate code from RIPP packets, this is optional and not part of the core protocol.

**What RIPP does:**

- Preserves intent so features can be regenerated when code needs to be rewritten
- Provides contracts that implementations must satisfy
- Enables validation that implementations match specifications

**What RIPP does NOT do:**

- Generate implementation code
- Transform prototype code into production code
- Scaffold boilerplate

---

### How strict is validation?

**Structural validation (schema):** Very strict. All required fields must be present and correctly typed.

**Semantic validation (linting):** Less strict. Linting provides warnings for best practices but doesn't fail builds (unless `--strict` mode is used).

**Example:**

```bash
# Structural (strict)
ripp validate my-feature.ripp.yaml
# Exit code 1 if invalid

# Semantic (warnings)
ripp lint my-feature.ripp.yaml
# Exit code 0 unless --strict

# Semantic (strict)
ripp lint my-feature.ripp.yaml --strict
# Exit code 1 if warnings or errors
```

---

### Can I customize the schema?

Not recommended. The RIPP schema is the authoritative definition of the protocol. Customizing it breaks interoperability with tooling.

**Instead:**

- Use custom sections (ignored by validators)
- Propose schema changes via [spec change issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=spec_change.yml)

---

## Workflow Integration

### When do I write a RIPP packet?

**Before writing code.** The workflow is:

```
1. Draft RIPP packet
   ↓
2. Review with team
   ↓
3. Approve
   ↓
4. Implement
   ↓
5. Validate against acceptance tests
   ↓
6. Mark as implemented
```

**Alternative (Prototype-First):**

```
1. Build prototype
   ↓
2. Extract intent into RIPP packet
   ↓
3. Review & refine
   ↓
4. Rebuild for production using RIPP
```

---

### What if the implementation deviates from the RIPP packet?

Update the RIPP packet to reflect reality. **The packet is the source of truth.** If the code doesn't match the packet, one of them is wrong.

**Options:**

1. **Update RIPP to match code** — If implementation reveals better approach
2. **Update code to match RIPP** — If code deviated unintentionally
3. **Discuss and decide** — Review with team to determine correct approach

**Key principle:** Spec and code must stay in sync.

---

### Do I need a RIPP packet for bug fixes?

Usually not. RIPP is for features and significant changes. Trivial bug fixes don't need RIPP (that's Level 0).

**When to use RIPP for bug fixes:**

- ✅ Bug reveals missing feature or incorrect design
- ✅ Fix requires significant changes to data contracts or APIs
- ✅ Fix introduces new permissions or failure modes

**When NOT to use RIPP:**

- ❌ Typo fixes
- ❌ Simple logic errors
- ❌ Performance optimizations that don't change contracts

---

### Can I use RIPP with Agile/Scrum?

Yes. RIPP complements Agile workflows:

- **User stories** define the "what" and "why" (high-level, conversational)
- **RIPP packets** add the "how," "who can," "what if," and "how to verify" (technical depth, executable)

**Workflow integration:**

1. Create user story during sprint planning
2. Draft RIPP packet to define implementation contract
3. Review RIPP packet with team (like a design review)
4. Approve RIPP packet before development begins
5. Implement feature according to RIPP spec
6. Validate against RIPP's acceptance tests
7. Mark RIPP packet as "implemented"

Include "RIPP packet complete and approved" in your Definition of Done.

**RIPP is not a replacement for Agile—it's Agile's specification layer.**

---

### How does RIPP relate to user stories?

RIPP is the evolution of the user story for AI-assisted and production-grade development.

**User stories excel at:**

- Facilitating conversation between product and engineering
- Capturing high-level problem and value
- Remaining lightweight and discussable

**RIPP adds:**

- Structured data contracts and API specifications
- Explicit permissions and authorization model
- Documented failure modes and error handling
- Machine-readable format for validation and automation
- Preserved intent that survives implementation

**The relationship:** User stories define the problem space. RIPP packets define the solution space.

**Practical approach:**

- Start with a user story to align on business value
- Translate to a RIPP packet to define implementation contract
- Reference the user story in `purpose.references`
- Keep user story in your backlog tool (Jira, Linear, etc.)
- Keep RIPP packet in version control with your code

---

### Does RIPP replace user stories?

No. RIPP complements user stories.

**User stories answer:** "What problem are we solving and why?"  
**RIPP answers:** "How exactly does it work, who can use it, what can break, and how do we verify it?"

**Think of it this way:**

- User story = the initial conversation starter
- RIPP packet = the reviewed contract before implementation

For simple features, a user story might be enough. For production features—especially with AI assistance—you need both the conversational clarity of a user story and the executable precision of a RIPP packet.

---

### How does RIPP fit with existing documentation?

RIPP is the **technical specification**. It complements (not replaces):

- **Architecture docs** — System design, component diagrams
- **API docs** — Generated from RIPP or OpenAPI
- **User docs** — Product manuals, tutorials

**RIPP's role:** Define feature contracts before implementation.

---

## Version Control

### Where do I store RIPP packets?

In version control with your code. Recommended locations:

- `/ripp/` (root level, created by `ripp init`)
- `/features/` (alongside feature code)
- `/specs/` (centralized specs directory)

**Why co-locate with code:**

- ✅ Single source of truth
- ✅ Specs and code versioned together
- ✅ Same review workflow (pull requests)

---

### How do I version RIPP packets?

RIPP packets are versioned through:

1. **Git commit history** — Primary versioning mechanism
2. **`updated` field** — ISO 8601 date of last modification
3. **Optional `version` field** — Semver or custom versioning

**Example:**

```yaml
ripp_version: '1.0'
packet_id: 'item-creation'
version: '2.1.0' # Optional
created: '2025-01-10'
updated: '2025-12-14'
```

**Best practice:** Update the `updated` field whenever you modify the packet.

---

### Should RIPP packets be in the same repo as code?

Usually yes. Co-locating specs and code keeps them in sync. For microservices, each service can have its own RIPP packets.

**Monorepo example:**

```
monorepo/
├── packages/
│   ├── auth/
│   │   ├── ripp/
│   │   └── src/
│   └── billing/
│       ├── ripp/
│       └── src/
└── .github/workflows/ripp-validate.yml
```

---

## Adoption

### How do I convince my team to use RIPP?

Start small:

1. Write one RIPP packet for a new feature
2. Review it as a team
3. Track how many issues were caught before coding
4. Show the time savings

Success builds momentum.

**Tips:**

- Frame RIPP as a "spec review" (already familiar to most teams)
- Start with Level 1 (low overhead)
- Use it for high-risk features first (auth, payments)
- Demonstrate value before mandating adoption

---

### What's the ROI of using RIPP?

**Time saved:**

- Fewer requirements clarification meetings
- Fewer mid-implementation surprises
- Fewer production bugs from undocumented edge cases
- Faster onboarding (specs are reviewable and versioned)

**Quality improved:**

- Security and permissions defined upfront
- Failure modes documented before they happen
- Acceptance tests written before implementation

**Estimate:** Teams report 20-40% reduction in rework on features with RIPP packets.

---

### Can I adopt RIPP incrementally?

Yes. Start with:

1. One team
2. One feature
3. Level 1 only

Expand as you see value.

---

### What if I have legacy features without RIPP packets?

**Option 1:** Document as you refactor or extend them

**Option 2:** Use `ripp analyze` to bootstrap from existing OpenAPI specs

**Option 3:** Focus on new features only

**Don't:** Try to retroactively document everything. Focus on forward progress.

---

## Comparison to Other Tools

### How is RIPP different from OpenAPI?

| Dimension    | RIPP                                                                    | OpenAPI                              |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------ |
| **Scope**    | Full feature specification (purpose, UX, data, API, permissions, tests) | API contracts only                   |
| **Purpose**  | Capture intent before coding                                            | Document existing APIs               |
| **Audience** | Product + Engineering                                                   | API consumers                        |
| **Includes** | Why, what, how, who, what if, how to verify                             | API endpoints, parameters, responses |

**Can they coexist?** Yes. RIPP packets can reference OpenAPI specs in `purpose.references`. Or use `ripp analyze` to bootstrap from OpenAPI.

---

### How is RIPP different from Gherkin (Cucumber)?

| Dimension            | RIPP                        | Gherkin                           |
| -------------------- | --------------------------- | --------------------------------- |
| **Purpose**          | Feature specification       | Behavior-driven tests             |
| **Format**           | YAML/JSON                   | Plain text (Given/When/Then)      |
| **Audience**         | Engineering + Product       | QA + Engineering                  |
| **Machine-readable** | Yes (JSON Schema validated) | Partially (test framework parses) |

**Can they coexist?** Yes. RIPP's `acceptance_tests` can be translated into Gherkin scenarios.

---

### How is RIPP different from Architecture Decision Records (ADRs)?

| Dimension      | RIPP                   | ADRs                              |
| -------------- | ---------------------- | --------------------------------- |
| **Scope**      | Feature specifications | Architecture decisions            |
| **Purpose**    | Define what and how    | Document why (decision rationale) |
| **Format**     | Structured YAML/JSON   | Markdown or plain text            |
| **Validation** | Schema-validated       | No formal validation              |

**Can they coexist?** Yes. RIPP packets can reference ADRs in `purpose.references`.

---

## Next Steps

- **New to RIPP?** → [Getting Started](Getting-Started)
- **Need to validate?** → [CLI Reference](CLI-Reference)
- **Setting up CI?** → [GitHub Integration](GitHub-Integration)
- **Questions on design?** → [Design Philosophy](Design-Philosophy)
- **Term definitions?** → [Glossary](Glossary)
