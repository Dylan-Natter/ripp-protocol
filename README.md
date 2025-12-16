# Regenerative Intent Prompting Protocol (RIPP)

**Build fast. Ship safely. Regenerate always.**

---

## What is RIPP?

RIPP is an open standard for capturing feature requirements as structured, machine-readable, human-reviewable specifications. A RIPP packet is a single YAML or JSON file that describes what a feature does, how it works, what can go wrong, and how to verify correctness—before any code is written.

<!-- // Added for clarity: AI positioning -->

**RIPP is deterministic by default—AI is optional and additive.**

RIPP solves **intent erosion**: the problem where clear ideas degrade into fragmented requirements, undocumented edge cases, and production surprises. By making the specification the primary artifact, RIPP enables teams to review, validate, and ship features with confidence.

**RIPP is an intent-as-protocol specification layer**—not an IaC tool, not a policy engine, not a code generator. It sits above implementation, defining the "why" and "what" that other tools execute and enforce. [Learn more about RIPP's category and positioning →](docs/category/)

### RIPP as the Next-Generation User Story

In an era where AI can generate entire features from prompts, the traditional user story—optimized for human conversation—no longer captures what modern teams need: **executable intent**.

User stories were designed to facilitate dialogue between product and engineering. They succeeded brilliantly at making requirements discussable. But AI-assisted development demands more. When machines participate in delivery, specifications must be precise, structured, and complete enough to guide autonomous execution while remaining human-reviewable.

**RIPP is not a rejection of user stories. It is their evolution.**

Where user stories describe what humans should discuss, RIPP defines what machines are allowed to build. Where user stories optimize for conversation, RIPP optimizes for delegation. Where user stories capture high-level intent, RIPP preserves that intent through implementation, deployment, and maintenance.

**The gap RIPP fills:**

- **User stories** excel at capturing "As a user, I want X so that Y"—the problem and the value
- **RIPP** adds "here's exactly how it works, what can break, who can access it, and how to verify it"—the contract

For teams building with AI assistance, RIPP provides the rigor that prevents prototype-to-production disasters. For teams building without AI, RIPP provides the clarity that prevents intent erosion.

---

## Why RIPP Exists

Modern development moves fast. Ideas are prototyped in hours. But turning prototypes into production-ready systems is where teams lose clarity:

- Requirements scatter across tickets, docs, and conversations
- Security and edge cases are discovered too late
- Code review lacks a single source of truth
- Production issues reveal undocumented assumptions

RIPP fixes this. Write a RIPP packet first. Review it. Approve it. Then build it. The specification becomes the contract, the documentation, and the validation checklist.

### NEW: RIPP vNext — Intent Discovery Mode

**RIPP vNext** adds an optional, AI-assisted workflow for extracting intent from existing codebases:

1. **Build Evidence Pack** — Scan your repository to extract routes, dependencies, schemas
2. **Discover Intent** (AI-assisted, optional) — Infer candidate RIPP sections with confidence scores
3. **Confirm Intent** — Human review and approval of AI suggestions
4. **Build Canonical Packet** — Compile into schema-validated RIPP artifacts

**Key features:**

- ✅ **Additive and optional** — All v1 workflows continue unchanged
- ✅ **AI disabled by default** — Requires explicit opt-in (config + runtime env var)
- ✅ **Human confirmation mandatory** — No AI content becomes canonical without approval
- ✅ **Deterministic compilation** — Same confirmed intent → same output
- ✅ **Backward compatible** — vNext artifacts work with all v1 tools

**[📖 Read the Intent Discovery Mode Guide →](docs/INTENT-DISCOVERY-MODE.md)**

---

## User Story vs RIPP: A Comparison

RIPP is not a replacement for user stories—it's a complement. User stories define the "what" and "why" at a high level. RIPP adds the "how," "who," "what if," and "how to verify."

| Dimension                       | Traditional User Story                     | RIPP Packet                                                           |
| ------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| **Intent Capture**              | High-level problem and value statement     | Structured purpose with problem, solution, and value                  |
| **Human Readability**           | Optimized for conversation and consensus   | Human-reviewable but structured for machines                          |
| **AI Executability**            | Requires interpretation and clarification  | Machine-readable with explicit contracts                              |
| **Security & Permissions**      | Implicit or documented separately          | Explicit permissions and authorization model (Level 2+)               |
| **Multi-Tenancy**               | Rarely addressed                           | Tenant isolation in permissions and failure modes (Level 3)           |
| **Auditability**                | No standard format                         | Structured audit events with severity and purpose (Level 3)           |
| **Non-Functional Requirements** | Often in separate docs or tribal knowledge | Explicit NFRs section for performance, security, compliance (Level 3) |
| **Failure Modes**               | Discovered during testing or production    | Documented upfront with handling strategies (Level 2+)                |
| **Regenerability**              | Intent erodes during implementation        | Intent preserved and versioned with code                              |
| **Validation**                  | Manual review only                         | Automated schema validation in CI/CD                                  |

**When to use both:**

1. Start with a user story to align on business value
2. Translate to a RIPP packet to define implementation contract
3. Review the RIPP packet before writing code
4. Reference the user story in RIPP's `purpose.references` field

---

## The AI-Assisted Development Shift

### Before RIPP: Prototyping Without Durable Intent

AI coding assistants have made prototyping nearly frictionless. Ideas become running code in minutes. But this speed creates a hidden cost: **specifications that exist only in the prompt history**.

**The problem:**

- Features ship with the intent trapped in a conversation log
- Security and edge cases are addressed reactively
- Code review has no authoritative spec to validate against
- Six months later, no one remembers why it works this way
- Regenerating or refactoring requires archaeology through git history and Slack threads

**The user story doesn't scale to this reality.** It was designed for human-paced iteration where requirements evolved through conversation. In AI-assisted workflows, the conversation happens in seconds, but the durability requirement remains.

### After RIPP: AI-Assisted Delivery Governed by Specification

RIPP makes intent explicit, reviewable, and durable. When you prompt an AI to build a feature, you start with a RIPP packet—not a freeform description.

**The transformation:**

- Intent is captured in a structured, versioned specification
- Security, permissions, and failure modes are defined before code generation
- Code review compares implementation against an approved contract
- Features can be regenerated from the RIPP packet with confidence
- The "why" and "how" survive beyond the original author

**AI made code cheap. RIPP makes intent durable.**

---

## 7 Canonical Statements About RIPP

1. **"User stories optimize for conversation. RIPP optimizes for delegation."**  
   User stories facilitate discussion. RIPP facilitates execution by autonomous systems.

2. **"User stories describe what humans should discuss. RIPP defines what machines are allowed to build."**  
   The shift from collaborative exploration to bounded autonomy requires explicit contracts.

3. **"AI made code cheap. RIPP makes intent durable."**  
   Generating code is fast. Preserving why it exists and how it should behave is the new bottleneck.

4. **"RIPP is not the death of Agile—it's Agile's specification layer."**  
   User stories remain valuable for problem discovery. RIPP adds the rigor for safe delivery.

5. **"The best code review happens before the code exists."**  
   Reviewing a RIPP packet catches security, edge cases, and architectural issues before implementation.

6. **"Intent erosion is the silent killer of production systems."**  
   RIPP preserves the "why" alongside the "what" and "how," versioned and reviewable.

7. **"In an AI-assisted world, specifications are the new source code."**  
   If machines generate implementation, humans must govern intent. RIPP is that governance layer.

---

## From User Story to RIPP Packet: A Practical Translation

Agile teams can adopt RIPP without abandoning user stories. Here's how a traditional user story maps to a RIPP packet:

### User Story (Traditional)

```
As a registered user
I want to update my profile information
So that my account details stay current
```

**Acceptance Criteria:**

- User can edit name and email
- Changes are validated before saving
- User sees confirmation after successful update

### RIPP Packet (Evolution)

```yaml
ripp_version: '1.0'
packet_id: 'user-profile-update'
title: 'User Profile Update Feature'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft'
level: 2

purpose:
  problem: 'Users cannot update their profile information after registration'
  solution: 'Provide a profile editing form with server-side validation'
  value: 'Improves user experience and data accuracy'
  references:
    - title: 'User Story US-4521: Profile Management'
      url: 'https://example.com/jira/US-4521'

ux_flow:
  - step: 1
    actor: 'User'
    action: 'Navigates to profile settings page'
    trigger: "Clicks 'Edit Profile' button"
  - step: 2
    actor: 'User'
    action: 'Updates name and email fields'
    result: 'Form shows real-time validation'
  - step: 3
    actor: 'User'
    action: 'Submits form'
    trigger: "Clicks 'Save Changes'"
  - step: 4
    actor: 'System'
    action: 'Validates and persists changes'
    result: 'User sees success message and updated profile'

data_contracts:
  inputs:
    - name: 'ProfileUpdateRequest'
      fields:
        - name: 'name'
          type: 'string'
          required: true
          description: "User's display name"
        - name: 'email'
          type: 'string'
          required: true
          description: "User's email address"
          format: 'email'
  outputs:
    - name: 'ProfileUpdateResponse'
      fields:
        - name: 'user_id'
          type: 'string'
          required: true
          description: 'UUID of the updated user'
        - name: 'updated_at'
          type: 'string'
          required: true
          description: 'ISO 8601 timestamp of update'
    - name: 'ValidationError'
      fields:
        - name: 'error'
          type: 'string'
          required: true
          description: 'Error message'
        - name: 'field'
          type: 'string'
          required: false
          description: 'Field that caused the error'

api_contracts:
  - endpoint: '/api/users/{user_id}/profile'
    method: 'PATCH'
    purpose: 'Update user profile information'
    request:
      content_type: 'application/json'
      schema_ref: 'ProfileUpdateRequest'
    response:
      success:
        status: 200
        schema_ref: 'ProfileUpdateResponse'
        content_type: 'application/json'
      errors:
        - status: 400
          description: 'Validation error (invalid email format or missing required field)'
        - status: 401
          description: 'User not authenticated'
        - status: 403
          description: 'User cannot update another user profile'

permissions:
  - action: 'update:profile'
    required_roles: ['authenticated_user']
    resource_scope: 'own_profile'
    description: 'User must be authenticated and can only update their own profile (user_id in request matches authenticated user_id)'

failure_modes:
  - scenario: 'Email already in use by another account'
    impact: 'Update fails with validation error'
    handling: 'Return 400 with error message'
    user_message: 'This email is already registered to another account'
```

### What RIPP Adds

**Beyond the user story:**

- **Explicit data contracts** — types, validation, required fields
- **API specification** — endpoints, methods, response codes
- **Permission model** — who can update what, under which conditions
- **Failure modes** — edge cases and error handling defined upfront
- **Machine validation** — automated checks in CI/CD

**Continuity with Agile:**

- The user story's problem and value appear in `purpose`
- Acceptance criteria map to `ux_flow` and optionally `acceptance_tests`
- Reference the original user story in `purpose.references`

**The result:** Teams keep the conversational benefits of user stories while gaining the execution rigor needed for AI-assisted and production-grade development.

---

## Understanding RIPP's Category and Position

RIPP is often misunderstood as an IaC tool, policy engine, or code generator. It is none of these. RIPP is an **intent specification protocol layer** that complements—not replaces—existing tools.

**Essential reading for new adopters:**

- **[Intent as Protocol](docs/category/INTENT-AS-PROTOCOL.md)** — Why intent must be a first-class protocol artifact
- **[What RIPP Is and Is Not](docs/category/WHAT-RIPP-IS-AND-IS-NOT.md)** — Explicit boundaries, scope, and common misconceptions
- **[RIPP vs Existing Paradigms](docs/category/RIPP-VS-EXISTING-PARADIGMS.md)** — How RIPP relates to IaC, GitOps, Policy-as-Code, and AI frameworks
- **[Who RIPP Is For](docs/category/WHO-RIPP-IS-FOR.md)** — Ideal adopters, use cases, and team readiness criteria

**Quick answers:**

| Question                                  | Answer                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Is RIPP a code generator?                 | No. RIPP is a specification format. Code generation is optional tooling.             |
| Does RIPP replace IaC/Terraform?          | No. RIPP documents intent; IaC provisions infrastructure. They coexist.              |
| Does RIPP enforce policies at runtime?    | No. RIPP documents permissions; policy engines (OPA, etc.) enforce them.             |
| Is RIPP only for AI-assisted development? | No. RIPP solves intent erosion for all teams, with or without AI.                    |
| Do I need Level 3 for everything?         | No. Choose Level 1 (simple), 2 (production), or 3 (high-risk) based on your feature. |

---

## Quickstart

### 1. Initialize RIPP in Your Repository

Install the RIPP CLI and set up your repository:

```bash
# Install RIPP CLI
npm install -g ripp-cli

# Initialize RIPP scaffolding
ripp init
```

This creates:

- `ripp/` directory for your RIPP packets
- `ripp/features/` for feature specifications
- GitHub Actions workflow for automated validation
- Intent package management structure

### 2. Create Your First RIPP File

Create `ripp/features/my-feature.ripp.yaml`:

```yaml
ripp_version: '1.0'
packet_id: 'my-feature'
title: 'User Registration'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft'
level: 1

purpose:
  problem: 'Users cannot create accounts'
  solution: 'Provide a registration form with email verification'
  value: 'Enables user onboarding and personalization'

ux_flow:
  - step: 1
    actor: 'User'
    action: 'Fills out registration form'
    trigger: "Clicks 'Sign Up' button"
  - step: 2
    actor: 'System'
    action: 'Validates input and creates account'
    result: 'User receives confirmation email'

data_contracts:
  inputs:
    - name: 'RegistrationRequest'
      fields:
        - name: 'email'
          type: 'string'
          required: true
          description: "User's email address"
        - name: 'password'
          type: 'string'
          required: true
          description: "User's chosen password (min 8 chars)"
  outputs:
    - name: 'RegistrationResponse'
      fields:
        - name: 'user_id'
          type: 'string'
          required: true
          description: 'Unique user identifier'
        - name: 'status'
          type: 'string'
          required: true
          description: 'Registration status (pending_verification)'
```

### 3. Validate It

Validate your packet:

```bash
ripp validate ripp/features/my-feature.ripp.yaml

# Or validate all features
ripp validate ripp/features/
```

### 4. Learn More

- **Full Specification**: [SPEC.md](SPEC.md)
- **Examples**: [examples/](examples/)
- **Documentation**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **Schema**: [schema/ripp-1.0.schema.json](schema/ripp-1.0.schema.json)

---

## Integration Guide

### Installing as a Dependency

RIPP can be integrated into your project in several ways, depending on your workflow.

#### Option 1: Git Submodule (Recommended for pre-npm projects)

Use this approach to integrate RIPP as a vendored dependency:

```bash
# Add RIPP as a git submodule
git submodule add https://github.com/Dylan-Natter/ripp-protocol vendor/ripp-protocol
git submodule update --init --recursive
```

Then add the CLI to your `package.json`:

```json
{
  "devDependencies": {
    "ripp-cli": "file:./vendor/ripp-protocol/tools/ripp-cli"
  },
  "scripts": {
    "ripp:validate": "ripp validate 'specs/**/*.ripp.{yaml,json}'",
    "ripp:validate:min-level-2": "ripp validate specs/ --min-level 2",
    "precommit": "npm run ripp:validate"
  }
}
```

Install the dependency:

```bash
npm install
```

#### Option 2: npm Package (when published)

Once RIPP is published to npm, you can install it directly:

```bash
npm install -D ripp-cli
```

Then use it in your scripts:

```json
{
  "scripts": {
    "ripp:validate": "ripp validate specs/",
    "ripp:validate:strict": "ripp validate specs/ --min-level 3"
  }
}
```

#### Option 3: Monorepo Setup

For monorepo projects using Yarn workspaces or npm workspaces:

```json
{
  "workspaces": ["packages/*", "vendor/ripp-protocol/tools/ripp-cli"]
}
```

Then reference it in individual package dependencies:

```json
{
  "devDependencies": {
    "ripp-cli": "workspace:*"
  }
}
```

### Common Integration Patterns

#### Validation Scripts

Automate RIPP validation in your development workflow:

```json
{
  "scripts": {
    "ripp:validate": "ripp validate 'handoff/**/*.ripp.{yaml,json}'",
    "ripp:validate:api": "ripp validate api-specs/ --min-level 2",
    "ripp:validate:critical": "ripp validate critical-features/ --min-level 3",
    "ripp:check": "ripp validate specs/ --quiet"
  }
}
```

#### Pre-commit Hooks

Validate RIPP packets before committing:

```json
{
  "scripts": {
    "precommit": "ripp validate specs/"
  }
}
```

Or using husky:

```bash
npm install -D husky
npx husky init
echo "npm run ripp:validate" > .husky/pre-commit
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Validate RIPP Specs

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive # If using git submodules

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Validate RIPP packets
        run: npm run ripp:validate

      - name: Validate API specs (min Level 2)
        run: ripp validate api-specs/ --min-level 2
```

#### GitLab CI

```yaml
validate-ripp:
  image: node:18
  stage: test
  before_script:
    - git submodule update --init --recursive
    - npm ci
  script:
    - npm run ripp:validate
    - ripp validate api-specs/ --min-level 2
  only:
    - merge_requests
    - main
```

#### CircleCI

```yaml
version: 2.1

jobs:
  validate-ripp:
    docker:
      - image: node:18
    steps:
      - checkout
      - run:
          name: Checkout submodules
          command: git submodule update --init --recursive
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Validate RIPP specs
          command: npm run ripp:validate

workflows:
  version: 2
  test:
    jobs:
      - validate-ripp
```

### Directory Structure Recommendations

Organize your RIPP packets for clarity:

```
your-project/
├── specs/                      # All RIPP packets
│   ├── features/              # Feature specifications
│   │   ├── user-auth.ripp.yaml
│   │   └── profile-mgmt.ripp.yaml
│   ├── apis/                  # API specifications (Level 2+)
│   │   ├── auth-api.ripp.yaml
│   │   └── user-api.ripp.yaml
│   └── critical/              # Critical features (Level 3)
│       └── payment-flow.ripp.yaml
├── vendor/                    # Git submodules (if applicable)
│   └── ripp-protocol/
├── package.json
└── .github/
    └── workflows/
        └── validate-ripp.yml
```

### Troubleshooting

**Issue: `ripp: command not found`**

- Ensure you've run `npm install` after adding ripp-cli as a dependency
- For global installs: `npm install -g ripp-cli`
- For local installs: use `npx ripp validate` or add npm scripts

**Issue: Validation fails with "No RIPP files found"**

- Check your glob pattern: `'**/*.ripp.{yaml,json}'` (note the quotes)
- Ensure files use the `.ripp.yaml` or `.ripp.json` naming convention
- Verify the path argument points to the correct directory

**Issue: Git submodule not updating**

```bash
git submodule update --remote --merge
```

---

## RIPP Levels

RIPP defines three conformance levels. Choose the level that matches your feature's risk and complexity:

- **Level 1**: Purpose, UX Flow, Data Contracts (minimum viable spec)
- **Level 2**: Level 1 + API Contracts, Permissions, Failure Modes (production-grade)
- **Level 3**: Level 2 + Audit Events, NFRs, Acceptance Tests (full rigor)

---

## From Prototype to Production: RIPP as an Intent Compiler

AI coding assistants make prototyping effortless. Ideas become running code in minutes. But **prototypes are not production systems**.

RIPP acts as an **intent compiler**: it transforms rapid prototypes into durable, production-grade specifications.

### The Problem RIPP Solves

**Rapid prototypes prove feasibility** but lack:

- Durable intent (the "why" exists only in prompt history)
- Security boundaries (permissions often omitted)
- Failure handling (edge cases discovered reactively)
- Verification criteria (no formal definition of "done")

**The risk**: Speed without structure creates technical debt. Features ship with underspecified intent, leading to production incidents and maintenance nightmares.

### RIPP as the Bridge

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

### The Workflow: Prototype → RIPP → Production

1. **Build rapid MVP**: Use AI to create a working prototype
2. **Extract RIPP**: Generate a formal specification from prototype + stated intent
3. **Review and resolve**: Fill gaps, resolve conflicts, answer open questions
4. **Implement for production**: Use RIPP as the authoritative contract

**Result**: The prototype proves it CAN be done. The RIPP packet defines HOW it SHOULD be done.

**Key Principle: Intent is preserved. Code is optional.**

Production implementations guided by RIPP may:

- Share no code with the prototype (complete rewrite in different language)
- Use different architectures (microservices instead of monolith)
- Use different frameworks and platforms
- Follow different implementation patterns

What remains constant is the intent: the problem being solved, the value delivered, the data contracts, and the user experience patterns.

### Optional Metadata for Prototype-Generated RIPP

When RIPP packets are generated from prototypes, optional metadata provides traceability:

- **`source_prototype`**: Links to prototype repo, commit, and generation tool
- **`evidence_map`**: Maps each RIPP section to specific code files/functions
- **`confidence`**: Indicates certainty level (high/medium/low/unknown) per section
- **`open_questions`**: Flags unresolved decisions requiring review

These fields are **optional** and do not affect RIPP v1.0 conformance. They enhance transparency when transitioning from prototype to production.

### Evidence and Trust Rules

To ensure teams trust RIPP packets generated from prototypes:

- **Code is evidence** of what EXISTS (extracted behavior only)
- **Inputs define** what SHOULD exist (stated requirements)
- **Conflicts must be flagged** explicitly, never silently resolved
- **Never infer**: Permissions, tenancy, audit, or security (mark as "proposed" or "unknown")

Verification labels indicate source:

- **VERIFIED**: Extracted from code and confirmed
- **STATED**: From explicit requirements
- **PROPOSED**: Inferred, requires review
- **UNKNOWN**: Missing, must be specified

### The RIPP Extractor (Conceptual)

Future tooling may include a **RIPP Extractor** that:

- Consumes: Prototype code + stated requirements
- Produces: Draft RIPP packet + evidence map + confidence ratings
- Flags: Gaps, conflicts, and open questions
- Requires: Human review and approval before production use

**Design principles**: Read-only, conservative (marks uncertainty), transparent (shows sources), requires human approval.

### Learn More

For complete details on prototype-to-production workflows, see:  
**[From Prototype to Production: RIPP as an Intent Compiler](docs/prototype-to-production.md)**

---

## What RIPP Gives You

✅ **Before code review, spec review**: Catch issues before implementation  
✅ **Single source of truth**: All requirements in one place  
✅ **Automated validation**: CI checks ensure specs are complete  
✅ **Intent preservation**: The "why" survives the "how"  
✅ **Failure mode analysis**: Forces teams to think about edge cases upfront  
✅ **Onboarding clarity**: New engineers read the spec, understand the feature

---

## Who Uses RIPP?

- **Concept designers**: Capture AI-generated ideas in structured format
- **Engineers**: Review specs before writing code
- **Platform teams**: Enforce standards across features
- **Executives**: Verify alignment between idea and implementation

---

## Status

**v1.0 Stable** — Ready for production use.

---

## Tooling Extensions (Additive)

RIPP tooling exists to enhance workflows, not redefine the protocol. Extensions like linters, packagers, and analyzers are designed to be **additive**: they build on top of RIPP without changing its core semantics or requiring modifications to existing packets.

All tooling follows strict guardrails:

- Validators enforce schema conformance (required)
- Linters provide best-practice guidance (optional)
- Packagers generate artifacts without mutating source files
- Analyzers extract observable facts, never invent intent

**Extensions are optional.** RIPP packets remain valid and useful with or without additional tooling.

For detailed rules on extending RIPP, see [docs/EXTENSIONS.md](docs/EXTENSIONS.md).

---

## Contributing

RIPP is an open standard. Contributions are welcome!

- Read the [SPEC.md](SPEC.md)
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Open an issue or pull request

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Links

- **Docs**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **Schema**: [schema/ripp-1.0.schema.json](schema/ripp-1.0.schema.json)
- **Examples**: [examples/](examples/)
- **CLI Tool**: [tools/ripp-cli](tools/ripp-cli)

---

**Tagline**: Build fast. Ship safely. Regenerate always.
