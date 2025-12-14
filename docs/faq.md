---
layout: default
title: 'FAQ - Frequently Asked Questions'
---

## Frequently Asked Questions

---

### General

**Q: What does RIPP stand for?**

A: **Regenerative Intent Prompting Protocol**. It's called "regenerative" because it preserves and regenerates the original intent of a feature throughout the development lifecycle.

---

**Q: Why another documentation format?**

A: RIPP isn't just documentation. It's a structured, machine-readable specification that can be validated, versioned, and reviewed before code is written. It solves **intent erosion**—the problem where clear ideas degrade into fragmented requirements and production surprises.

---

**Q: Is RIPP only for AI-generated code?**

A: No. While RIPP was designed for AI-augmented workflows (where ideas move fast), it works for any software development. If you write features, you can use RIPP.

**RIPP solves two related problems:**

1. **For AI-assisted teams:** When AI generates code from prompts, RIPP ensures the specification is durable, reviewable, and complete—not trapped in a conversation log.

2. **For all teams:** Intent erosion happens whether code is written by humans or AI. RIPP preserves the "why" and "how" regardless of who (or what) writes the implementation.

**The key insight:** AI made code cheap. The bottleneck is now preserving intent, defining boundaries, and ensuring production safety. RIPP addresses this bottleneck.

---

**Q: How does RIPP support AI-assisted development?**

A: RIPP provides the specification layer that makes AI-generated code production-ready.

**The problem RIPP solves:**

- AI can generate features from prompts in minutes
- But prompts are ephemeral—they don't survive as documentation
- Security, permissions, edge cases often missing from generated code
- Regenerating or modifying features requires re-prompting with context loss
- Code review has no authoritative spec to validate against

**How RIPP helps:**

1. **Spec-first workflow:** Write RIPP packet before prompting AI to generate code
2. **Bounded autonomy:** RIPP defines exactly what the AI is allowed to build
3. **Durable intent:** Specification survives beyond the prompt conversation
4. **Review gate:** Team reviews RIPP packet before code generation begins
5. **Validation:** Generated code can be verified against RIPP contracts
6. **Regeneration:** Features can be rebuilt from RIPP spec with confidence

**Example workflow:**

1. Draft RIPP packet describing the feature
2. Review and approve RIPP packet
3. Use RIPP packet as context when prompting AI
4. Validate generated code against RIPP contracts
5. Update RIPP if implementation reveals gaps
6. RIPP packet becomes the durable specification

**The result:** AI provides speed. RIPP provides safety and durability.

---

**Q: Who created RIPP?**

A: RIPP is an open standard maintained by the community. See [GOVERNANCE.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/GOVERNANCE.md) for how the protocol evolves.

---

### Getting Started

**Q: How long does it take to write a RIPP packet?**

A:

- **Level 1**: 30-60 minutes
- **Level 2**: 1-2 hours
- **Level 3**: 2-4 hours

Once you're familiar with the format, it gets faster.

---

**Q: Do I need to use all three levels?**

A: No. Choose the level that matches your feature's risk:

- **Level 1**: Simple, low-risk features
- **Level 2**: Production features, customer-facing APIs
- **Level 3**: High-risk features (payments, auth, PII, multi-tenant)

---

**Q: Can I start with Level 1 and upgrade later?**

A: Yes! Just add the required sections for Level 2 or 3, update the `level` field, and re-validate.

---

**Q: What if my team resists documentation?**

A: RIPP is **reviewed before code is written**. It catches issues early, reduces rework, and speeds up development. Frame it as a tool for clarity, not bureaucracy. Start with Level 1 for simple features to build momentum.

---

### Technical

**Q: YAML or JSON?**

A: Both are supported. YAML is more human-friendly. JSON integrates better with tooling. Use `.ripp.yaml` or `.ripp.json` extension.

---

**Q: Can I include custom sections beyond the spec?**

A: Yes! RIPP allows `additionalProperties` for forward compatibility. Validators will ignore unknown sections. This lets you add organization-specific fields without breaking conformance.

---

**Q: How do I validate a RIPP packet?**

A: Use the official CLI:

