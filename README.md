# Regenerative Intent Prompting Protocol (RIPP)

**Build fast. Ship safely. Regenerate always.**

---

## What is RIPP?

RIPP is an open standard for capturing feature requirements as structured, machine-readable, human-reviewable specifications. A RIPP packet is a single YAML or JSON file that describes what a feature does, how it works, what can go wrong, and how to verify correctness—before any code is written.

RIPP solves **intent erosion**: the problem where clear ideas degrade into fragmented requirements, undocumented edge cases, and production surprises. By making the specification the primary artifact, RIPP enables teams to review, validate, and ship features with confidence.

---

## Why RIPP Exists

Modern development moves fast. Ideas are prototyped in hours. But turning prototypes into production-ready systems is where teams lose clarity:

- Requirements scatter across tickets, docs, and conversations
- Security and edge cases are discovered too late
- Code review lacks a single source of truth
- Production issues reveal undocumented assumptions

RIPP fixes this. Write a RIPP packet first. Review it. Approve it. Then build it. The specification becomes the contract, the documentation, and the validation checklist.

---

## Quickstart

### 1. Create a RIPP File

Create `my-feature.ripp.yaml`:

```yaml
ripp_version: "1.0"
packet_id: "my-feature"
title: "User Registration"
created: "2025-12-13"
updated: "2025-12-13"
status: "draft"
level: 1

purpose:
  problem: "Users cannot create accounts"
  solution: "Provide a registration form with email verification"
  value: "Enables user onboarding and personalization"

ux_flow:
  - step: 1
    actor: "User"
    action: "Fills out registration form"
    trigger: "Clicks 'Sign Up' button"
  - step: 2
    actor: "System"
    action: "Validates input and creates account"
    result: "User receives confirmation email"

data_contracts:
  inputs:
    - name: "RegistrationRequest"
      fields:
        - name: "email"
          type: "string"
          required: true
          description: "User's email address"
        - name: "password"
          type: "string"
          required: true
          description: "User's chosen password (min 8 chars)"
  outputs:
    - name: "RegistrationResponse"
      fields:
        - name: "user_id"
          type: "string"
          required: true
          description: "Unique user identifier"
        - name: "status"
          type: "string"
          required: true
          description: "Registration status (pending_verification)"
```

### 2. Validate It

Install the RIPP CLI:

```bash
npm install -g ripp-cli
```

Validate your packet:

```bash
ripp validate my-feature.ripp.yaml
```

### 3. Learn More

- **Full Specification**: [SPEC.md](SPEC.md)
- **Examples**: [examples/](examples/)
- **Documentation**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **Schema**: [schema/ripp-1.0.schema.json](schema/ripp-1.0.schema.json)

---

## RIPP Levels

RIPP defines three conformance levels. Choose the level that matches your feature's risk and complexity:

- **Level 1**: Purpose, UX Flow, Data Contracts (minimum viable spec)
- **Level 2**: Level 1 + API Contracts, Permissions, Failure Modes (production-grade)
- **Level 3**: Level 2 + Audit Events, NFRs, Acceptance Tests (full rigor)

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
