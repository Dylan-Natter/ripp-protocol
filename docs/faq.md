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

A: Yes. RIPP complements Agile:

- **User stories** define the "what" (high-level)
- **RIPP packets** add the "how" (technical depth)
- **Acceptance criteria** map to RIPP's `acceptance_tests`

Include "RIPP packet complete" in your Definition of Done.

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