```bash
npm install -g ripp-cli
ripp validate my-feature.ripp.yaml
```

Or validate in your editor using the JSON Schema.

---

**Q: Can I write RIPP packets in Markdown or other formats?**

A: RIPP requires YAML or JSON for machine readability and automated validation. You can generate Markdown documentation **from** RIPP packets if needed.

---

**Q: What if the RIPP spec doesn't cover my use case?**

A: Add custom sections or open a [spec change issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new?template=spec_change.yml). RIPP is designed to be extensible.

---

### Workflow Integration

**Q: When do I write a RIPP packet?**

A: **Before writing code.** The workflow is:

1. Draft RIPP packet
2. Review with team
3. Approve
4. Implement
5. Validate against acceptance tests
6. Mark as implemented

---

**Q: What if the implementation deviates from the RIPP packet?**

A: Update the RIPP packet to reflect reality. The packet is the source of truth. If the code doesn't match the packet, one of them is wrong.

---

**Q: Do I need a RIPP packet for bug fixes?**

A: Usually not. RIPP is for features and significant changes. Trivial bug fixes don't need RIPP (that's Level 0).

---

**Q: Can I use RIPP with Agile/Scrum?**

A: Yes. RIPP complements Agile workflows:

- **User stories** define the "what" and "why" (high-level, conversational)
- **RIPP packets** add the "how," "who can," "what if," and "how to verify" (technical depth, executable)
- **Acceptance criteria** from user stories map to RIPP's `ux_flow` and `acceptance_tests`

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

**Q: How does RIPP relate to user stories?**

A: RIPP is the evolution of the user story for AI-assisted and production-grade development.

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

**The relationship:** User stories define the problem space. RIPP packets define the solution space. Together, they provide both alignment (user story) and rigor (RIPP).

**Practical approach:**

- Start with a user story to align on business value
- Translate to a RIPP packet to define implementation contract
- Reference the user story in `purpose.references`
- Keep user story in your backlog tool (Jira, Linear, etc.)
- Keep RIPP packet in version control with your code

---

**Q: Does RIPP replace user stories?**

A: No. RIPP complements user stories.

**User stories answer:** "What problem are we solving and why?"  
**RIPP answers:** "How exactly does it work, who can use it, what can break, and how do we verify it?"

**Think of it this way:**

- User story = the initial conversation starter
- RIPP packet = the reviewed contract before implementation

For simple features, a user story might be enough. For production features—especially with AI assistance—you need both the conversational clarity of a user story and the executable precision of a RIPP packet.

---

**Q: How does RIPP fit with existing documentation?**

A: RIPP is the **technical specification**. It complements (not replaces):

- Architecture docs (system design)
- API docs (generated from RIPP or OpenAPI)
- User docs (product manuals)

---

### Version Control

**Q: Where do I store RIPP packets?**

A: In version control with your code. Recommended locations:

- `/ripp/` (root level)
- `/features/` (alongside feature code)
- `/specs/` (centralized specs directory)

---

**Q: How do I version RIPP packets?**

A: RIPP packets are versioned through:

1. The `updated` field (ISO date)
2. Git commit history
3. Optional `version` field in metadata

---

**Q: Should RIPP packets be in the same repo as code?**

A: Usually yes. Co-locating specs and code keeps them in sync. For microservices, each service can have its own RIPP packets.

---

### Adoption

**Q: How do I convince my team to use RIPP?**

A: Start small:

1. Write one RIPP packet for a new feature
2. Review it as a team
3. Track how many issues were caught before coding
4. Show the time savings

Success builds momentum.

---

**Q: Can I use RIPP for existing features?**

A: Yes. Retroactively document features with RIPP packets. Set `status: "implemented"`. This helps with onboarding and refactoring.

---

**Q: What if I work alone?**

A: RIPP is still useful for solo developers:

- Clarifies your thinking before coding
- Documents decisions for future you
- Makes onboarding contributors easier

---

**Q: Is RIPP suitable for open source projects?**

A: Absolutely. RIPP packets are reviewable, transparent, and version-controlled—perfect for open source. Contributors can review specs before writing code.

---

