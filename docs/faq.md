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

### Prototype-to-Production Workflow

**Q: Can I generate a RIPP packet from an existing prototype?**

A: Yes! RIPP supports a prototype-first workflow where you start with rapid prototyping (especially AI-generated code) and then extract a formal specification.

**Conceptual workflow**:

1. Build a working prototype with AI or rapid tools
2. Extract a draft RIPP packet from the prototype code + stated requirements
3. Review the draft, filling gaps and resolving conflicts
4. Approve the RIPP packet as the production specification
5. Rebuild (or refine) for production using RIPP as the contract

The RIPP Extractor is a conceptual tool documented but not yet fully implemented. Manual extraction is currently the recommended approach.

---

**Q: What's the difference between a prototype and a production system?**

A: A prototype proves feasibility. A production system must be secure, maintainable, and complete.

**Prototypes typically lack**:

- Durable intent (exists only in prompt history or developer's head)
- Security boundaries (permissions, authentication often simplified or omitted)
- Failure handling (edge cases discovered reactively in testing or production)
- Verification criteria (no formal acceptance tests)
- Compliance needs (audit trails, data retention, encryption)

**RIPP bridges the gap** by formalizing the prototype into a production-grade specification.

---

**Q: When should I use prototype-first vs spec-first?**

A: Choose based on your context:

**Prototype-first** (build MVP, then extract RIPP):

- ✅ Rapid idea validation
- ✅ Exploring AI-generated solutions
- ✅ Unclear requirements (prototype clarifies what's possible)
- ✅ Converting existing PoCs to formal specs

**Spec-first** (write RIPP, then implement):

- ✅ Clear requirements upfront
- ✅ High-security or regulated features
- ✅ Team collaboration with review before coding
- ✅ Avoiding rework from underspecified prototypes

Both approaches are valid. RIPP accommodates both workflows.

---

**Q: What is a RIPP Extractor?**

A: A conceptual tool that generates draft RIPP packets from prototype code and stated requirements.

**What it would do**:

- Parse prototype code to extract API contracts, data structures, flows
- Read requirements from README, prompts, or design notes
- Generate a draft RIPP packet with evidence map and confidence ratings
- Flag gaps, conflicts, and open questions for human review

**Current status**: Documented as a concept, not yet fully implemented. Teams currently extract RIPP specifications manually.

**Design principles**:

- Read-only (never modifies prototype code)
- Conservative (marks uncertainty rather than guessing)
- Transparent (shows how each section was derived)
- Requires human approval (outputs are drafts, not authoritative)

---

**Q: What are evidence maps and confidence ratings?**

A: Optional metadata fields that provide transparency when a RIPP packet is generated from a prototype.

**`evidence_map`**: Maps each RIPP section to its source in the prototype

```yaml
evidence_map:
  ux_flow:
    source: 'extracted'
    location: 'src/routes/profile.js, lines 45-89'
  permissions:
    source: 'proposed'
    location: 'Not implemented in prototype'
    notes: 'Inferred from UX flow, needs validation'
```

**`confidence`**: Indicates how certain the extraction is

```yaml
confidence:
  purpose: 'high' # Explicitly stated in README
  ux_flow: 'high' # Directly observable in code
  permissions: 'low' # Proposed based on patterns
  audit_events: 'unknown' # Not present in prototype
```

**These fields are optional** and don't affect RIPP v1.0 conformance. They enhance trust and transparency.

---

**Q: What should never be inferred from a prototype?**

A: Extraction tools and humans reviewing prototypes must NEVER silently infer:

- **Permissions and authorization**: Code may lack auth checks; don't assume what they should be
- **Multi-tenancy boundaries**: Tenant isolation must be explicit, never assumed from single-tenant prototypes
- **Audit and compliance requirements**: Logging needs must be stated, not invented
- **Security constraints**: Encryption, validation, rate limiting must be specified

If these are missing, mark them as **`proposed`** or **`unknown`**, and require explicit human decisions before production.

**Why this matters**: Guessing security requirements creates vulnerabilities. Making gaps visible forces teams to address them.

---

**Q: How do I handle conflicts between prototype code and stated requirements?**

A: Flag them explicitly. Never silently choose one over the other.

**Example conflict**:

- **Code**: Allows any authenticated user to update any profile
- **Stated intent**: "Users should only update their own profile"

**Resolution process**:

1. Document the conflict in `open_questions`:
   ```yaml
   open_questions:
     - question: 'Should users be able to update other users profiles?'
       section: 'permissions'
       impact: 'Prototype allows it, requirements say no. Security concern.'
   ```
2. Bring to team review
3. Make an explicit decision
4. Update the RIPP packet with the chosen behavior
5. Implement production code to match

**Never assume the code is right or the stated intent is right.** Conflicts require human judgment.

---

**Q: What are verification labels (VERIFIED, STATED, PROPOSED, UNKNOWN)?**

A: Labels that indicate the source and certainty of each RIPP section.

- **VERIFIED**: Directly extracted from working code and confirmed accurate
- **STATED**: Derived from explicit requirements, prompts, or documentation
- **PROPOSED**: Inferred from patterns or best practices, requires review
- **UNKNOWN**: Not present in prototype or inputs, must be specified

**Used in `evidence_map`**:

```yaml
evidence_map:
  data_contracts:
    source: 'verified' # Extracted from API request/response handling
  permissions:
    source: 'proposed' # Inferred from UX flow, needs validation
  audit_events:
    source: 'unknown' # Not addressed in prototype
```

These labels help teams understand what's solid, what needs review, and what's missing.

---

**Q: Can RIPP replace my prototyping workflow?**

A: No. RIPP complements prototyping, it doesn't replace it.

**Prototyping**: Fast exploration, prove feasibility, discover edge cases  
**RIPP**: Formalize intent, define contracts, prepare for production

**Use both**:

1. Prototype to validate ideas quickly
2. Extract RIPP to formalize for production
3. Review and approve RIPP before building production system
4. Implement with confidence that requirements are explicit

RIPP makes prototypes valuable beyond the exploration phase. Instead of discarding prototype learnings, RIPP captures them as a durable specification.

---

**Q: Does prototype-first mean "ship the prototype"?**

A: **No.** The prototype proves feasibility. RIPP formalizes the spec. Production is a separate implementation.

**Workflow**:

1. Build prototype (quick and dirty)
2. Extract RIPP (formal specification)
3. Review RIPP (fill gaps, resolve conflicts)
4. **Rebuild for production** (clean implementation guided by RIPP)

The prototype may have shortcuts, missing error handling, or security gaps. The RIPP packet documents what the production system SHOULD do. The production build implements the RIPP contract properly.

**Exception**: If the prototype is already production-quality (rare), you can refine it to match RIPP rather than rebuild. But most AI-generated prototypes need significant hardening.

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
