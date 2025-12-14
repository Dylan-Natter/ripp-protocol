---
layout: default
title: 'RIPP Levels Explained'
---

## RIPP Levels Explained

RIPP defines three conformance levels. Each level adds more rigor and structure. Choose the level that matches your feature's risk, complexity, and organizational requirements.

---

## Level 0: No RIPP (Baseline)

**Status**: Ad-hoc documentation

This is where most teams start. Requirements are scattered across:

- Jira tickets
- Slack conversations
- Email threads
- Google Docs
- Code comments
- Tribal knowledge

**Problems:**

- No single source of truth
- Intent erodes during implementation
- Security and edge cases discovered too late
- Onboarding is difficult

**When it's acceptable:**

- Trivial bug fixes
- Documentation-only changes
- Spikes and experiments

---

## Level 1: Purpose + UX + Data

**Status**: Minimum viable RIPP

**Required Sections:**

- Metadata (version, ID, title, status, level)
- Purpose (problem, solution, value)
- UX Flow (step-by-step interaction)
- Data Contracts (inputs and outputs)

**What it gives you:**

- Clear understanding of what and why
- Reviewable specification before code
- Data structure documentation
- Single file with core requirements

**When to use Level 1:**

- Simple features
- Internal tools
- Low-risk changes
- MVPs and prototypes
- Features that don't touch permissions or PII

**Example Use Cases:**

- Adding a new field to a form
- Internal analytics dashboard
- Read-only API endpoint for public data
- Non-critical UI changes

**Effort**: ~30-60 minutes to write

---

## Level 2: Production-Grade

**Status**: Production-ready specification

**Required Sections:**

- All Level 1 sections
- **API Contracts** (endpoints, methods, errors)
- **Permissions** (who can do what)
- **Failure Modes** (what can go wrong)

**What it gives you:**

- Full API specification
- Explicit permission model
- Error handling documentation
- Security considerations upfront
- Reviewable before implementation

**When to use Level 2:**

- Production features
- Customer-facing APIs
- Features that modify data
- Multi-user functionality
- Anything with authentication

**Example Use Cases:**

- REST API for resource management
- User-facing CRUD operations
- Third-party integrations
- Webhook delivery systems
- Background job processing

**Effort**: ~1-2 hours to write

---

## Level 3: Full Rigor

**Status**: High-assurance specification

**Required Sections:**

- All Level 2 sections
- **Audit Events** (what gets logged)
- **Non-Functional Requirements** (performance, security)
- **Acceptance Tests** (verification criteria)

**What it gives you:**

- Compliance-ready audit trail
- Performance and scalability targets
- Security requirements explicit
- Testable acceptance criteria
- Full lifecycle documentation

**When to use Level 3:**

- Payment processing
- Authentication and authorization
- Personal identifiable information (PII)
- Multi-tenant data isolation
- Regulated industries (healthcare, finance)
- High-traffic APIs
- Mission-critical features

**Example Use Cases:**

- Payment gateway integration
- Multi-tenant SaaS features
- Healthcare data handling (HIPAA)
- Financial transactions
- Identity and access management
- Data export with PII

**Effort**: ~2-4 hours to write

---

## Comparison Matrix

| Aspect               | Level 1   | Level 2  | Level 3  |
| -------------------- | --------- | -------- | -------- |
| **Purpose**          | ✓         | ✓        | ✓        |
| **UX Flow**          | ✓         | ✓        | ✓        |
| **Data Contracts**   | ✓         | ✓        | ✓        |
| **API Contracts**    | —         | ✓        | ✓        |
| **Permissions**      | —         | ✓        | ✓        |
| **Failure Modes**    | —         | ✓        | ✓        |
| **Audit Events**     | —         | —        | ✓        |
| **NFRs**             | —         | —        | ✓        |
| **Acceptance Tests** | —         | —        | ✓        |
| **Time to Write**    | 30-60 min | 1-2 hrs  | 2-4 hrs  |
| **Review Depth**     | Light     | Moderate | Thorough |
| **Compliance**       | No        | Partial  | Full     |

---

## Choosing the Right Level

### Start with Risk Assessment

Ask yourself:

1. **Does it touch user permissions or auth?** → Level 2 minimum
2. **Does it handle PII or payment data?** → Level 3
3. **Is it customer-facing?** → Level 2 minimum
4. **Is it multi-tenant?** → Level 3
5. **Is it internal and low-risk?** → Level 1 is fine

### Consider Compliance Requirements

- **SOC 2, ISO 27001**: Level 3 for security-critical features
- **GDPR**: Level 3 for PII handling
- **HIPAA**: Level 3 for healthcare data
- **PCI DSS**: Level 3 for payment processing

### Factor in Team Maturity

- **New to RIPP**: Start with Level 1, upgrade later
- **Experienced team**: Go straight to Level 2 or 3
- **High-stakes project**: Always use Level 3

---

## Upgrading Levels

You can start with Level 1 and upgrade to Level 2 or 3 later:

1. Change the `level` field in metadata
2. Add the required sections for the new level
3. Update the `updated` field
4. Validate: `ripp validate your-feature.ripp.yaml`
5. Review the additions with your team

**Tip**: It's easier to start at the right level than to retrofit later.

---

## Level Enforcement

Use CI validation to enforce minimum levels for certain features:

```yaml
# GitHub Actions example
- name: Validate RIPP Levels
  run: |
    ripp validate --min-level 2 src/api/
    ripp validate --min-level 3 src/auth/
    ripp validate --min-level 1 src/internal/
```

---

## Real-World Examples

See the [Examples]({{ '/examples' | relative_url }}) page for complete RIPP packets at each level:

- **Level 1**: Coming soon (simple feature example)
- **Level 2**: [Webhook Delivery System](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/api-only-feature.ripp.yaml)
- **Level 3**: [Item Creation](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/item-creation.ripp.yaml), [Multi-Tenant Isolation](https://github.com/Dylan-Natter/ripp-protocol/blob/main/examples/multi-tenant-feature.ripp.yaml)

---

## FAQ

**Q: Can I have Level 3 sections in a Level 1 packet?**  
A: Yes! The level field declares your minimum conformance. You can include additional sections at any level.

**Q: Can I skip sections within a level?**  
A: No. All required sections for your declared level must be present. The validator will fail otherwise.

**Q: Should I use Level 3 for everything?**  
A: No. Level 3 is for high-risk features. Over-documenting simple features slows teams down. Choose appropriately.

**Q: Can I create Level 4 or custom levels?**  
A: RIPP v1.0 defines levels 1-3 only. You can add custom sections beyond Level 3, but they're not part of the standard.

---

**Choose your level. Write your spec. Ship with confidence.**