### Compliance and Security

**Q: Does RIPP help with compliance (SOC 2, GDPR, HIPAA)?**

A: Yes. Level 3 RIPP packets document:

- Audit events (what gets logged)
- Data handling (PII, encryption)
- Permissions (who can access what)
- NFRs (compliance standards)

This makes audits easier.

---

**Q: Should I include security requirements in RIPP packets?**

A: Yes! Use the `permissions` and `nfrs.security` sections. Document:

- Authentication requirements
- Authorization model
- Encryption (at rest, in transit)
- Data retention policies

---

**Q: Can RIPP packets contain sensitive information?**

A: **No.** Never include secrets, credentials, or PII in RIPP packets. They're committed to version control and may be public.

---

### Tooling

**Q: Can I generate code from RIPP packets?**

A: RIPP is designed as a specification, not a code generator. But you **can** build tools that generate scaffolding, tests, or documentation from RIPP packets. The community welcomes such tools!

---

**Q: Does RIPP integrate with OpenAPI/Swagger?**

A: RIPP's `api_contracts` section is similar to OpenAPI but includes more context (purpose, failure modes, permissions). You could convert RIPP to OpenAPI or vice versa with tooling.

---

**Q: Can I use RIPP with GitHub Projects or Jira?**

A: Yes. Link RIPP packets in issue descriptions:

```markdown
## RIPP Packet

See: [user-auth.ripp.yaml](../ripp/user-auth.ripp.yaml)
```

---

### Troubleshooting

**Q: My RIPP packet won't validate. What's wrong?**

Common issues:

- **YAML indentation**: Use spaces, not tabs
- **Missing required fields**: Check error message for field name
- **Wrong types**: `type: string` not `type: "string"` (no quotes on type values)
- **Enum typos**: `status: "aproved"` should be `"approved"`

Run `ripp validate --help` for debugging options.

---

**Q: Can I see a minimal valid RIPP packet?**

A: Yes:

```yaml
ripp_version: '1.0'
packet_id: 'minimal-example'
title: 'Minimal Feature'
created: '2025-12-13'
updated: '2025-12-13'
status: 'draft'
level: 1

purpose:
  problem: 'Problem statement'
  solution: 'Solution approach'
  value: 'Value delivered'

ux_flow:
  - step: 1
    actor: 'User'
    action: 'Does something'
    trigger: 'Some trigger'

data_contracts:
  inputs:
    - name: 'Input'
      fields:
        - name: 'field'
          type: 'string'
          required: true
          description: 'A field'
```

---

**Q: How do I report bugs or suggest improvements?**

A: Open an issue on [GitHub](https://github.com/Dylan-Natter/ripp-protocol/issues):

- **Bug reports**: Use the bug_report template
- **Feature requests**: Use the feature_request template
- **Spec changes**: Use the spec_change template

---

### Ecosystem

**Q: Are there RIPP templates for my IDE?**

A: Coming soon! For now, use the [feature packet template](https://github.com/Dylan-Natter/ripp-protocol/blob/main/templates/feature-packet.ripp.template.yaml) and enable JSON Schema support in your editor.

---

**Q: Can I contribute to RIPP?**

A: Yes! See [CONTRIBUTING.md](https://github.com/Dylan-Natter/ripp-protocol/blob/main/CONTRIBUTING.md). Contributions can include:

- Examples
- Tooling
- Documentation improvements
- Spec clarifications

---

**Q: Will there be a RIPP v2?**

A: RIPP v1.0 is stable. Future versions will be backward-compatible within v1.x. Major version bumps (v2.0) will include migration guides.

---

**Q: Where can I get help?**

A:

- **Documentation**: [https://dylan-natter.github.io/ripp-protocol](https://dylan-natter.github.io/ripp-protocol)
- **GitHub Discussions**: [Coming soon]
- **Issues**: [https://github.com/Dylan-Natter/ripp-protocol/issues](https://github.com/Dylan-Natter/ripp-protocol/issues)

---

**Still have questions?** [Open an issue](https://github.com/Dylan-Natter/ripp-protocol/issues/new) and we'll add it to this FAQ.
