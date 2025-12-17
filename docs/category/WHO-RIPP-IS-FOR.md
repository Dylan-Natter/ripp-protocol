---
layout: default
title: 'Who RIPP Is For'
---

# Who RIPP Is For

**Category**: Audience and Use Case Targeting

---

## Ideal Adopters

RIPP™ is designed for teams and individuals who need **durable, structured specifications** that prevent intent erosion and enable confident delivery.

---

### 1. AI-Assisted Development Teams

**Profile**: Teams using AI coding assistants (Copilot, ChatGPT, etc.) to accelerate development.

**Why RIPP helps**:

- AI generates code fast, but prompts are ephemeral—RIPP makes specs durable
- Prototypes lack security boundaries—RIPP defines permissions and failure modes upfront
- Code review lacks authoritative specs—RIPP provides the contract to validate against
- Regeneration requires reprompting—RIPP enables rebuilding from a stable specification

**Use cases**:

- Rapid prototyping → production transition
- AI-generated features that need production rigor
- Preserving intent when prompts disappear from chat history

**Team size**: Any (individual contributors to large teams)

**Maturity level**: Early-stage startups to mature engineering orgs experimenting with AI workflows

---

### 2. Platform and Infrastructure Teams

**Profile**: Teams building internal platforms, APIs, or shared services used by other teams.

**Why RIPP helps**:

- Platform contracts must be explicit—RIPP documents APIs, permissions, and failure modes
- Breaking changes are costly—RIPP provides versioned specifications that evolve deliberately
- Onboarding new platform users is hard—RIPP packets serve as authoritative documentation
- Platform reliability is critical—RIPP captures NFRs, audit events, and acceptance tests

**Use cases**:

- Internal APIs consumed by multiple teams
- Developer platforms (CI/CD, deployment, observability)
- Shared services (auth, payments, notifications)
- Multi-tenant SaaS platforms

**Team size**: 5+ engineers, often with consumers across multiple teams

**Maturity level**: Mid-stage to mature organizations with platform engineering practices

---

### 3. Product Teams Shipping Customer-Facing Features

**Profile**: Teams delivering features directly to users, where quality and clarity are essential.

**Why RIPP helps**:

- Requirements scatter across Jira, Slack, and PRD docs—RIPP consolidates them
- Edge cases discovered in production—RIPP forces upfront failure mode analysis
- Code review is reactive—RIPP enables spec review before code exists
- Onboarding is slow—RIPP packets document "why" and "how" for new engineers

**Use cases**:

- User-facing features (registration, payments, dashboards)
- API endpoints for mobile or web clients
- High-stakes features (auth, PII handling, financial transactions)
- Features with complex UX flows or multi-step workflows

**Team size**: Any (solo developers to 50+ person product teams)

**Maturity level**: Startups to enterprises

---

### 4. Compliance-Driven Organizations

**Profile**: Teams operating in regulated industries (healthcare, finance, government) where auditability is mandatory.

**Why RIPP helps**:

- Compliance requires documented intent—RIPP captures purpose, permissions, and audit events
- Audits demand traceability—RIPP packets are versioned in Git alongside code
- Security reviews need explicit contracts—RIPP defines data handling, permissions, and failure modes
- Regulations change—RIPP allows evolving specifications with clear versioning

**Use cases**:

- Features handling PII, PHI, or financial data
- Systems requiring SOC 2, HIPAA, or PCI-DSS compliance
- Government contracts with strict documentation requirements
- Features requiring audit trails and access logs

**Team size**: Any, but especially common in 20+ person orgs with dedicated compliance roles

**Maturity level**: Mid-stage to enterprise organizations in regulated industries

---

### 5. Open Source Maintainers

**Profile**: Maintainers of open source projects who need clear specifications for contributors.

**Why RIPP helps**:

- Contributors need clear requirements—RIPP packets define "what to build" before coding
- Code review is time-consuming—RIPP enables spec review before implementation
- Documentation often lags—RIPP packets become the authoritative reference
- Maintainer time is limited—RIPP reduces back-and-forth on ambiguous requirements

