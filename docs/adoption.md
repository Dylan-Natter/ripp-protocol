---
layout: default
title: 'Adoption Guide'
---

## Adoption Guide

How to introduce RIPP to your team or organization.

---

## Quick Start: Solo Developer

If you're working alone, start immediately:

1. Download the [template](https://github.com/Dylan-Natter/ripp-protocol/blob/main/templates/feature-packet.ripp.template.yaml)
2. Write your first RIPP packet (Level 1)
3. Review it yourself (think critically about edge cases)
4. Validate: `ripp validate your-feature.ripp.yaml`
5. Implement the feature

**Why it helps solo developers:**

- Clarifies your thinking before coding
- Documents decisions for future you
- Makes it easier to onboard contributors later
- Creates a record of what you built and why

---

## Small Team (2-5 people)

### Week 1: Introduction

**Day 1-2: Learn**

- Read the [Getting Started]({{ '/getting-started' | relative_url }}) guide
- Review [examples]({{ '/examples' | relative_url }})
- Install the CLI: `npm install -g ripp-cli`

**Day 3-5: First Packet**

- Pick a small upcoming feature
- One person writes a Level 1 RIPP packet
- Team reviews it together (30-minute meeting)
- Track: How many questions or issues were caught before coding?

### Week 2: Iterate

- Implement the feature using the RIPP packet as the spec
- Update the packet if implementation deviates
- Mark as `implemented` when done
- Retrospective: Was it worth it?

### Week 3: Establish Workflow

If Week 1-2 went well:

1. Add RIPP validation to CI (see [Tooling]({{ '/tooling' | relative_url }}))
2. Update Definition of Done: "RIPP packet complete and approved"
3. Make RIPP packets required for new features

---

## Medium Team (6-20 people)

### Phase 1: Pilot Program (2 weeks)

1. **Select champions**: Pick 2-3 engineers who are excited about structured specs
2. **Pilot features**: Choose 2-3 upcoming features for the pilot
3. **Write packets**: Champions write RIPP packets (mix of Level 1 and 2)
4. **Team review**: Hold spec review meetings (before code review)
5. **Measure impact**: Track time saved, issues caught early

### Phase 2: Expand (1 month)

1. **Share results**: Present pilot findings to the team
2. **Training**: Run a 1-hour RIPP workshop for the team
3. **Gradual rollout**: Start with Level 1 for all new features
4. **CI integration**: Add RIPP validation to your pipeline
5. **Templates**: Create org-specific templates if needed

### Phase 3: Standardize (Ongoing)

1. **Minimum levels**: Enforce Level 2 for customer-facing APIs, Level 3 for auth/payments
2. **Code review**: Review RIPP packets before code, not after
3. **Onboarding**: Add RIPP to new engineer onboarding
4. **Iterate**: Gather feedback, refine your RIPP workflow

---

## Large Organization (20+ people)

### Phase 1: Executive Buy-In (Week 1)

**Present the business case:**

- **Faster reviews**: Specs are reviewed before coding, reducing rework
- **Fewer production issues**: Failure modes documented upfront
- **Better onboarding**: New engineers read specs, not just code
- **Compliance**: Level 3 packets document audit requirements

**Pilot team**: Choose one team (5-10 people) to pilot RIPP.

### Phase 2: Pilot (1-2 months)

1. **Dedicated support**: Assign a RIPP champion to help the pilot team
2. **Regular check-ins**: Weekly 15-minute sync to address blockers
3. **Metrics**: Track:
   - Time to write RIPP packet
   - Issues caught in spec review vs. code review
   - Time saved in code review
   - Production bugs related to unclear requirements

### Phase 3: Rollout (3-6 months)

**If pilot succeeds:**

1. **Playbook**: Document your org's RIPP workflow
2. **Training**: Run workshops for all teams
3. **Champions network**: Create a Slack channel or forum for RIPP questions
4. **Gradual enforcement**: Start with Level 1, enforce Level 2/3 for high-risk features
5. **Tooling**: Invest in custom tooling if needed (generators, dashboards)

**If pilot struggles:**

- Identify blockers (too complex? not enough time? wrong features?)
- Simplify (start with Level 1 only)
- Reduce scope (only for new APIs, not all features)
- Try again with a different team or feature set

### Phase 4: Scale (Ongoing)

1. **Platform team ownership**: Assign RIPP maintenance to a platform team
2. **Custom levels**: Define org-specific conformance levels if needed
3. **Metrics dashboard**: Track RIPP adoption across teams
4. **Continuous improvement**: Evolve your RIPP practices based on feedback

---

## Common Adoption Patterns

### Pattern 1: API-First

Start with API features only:

- Enforce Level 2 for all new REST/GraphQL endpoints
- Use RIPP as the API specification
- Generate OpenAPI docs from RIPP (custom tooling)
- Expand to UI features once established

### Pattern 2: High-Risk First

Start with security-critical features:

- Require Level 3 for auth, payments, PII
- Keep everything else ad-hoc initially
- Prove value on high-stakes features
- Expand to all features gradually

### Pattern 3: New Projects Only

Don't retrofit existing features:

- Apply RIPP to new projects or greenfield work
- Leave legacy features as-is
- Slowly document critical legacy features as Level 1
- Full RIPP compliance for all new code

---

## Overcoming Resistance

### "We don't have time to write specs"

**Response**: RIPP saves time by catching issues before coding. A 1-hour spec review prevents days of rework.

**Tactics:**

- Start with Level 1 (30 minutes)
- Track time saved in code review
- Show metrics from pilot

### "Our features are too simple for this"

**Response**: Simple features use Level 1 (Purpose, UX, Data). It's 30 minutes of clarity.

**Tactics:**

- Pick a "simple" feature that had production issues
- Show how RIPP would have caught the issue
- Use RIPP for complex features only, initially

### "This feels like bureaucracy"

**Response**: RIPP is reviewed **before** coding, not after. It's a planning tool, not overhead.

**Tactics:**

- Frame as "design doc lite"
- Emphasize machine validation (not manual checklists)
- Show that it reduces meetings (async spec review)

### "We already use Jira/Confluence/etc."

**Response**: RIPP is structured, versioned, and validated. Tickets scatter requirements; RIPP centralizes them.

**Tactics:**

- Link RIPP packets from Jira tickets
- Use RIPP as the "Acceptance Criteria" source
- Show how RIPP integrates with existing tools

---

## Success Metrics

Track these to measure RIPP adoption success:

### Process Metrics

- % of new features with RIPP packets
- Average time to write a RIPP packet
- % of packets that pass validation on first try
- Spec review time vs. code review time

### Quality Metrics

- Issues caught in spec review vs. code review
- Production bugs related to unclear requirements
- Time to onboard new engineers (with RIPP vs. without)

### Compliance Metrics (Level 3)

- % of security-critical features with Level 3 packets
- Audit readiness (time to produce compliance docs)

---

## Organizational Templates

Create org-specific templates with:

- Pre-filled `references` to internal docs
- Custom sections (e.g., `compliance.soc2_controls`)
- Team-specific fields (e.g., `team`, `jira_ticket`)

Example:

```yaml
ripp_version: '1.0'
# ... standard RIPP fields ...

# Org-specific extensions
org_metadata:
  team: 'Platform'
  jira_ticket: 'PLAT-123'
  deployment_target: '2025-Q1'
```

---

## Training Resources

### For New Users

- [Getting Started Guide]({{ '/getting-started' | relative_url }})
- [Examples]({{ '/examples' | relative_url }})
- [FAQ]({{ '/faq' | relative_url }})

### For Champions

- [Full Specification]({{ '/spec' | relative_url }})
- [RIPP Levels Deep Dive]({{ '/ripp-levels' | relative_url }})
- [Tooling Setup]({{ '/tooling' | relative_url }})

### Workshop Outline (1 hour)

1. **Intro** (10 min): What is RIPP and why it exists
2. **Live demo** (15 min): Write a Level 1 packet together
3. **Examples** (10 min): Walk through a real Level 2/3 packet
4. **Hands-on** (20 min): Attendees write their own packet
5. **Q&A** (5 min): Address concerns and questions

---

## Pitfalls to Avoid

❌ **Don't**: Make RIPP mandatory for all features on day 1  
✅ **Do**: Start with a pilot, prove value, then expand

❌ **Don't**: Enforce Level 3 for everything  
✅ **Do**: Use Level 1 for simple features, Level 3 for high-risk

❌ **Don't**: Write RIPP packets after coding  
✅ **Do**: Write RIPP packets before coding (spec-first)

❌ **Don't**: Skip validation  
✅ **Do**: Automate validation in CI from day 1

❌ **Don't**: Let packets drift from implementation  
✅ **Do**: Update packets when implementation changes

---

## Long-Term Success

RIPP adoption is successful when:

1. **Spec review is routine**: Teams naturally review RIPP packets before coding
2. **Validation is automated**: CI fails if packets are invalid or missing
3. **New engineers onboard faster**: They read RIPP packets to understand features
4. **Fewer production surprises**: Failure modes are documented and handled
5. **Compliance is easier**: Level 3 packets provide audit trails

---

**Start small. Prove value. Scale thoughtfully.**