**Use cases**:

- New feature proposals (contributors write RIPP packets before PRs)
- API design (RIPP defines contracts before implementation)
- Breaking changes (RIPP documents migration path and failure modes)
- Community contributions (RIPP ensures consistency across contributors)

**Team size**: 1-10 core maintainers, unlimited contributors

**Maturity level**: Mature projects with active contributor communities

---

### 6. Consultancies and Agencies

**Profile**: Teams building software for clients, where handoff and clarity are critical.

**Why RIPP helps**:

- Clients need to approve specs—RIPP provides reviewable, non-technical documentation
- Handoffs are risky—RIPP packets preserve intent when transitioning between teams
- Scope creep is common—RIPP defines contracts that prevent "one more thing" drift
- Maintenance requires context—RIPP ensures future maintainers understand the "why"

**Use cases**:

- Client feature delivery (RIPP as deliverable alongside code)
- Staff augmentation (RIPP ensures consistency across rotating contractors)
- Agency-to-internal-team handoffs (RIPP preserves decisions post-engagement)
- Fixed-scope projects (RIPP defines boundaries upfront)

**Team size**: 3-50 person delivery teams

**Maturity level**: Boutique agencies to large consultancies

---

## Specific Use Cases

### Use Case 1: Rapid Prototype → Production Deployment

**Scenario**: You build a prototype with AI in 2 hours. It works. Now you need to ship it to production.

**How RIPP helps**:

1. Extract RIPP packet from prototype (document intent, contracts, learnings)
2. Review RIPP packet with team (identify security gaps, missing failure modes)
3. Approve RIPP packet (becomes the production contract)
4. Rebuild feature for production (using RIPP as specification)
5. RIPP packet survives as documentation (intent preserved even if code changes)

**Result**: Fast prototyping + production rigor

---

### Use Case 2: Multi-Team API Design

**Scenario**: Your backend team is building an API consumed by 3 frontend teams. Miscommunication leads to rework.

**How RIPP helps**:

1. Backend team writes RIPP packet (defines API contracts, error codes, permissions)
2. Frontend teams review RIPP packet (catch mismatches early)
3. Approve RIPP packet before implementation (alignment before coding)
4. Backend implements to RIPP spec (contract is authoritative)
5. Frontend teams build against RIPP contracts (no surprises)

**Result**: Fewer integration bugs, faster delivery

---

### Use Case 3: Security and Compliance Audit

**Scenario**: Your company needs SOC 2 compliance. Auditors ask, "How do you document permissions and audit events?"

**How RIPP helps**:

1. Write Level 3 RIPP packets for all features handling sensitive data
2. Include `permissions`, `audit_events`, and `nfrs` sections
3. Version RIPP packets in Git (audit trail via commit history)
4. Reference RIPP packets in compliance documentation
5. Auditors review RIPP packets as authoritative specs

**Result**: Clear compliance documentation, faster audits

---

### Use Case 4: Onboarding New Engineers

**Scenario**: A new engineer joins and asks, "Why does this feature work this way?"

**Without RIPP**:

- Archaeology through Git commits, Slack, and Jira
- "Ask Alice, she built it 6 months ago"
- Undocumented assumptions and tribal knowledge

**With RIPP**:

- Read the RIPP packet (purpose, contracts, failure modes all documented)
- Understand the "why" and "how" in 15 minutes
- No dependency on original author

**Result**: Faster onboarding, reduced knowledge silos

---

### Use Case 5: AI Code Generation with Guardrails

**Scenario**: You want to use AI to generate features, but you're concerned about security gaps and missing edge cases.

**How RIPP helps**:

1. Write RIPP packet first (define permissions, failure modes, NFRs)
2. Review and approve RIPP packet (security boundaries explicit)
3. Prompt AI with RIPP packet as context ("Implement this RIPP spec in Python")
4. AI generates code (guided by RIPP's contracts and constraints)
5. Review generated code against RIPP (validate conformance)

**Result**: AI speed + human oversight

---

## Who RIPP Is NOT For

RIPP is not suitable for all teams or projects. **RIPP may not be a good fit if**:

---

### ❌ You're Building One-Off Scripts or Throwaway Prototypes

**Why**: If the code will never reach production or be maintained, RIPP is overhead.

**Better approach**: Write the script, document with comments if needed, move on.

**RIPP is for durable features, not temporary experiments.**

---

### ❌ Your Team Already Has Mature, Stable Specifications

**Why**: If you have comprehensive ADRs, OpenAPI specs, and test coverage, RIPP may be redundant.

**When to consider RIPP anyway**:

- If specs are scattered (ADRs, Confluence, Jira, code comments)
- If permissions and failure modes are undocumented
- If onboarding still requires tribal knowledge

**RIPP consolidates. If you don't need consolidation, you may not need RIPP.**

---

### ❌ You're Operating in Pure Research or Exploration Mode

**Why**: Research codebases prioritize experimentation over structure. RIPP adds rigor that may slow exploration.

**When RIPP becomes useful**: When research transitions to production or when learnings need to be preserved.

**RIPP is for delivery, not discovery.**

---

### ❌ Your Team Resists Process and Documentation

**Why**: RIPP requires deliberate specification work. If your team views all documentation as bureaucracy, adoption will fail.

**Mitigation**:

- Start with Level 1 (30-60 minutes per packet)
- Frame RIPP as "preventing rework" not "adding process"
- Use RIPP for high-risk features only

**If the team won't engage, RIPP won't help.**

---

### ❌ You're in Crisis Mode (Production Incident, Emergency Hotfix)

**Why**: During incidents, fix first, document later.

**When to write RIPP**: After the incident, capture learnings in a RIPP packet for future reference.

**RIPP is for deliberate development, not firefighting.**

---

## Team Readiness Criteria

**Your team is ready for RIPP if**:

✅ You've experienced "intent erosion" (features shipped with unclear requirements)

✅ Code reviews frequently reveal missing edge cases or security gaps

✅ Onboarding new engineers is slow due to undocumented assumptions

✅ You're using AI to generate code and want durable specifications

✅ You're building APIs or platforms consumed by other teams

✅ You operate in a regulated industry requiring audit trails

✅ You value "review specs before code" workflows

**Your team may NOT be ready if**:

❌ Documentation is viewed as pure overhead with no value

❌ Features are simple CRUD with no complex permissions or failure modes

❌ The team is in pure exploration/research mode

❌ You're building throwaway prototypes with no production intent

❌ Time-to-market is measured in hours, not days or weeks

---

## Organizational Fit

| Organization Type                    | RIPP Fit    | Why                                                                                        |
| ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| **Early-stage startup (1-5 people)** | ⚠️ Moderate | RIPP adds rigor but may slow rapid iteration. Use Level 1 for critical features only.      |
| **Growth-stage startup (10-50)**     | ✅ High     | Intent erosion accelerates at scale. RIPP prevents scattered requirements.                 |
| **Mid-market company (50-200)**      | ✅ High     | Cross-team coordination requires explicit contracts. RIPP provides single source of truth. |
| **Enterprise (200+)**                | ✅ High     | Compliance, auditability, and onboarding challenges make RIPP valuable.                    |
| **Open source (any size)**           | ✅ High     | Distributed contributors need clear specifications. RIPP reduces maintainer burden.        |
| **Consultancy/Agency**               | ✅ High     | Client handoffs and scope management benefit from explicit contracts.                      |
| **Research lab**                     | ❌ Low      | Pure exploration doesn't need structured specs. Use RIPP when transitioning to production. |

---

## Industry Fit

| Industry                | RIPP Fit         | Why                                                                                     |
| ----------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| **Financial services**  | ✅ High          | Compliance, audit trails, and permissions are mandatory. RIPP Level 3 ideal.            |
| **Healthcare**          | ✅ High          | HIPAA compliance requires documented data handling and access controls.                 |
| **Government/Defense**  | ✅ High          | Strict documentation and audit requirements. RIPP provides traceability.                |
| **SaaS/Cloud**          | ✅ High          | Multi-tenant systems require explicit tenant isolation and permissions.                 |
| **E-commerce**          | ✅ Moderate-High | Payment and PII handling benefit from RIPP Level 2-3.                                   |
| **Media/Entertainment** | ⚠️ Moderate      | RIPP useful for APIs and platforms, less so for content-heavy workflows.                |
| **Gaming**              | ⚠️ Low-Moderate  | Rapid iteration may conflict with RIPP's rigor. Use for backend services, not gameplay. |
| **EdTech**              | ✅ Moderate-High | Student data privacy and compliance make RIPP valuable.                                 |

---

## Role-Specific Value

### For Product Managers

**RIPP helps you**:

- Define features clearly before engineering estimates
- Review specifications before code review (catch issues early)
- Communicate requirements to stakeholders (RIPP packets are readable)
- Prevent scope creep (RIPP defines contracts upfront)

---

### For Engineering Managers

**RIPP helps you**:

- Reduce rework from unclear requirements
- Improve onboarding (RIPP packets document intent)
- Enforce standards across teams (RIPP validation in CI/CD)
- Provide audit trail for compliance (RIPP packets in Git)

---

### For Security Engineers

**RIPP helps you**:

- Review permissions and data handling before code exists
- Define threat models in `failure_modes` section
- Ensure audit events are specified upfront (Level 3)
- Trace requirements to implementation (RIPP as authoritative spec)

---

### For DevOps/SRE

**RIPP helps you**:

- Understand NFRs (performance, availability, scalability) before deployment
- Define monitoring and alerting requirements (from `audit_events` and `nfrs`)
- Document deployment dependencies and failure modes
- Provide runbooks (RIPP's `failure_modes` inform incident response)

---

### For QA/Test Engineers

**RIPP helps you**:

- Write tests before code exists (from `acceptance_tests` section)
- Validate edge cases (from `failure_modes`)
- Verify API contracts (from `api_contracts`)
- Ensure test coverage matches requirements (RIPP is the checklist)

---

### For Individual Contributors

**RIPP helps you**:

- Clarify requirements before coding (prevents rework)
- Review specs with team before implementation (alignment)
- Document your work for future maintainers (RIPP survives your code)
- Onboard faster to new codebases (read RIPP packets, not tribal knowledge)

---

## When to Start Using RIPP

**Start with RIPP if**:

✅ You're beginning a new project (establish RIPP from day 1)

✅ You're refactoring a critical system (document intent before rewriting)

✅ You're transitioning a prototype to production (extract RIPP from learnings)

✅ You're building an API or platform (RIPP defines contracts)

✅ You're facing an audit (RIPP provides compliance documentation)

✅ You're onboarding multiple new engineers (RIPP reduces knowledge transfer burden)

**Start small**:

- Use Level 1 for simple features (low overhead)
- Use Level 2 for production APIs (production-grade)
- Use Level 3 for high-risk features (full rigor)

**Expand gradually**: As your team sees value, adopt RIPP more broadly.

---

## Summary: Is RIPP Right for You?

| You Should Use RIPP If                      | You Should NOT Use RIPP If                   |
| ------------------------------------------- | -------------------------------------------- |
| You need durable, structured specifications | You're building throwaway prototypes         |
| You're using AI to generate code            | You already have mature, stable specs        |
| You're building APIs for other teams        | You're in pure research mode                 |
| You operate in a regulated industry         | Your team resists all documentation          |
| You've experienced intent erosion           | You're in crisis/firefighting mode           |
| You value "spec review before code review"  | Features are trivial CRUD with no edge cases |

---

## Next Steps

- **[Intent as Protocol](INTENT-AS-PROTOCOL.md)** — Understand RIPP's design philosophy
- **[What RIPP Is and Is Not](WHAT-RIPP-IS-AND-IS-NOT.md)** — Clear boundaries and scope
- **[RIPP vs Existing Paradigms](RIPP-VS-EXISTING-PARADIGMS.md)** — How RIPP complements IaC, GitOps, etc.

---

**Key Principle**: RIPP is for teams who value clarity, durability, and rigor. If that's you, RIPP will help. If not, it won't.
